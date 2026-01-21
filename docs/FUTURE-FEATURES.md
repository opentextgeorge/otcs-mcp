# OTCS-MCP Intelligent Automation Strategy

## Executive Summary

The future of OTCS-MCP is not about building dozens of individual "smart" tools. The AI agent (Claude) already provides intelligence - it interprets intent, makes decisions, and orchestrates actions. What we need are **process orchestrators** that execute end-to-end business processes through coordinated multi-step operations.

**Design Principle**: Fewer tools, more power. Each tool should handle a complete business process, not a single function.

---

## Part 1: The Intelligence Model

### Where Intelligence Lives

| Layer | What It Does | Examples |
|-------|--------------|----------|
| **AI Agent (Claude)** | Intent interpretation, decision making, natural language understanding, context awareness | "Find all contracts with Acme" → knows to search, what fields matter |
| **Orchestrator Tools** | Multi-step process execution, transaction management, state tracking | Legal hold process, workspace provisioning, bulk classification |
| **Transactional Tools** | Single CRUD operations, atomic actions | upload, search, create_folder, apply_hold |

The AI agent is the brain. Orchestrator tools are the hands that execute complex, coordinated work. Transactional tools are the fingers that perform individual operations.

### The Orchestrator Pattern

Every orchestrator follows a consistent five-phase pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR PATTERN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DISCOVER    →  Find content/targets based on criteria       │
│       ↓                                                         │
│  2. ANALYZE     →  Assess state, identify gaps, calculate scope │
│       ↓                                                         │
│  3. PREVIEW     →  Show impact, get confirmation (dry_run)      │
│       ↓                                                         │
│  4. EXECUTE     →  Perform actions in transaction batches       │
│       ↓                                                         │
│  5. NOTIFY      →  Generate reports, trigger workflows, audit   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Persona-Driven Process Design

Before defining tools, we must understand **who** uses them and **what processes** they need to execute.

### Persona: Legal / Compliance

**Mission**: Protect the organization through proper information governance, litigation readiness, and regulatory compliance.

| Process | Current Pain | What They Need |
|---------|--------------|----------------|
| **Legal Hold** | Manual search, document-by-document hold application, no manifest | Single command: criteria → discovery → hold → manifest → notification workflow |
| **eDiscovery Prep** | Export scattered across folders, inconsistent metadata | Identify custodian documents, package for export, generate chain of custody |
| **Compliance Audit** | Manual spot-checks, no systematic scanning | Automated scanning for classification gaps, permission anomalies, retention violations |
| **Regulatory Reporting** | Manual counting and categorization | Automated reports on records by classification, retention status, hold status |

**Example Process - Legal Hold**:
```
Legal Request: "Place litigation hold on all Acme Corp documents from 2023-2024
               related to the service agreement dispute. Notify all custodians."

Process Flow:
1. DISCOVER: Search for documents matching:
   - Keywords: "Acme", "service agreement", "dispute"
   - Date range: 2023-01-01 to 2024-12-31
   - Custodians: Identify document creators/modifiers

2. ANALYZE:
   - 234 documents found across 12 workspaces
   - 8 unique custodians identified
   - 15 documents already on existing holds
   - Total size: 4.5 GB

3. PREVIEW:
   - Show document list with relevance scores
   - Identify conflicts with existing holds
   - Estimate workflow recipients

4. EXECUTE:
   - Create hold: "Acme Corp Litigation - 2024"
   - Apply hold to 234 documents (batch operation)
   - Generate hold manifest (PDF/Excel)
   - Upload manifest to Legal Holds workspace

5. NOTIFY:
   - Start "Legal Hold Notification" workflow
   - Recipients: 8 custodians + Legal team
   - Attach: Hold manifest, preservation instructions
   - Track acknowledgments
```

---

### Persona: Records Manager

**Mission**: Ensure proper classification, retention, and disposition of organizational records.

| Process | Current Pain | What They Need |
|---------|--------------|----------------|
| **Classification Campaign** | Manual review of each document, inconsistent application | Bulk discovery of unclassified content, AI-suggested classifications, batch application |
| **Retention Review** | No visibility into what's expiring | Dashboard of records approaching disposition, approval workflows |
| **Disposition Processing** | Manual identification and destruction | Automated identification, legal hold checks, approval routing, certified destruction |
| **Compliance Reporting** | Manual metrics gathering | Automated reports on classification coverage, retention compliance, disposition backlog |

**Example Process - Classification Campaign**:
```
Records Manager Request: "Classify all unclassified documents in the HR workspace
                         that are older than 30 days."

Process Flow:
1. DISCOVER:
   - Scan HR workspace recursively
   - Filter: documents without RM classification
   - Filter: created > 30 days ago
   - Result: 156 unclassified documents

2. ANALYZE:
   - Group by folder location and document type
   - Analyze sibling documents for classification patterns
   - Extract content keywords for classification suggestions
   - Result:
     - 89 documents in Employee Records folders → suggest "HR > Employee Records"
     - 45 documents in Recruiting folders → suggest "HR > Recruiting"
     - 22 documents unclear → flag for manual review

3. PREVIEW:
   - Show groupings with suggested classifications
   - Highlight confidence levels
   - Identify documents requiring manual review

4. EXECUTE:
   - Apply classifications in batches
   - Assign appropriate RSI schedules
   - Log all actions for audit trail

5. NOTIFY:
   - Generate classification report
   - Send summary to Records Manager
   - Queue manual review items as tasks
```

---

### Persona: Project / Case Manager

**Mission**: Manage project/case workspaces through their lifecycle with proper governance.

| Process | Current Pain | What They Need |
|---------|--------------|----------------|
| **Workspace Setup** | Manual folder creation, role assignment, template following | One-click provisioning with team, structure, classifications, and related workspace links |
| **Health Check** | No visibility into workspace state | Automated assessment of structure, permissions, stale content, compliance |
| **Project Closeout** | Manual archival, no consistency | Guided closeout: verify deliverables, final classification, archive workflow, access restriction |
| **Team Transition** | Manual permission updates when people change | Detect inactive members, suggest replacements, bulk permission updates |

**Example Process - Workspace Provisioning**:
```
Project Manager Request: "Create a new Customer workspace for Acme Corporation.
                         They're a manufacturing company in Chicago. Set up the
                         standard folder structure and link to their existing contracts."

Process Flow:
1. DISCOVER:
   - Find workspace type: "Customer"
   - Identify existing Acme-related workspaces
   - Look up standard folder template

2. ANALYZE:
   - Customer workspace type requires: Name, Industry, Location, Account Manager
   - Found 2 existing Acme workspaces: "Acme - Sales Contract 2023", "Acme - Support Case #1234"
   - Standard template has 8 folders: Contracts, Correspondence, Invoices, etc.

3. PREVIEW:
   - Workspace configuration summary
   - Folder structure to be created
   - Related workspaces to link
   - Role assignments needed

4. EXECUTE:
   - Create workspace with business properties
   - Create folder structure from template
   - Apply RM classifications to folders
   - Link related workspaces
   - Assign requesting user as Owner

5. NOTIFY:
   - Return workspace details and URL
   - Optionally start "New Customer Onboarding" workflow
```

---

### Persona: Document Controller / Quality Manager

**Mission**: Ensure document integrity, proper versioning, and controlled distribution.

| Process | Current Pain | What They Need |
|---------|--------------|----------------|
| **Document Review Cycle** | Manual routing, tracking in spreadsheets | Automated review package assembly, routing, tracking, and completion |
| **Transmittal Processing** | Manual package creation, recipient tracking | Bulk document selection, transmittal generation, delivery tracking |
| **Version Control Audit** | No visibility into version history issues | Scan for version anomalies, orphaned drafts, naming inconsistencies |
| **Supersession Management** | Manual cross-reference maintenance | Automated detection of document relationships, suggested cross-references |

---

### Persona: Knowledge Worker

**Mission**: Find, use, and contribute to organizational knowledge efficiently.

| Process | Current Pain | What They Need |
|---------|--------------|----------------|
| **Smart Search** | Complex query syntax, scattered results | Natural language search, contextual results, relationship awareness |
| **Document Filing** | Uncertainty about where to file, what metadata | Intelligent destination suggestion, auto-metadata extraction, duplicate detection |
| **Finding Related Content** | Manual cross-reference following | Automatic relationship discovery across the system |
| **Getting Approvals** | Uncertainty about which workflow, who to include | Suggested workflows based on document type, auto-populated forms |

---

## Part 3: Orchestrator Tool Definitions

Based on the persona analysis, we define **5 core orchestrators** that cover the major process patterns.

### Orchestrator 1: `otcs_legal_hold_process`

**Purpose**: End-to-end legal/administrative hold management from discovery through notification.

**Phases**:
| Phase | Operations |
|-------|------------|
| DISCOVER | Multi-criteria search: keywords, dates, custodians, workspaces, document types |
| ANALYZE | Identify unique custodians, calculate scope, detect hold conflicts, assess storage impact |
| PREVIEW | Return document list, custodian list, conflicts, impact summary |
| EXECUTE | Create hold (if new), batch apply hold, generate manifest document, upload to Legal workspace |
| NOTIFY | Start notification workflow, attach manifest, track acknowledgments |

**Input**:
```typescript
{
  // Discovery criteria (natural language OR structured)
  matter: {
    name: string;                    // "Acme Corp Service Agreement Dispute"
    type: "Legal" | "Administrative" | "Audit";
    description?: string;
  };

  criteria: {
    keywords?: string[];             // ["Acme", "service agreement"]
    date_range?: { start: string; end: string };
    custodians?: number[];           // User IDs
    workspaces?: number[];           // Workspace IDs to search
    workspace_types?: string[];      // ["Customer", "Contract"]
    document_types?: string[];       // File types or OTCS types
    classifications?: number[];      // RM classification IDs
    metadata_filters?: Record<string, any>;  // Category field filters
  };

  options: {
    existing_hold_id?: number;       // Add to existing hold instead of creating new
    include_children?: boolean;      // Include folder children (default: true)
    generate_manifest?: boolean;     // Create manifest document (default: true)
    manifest_format?: "pdf" | "excel" | "both";
    start_notification_workflow?: boolean;
    notification_workflow_id?: number;
    dry_run?: boolean;               // Preview only (default: false)
  };
}
```

**Output**:
```typescript
{
  discovery: {
    query_interpreted: string;       // Human-readable interpretation
    documents_found: number;
    custodians_identified: Array<{ id: number; name: string; document_count: number }>;
    workspaces_involved: Array<{ id: number; name: string; document_count: number }>;
    total_size_bytes: number;
    date_range_actual: { earliest: string; latest: string };
  };

  analysis: {
    conflicts: Array<{
      document_id: number;
      document_name: string;
      existing_hold: { id: number; name: string };
      recommendation: string;
    }>;
    already_held_count: number;
    new_documents_to_hold: number;
  };

  preview: {
    documents: Array<{
      id: number;
      name: string;
      path: string;
      custodian: string;
      relevance_score: number;
      already_held: boolean;
    }>;  // Top 100 or configurable
    total_documents: number;
  };

  execution?: {  // Only if not dry_run
    hold: { id: number; name: string; created: boolean };
    documents_held: number;
    manifest?: { id: number; name: string; path: string };
    workflow_started?: { id: number; process_id: number };
  };

  audit: {
    operation_id: string;
    timestamp: string;
    user: string;
    actions_taken: string[];
  };
}
```

---

### Orchestrator 2: `otcs_classification_process`

**Purpose**: Bulk discovery, analysis, and classification of unclassified or misclassified content.

**Phases**:
| Phase | Operations |
|-------|------------|
| DISCOVER | Find content matching criteria (unclassified, specific locations, age thresholds) |
| ANALYZE | Determine suggested classifications based on content, location, siblings, document type |
| PREVIEW | Return groupings with confidence scores, identify manual review candidates |
| EXECUTE | Batch apply classifications, assign RSI schedules, update metadata |
| NOTIFY | Generate classification report, queue manual review tasks, send summary |

**Input**:
```typescript
{
  scope: {
    root_id: number;                 // Starting folder/workspace
    depth?: number;                  // How deep to scan (-1 for unlimited)
    include_workspaces?: boolean;    // Descend into business workspaces
  };

  discovery_criteria: {
    unclassified_only?: boolean;     // Only find unclassified documents
    age_threshold_days?: number;     // Only documents older than X days
    document_types?: number[];       // Specific OTCS types
    exclude_folders?: number[];      // Skip these folders
  };

  classification_rules?: {
    use_sibling_patterns?: boolean;  // Infer from siblings (default: true)
    use_folder_context?: boolean;    // Infer from folder name/location (default: true)
    use_content_analysis?: boolean;  // Analyze document content (default: true)
    minimum_confidence?: number;     // Only suggest if confidence > X (default: 0.7)
    default_classification?: number; // Fallback classification ID

    // Explicit rules (highest priority)
    folder_mappings?: Array<{
      folder_pattern: string;        // Regex or glob for folder path
      classification_id: number;
    }>;
  };

  options: {
    auto_assign_rsi?: boolean;       // Assign RSI with classification (default: true)
    generate_report?: boolean;       // Create classification report (default: true)
    create_review_tasks?: boolean;   // Queue uncertain items for manual review
    dry_run?: boolean;
  };
}
```

**Output**:
```typescript
{
  discovery: {
    total_scanned: number;
    unclassified_found: number;
    already_classified: number;
    folders_scanned: number;
  };

  analysis: {
    groupings: Array<{
      suggested_classification: {
        id: number;
        name: string;
        path: string;
      };
      confidence: number;            // 0-1
      reasoning: string;             // "78% of siblings have this classification"
      documents: Array<{
        id: number;
        name: string;
        path: string;
        individual_confidence: number;
      }>;
      rsi_suggestion?: {
        id: number;
        name: string;
        retention_period: string;
      };
    }>;

    manual_review_required: Array<{
      id: number;
      name: string;
      path: string;
      reason: string;               // "Low confidence", "Multiple possible classifications"
      suggestions: Array<{ classification_id: number; confidence: number }>;
    }>;

    summary: {
      high_confidence_count: number;   // Can auto-classify
      medium_confidence_count: number; // Review recommended
      low_confidence_count: number;    // Manual review required
    };
  };

  execution?: {
    classified_count: number;
    rsi_assigned_count: number;
    review_tasks_created: number;
    report?: { id: number; name: string; path: string };
  };
}
```

---

### Orchestrator 3: `otcs_workspace_lifecycle`

**Purpose**: Manage workspace provisioning, health assessment, and closeout processes.

**Modes**:
- `provision`: Create and configure a new workspace
- `health_check`: Assess workspace state and compliance
- `closeout`: Archive and restrict access to completed workspace

**Input**:
```typescript
{
  mode: "provision" | "health_check" | "closeout";

  // For provision mode
  provision?: {
    workspace_type: string | number;
    name: string;
    description?: string;
    business_properties: Record<string, any>;

    options: {
      copy_structure_from?: number;  // Clone structure from existing workspace
      link_related_workspaces?: {
        by_property?: string;        // Link workspaces with same property value
        by_type?: string[];          // Link workspaces of these types
      };
      auto_classify_folders?: boolean;
      initial_team?: Array<{
        user_id: number;
        role: string;
      }>;
      start_onboarding_workflow?: number;  // Workflow map ID
    };
  };

  // For health_check mode
  health_check?: {
    workspace_id: number;
    checks: {
      structure?: boolean;           // Compare to template
      permissions?: boolean;         // Role/permission alignment
      classification?: boolean;      // RM coverage
      metadata?: boolean;            // Required fields complete
      activity?: boolean;            // Stale content detection
      team?: boolean;                // Inactive members, unfilled roles
    };
    stale_threshold_days?: number;   // Default: 90
  };

  // For closeout mode
  closeout?: {
    workspace_id: number;
    options: {
      verify_deliverables?: boolean;
      final_classification_check?: boolean;
      restrict_access?: boolean;
      archive_location?: number;     // Move to archive folder
      start_closeout_workflow?: number;
      generate_closeout_report?: boolean;
    };
  };
}
```

---

### Orchestrator 4: `otcs_review_cycle`

**Purpose**: Manage document review and approval cycles from package assembly through completion.

**Phases**:
| Phase | Operations |
|-------|------------|
| DISCOVER | Identify documents requiring review (by criteria or explicit list) |
| ANALYZE | Determine review type, identify reviewers, estimate timeline |
| PREVIEW | Show review package, reviewer assignments, workflow configuration |
| EXECUTE | Assemble package, start review workflow, track status |
| NOTIFY | Monitor progress, send reminders, compile feedback, finalize |

**Input**:
```typescript
{
  review_type: "approval" | "feedback" | "sign_off" | "quality_check";

  documents: {
    // Either explicit list or discovery criteria
    document_ids?: number[];

    discovery_criteria?: {
      workspace_id?: number;
      folder_id?: number;
      query?: string;
      document_types?: string[];
      status_filter?: string;        // e.g., "Draft", "Pending Review"
    };
  };

  review_configuration: {
    workflow_id?: number;            // Specific workflow to use
    auto_select_workflow?: boolean;  // Choose based on document type

    reviewers?: {
      explicit?: number[];           // Specific user IDs
      by_role?: string[];            // "Legal", "Finance", "Manager"
      from_workspace_roles?: boolean; // Use workspace role assignments
    };

    options: {
      sequential?: boolean;          // Reviewers in sequence vs parallel
      due_date?: string;
      reminder_days?: number[];      // [3, 1] = remind at 3 days and 1 day before due
      require_comments?: boolean;
      allow_delegation?: boolean;
    };
  };

  package_options?: {
    create_package_folder?: boolean; // Group documents in a folder
    include_cover_sheet?: boolean;   // Generate review cover sheet
    include_checklist?: boolean;     // Generate review checklist
  };
}
```

---

### Orchestrator 5: `otcs_intelligent_filing`

**Purpose**: Intelligently file documents with destination suggestion, metadata extraction, and duplicate detection.

**Phases**:
| Phase | Operations |
|-------|------------|
| DISCOVER | Analyze document content and context |
| ANALYZE | Identify document type, extract entities, find destination candidates, detect duplicates |
| PREVIEW | Show recommendations with confidence scores |
| EXECUTE | Move/copy to destination, apply classification, populate metadata, create cross-references |
| NOTIFY | Confirm filing, suggest related actions |

**Input**:
```typescript
{
  document_id: number;

  analysis_options: {
    extract_content?: boolean;       // Parse document text (default: true)
    detect_document_type?: boolean;  // Contract, Invoice, Memo, etc. (default: true)
    extract_entities?: boolean;      // Parties, dates, amounts (default: true)
    check_duplicates?: boolean;      // Find similar documents (default: true)
  };

  destination: {
    // Either explicit or discovered
    folder_id?: number;
    workspace_id?: number;

    // Or let the system suggest
    auto_suggest?: boolean;
    destination_hint?: string;       // "file in customer contracts for Acme"

    // Constraints for suggestions
    workspace_types?: string[];      // Prefer these workspace types
    must_be_classified?: boolean;    // Only suggest classified locations
  };

  metadata_options: {
    auto_populate?: boolean;         // Fill metadata from content (default: true)
    category_id?: number;            // Specific category to populate
    confirm_values?: boolean;        // Return values for confirmation before applying
  };

  classification_options: {
    auto_classify?: boolean;         // Apply RM classification (default: false)
    classification_hint?: string;    // "this is a service contract"
  };

  options: {
    move_vs_copy?: "move" | "copy";  // Default: move
    create_destination_if_missing?: boolean;
    dry_run?: boolean;
  };
}
```

**Output**:
```typescript
{
  document_analysis: {
    detected_type: string;           // "Service Contract"
    confidence: number;

    extracted_entities: {
      parties: Array<{ name: string; role: string; confidence: number }>;
      dates: Array<{ type: string; value: string; confidence: number }>;
      amounts: Array<{ value: number; currency: string; context: string }>;
      references: Array<{ type: string; value: string }>;  // Contract numbers, etc.
    };

    content_summary?: string;        // Brief summary of document
  };

  destination_recommendations: Array<{
    folder_id: number;
    path: string;
    workspace?: { id: number; name: string; type: string };
    confidence: number;
    reasoning: string;               // "Acme Corp workspace contains related contracts"
    classification?: { id: number; path: string };
  }>;

  duplicates_found: Array<{
    id: number;
    name: string;
    path: string;
    similarity: number;
    relationship: string;            // "Possible duplicate", "Earlier version", "Related"
  }>;

  metadata_mapping?: {
    category_id: number;
    extracted_values: Record<string, { value: any; confidence: number; source: string }>;
    missing_required: string[];
  };

  execution?: {
    filed_to: { id: number; path: string };
    classification_applied?: { id: number; path: string };
    metadata_populated?: Record<string, any>;
    cross_references_created?: Array<{ target_id: number; type: string }>;
  };
}
```

---

## Part 4: Supporting Capabilities

The orchestrators rely on these enhanced capabilities in the underlying tools.

### Batch Operations

All transactional tools should support batch mode:

```typescript
// Single operation
otcs_rm_holds({ action: "apply_hold", hold_id: 1, node_id: 123 })

// Batch operation
otcs_rm_holds({
  action: "apply_hold_batch",
  hold_id: 1,
  node_ids: [123, 124, 125, ...],
  batch_options: {
    continue_on_error: true,
    parallel_limit: 10,
    progress_callback: true
  }
})
```

### Content Analysis Service

A new capability for document intelligence:

```typescript
interface ContentAnalysis {
  // Extract text content from documents
  extractText(nodeId: number): Promise<string>;

  // Identify document type from content
  detectDocumentType(content: string): Promise<{
    type: string;
    confidence: number;
    indicators: string[];
  }>;

  // Extract structured entities
  extractEntities(content: string): Promise<{
    parties: Entity[];
    dates: DateEntity[];
    amounts: AmountEntity[];
    references: ReferenceEntity[];
  }>;

  // Calculate content similarity
  calculateSimilarity(content1: string, content2: string): Promise<number>;
}
```

### Process State Management

For long-running processes:

```typescript
interface ProcessState {
  process_id: string;
  orchestrator: string;
  phase: "discover" | "analyze" | "preview" | "execute" | "notify" | "complete" | "error";
  started_at: string;
  updated_at: string;

  progress: {
    total_items: number;
    processed_items: number;
    failed_items: number;
    current_operation: string;
  };

  can_resume: boolean;
  can_cancel: boolean;

  results_so_far?: any;
  error?: string;
}
```

---

## Part 5: Implementation Roadmap

### Phase 1: Foundation Enhancement (Q1)

**Goal**: Enhance existing tools to support orchestrators

1. **Batch Operations**
   - Add batch mode to: `rm_holds`, `rm_classification`, `categories`, `permissions`
   - Implement parallel execution with rate limiting
   - Add progress tracking

2. **Enhanced Search**
   - Add metadata field filtering to `search`
   - Add workspace-scoped search
   - Add result aggregation (by custodian, workspace, date)

3. **Content Access**
   - Implement text extraction from common document types
   - Add content caching for repeated access

### Phase 2: Core Orchestrators (Q2)

**Goal**: Deliver highest-value orchestrators

1. **`otcs_legal_hold_process`** - Complete legal hold workflow
   - Highest value for compliance risk mitigation
   - Demonstrates the full orchestrator pattern

2. **`otcs_classification_process`** - Bulk classification workflow
   - High value for records management
   - Builds on existing RM tools

### Phase 3: Workspace & Filing (Q3)

**Goal**: Workspace lifecycle and intelligent filing

3. **`otcs_workspace_lifecycle`** - Provisioning, health, closeout
   - Addresses project management needs
   - Enables governance at workspace level

4. **`otcs_intelligent_filing`** - Smart document filing
   - Highest user-facing value
   - Requires content analysis capability

### Phase 4: Review & Refinement (Q4)

**Goal**: Complete the orchestrator suite and refine

5. **`otcs_review_cycle`** - Document review management
   - Integrates with workflow capabilities
   - Completes document lifecycle coverage

6. **Refinement**
   - Performance optimization
   - Error handling enhancement
   - User feedback incorporation

---

## Part 6: Design Principles

### 1. Dry-Run First
Every orchestrator supports `dry_run: true` mode that shows exactly what will happen without making changes. Users should preview before executing.

### 2. Explainable Recommendations
When the system suggests actions, it explains why:
- "Suggested classification: HR > Employee Records (78% of siblings have this classification)"
- "Recommended destination: /Customers/Acme Corp (document mentions 'Acme' 12 times)"

### 3. Graceful Degradation
If content analysis isn't available, fall back to metadata and location analysis. If batch operations fail partially, report what succeeded and what failed.

### 4. Audit Everything
Every orchestrator operation creates audit records:
- What was discovered
- What decisions were made
- What actions were taken
- Who authorized it
- When it happened

### 5. Resumable Operations
Long-running operations can be paused and resumed. If a process fails midway, it can continue from where it left off.

### 6. Minimal Tool Count
Resist the urge to create single-purpose tools. If a capability is only useful as part of a larger process, embed it in the orchestrator rather than exposing it as a separate tool.

---

## Part 7: Success Metrics

| Orchestrator | Key Metrics |
|--------------|-------------|
| Legal Hold | Time to apply hold (hours → minutes), Hold completeness (% documents captured) |
| Classification | Classification coverage improvement, Time saved vs manual |
| Workspace Lifecycle | Workspace setup time, Health score improvement, Closeout completeness |
| Intelligent Filing | Filing accuracy, Metadata completeness, Duplicate prevention |
| Review Cycle | Review cycle time, On-time completion rate |

### Overall Platform Metrics

- **Process Automation Rate**: % of document processes handled by orchestrators
- **User Efficiency**: Reduction in steps/time for common tasks
- **Compliance Score**: System-wide classification and retention coverage
- **Error Reduction**: Fewer misfiled documents, missed holds, permission errors

---

## Appendix A: Workflow Integration Patterns

Orchestrators can trigger workflows at key points:

| Orchestrator | Workflow Triggers |
|--------------|-------------------|
| Legal Hold | Hold notification, Custodian acknowledgment |
| Classification | Manual review routing, Classification approval |
| Workspace | Onboarding, Closeout approval |
| Filing | Approval for sensitive destinations |
| Review | The entire review cycle |

### Workflow Trigger Pattern

```typescript
{
  trigger_workflow: {
    workflow_id: number;
    trigger_point: "after_discovery" | "after_execution" | "on_error";

    // Context passed to workflow
    attach_documents?: boolean;
    attach_report?: boolean;

    // Role mapping
    role_assignments?: {
      [role_name: string]: number | "from_workspace" | "from_custodians";
    };

    // Form pre-population
    form_values?: Record<string, any>;
  }
}
```

---

## Appendix B: Error Handling Strategy

### Error Categories

1. **Recoverable**: Retry automatically (network timeout, rate limit)
2. **Partial**: Continue with remaining items (single document access failure)
3. **Blocking**: Stop and report (authentication failure, permission denied)
4. **Validation**: Reject before execution (invalid input, constraint violation)

### Error Response Pattern

```typescript
{
  success: false,
  error: {
    category: "partial" | "blocking" | "validation",
    message: "15 of 234 documents could not be held",

    failed_items: [
      { id: 123, error: "Permission denied" },
      { id: 456, error: "Document locked by another user" }
    ],

    successful_items: 219,

    can_retry: true,
    retry_command: { /* Same command with only failed items */ }
  }
}
```

---

## Appendix C: Comparison - Old vs New Approach

### Old Approach: Many Individual Tools

```
User: "Place a legal hold on all Acme documents from 2023"

Agent: Let me search for those documents...
[otcs_search] → 234 results

Agent: Now let me create a hold...
[otcs_rm_holds create_hold] → hold created

Agent: Now let me apply the hold to each document...
[otcs_rm_holds apply_hold] × 234 times

Agent: Now let me create a manifest...
[generate PDF] → manifest created

Agent: Now let me upload the manifest...
[otcs_upload] → uploaded

Agent: Now let me start the notification workflow...
[otcs_start_workflow] → started

Total: 240+ tool calls, multiple round-trips, error-prone
```

### New Approach: Single Orchestrator

```
User: "Place a legal hold on all Acme documents from 2023"

Agent: I'll use the legal hold orchestrator with dry_run first...
[otcs_legal_hold_process dry_run=true] → preview shows 234 documents

Agent: Preview looks correct. Executing...
[otcs_legal_hold_process dry_run=false] → complete

Total: 2 tool calls, complete process, audited, workflow started
```

---

## Part 8: Automation Bots

Beyond orchestrators that humans invoke, we need **autonomous worker bots** that can handle end-to-end business processes triggered by requests, workflows, or schedules.

### The Bot Concept

| Aspect | Orchestrator | Automation Bot |
|--------|--------------|----------------|
| **Trigger** | Human invokes via AI agent | Workflow task, API call, schedule, or AI agent |
| **Interaction** | Preview → Confirm → Execute | Fully autonomous (configurable checkpoints) |
| **Scope** | Single process instance | Continuous service handling multiple requests |
| **State** | Stateless (completes and done) | Stateful (tracks requests, maintains context) |

### Bot Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATION BOT PATTERN                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INTAKE          →  Receive request (workflow, API, natural language)   │
│       ↓                                                                 │
│  LOG             →  Create case/workflow, document the request          │
│       ↓                                                                 │
│  DISCOVER        →  Search, find, compile relevant information          │
│       ↓                                                                 │
│  PROCESS         →  Transform, summarize, package, prepare              │
│       ↓                                                                 │
│  DELIVER         →  Share, notify, distribute to requestor              │
│       ↓                                                                 │
│  CLOSE           →  Mark complete, audit trail, metrics                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Bot 1: `otcs_document_request_bot`

**Purpose**: Handle document requests end-to-end - from intake to delivery with full audit trail.

**Trigger Sources**:
- Workflow task assignment (automated intake)
- Direct API call (integration with portals/apps)
- AI agent conversation (natural language request)
- Email integration (parse incoming requests)

**Example Scenario**:
```
Request: "I need all contracts with Acme Corp from the past 2 years
         for the quarterly business review. Please include summaries."

Bot Process:
1. INTAKE
   - Parse request: entity="Acme Corp", type="contracts", range="2 years", include_summary=true
   - Identify requestor: John Smith, Finance Department
   - Validate: Requestor has permission to access contract documents

2. LOG
   - Create case workflow: "Document Request #DR-2026-0042"
   - Log request details, requestor, timestamp
   - Set SLA timer (e.g., 4 hours for standard request)

3. DISCOVER
   - Search: workspace_type="Customer" + name contains "Acme"
   - Search: classification="Contracts" + date > 2024-01-21
   - Result: 23 contracts found across 3 workspaces
   - Download content for summarization

4. PROCESS
   - Generate summary for each contract (AI-powered)
   - Create cover sheet with index
   - Compile into package folder
   - Generate executive summary document

5. DELIVER
   - Create shared folder: "DR-2026-0042 - Acme Contracts"
   - Copy documents to shared folder
   - Set permissions: Requestor + Finance team
   - Generate share link (if external sharing enabled)
   - Send notification with link and summary

6. CLOSE
   - Update workflow: Mark complete
   - Record: 23 documents delivered, 4 hours elapsed
   - Archive request record for audit
   - Update metrics dashboard
```

**Input**:
```typescript
{
  request: {
    // Natural language or structured
    description?: string;           // "All Acme contracts from 2023-2024"

    // Structured criteria (if not using natural language)
    criteria?: {
      keywords?: string[];
      workspaces?: number[];
      workspace_types?: string[];
      classifications?: number[];
      document_types?: string[];
      date_range?: { start: string; end: string };
      metadata_filters?: Record<string, any>;
    };

    // Request options
    include_summaries?: boolean;
    include_index?: boolean;
    output_format?: "folder" | "zip" | "package";
  };

  requestor: {
    user_id?: number;              // OTCS user ID
    email?: string;                // For external notifications
    department?: string;
    justification?: string;        // Why they need the documents
  };

  delivery: {
    method: "shared_folder" | "download_link" | "email" | "workflow";
    share_with?: number[];         // Additional user IDs
    expiration_days?: number;      // Auto-expire share after N days
    notify?: boolean;              // Send notification when ready
  };

  workflow_options?: {
    create_case?: boolean;         // Create tracking case (default: true)
    case_workflow_id?: number;     // Specific workflow template
    require_approval?: boolean;    // Route for approval first
    approver_id?: number;
  };

  sla?: {
    priority: "urgent" | "standard" | "low";
    due_hours?: number;
  };
}
```

**Output**:
```typescript
{
  request_id: string;              // "DR-2026-0042"
  status: "completed" | "pending_approval" | "in_progress" | "failed";

  discovery: {
    documents_found: number;
    workspaces_searched: number;
    search_criteria_used: string;
  };

  package: {
    folder_id: number;
    folder_path: string;
    document_count: number;
    total_size_bytes: number;
    index_document_id?: number;
    summary_document_id?: number;
  };

  delivery: {
    share_link?: string;
    shared_with: Array<{ user_id: number; name: string }>;
    expiration_date?: string;
    notification_sent: boolean;
  };

  workflow: {
    case_id: number;
    process_id: number;
    status: string;
  };

  audit: {
    request_timestamp: string;
    completion_timestamp: string;
    elapsed_minutes: number;
    actions_log: string[];
  };
}
```

---

### Bot 2: `otcs_document_sharing_bot`

**Purpose**: Manage secure document sharing with external or internal parties.

> **Implementation Note**: Sharing API exists (`/v2/shares`) but is not yet implemented as MCP tool. This bot requires:
> - `otcs_share_item` - Share document/folder with provider
> - `otcs_stop_share` - Revoke sharing
> - `otcs_get_shares` - List active shares

**Capabilities**:
- Create shared folders with appropriate permissions
- Generate time-limited access links
- Track share access and downloads
- Auto-expire shares based on policy
- Notify when shares are accessed
- Revoke shares on demand or schedule

**Example Scenario**:
```
Request: "Share the Project Phoenix deliverables with our client contact
         at acme@example.com. They should only have read access for 30 days."

Bot Process:
1. INTAKE: Parse sharing request, identify documents, validate permissions

2. LOG: Create sharing record, document business justification

3. DISCOVER:
   - Find Project Phoenix workspace
   - Identify deliverables folder
   - List 15 documents to be shared

4. PROCESS:
   - Create external share folder
   - Copy documents (or create shortcuts)
   - Apply read-only permissions
   - Set 30-day expiration

5. DELIVER:
   - Generate secure share link
   - Send email to acme@example.com with access instructions
   - Log share activation

6. CLOSE:
   - Schedule auto-revocation for day 30
   - Set up access monitoring
   - Update sharing registry
```

**Input**:
```typescript
{
  content: {
    node_ids?: number[];           // Specific documents
    folder_id?: number;            // Entire folder
    workspace_id?: number;         // Workspace deliverables
    query?: string;                // Search and share results
  };

  recipients: Array<{
    type: "internal_user" | "internal_group" | "external_email";
    identifier: number | string;   // User ID, Group ID, or email
    permissions: "read" | "read_download" | "edit";
  }>;

  options: {
    expiration_days?: number;
    password_protected?: boolean;
    download_limit?: number;       // Max downloads per recipient
    watermark?: boolean;           // Apply watermark to downloads
    notify_on_access?: boolean;
    require_acknowledgment?: boolean;
  };

  tracking: {
    business_justification: string;
    project_reference?: string;
    approval_required?: boolean;
  };
}
```

---

### Bot 3: `otcs_document_retrieval_bot`

**Purpose**: Intelligent document finding and compilation for complex queries.

**Capabilities**:
- Natural language query interpretation
- Multi-source search (content, metadata, classifications)
- Relevance ranking and filtering
- Duplicate detection and consolidation
- Version management (latest vs all versions)
- Cross-reference following

**Example Scenario**:
```
Request: "Find everything we have about the Johnson merger -
         due diligence documents, board minutes, legal opinions,
         financial analyses. Need this for the integration team."

Bot Process:
1. INTAKE: Parse complex multi-topic query

2. LOG: Create retrieval case

3. DISCOVER:
   - Search for "Johnson" across all workspaces
   - Filter by workspace types: M&A, Legal, Finance, Board
   - Search classifications: Due Diligence, Board Minutes, Legal Opinion
   - Search content for merger-related terms
   - Result: 156 documents across 8 workspaces

4. PROCESS:
   - Deduplicate (found 12 duplicates)
   - Organize by category:
     - Due Diligence (45 docs)
     - Board Minutes (8 docs)
     - Legal Opinions (23 docs)
     - Financial Analysis (34 docs)
     - Correspondence (46 docs)
   - Generate index with descriptions
   - Create navigation cover sheet

5. DELIVER:
   - Create organized folder structure
   - Set permissions for integration team
   - Notify with summary and access link

6. CLOSE:
   - Log retrieval metrics
   - Store query for future reference
```

---

### Bot 4: `otcs_document_summary_bot`

**Purpose**: Generate intelligent summaries of documents and document collections.

**Capabilities**:
- Single document summarization
- Collection/folder summarization
- Comparison summaries (what's different between versions)
- Key entity extraction
- Timeline generation
- Risk/issue identification

**Example Scenario**:
```
Request: "Summarize the vendor contracts expiring in Q1 2026.
         Highlight any auto-renewal clauses and notice periods."

Bot Process:
1. INTAKE: Parse summary request with specific focus areas

2. LOG: Create summary case

3. DISCOVER:
   - Search: classification="Vendor Contracts"
   - Filter: expiration_date between 2026-01-01 and 2026-03-31
   - Result: 18 contracts

4. PROCESS:
   - Download and parse each contract
   - Extract for each:
     - Vendor name
     - Contract value
     - Expiration date
     - Auto-renewal clause (yes/no, terms)
     - Notice period required
     - Key obligations
   - Generate:
     - Executive summary
     - Tabular comparison
     - Risk highlights (short notice periods, unfavorable auto-renewal)
     - Recommended actions

5. DELIVER:
   - Create summary report (PDF)
   - Upload to Procurement workspace
   - Notify procurement team

6. CLOSE:
   - Log summary generation
   - Schedule reminder for notice periods
```

**Input**:
```typescript
{
  scope: {
    node_ids?: number[];
    folder_id?: number;
    workspace_id?: number;
    query?: string;
  };

  summary_type: "executive" | "detailed" | "comparison" | "extraction";

  focus_areas?: string[];          // ["auto-renewal", "notice periods", "liability"]

  extraction_schema?: {            // For structured extraction
    fields: Array<{
      name: string;
      description: string;
      type: "text" | "date" | "number" | "boolean";
    }>;
  };

  output: {
    format: "text" | "pdf" | "spreadsheet";
    include_source_links?: boolean;
    upload_location?: number;      // Folder ID to save report
  };
}
```

---

### Bot 5: `otcs_workflow_automation_bot`

**Purpose**: Monitor and automate workflow processing for routine decisions.

**Capabilities**:
- Auto-approve based on rules (amount thresholds, document types)
- Route to appropriate reviewer based on content
- Send reminders and escalations
- Compile workflow packages
- Generate workflow analytics

**Example Scenario**:
```
Rule: "Auto-approve expense reports under $500 from verified employees.
       Route anything over $500 to department manager.
       Escalate after 3 days without action."

Bot Process (continuous):
1. MONITOR: Watch for new expense workflow tasks

2. EVALUATE each task:
   - Extract: Amount = $325, Employee = Jane Doe (verified)
   - Rule match: Amount < $500, employee verified
   - Decision: AUTO-APPROVE

3. EXECUTE:
   - Complete workflow task with disposition "Approved"
   - Add comment: "Auto-approved per policy EXP-001"
   - Log decision and rationale

4. ESCALATE (if needed):
   - Task pending > 3 days
   - Send reminder to assignee
   - If still pending after reminder, escalate to manager
```

---

## Part 9: Sharing Implementation Requirements

### New MCP Tools Needed

The automation bots require these sharing-related tools to be implemented:

```typescript
// 1. Create a share
otcs_share({
  action: "create",
  node_id: number,
  share_type: "internal" | "external" | "public_link",

  // For internal sharing
  share_with?: Array<{
    type: "user" | "group",
    id: number,
    permissions: ("see" | "see_contents" | "modify" | "edit_attributes" |
                  "add_items" | "reserve" | "delete")[]
  }>,

  // For external/link sharing
  external_options?: {
    email_recipients?: string[],
    password?: string,
    expiration_date?: string,
    download_limit?: number,
    access_tracking?: boolean
  }
})

// 2. List shares for a node
otcs_share({
  action: "list",
  node_id: number
})

// 3. Revoke a share
otcs_share({
  action: "revoke",
  share_id: number
})

// 4. Get share access logs
otcs_share({
  action: "access_log",
  share_id: number
})
```

### API Endpoints Available

Per Content Server REST API 2.0.2:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/shares` | POST | Share item with provider |
| `/v2/shares/{id}` | DELETE | Stop sharing item |

Additional endpoints may be needed:
- List shares for a node
- Get share details
- Access tracking/logging

---

## Part 10: Bot Integration with Workflows

### Workflow-Triggered Bots

Bots can be triggered by workflow events:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  User submits   │ ──── │  Workflow task   │ ──── │  Bot processes  │
│  request form   │      │  created         │      │  automatically  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                           │
                         ┌──────────────────┐              │
                         │  Workflow        │ ◄────────────┘
                         │  continues       │
                         └──────────────────┘
```

### Example: Document Request Workflow

1. **User** submits "Document Request" form in OTCS
2. **Workflow** creates task assigned to "Document Bot" service account
3. **Bot** detects new task via `otcs_get_assignments`
4. **Bot** processes request using `otcs_document_request_bot`
5. **Bot** completes workflow task with results
6. **Workflow** notifies requestor, archives case

### Bot Service Pattern

```typescript
// Bot runs as a service, polling for work
async function documentRequestBotService() {
  while (true) {
    // Check for new tasks
    const tasks = await otcs_get_assignments();

    for (const task of tasks.filter(t => t.workflow_type === "Document Request")) {
      try {
        // Extract request details from workflow form
        const request = parseWorkflowForm(task);

        // Process the request
        const result = await otcs_document_request_bot(request);

        // Complete the workflow task
        await otcs_workflow_task({
          action: "send",
          process_id: task.process_id,
          task_id: task.task_id,
          disposition: "SendOn",
          comment: `Request completed. ${result.discovery.documents_found} documents delivered.`,
          form_data: {
            delivery_folder: result.package.folder_path,
            document_count: result.package.document_count
          }
        });

      } catch (error) {
        // Handle errors, potentially reassign to human
        await escalateToHuman(task, error);
      }
    }

    // Wait before next poll
    await sleep(60000); // 1 minute
  }
}
```

---

## Part 11: Complete Tool Inventory

### Current Tools (Transactional)

| Category | Tools | Count |
|----------|-------|-------|
| Core | authenticate, session_status, logout, get_node, browse, search | 6 |
| Documents | upload, upload_batch, upload_folder, upload_with_metadata, download_content, versions | 6 |
| Folders | create_folder, node_action (copy/move/rename/delete) | 2 |
| Workspaces | workspace_types, create_workspace, get_workspace, search_workspaces, workspace_roles, workspace_relations, workspace_metadata | 7 |
| Workflows | get_assignments, workflow_status, workflow_definition, workflow_tasks, workflow_activities, start_workflow, workflow_form, workflow_task, draft_workflow, workflow_info, manage_workflow | 11 |
| Categories | categories (list/get/add/update/remove/get_form) | 1 |
| Permissions | permissions (get/add/update/remove/effective/set_owner/set_public) | 1 |
| Members | members (search/get/get_user_groups/get_group_members), group_membership | 2 |
| Records Mgmt | rm_classification, rm_holds, rm_xref, rm_rsi | 4 |
| **Total Transactional** | | **40** |

### Proposed Orchestrators

| Orchestrator | Purpose | Priority |
|--------------|---------|----------|
| otcs_legal_hold_process | End-to-end legal hold | P1 |
| otcs_classification_process | Bulk classification | P1 |
| otcs_workspace_lifecycle | Workspace management | P2 |
| otcs_intelligent_filing | Smart document filing | P2 |
| otcs_review_cycle | Document review cycles | P3 |
| **Total Orchestrators** | | **5** |

### Proposed Automation Bots

| Bot | Purpose | Priority |
|-----|---------|----------|
| otcs_document_request_bot | Handle document requests | P1 |
| otcs_document_sharing_bot | Manage document sharing | P1 |
| otcs_document_retrieval_bot | Intelligent search/compile | P2 |
| otcs_document_summary_bot | Generate summaries | P2 |
| otcs_workflow_automation_bot | Automate workflow decisions | P3 |
| **Total Bots** | | **5** |

### New Tools Required

| Tool | Purpose | For |
|------|---------|-----|
| otcs_share | Create/manage shares | Sharing bot |
| otcs_batch_hold | Batch hold operations | Legal hold orchestrator |
| otcs_batch_classify | Batch classification | Classification orchestrator |
| otcs_content_extract | Extract text from documents | Summary bot, filing |
| **Total New Tools** | | **4** |

### Summary

| Category | Count |
|----------|-------|
| Transactional Tools (current) | 40 |
| New Transactional Tools | 4 |
| Orchestrators | 5 |
| Automation Bots | 5 |
| **Total Platform Capabilities** | **54** |

---

## Part 12: Implementation Notes

### Incremental Enhancement Approach

See **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** for detailed implementation guidance.

**Key Architecture Decisions**:

1. **Orchestrators are MCP Tools** - No new runtime pattern. Orchestrators are regular tools that internally coordinate multiple operations.

2. **Reuse Existing Patterns**:
   - Batch operations: Follow `applyRMHoldBatch()` pattern
   - Parallel processing: Follow `otcs_upload_folder` pattern
   - Tool definitions: Same `allTools` array structure

3. **File Organization**:
   ```
   src/
   ├── orchestrators/    # NEW: One file per orchestrator
   │   ├── legal-hold.ts
   │   └── classification.ts
   ├── client/
   │   └── otcs-client.ts  # Add new methods
   └── index.ts            # Add new tool defs + handlers
   ```

4. **Tool Profiles Extended**:
   - `orchestrator` - All orchestrator tools
   - `legal` - Legal/compliance persona
   - `records` - Records management persona

### Prerequisites Before Orchestrators

| Dependency | Status | Notes |
|------------|--------|-------|
| Batch hold operations | ✅ Done | `applyRMHoldBatch()` exists |
| Batch classification | 🔲 Needed | Add to client |
| Enhanced search | 🔲 Needed | Metadata filters |
| Sharing API | 🔲 Needed | `otcs_share` tool |

### Testing Strategy

1. **Unit Tests**: Each orchestrator function independently
2. **Integration Tests**: Full flow with dry_run=true
3. **Manual Testing**: Real OTCS server validation

---

*Document Version: 3.1*
*Last Updated: 2026-01-21*
*Status: Strategic Planning - Implementation Notes Added*
