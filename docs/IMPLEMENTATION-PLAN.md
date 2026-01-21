# OTCS-MCP Incremental Enhancement Plan

## Executive Summary

This document outlines the **incremental enhancement path** from the current 40-tool implementation to the 54-capability vision in the strategy document. The approach follows existing codebase patterns exactly—no architectural overhaul required.

**Key Insight**: The current codebase already has all the patterns we need:
- Tool profiles system → extend for orchestrators
- Batch operations → reuse for new batch actions
- Switch-based handler → add new cases
- OTCSClient methods → add new methods following existing style

---

## Current Architecture Analysis

### Files to Modify

| File | Purpose | Change Type |
|------|---------|-------------|
| `src/client/otcs-client.ts` | API methods | ADD new methods |
| `src/index.ts` | Tool definitions + handlers | ADD new tools + cases |
| `src/types.ts` | TypeScript types | ADD new interfaces |

### Existing Patterns We Reuse

**1. Batch Operations Pattern** (from `otcs-client.ts:3160-3180`):
```typescript
async applyRMCrossRefBatch(nodeIds: number[], xrefType: string, refNodeId: number): Promise<{ success: boolean; count: number }> {
  const formData = new URLSearchParams();
  formData.append('xref_type', xrefType);
  formData.append('ref_node_id', refNodeId.toString());
  formData.append('ids', nodeIds.join(','));
  await this.request<any>('POST', `/v1/rmclassifications/assignxref`, undefined, formData);
  return { success: true, count: nodeIds.length };
}
```

**2. Parallel Processing Pattern** (from `index.ts:970-1000`):
```typescript
for (let i = 0; i < items.length; i += maxConcurrency) {
  const batch = items.slice(i, i + maxConcurrency);
  const batchPromises = batch.map(async (item) => { /* process */ });
  const batchResults = await Promise.all(batchPromises);
  results.push(...batchResults);
}
```

**3. Tool Definition Pattern** (from `index.ts:97-110`):
```typescript
{
  name: 'otcs_tool_name',
  description: 'What it does',
  inputSchema: {
    type: 'object',
    properties: { /* ... */ },
    required: ['field1'],
  },
},
```

**4. Tool Profile Pattern** (from `index.ts:27-77`):
```typescript
const TOOL_PROFILES: Record<string, string[]> = {
  core: ['otcs_authenticate', 'otcs_browse', ...],
  workflow: ['otcs_authenticate', 'otcs_workflow_form', ...],
  admin: ['otcs_authenticate', 'otcs_permissions', ...],
  rm: ['otcs_authenticate', 'otcs_rm_holds', ...],
};
```

---

## Phase 1: Foundation (New Transactional Tools)

### 1.1 Add `otcs_share` Tool

**Location**: `src/client/otcs-client.ts` (new methods)

```typescript
// ============ Sharing ============

async createShare(nodeId: number, params: ShareCreateParams): Promise<ShareInfo> {
  const formData = new URLSearchParams();
  formData.append('node_id', nodeId.toString());
  if (params.recipients) {
    formData.append('recipients', JSON.stringify(params.recipients));
  }
  if (params.expiration_date) formData.append('expire_date', params.expiration_date);
  if (params.password) formData.append('password', params.password);

  const response = await this.request<any>('POST', '/v2/shares', undefined, formData);
  return this.parseShareInfo(response);
}

async listShares(nodeId: number): Promise<ShareInfo[]> {
  const response = await this.request<any>('GET', `/v2/nodes/${nodeId}/shares`);
  return (response.data || []).map((s: any) => this.parseShareInfo(s));
}

async revokeShare(shareId: number): Promise<{ success: boolean }> {
  await this.request<any>('DELETE', `/v2/shares/${shareId}`);
  return { success: true };
}
```

**Location**: `src/index.ts` (new tool definition + handler)

```typescript
// In allTools array:
{
  name: 'otcs_share',
  description: 'Manage document sharing. Actions: create, list, revoke, access_log.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['create', 'list', 'revoke', 'access_log'] },
      node_id: { type: 'number', description: 'Node to share (for create/list)' },
      share_id: { type: 'number', description: 'Share ID (for revoke/access_log)' },
      recipients: { type: 'array', description: 'Array of {type, id, permissions}' },
      expiration_days: { type: 'number' },
      password: { type: 'string' },
    },
    required: ['action'],
  },
},

// In switch statement:
case 'otcs_share': {
  const { action, node_id, share_id, recipients, expiration_days, password } = args;
  switch (action) {
    case 'create':
      return await client.createShare(node_id, { recipients, expiration_days, password });
    case 'list':
      return await client.listShares(node_id);
    case 'revoke':
      return await client.revokeShare(share_id);
    case 'access_log':
      return await client.getShareAccessLog(share_id);
  }
}
```

### 1.2 Add `otcs_batch_classify` Tool

Batch classification already exists partially—we extend it.

**Location**: `src/client/otcs-client.ts`

```typescript
// Add to existing RM section:
async applyRMClassificationBatch(
  nodeIds: number[],
  classificationId: number,
  rsiData?: { rsid: number; status_date?: string }
): Promise<{ success: boolean; count: number; failed: number[] }> {
  const results: { success: boolean; node_id: number; error?: string }[] = [];
  const failed: number[] = [];

  // Process in parallel batches (reuse existing pattern)
  const maxConcurrency = 5;
  for (let i = 0; i < nodeIds.length; i += maxConcurrency) {
    const batch = nodeIds.slice(i, i + maxConcurrency);
    const batchResults = await Promise.all(
      batch.map(async (nodeId) => {
        try {
          await this.applyRMClassification({ node_id: nodeId, classification_id: classificationId, rsi_data: rsiData });
          return { success: true, node_id: nodeId };
        } catch (error) {
          failed.push(nodeId);
          return { success: false, node_id: nodeId, error: String(error) };
        }
      })
    );
    results.push(...batchResults);
  }

  return { success: true, count: nodeIds.length - failed.length, failed };
}
```

### 1.3 Add Enhanced Search with Metadata Filters

**Location**: `src/client/otcs-client.ts`

```typescript
async searchWithMetadata(params: {
  query: string;
  metadata_filters?: Record<string, any>;
  workspace_types?: string[];
  classifications?: number[];
  date_range?: { start: string; end: string };
  limit?: number;
}): Promise<SearchResultWithMetadata> {
  // Build complex search query using existing search infrastructure
  let searchQuery = params.query;
  const filters: string[] = [];

  if (params.date_range) {
    filters.push(`OTCreateDate:[${params.date_range.start} TO ${params.date_range.end}]`);
  }

  // Execute search and enrich with metadata
  const results = await this.search(searchQuery, undefined, params.limit || 50);

  // Filter by workspace types if specified
  if (params.workspace_types && params.workspace_types.length > 0) {
    // Post-filter results by workspace type
  }

  return {
    documents: results,
    filters_applied: params,
    total_count: results.length,
  };
}
```

---

## Phase 2: Orchestrators

### Architecture Decision: Orchestrators as Tools

Orchestrators are implemented as **regular MCP tools** that internally coordinate multiple operations. This matches the existing pattern—just larger tools.

### 2.1 `otcs_legal_hold_process` Orchestrator

**Location**: `src/orchestrators/legal-hold.ts` (new file)

```typescript
import { OTCSClient } from '../client/otcs-client.js';

export interface LegalHoldProcessInput {
  matter: { name: string; type: 'Legal' | 'Administrative' | 'Audit'; description?: string };
  criteria: {
    keywords?: string[];
    date_range?: { start: string; end: string };
    custodians?: number[];
    workspaces?: number[];
  };
  options: {
    existing_hold_id?: number;
    generate_manifest?: boolean;
    dry_run?: boolean;
  };
}

export interface LegalHoldProcessResult {
  discovery: { documents_found: number; custodians_identified: any[]; };
  analysis: { conflicts: any[]; new_documents_to_hold: number; };
  preview: { documents: any[]; total_documents: number; };
  execution?: { hold: any; documents_held: number; manifest?: any; };
  audit: { operation_id: string; timestamp: string; actions_taken: string[]; };
}

export async function executeLegalHoldProcess(
  client: OTCSClient,
  input: LegalHoldProcessInput
): Promise<LegalHoldProcessResult> {
  const audit = { operation_id: crypto.randomUUID(), timestamp: new Date().toISOString(), actions_taken: [] as string[] };

  // Phase 1: DISCOVER
  audit.actions_taken.push('Starting discovery phase');
  const searchResults = await discoverDocuments(client, input.criteria);

  // Phase 2: ANALYZE
  audit.actions_taken.push('Analyzing results');
  const analysis = await analyzeHoldScope(client, searchResults, input.options.existing_hold_id);

  // Phase 3: PREVIEW
  const preview = {
    documents: searchResults.slice(0, 100),
    total_documents: searchResults.length,
  };

  if (input.options.dry_run) {
    return { discovery: { documents_found: searchResults.length, custodians_identified: [] }, analysis, preview, audit };
  }

  // Phase 4: EXECUTE
  audit.actions_taken.push('Executing hold application');
  const hold = input.options.existing_hold_id
    ? { id: input.options.existing_hold_id, created: false }
    : await client.createRMHold({ name: input.matter.name, type: input.matter.type as any });

  const nodeIds = searchResults.map(r => r.id);
  const holdResult = await client.applyRMHoldBatch(nodeIds, hold.id);

  // Phase 5: NOTIFY (manifest generation)
  let manifest;
  if (input.options.generate_manifest) {
    manifest = await generateHoldManifest(client, input.matter, searchResults);
  }

  audit.actions_taken.push(`Hold applied to ${holdResult.count} documents`);

  return {
    discovery: { documents_found: searchResults.length, custodians_identified: [] },
    analysis,
    preview,
    execution: { hold, documents_held: holdResult.count, manifest },
    audit,
  };
}

async function discoverDocuments(client: OTCSClient, criteria: any) {
  // Build search query from criteria
  const query = criteria.keywords?.join(' OR ') || '*';
  return await client.search(query, undefined, 1000);
}

async function analyzeHoldScope(client: OTCSClient, documents: any[], existingHoldId?: number) {
  const conflicts: any[] = [];
  // Check for existing holds on documents
  return { conflicts, new_documents_to_hold: documents.length };
}

async function generateHoldManifest(client: OTCSClient, matter: any, documents: any[]) {
  // Generate manifest document
  return { id: 0, name: `${matter.name} - Hold Manifest.pdf`, path: '' };
}
```

**Location**: `src/index.ts` (add tool + import + handler)

```typescript
// Add import at top:
import { executeLegalHoldProcess } from './orchestrators/legal-hold.js';

// Add to allTools:
{
  name: 'otcs_legal_hold_process',
  description: 'End-to-end legal hold: discover documents → analyze scope → preview → apply hold → generate manifest. Use dry_run=true first.',
  inputSchema: {
    type: 'object',
    properties: {
      matter: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Hold/matter name' },
          type: { type: 'string', enum: ['Legal', 'Administrative', 'Audit'] },
          description: { type: 'string' },
        },
        required: ['name', 'type'],
      },
      criteria: {
        type: 'object',
        properties: {
          keywords: { type: 'array', items: { type: 'string' } },
          date_range: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' } } },
          custodians: { type: 'array', items: { type: 'number' } },
          workspaces: { type: 'array', items: { type: 'number' } },
        },
      },
      options: {
        type: 'object',
        properties: {
          existing_hold_id: { type: 'number' },
          generate_manifest: { type: 'boolean', default: true },
          dry_run: { type: 'boolean', default: false },
        },
      },
    },
    required: ['matter', 'criteria'],
  },
},

// Add to switch:
case 'otcs_legal_hold_process': {
  return await executeLegalHoldProcess(client, args as any);
}
```

### 2.2 Tool Profile for Orchestrators

**Location**: `src/index.ts` (extend TOOL_PROFILES)

```typescript
const TOOL_PROFILES: Record<string, string[]> = {
  // ... existing profiles ...

  // NEW: Orchestrator-focused profile
  orchestrator: [
    'otcs_authenticate', 'otcs_session_status',
    'otcs_get_node', 'otcs_browse', 'otcs_search',
    // Include orchestrators
    'otcs_legal_hold_process',
    'otcs_classification_process',
    'otcs_workspace_lifecycle',
    'otcs_intelligent_filing',
    'otcs_review_cycle',
  ],

  // NEW: Legal/Compliance persona
  legal: [
    'otcs_authenticate', 'otcs_session_status',
    'otcs_get_node', 'otcs_browse', 'otcs_search',
    'otcs_rm_holds', 'otcs_rm_classification',
    'otcs_legal_hold_process',  // The orchestrator
    'otcs_share',
  ],
};
```

---

## Phase 3: Implementation Order

### Priority 1 (Foundation)

| Task | File Changes | Effort |
|------|--------------|--------|
| Add `otcs_share` tool | client + index | Small |
| Add `otcs_batch_classify` | client + index | Small |
| Add enhanced search | client | Small |
| Add new types | types.ts | Small |

### Priority 2 (First Orchestrators)

| Task | File Changes | Effort |
|------|--------------|--------|
| Create `orchestrators/` dir | New directory | Trivial |
| `legal_hold_process` | New file + index | Medium |
| `classification_process` | New file + index | Medium |
| Add `orchestrator` profile | index.ts | Trivial |

### Priority 3 (Remaining Orchestrators)

| Task | File Changes | Effort |
|------|--------------|--------|
| `workspace_lifecycle` | New file + index | Medium |
| `intelligent_filing` | New file + index | Medium |
| `review_cycle` | New file + index | Medium |
| Add persona profiles | index.ts | Small |

### Priority 4 (Bots - Future)

Bots are orchestrators that can run autonomously. Implementation is similar but with:
- Polling mechanism for workflow tasks
- State persistence
- Error recovery

---

## File Structure After Enhancement

```
src/
├── client/
│   └── otcs-client.ts        # +300 lines (new methods)
├── orchestrators/            # NEW directory
│   ├── legal-hold.ts
│   ├── classification.ts
│   ├── workspace-lifecycle.ts
│   ├── intelligent-filing.ts
│   └── review-cycle.ts
├── types.ts                  # +100 lines (new interfaces)
└── index.ts                  # +200 lines (new tools + handlers)
```

---

## Key Decisions

### 1. Single File for Tool Handlers (Keep)

The switch statement in `index.ts` works well. Adding 5-10 new cases is manageable. No need for a handler registry pattern.

### 2. Orchestrators as Separate Module Files

Each orchestrator gets its own file in `src/orchestrators/` for:
- Code organization
- Testability
- Future extensibility

### 3. No Database/State Layer (Yet)

For MVP orchestrators:
- Use in-memory state during execution
- Return complete results
- No persistence between calls

Future enhancement: Add SQLite or similar for long-running processes.

### 4. Reuse Existing Batch Patterns

All new batch operations follow the exact pattern of `applyRMHoldBatch`:
```typescript
formData.append('ids', nodeIds.join(','));
```

Or the parallel processing pattern from `upload_folder`.

---

## Validation Checklist

Before merging any enhancement:

- [ ] Follows existing code style
- [ ] Uses existing patterns (batch, parallel, tool def)
- [ ] Added to appropriate tool profile(s)
- [ ] Types added to `types.ts`
- [ ] Tested manually with Claude
- [ ] No breaking changes to existing tools

---

## Summary

**This is an enhancement, not an overhaul.**

We're adding:
- ~4 new client methods (following existing patterns)
- ~5 new orchestrator modules (new files, clean separation)
- ~10 new tool definitions (same pattern as existing 40)
- ~3 new tool profiles (extend existing system)

We're NOT changing:
- Architecture (MCP server, client pattern)
- Tool registration (same allTools array)
- Tool handling (same switch statement)
- Authentication/session management
- Any existing tool behavior

---

*Document Version: 1.0*
*Created: 2026-01-21*
*Status: Ready for Implementation*
