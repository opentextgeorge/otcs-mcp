# Intelligent Tools Recommendation for OTCS-MCP

## Philosophy: From CRUD to Intelligence

The current 37 tools are **transactional** - they do one thing well. Intelligent tools should be **advisory and autonomous** - they analyze, recommend, and execute complex workflows that would otherwise require multiple back-and-forth interactions with an AI agent.

---

## Category 1: Intelligent Filing & Classification

### Tool: `otcs_smart_file`
**Purpose:** Intelligently file a document by analyzing its content and context

**What Makes It Smart:**
- Downloads and analyzes document text content
- Identifies document type (contract, invoice, memo, policy, etc.)
- Searches for appropriate destination folders/workspaces
- Suggests RM classification from classification tree
- Auto-populates metadata from extracted content
- Detects potential duplicates before filing

**Building Blocks:**
```
download_content → content analysis → search_workspaces →
browse (classification tree) → create node → add_category →
apply_rm_classification
```

**Input:**
```typescript
{
  node_id: number;              // Document to file (or temp upload)
  analyze_content?: boolean;    // Extract text for analysis (default: true)
  destination_hint?: string;    // Natural language hint: "file in HR policies"
  auto_classify?: boolean;      // Auto-apply RM classification
  auto_metadata?: boolean;      // Auto-extract and apply metadata
  dry_run?: boolean;            // Preview actions without executing
}
```

**Output:**
```typescript
{
  document_analysis: {
    detected_type: "Contract",
    detected_parties: ["Acme Corp", "Beta Inc"],
    detected_dates: { effective: "2024-01-15", expiration: "2025-01-15" },
    detected_values: { amount: "$50,000" },
    language: "en",
    confidence: 0.92
  },
  recommendations: {
    destination: { id: 12345, path: "/Contracts/Acme Corp/2024", confidence: 0.88 },
    classification: { id: 5678, name: "Legal > Contracts > Service Agreements", confidence: 0.91 },
    rsi_schedule: { id: 789, name: "7-Year Contract Retention", confidence: 0.85 },
    metadata: {
      "Contract Type": "Service Agreement",
      "Party A": "Acme Corp",
      "Effective Date": "2024-01-15"
    }
  },
  duplicates_found: [
    { id: 99999, name: "Acme Contract v1.docx", similarity: 0.94 }
  ],
  actions_taken: [...] // if not dry_run
}
```

---

### Tool: `otcs_classify_advisor`
**Purpose:** Recommend RM classification and retention for unclassified content

**What Makes It Smart:**
- Traverses classification tree to understand available options
- Analyzes document content against classification descriptions
- Considers folder context and sibling document classifications
- Suggests appropriate RSI retention schedule
- Identifies regulatory/compliance implications

**Building Blocks:**
```
get_node → download_content → rm_classification (browse_tree) →
rm_rsi (list) → sibling analysis → recommendation engine
```

**Input:**
```typescript
{
  node_id: number;
  include_siblings?: boolean;   // Analyze what siblings are classified as
  include_parent_context?: boolean;  // Consider folder/workspace context
  regulatory_context?: string;  // "HIPAA", "SOX", "GDPR", etc.
}
```

**Output:**
```typescript
{
  current_state: {
    is_classified: false,
    has_retention: false,
    is_confidential: false
  },
  recommendations: [
    {
      classification: { id: 123, path: "HR > Employee Records > Performance" },
      confidence: 0.89,
      rationale: "Document contains performance review keywords and is located in HR workspace",
      rsi_suggestion: { id: 456, name: "Employee Records - 7 Years", retention_period: "7 years" }
    },
    // ... alternative recommendations
  ],
  sibling_patterns: {
    most_common_classification: "HR > Employee Records",
    classification_coverage: "78% of siblings are classified"
  },
  compliance_notes: [
    "HIPAA: Document may contain PHI - consider confidential marking",
    "State Law: Employee records require 7-year minimum retention"
  ]
}
```

---

## Category 2: Compliance & Governance Intelligence

### Tool: `otcs_compliance_scan`
**Purpose:** Scan folder/workspace for compliance gaps and policy violations

**What Makes It Smart:**
- Recursively analyzes folder structure
- Identifies unclassified documents that should be records
- Finds documents with missing required metadata
- Detects permission anomalies (overly permissive access)
- Identifies documents that should be on hold but aren't
- Checks retention coverage

**Building Blocks:**
```
browse (recursive) → get_categories → rm_classification (get) →
rm_holds (get_node_holds) → permissions (get) → analysis
```

**Input:**
```typescript
{
  root_id: number;              // Folder or workspace to scan
  depth?: number;               // How deep to scan (default: all)
  checks: {
    unclassified?: boolean;     // Find docs without RM classification
    missing_metadata?: boolean; // Find docs with incomplete categories
    permission_review?: boolean;// Find unusual permission patterns
    retention_gaps?: boolean;   // Find records without RSI
    hold_coverage?: boolean;    // Check hold applicability
  };
  classification_rules?: {      // Custom rules
    required_for_types?: number[];  // Node types that must be classified
    age_threshold_days?: number;    // Flag unclassified items older than X days
  };
}
```

**Output:**
```typescript
{
  summary: {
    total_items_scanned: 1250,
    compliance_score: 72,  // Percentage
    critical_issues: 15,
    warnings: 48
  },
  issues: {
    unclassified: [
      { id: 123, name: "Contract.pdf", age_days: 45, suggested_action: "Classify as Legal Record" }
    ],
    missing_metadata: [
      { id: 456, name: "Invoice.pdf", missing_fields: ["Vendor", "Amount", "Due Date"] }
    ],
    permission_anomalies: [
      { id: 789, name: "Confidential Report.docx", issue: "Public access enabled on confidential document" }
    ],
    retention_gaps: [
      { id: 101, name: "Employee File.pdf", classified: true, rsi_assigned: false }
    ]
  },
  recommendations: [
    { action: "bulk_classify", target_ids: [123, 124, 125], suggested_classification: 5678 },
    { action: "apply_hold", target_ids: [789], reason: "Appears related to active litigation matter" }
  ]
}
```

---

### Tool: `otcs_smart_hold`
**Purpose:** Intelligently apply legal/administrative holds based on criteria

**What Makes It Smart:**
- Interprets natural language hold criteria
- Searches across the system for matching content
- Previews impact before applying
- Creates hold with proper documentation
- Sets up monitoring for new matching content
- Generates hold manifest/report

**Building Blocks:**
```
search (multiple criteria) → create_hold → apply_hold (batch) →
generate report
```

**Input:**
```typescript
{
  matter_description: string;   // "All documents related to Acme Corp dispute from 2023"
  hold_type: "Legal" | "Administrative" | "Audit";
  search_criteria?: {
    keywords?: string[];
    date_range?: { start: string; end: string };
    workspaces?: number[];
    document_types?: string[];
    parties?: string[];
  };
  custodian_id?: number;
  dry_run?: boolean;            // Preview without applying
  generate_manifest?: boolean;  // Create hold inventory document
}
```

**Output:**
```typescript
{
  hold_analysis: {
    search_query_generated: "name:*Acme* AND modify_date:[2023-01-01 TO 2023-12-31]",
    documents_found: 234,
    unique_custodians: 12,
    storage_size_gb: 4.5
  },
  preview: [
    { id: 123, name: "Acme Contract.pdf", path: "/Legal/Contracts/Acme", relevance: 0.95 },
    // ... top 20 results
  ],
  conflicts: [
    { id: 456, existing_hold: "SEC Investigation", recommendation: "Document already preserved" }
  ],
  actions_taken: {
    hold_created: { id: 999, name: "Acme Corp Dispute 2023" },
    documents_held: 234,
    manifest_created: { id: 1000, path: "/Legal Holds/Acme Corp Dispute 2023/Manifest.xlsx" }
  }
}
```

---

## Category 3: Workspace Intelligence

### Tool: `otcs_workspace_health`
**Purpose:** Comprehensive health check and optimization recommendations for a workspace

**What Makes It Smart:**
- Analyzes workspace structure, content, and activity
- Identifies stale content (not accessed in X days)
- Detects permission inconsistencies
- Finds incomplete role assignments
- Checks metadata completeness
- Compares against workspace type template
- Identifies orphaned or misplaced content

**Building Blocks:**
```
get_workspace → browse (recursive) → workspace_roles → permissions (get) →
categories (list) → activity analysis → comparison with template
```

**Input:**
```typescript
{
  workspace_id: number;
  checks: {
    structure?: boolean;        // Compare against template
    permissions?: boolean;      // Check role/permission alignment
    metadata?: boolean;         // Check required fields
    activity?: boolean;         // Identify stale content
    compliance?: boolean;       // RM classification coverage
  };
  stale_threshold_days?: number; // Default: 90
}
```

**Output:**
```typescript
{
  workspace: { id: 12345, name: "Project Alpha", type: "Project" },
  health_score: 78,
  analysis: {
    structure: {
      missing_folders: ["Deliverables", "Meeting Notes"],  // vs template
      extra_folders: ["Temp", "Old Stuff"],
      recommendation: "Create standard folder structure"
    },
    team: {
      unfilled_roles: ["Project Sponsor", "QA Lead"],
      inactive_members: [{ id: 100, name: "John Doe", last_active: "2023-06-15" }],
      permission_drift: [
        { user_id: 200, has_permission: "edit", expected: "read", folder: "Budget" }
      ]
    },
    content: {
      total_documents: 450,
      stale_documents: 45,  // Not accessed in 90 days
      unclassified_records: 23,
      missing_metadata: 67
    },
    activity: {
      last_activity: "2024-01-10",
      trend: "declining",  // Activity decreasing over time
      hot_spots: ["/Deliverables/Phase 2"]  // Most active areas
    }
  },
  recommendations: [
    { priority: "high", action: "Fill Project Sponsor role", impact: "Governance" },
    { priority: "medium", action: "Archive 45 stale documents", impact: "Storage" },
    { priority: "low", action: "Create missing standard folders", impact: "Organization" }
  ]
}
```

---

### Tool: `otcs_workspace_setup`
**Purpose:** Intelligently set up a new workspace with best practices

**What Makes It Smart:**
- Suggests team members based on similar workspaces
- Pre-populates folder structure from templates or similar workspaces
- Sets up related workspace links automatically
- Applies appropriate RM classifications to folders
- Configures permissions based on role patterns

**Building Blocks:**
```
workspace_types → create_workspace → create_folder (structure) →
workspace_roles (populate) → rm_classification (apply) →
workspace_relations (link)
```

**Input:**
```typescript
{
  workspace_type: string | number;  // Type name or ID
  name: string;
  business_properties: Record<string, any>;
  setup_options: {
    copy_structure_from?: number;     // Clone structure from existing workspace
    suggest_team?: boolean;           // Recommend team members
    auto_classify_folders?: boolean;  // Apply RM classifications
    link_related?: {                  // Auto-discover related workspaces
      by_property?: string;           // e.g., "Customer Name"
      by_type?: string[];             // e.g., ["Contract", "Project"]
    };
  };
}
```

---

## Category 4: Document Intelligence

### Tool: `otcs_find_related`
**Purpose:** Discover documents related to a given document across the system

**What Makes It Smart:**
- Analyzes document content for entities (people, companies, dates, topics)
- Searches for documents mentioning same entities
- Checks existing cross-references
- Identifies documents in same workspace/matter
- Finds version/amendment relationships
- Detects near-duplicates

**Building Blocks:**
```
download_content → entity extraction → search (multiple) →
rm_xref (get) → workspace_relations → similarity analysis
```

**Input:**
```typescript
{
  node_id: number;
  relationship_types?: ("content_similar" | "same_entities" | "same_matter" |
                        "version_chain" | "references" | "supersedes")[];
  scope?: {
    workspace_only?: boolean;
    include_workspaces?: number[];
    exclude_workspaces?: number[];
  };
  max_results?: number;
}
```

**Output:**
```typescript
{
  source: { id: 123, name: "Acme Service Agreement v2.docx" },
  relationships: {
    content_similar: [
      { id: 456, name: "Acme Service Agreement v1.docx", similarity: 0.92,
        differences: "Updated payment terms section" }
    ],
    same_entities: [
      { id: 789, name: "Acme Corp Profile.pdf", entities_matched: ["Acme Corp", "John Smith"] }
    ],
    references: [
      { id: 101, name: "Acme Invoice #1234.pdf", reference_type: "cites" }
    ],
    suggested_xrefs: [
      { target_id: 456, xref_type: "Supersedes", confidence: 0.95,
        reason: "Earlier version of same document" }
    ]
  }
}
```

---

### Tool: `otcs_extract_metadata`
**Purpose:** Intelligently extract metadata from document content

**What Makes It Smart:**
- Downloads and parses document content
- Uses pattern matching and NLP to extract:
  - Dates (effective, expiration, signature)
  - Parties/entities
  - Monetary values
  - Reference numbers (contract #, invoice #)
  - Classification indicators
- Maps extracted values to category schema

**Building Blocks:**
```
download_content → content parsing → categories (get_form) →
value mapping → categories (update)
```

**Input:**
```typescript
{
  node_id: number;
  target_category_id?: number;   // Map to specific category
  auto_apply?: boolean;          // Apply extracted values
  extraction_hints?: {
    document_type?: string;      // "contract", "invoice", "memo"
    date_format?: string;        // Expected date format
    entity_types?: string[];     // What to look for
  };
}
```

**Output:**
```typescript
{
  extracted: {
    dates: {
      effective_date: { value: "2024-01-15", confidence: 0.95, source: "Page 1, Line 5" },
      expiration_date: { value: "2025-01-15", confidence: 0.88, source: "Page 12, Section 8" }
    },
    parties: [
      { name: "Acme Corporation", role: "Provider", confidence: 0.92 },
      { name: "Beta Industries", role: "Client", confidence: 0.90 }
    ],
    values: {
      contract_value: { amount: 50000, currency: "USD", confidence: 0.85 }
    },
    references: {
      contract_number: "ACM-2024-001"
    }
  },
  category_mapping: {
    category_id: 5678,
    mapped_fields: {
      "Effective Date": "2024-01-15",
      "Party A": "Acme Corporation",
      "Contract Value": "$50,000"
    },
    unmapped_extractions: ["expiration_date"],  // No matching field
    missing_required: ["Approval Status"]        // Required but not extracted
  },
  actions_taken: { ... }  // if auto_apply
}
```

---

## Category 5: Workflow Intelligence

### Tool: `otcs_workflow_advisor`
**Purpose:** Recommend and configure workflows based on document/situation

**What Makes It Smart:**
- Analyzes document type and content
- Identifies applicable workflows
- Pre-configures workflow form based on document metadata
- Suggests role assignments based on workspace team
- Estimates completion time based on historical data

**Building Blocks:**
```
get_node → download_content → workflow_definition (list) →
workspace_roles → workflow pattern analysis → draft_workflow (configure)
```

**Input:**
```typescript
{
  document_id: number;
  workflow_hint?: string;        // "approval", "review", "signature"
  auto_configure?: boolean;      // Pre-fill workflow form from document
}
```

**Output:**
```typescript
{
  document: { id: 123, name: "Contract.pdf", type: "Contract" },
  recommended_workflows: [
    {
      workflow_id: 5000,
      name: "Contract Approval",
      match_reason: "Document type is Contract, standard approval required",
      confidence: 0.92,
      estimated_duration: "3-5 business days",
      suggested_configuration: {
        roles: {
          "Legal Reviewer": { user_id: 100, name: "Jane Smith", reason: "Assigned Legal role in workspace" },
          "Approver": { user_id: 200, name: "John Doe", reason: "Contract value < $100k threshold" }
        },
        form_values: {
          "Contract Value": "$50,000",  // Extracted from document
          "Urgency": "Normal"
        }
      }
    }
  ],
  ready_to_initiate: {
    draft_id: 9999,  // Pre-created draft if auto_configure
    configured: true
  }
}
```

---

### Tool: `otcs_workflow_bottleneck`
**Purpose:** Analyze workflow queues to identify bottlenecks and suggest optimizations

**What Makes It Smart:**
- Aggregates workflow status across users/teams
- Identifies overloaded users
- Detects overdue patterns
- Suggests delegation or reassignment
- Predicts future bottlenecks

**Building Blocks:**
```
workflow_status (all) → get_assignments (aggregated) →
user workload analysis → pattern detection
```

**Input:**
```typescript
{
  scope?: {
    workflow_types?: number[];
    workspaces?: number[];
    time_range_days?: number;
  };
  include_predictions?: boolean;
}
```

**Output:**
```typescript
{
  overview: {
    total_active_workflows: 234,
    total_pending_tasks: 567,
    overdue_tasks: 45,
    average_completion_days: 4.2
  },
  bottlenecks: [
    {
      user_id: 100,
      user_name: "John Smith",
      pending_tasks: 28,
      overdue_tasks: 12,
      average_days_to_complete: 8.5,
      recommendation: "Delegate 10 tasks to available team members",
      suggested_delegates: [
        { user_id: 101, name: "Jane Doe", current_load: 5, capacity: 15 }
      ]
    }
  ],
  patterns: {
    slow_steps: [
      { step_name: "Legal Review", average_days: 6.5, target_days: 2 }
    ],
    peak_times: ["End of month", "Quarter close"],
    escalation_candidates: [
      { workflow_id: 1234, days_overdue: 10, current_step: "VP Approval" }
    ]
  },
  predictions: {
    next_week_volume: 45,
    risk_users: ["john.smith", "legal.team"]  // Likely to become bottlenecks
  }
}
```

---

## Category 6: Search Intelligence

### Tool: `otcs_natural_search`
**Purpose:** Translate natural language queries into structured OTCS searches

**What Makes It Smart:**
- Parses natural language intent
- Identifies entity types (people, dates, document types)
- Builds complex query with proper syntax
- Searches across appropriate scopes
- Ranks results by relevance

**Input:**
```typescript
{
  query: string;  // "contracts with Acme expiring in the next 30 days over $100k"
  scope?: {
    workspace_types?: string[];
    locations?: number[];
  };
}
```

**Output:**
```typescript
{
  interpreted_query: {
    document_type: "Contract",
    entity: "Acme",
    date_filter: { field: "expiration_date", range: "next 30 days" },
    value_filter: { field: "contract_value", operator: ">", value: 100000 }
  },
  generated_query: {
    otcs_search: "type:Contract name:*Acme*",
    where_column_query: "expiration_date < 2024-02-15 AND contract_value > 100000"
  },
  results: [
    { id: 123, name: "Acme Service Agreement", relevance: 0.95,
      highlights: { expiration: "2024-02-01", value: "$150,000" } }
  ],
  suggestions: [
    "Also found 3 contracts with 'Acme' in content but not title",
    "Related workspace: 'Acme Corp Customer Workspace' has 12 contracts"
  ]
}
```

---

## Implementation Priority Matrix

| Tool | Value | Complexity | Priority |
|------|-------|------------|----------|
| `otcs_compliance_scan` | High | Medium | **1st** |
| `otcs_smart_hold` | High | Medium | **2nd** |
| `otcs_workspace_health` | High | Medium | **3rd** |
| `otcs_classify_advisor` | High | Medium | **4th** |
| `otcs_smart_file` | Very High | High | **5th** |
| `otcs_find_related` | Medium | High | 6th |
| `otcs_extract_metadata` | Medium | High | 7th |
| `otcs_natural_search` | Medium | Medium | 8th |
| `otcs_workflow_bottleneck` | Medium | Medium | 9th |
| `otcs_workflow_advisor` | Medium | High | 10th |
| `otcs_workspace_setup` | Low | Medium | 11th |

---

## Technical Considerations

### Content Analysis Capability
Several tools require **document content analysis**. Options:
1. **Simple extraction**: Text from PDFs/Office docs (can use existing `download_content`)
2. **Pattern matching**: Regex for dates, amounts, references
3. **LLM analysis**: Pass content to the AI model for entity extraction (most powerful)

### Caching Requirements
- Classification tree (changes rarely)
- Workspace templates
- User/group directory for suggestions
- Workflow definitions

### New Client Methods Needed
```typescript
// Content analysis
analyzeDocumentContent(nodeId: number): Promise<ContentAnalysis>

// Aggregation
getWorkspaceStatistics(workspaceId: number): Promise<WorkspaceStats>
getWorkflowStatistics(filters: WorkflowFilters): Promise<WorkflowStats>

// Batch operations
batchGetCategories(nodeIds: number[]): Promise<CategoryInfo[]>
batchGetClassifications(nodeIds: number[]): Promise<RMClassification[]>
```

---

## Tool Profile for Intelligent Features

A new `intelligent` profile should be added:

```typescript
const TOOL_PROFILES = {
  // ... existing profiles
  intelligent: [
    // Core tools needed for intelligence
    'otcs_authenticate', 'otcs_session_status',
    'otcs_get_node', 'otcs_browse', 'otcs_search',
    'otcs_download_content', 'otcs_categories',
    'otcs_rm_classification', 'otcs_rm_holds', 'otcs_rm_rsi',
    'otcs_permissions', 'otcs_workspace_roles',
    // Intelligent tools
    'otcs_compliance_scan',
    'otcs_smart_hold',
    'otcs_workspace_health',
    'otcs_classify_advisor',
    'otcs_smart_file',
    'otcs_find_related',
    'otcs_extract_metadata',
    'otcs_natural_search',
    'otcs_workflow_bottleneck',
    'otcs_workflow_advisor',
    'otcs_workspace_setup',
  ],
};
```

---

## Recommendation

Start with **`otcs_compliance_scan`** - it provides immediate, measurable value for governance and uses only existing API capabilities. It's a "read-only" intelligence tool that builds confidence before moving to tools that take automated actions.

### Implementation Roadmap

#### Phase 10: Intelligent Tools - Wave 1 (Read-Only Analytics)
1. `otcs_compliance_scan` - Compliance gap analysis
2. `otcs_workspace_health` - Workspace health check
3. `otcs_workflow_bottleneck` - Workflow analytics

#### Phase 11: Intelligent Tools - Wave 2 (Advisory)
4. `otcs_classify_advisor` - Classification recommendations
5. `otcs_smart_hold` - Hold impact preview (dry_run mode)
6. `otcs_natural_search` - Natural language search

#### Phase 12: Intelligent Tools - Wave 3 (Autonomous Actions)
7. `otcs_smart_file` - Intelligent document filing
8. `otcs_extract_metadata` - Metadata extraction and application
9. `otcs_find_related` - Relationship discovery
10. `otcs_workflow_advisor` - Workflow configuration
11. `otcs_workspace_setup` - Workspace provisioning

---

## Success Metrics

| Tool | Key Metric |
|------|------------|
| `otcs_compliance_scan` | % of compliance issues identified and resolved |
| `otcs_smart_hold` | Time saved vs manual hold application |
| `otcs_workspace_health` | Workspace health score improvement over time |
| `otcs_classify_advisor` | Classification accuracy rate |
| `otcs_smart_file` | % of documents filed correctly on first attempt |
| `otcs_natural_search` | Query success rate (found what user wanted) |
| `otcs_workflow_bottleneck` | Reduction in overdue workflows |
