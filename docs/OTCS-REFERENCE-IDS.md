# OpenText Content Server Reference IDs

Quick lookup reference for commonly used IDs, object types, and system values.

---

## System Volumes (Root Level)

| Node ID | Name | Type ID | Type Name |
|---------|------|---------|-----------|
| 2000 | Enterprise Workspace | 141 | Enterprise Workspace |
| 2001 | Content Server System | 148 | System Volume |
| 2002 | Tracer | 149 | Tracer Volume |
| 2003 | Content Server Reports | 211 | Reports Volume |
| 2004 | Admin Home | 142 | My Workspace |
| 2005 | Recycle Bin | 405 | Recycle Bin |
| 2006 | Content Server Categories | 133 | Categories Volume |
| 2046 | Classifications | 198 | Classification Volume |

---

## Object Type IDs (Subtypes)

### Core Types
| Type ID | Type Name | Description |
|---------|-----------|-------------|
| 0 | Folder | Standard folder |
| 1 | Shortcut | Shortcut/alias to another item |
| 131 | Category | Metadata category definition |
| 132 | Category Folder | Folder for organizing categories |
| 133 | Categories Volume | Root volume for categories |
| 136 | Compound Document | Multi-part document |
| 140 | URL | Web link |
| 141 | Enterprise Workspace | Enterprise root volume |
| 142 | My Workspace | Personal workspace |
| 144 | Document | Standard document |
| 145 | E-Mail Folder | Email folder |
| 148 | System Volume | System administration volume |
| 149 | Tracer Volume | Audit/trace volume |
| 154 | Alias | Alias to another item |

### Reports & Workflows
| Type ID | Type Name | Description |
|---------|-----------|-------------|
| 196 | Classification Tree | Classification hierarchy |
| 198 | Classification Volume | Root for RM classifications |
| 202 | Project | Project container |
| 204 | Task List | Task list item |
| 207 | Channel | News channel |
| 211 | Reports Volume | Root for reports |
| 215 | Discussion | Discussion thread |
| 223 | Form | Electronic form |
| 299 | LiveReport | Dynamic report |
| 405 | Recycle Bin | Deleted items container |

### Business Workspaces
| Type ID | Type Name | Description |
|---------|-----------|-------------|
| 848 | Business Workspace | Extended ECM workspace |
| 849 | Business Workspace Template | Template for workspaces |

### Records Management
| Type ID | Type Name | Description |
|---------|-----------|-------------|
| 551 | RM Classification | Records classification |
| 552 | RSI | Record Series Identifier |
| 553 | Hold | Legal/admin hold |
| 554 | Box | Physical records box |
| 555 | Physical Item | Physical object record |

---

## Business Workspace Types

| Type ID | Type Name | Template ID | RM Enabled |
|---------|-----------|-------------|------------|
| 1 | Transmittal | 17594 | No |
| 2 | REM - Rental Object | 17312 | No |
| 3 | eFile | 17568 | Yes |
| 4 | eCase | 17295 | Yes |
| 5 | Material | 17245 | No |
| 6 | Sales Order | 17439 | No |
| 7 | Production Order | 17168 | No |
| 8 | Maintenance Order | 17218 | No |
| 9 | REM - Business Entity | 17346 | No |
| 10 | REM - Property | 17555 | No |
| 11 | Task List | 17210 | No |
| 12 | Sales Contract | 17150 | Yes |
| 13 | Customer | 17284 | Yes |
| 14 | Support Case | 17178 | No |
| 15 | Equipment | 17235 | No |
| 16 | Purchase Contract | 17339 | No |
| 17 | Purchase Requisition | 17476 | No |
| 19 | Dynamic Workflow | 17795 | No |
| 20 | SAP PPM Project | 17360 | No |
| 21 | SAP DMS Document | 17519 | No |
| 22 | Purchase Order | 17186 | No |
| 23 | SAP PPM Task | 17406 | No |
| 24 | Sales Opportunity | 17332 | Yes |
| 25 | Sales Quotation | 17264 | No |
| 26 | Task List Operation | 17708 | No |
| 27 | Maintenance Order Operation | 17355 | No |
| 28 | Vendor | 17323 | No |
| 29 | Maintenance Notification | 17275 | No |
| 30 | SAP PPM Portfolio Item | 17304 | No |
| 31 | Solution | 17193 | No |
| 32 | SAP PPM Bucket | 17495 | No |
| 33 | Functional Location | 17201 | No |
| 34 | REM - Business Partner | 17619 | No |
| 35 | REM - Contract | 17227 | No |
| 36 | Campaign | 17397 | No |
| 37 | Goods Movement | 17468 | No |
| 38 | REM - Building | 17456 | No |
| 39 | Request For Quotation | 17160 | No |
| 40 | Employee | 16190 | Yes |
| 41 | Delivery | 17370 | No |
| 42 | Lead | 17669 | No |

---

## Categories Volume Structure (ID: 2006)

### Category Folders
| Folder ID | Name | Items |
|-----------|------|-------|
| 10582 | Case Management | 3 |
| 10530 | Contract Management | 3 |
| 11024 | Customer Support | 2 |
| 11051 | Data Governance | 1 |
| 5034 | Document Types | 1 |
| 11013 | Engineering & Construction | 4 |
| 10537 | Enterprise Asset Management | 8 |
| 10514 | General | 4 |
| 10552 | Human Resources | 3 |
| 10525 | Marketing | 2 |
| 10534 | Portfolio & Project Management | 6 |
| 10517 | Procurement | 6 |
| 10508 | Production & Logistics | 7 |
| 10579 | Real Estate Management | 11 |
| 10511 | Sales | 12 |
| 10500 | SAP CMIS Types | 2 |
| 10598 | SAP Document Management System | 2 |
| 10558 | SAP ILM | 2 |
| 10522 | System Record Type Categories | 4 |

### Standalone Categories
| Category ID | Name |
|-------------|------|
| 11142 | Geo Info |
| 156644 | HR Category |
| 169760 | ITC Demo |
| 10528 | SharePoint Properties |

---

## RM Classifications (Volume ID: 2046)

### Top-Level Classifications
| ID | Name | Type | Children |
|----|------|------|----------|
| 10388 | Data Governance | Classification Tree | 18 |
| 169659 | Demo Disposition | RM Classification | 0 |
| 9372 | Document Roles | Classification Tree | 2 |
| 14978 | RM Classifications | RM Classification | 9 |
| 9287 | Types | Classification Tree | 2 |

### RM Classifications (ID: 14978) - Subcategories
| ID | Name | Has Children |
|----|------|--------------|
| 14979 | Case Management | Yes |
| 15024 | Contract Management | No |
| 14987 | Enterprise Asset Management | Yes |
| 14992 | Finance | Yes (3) |
| 14991 | Human Resources | Yes (8) |
| 15030 | Marketing | No |
| 15010 | Procurement | Yes |
| 15003 | Production & Logistics | No |
| 15001 | Sales | Yes (6) |

---

## Legal & Administrative Holds

| Hold ID | Name |
|---------|------|
| 1 | GENERAL AUDIT HOLD |
| 2 | GENERAL LEGAL HOLD |
| 3 | SUBPOENA 123 |
| 4 | SUBPOENA ABC |
| 5 | EMPLOYMENT LITIGATION 2026 |

---

## Record Series Identifiers (RSIs)

| RSI ID | Name | Status | Disposition Control |
|--------|------|--------|---------------------|
| 14975 | DGO | ACTIVE | No |
| 14989 | AD-YE-07 | ACTIVE | No |
| 14995 | EU-GDPR | ACTIVE | No |
| 14997 | US-HR-7YEAR | ACTIVE | No |
| 15017 | AD-YE-01 | ACTIVE | No |
| 15022 | AD-YE-02 | ACTIVE | Yes |
| 15032 | EU-HR-3YEARS | ACTIVE | No |
| 15036 | AD-YE-03 | ACTIVE | No |
| 15039 | AD-YE-05 | ACTIVE | Yes |
| 15042 | AD-YE-04 | ACTIVE | No |
| 169660 | DEMO DISPOSITION RSI | ACTIVE | No |
| 174478 | DEMO-RSI-2026-001 | ACTIVE | Yes |

---

## Common Folder IDs in Enterprise Workspace (2000)

| Folder ID | Name | Purpose |
|-----------|------|---------|
| 12939 | Administration | Admin docs |
| 12585 | Case Management | Case files |
| 12621 | Contract Management | Contracts |
| 48980 | Corporate Policies | Policies |
| 12647 | Customer Support | Support docs |
| 12644 | Engineering & Construction | E&C docs |
| 12614 | Enterprise Asset Management | Asset docs |
| 12672 | Human Resources | HR docs |
| 12659 | Marketing | Marketing docs |
| 12648 | Portfolio & Project Management | Projects |
| 12561 | Procurement | Procurement |
| 12591 | Production & Logistics | Operations |
| 12633 | Real Estate Management | Real estate |
| 12684 | Records Management | RM docs |
| 12567 | Sales | Sales docs |
| 12969 | SAP Document Management System | SAP DMS |

---

## Permission Types

| Permission | Description |
|------------|-------------|
| see | View item in listings |
| see_contents | View folder contents |
| modify | Modify item properties |
| edit_attributes | Edit metadata/categories |
| add_items | Add items to container |
| reserve | Reserve/lock documents |
| add_major_version | Add major versions |
| delete_versions | Delete versions |
| delete | Delete the item |
| edit_permissions | Manage permissions |

---

## Workflow Dispositions

| Disposition | Description |
|-------------|-------------|
| SendOn | Complete step and continue workflow |
| Delegate | Assign to another user |
| SendForReview | Send for review loop |

---

## API Notes

- **Enterprise Workspace root**: Always use node ID `2000`
- **Categories root**: Always use node ID `2006`
- **Classifications root**: Always use node ID `2046`
- **Business Workspace subtype**: `848`
- **Document subtype**: `144`
- **Folder subtype**: `0`

---

*Last updated: 2026-01-21*
