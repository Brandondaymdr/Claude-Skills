# n8n Build Process

> Systematic approach to constructing n8n workflows with incremental testing

## The Golden Rule

```
ADD ONE NODE → TEST → ADD ONE NODE → TEST → REPEAT
```

This methodology prevents debugging nightmares where multiple simultaneous additions obscure which component failed.

## Why Incremental Development?

### The Problem with Batch Creation

```
❌ WRONG APPROACH:
   Create workflow with 5 nodes at once
   → Workflow fails
   → Which node caused the error?
   → Hours of debugging
```

### The Solution

```
✅ CORRECT APPROACH:
   Add trigger → Test ✓
   Add node 2 → Test ✓
   Add node 3 → Test ✓
   Add node 4 → Test ✓
   Add node 5 → Test ✓
   → Clear failure point if any step fails
```

## Process Overview

### 8-Step Build Cycle

1. **Initialize** - Create workflow with trigger node only
2. **Activate** - Enable the workflow
3. **Test** - Execute the trigger
4. **Verify** - Confirm successful execution
5. **Expand** - Add next node via PUT request
6. **Execute** - Run another test
7. **Confirm** - Verify new node participated
8. **Iterate** - Repeat steps 5-7 for each node

## Detailed Process

### Step 1: Initialize with Trigger

```bash
curl -X POST "$N8N_API_URL/api/v1/workflows" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{
    "name": "My Workflow",
    "nodes": [
      {
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {
          "path": "my-webhook",
          "httpMethod": "POST"
        }
      }
    ],
    "connections": {},
    "settings": {}
  }'
```

### Step 2: Activate Workflow

```bash
curl -X POST "$N8N_API_URL/api/v1/workflows/$WORKFLOW_ID/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Step 3: Test Trigger

```bash
curl -X POST "$N8N_API_URL/webhook/my-webhook" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Step 4: Verify Execution

```bash
curl -X GET "$N8N_API_URL/api/v1/executions?workflowId=$WORKFLOW_ID&limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Step 5: Add Next Node

```bash
# First, GET current workflow
WORKFLOW=$(curl -X GET "$N8N_API_URL/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY")

# Add new node to nodes array and update connections
# Then PUT the updated workflow
curl -X PUT "$N8N_API_URL/api/v1/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d "$UPDATED_WORKFLOW"
```

### Steps 6-8: Test, Verify, Iterate

Repeat the test → verify → expand cycle for each node.

## Testing Standards

### Use Real Data

```bash
# WRONG - Mock data
-d '{"test": "dummy"}'

# CORRECT - Representative data
-d '{"email": "user@example.com", "name": "John Doe"}'
```

### Test with Multiple Items

Always test with **2 real data items** to ensure:
- Loop functionality works
- Array processing handles multiple entries
- No single-item edge cases

```bash
-d '{"items": [{"id": 1, "name": "First"}, {"id": 2, "name": "Second"}]}'
```

## Workflow Management

### Maintain Single Workflow ID

```bash
# WRONG - Creating new workflows for each test
POST /api/v1/workflows  # Creates workflow v1
POST /api/v1/workflows  # Creates workflow v2
POST /api/v1/workflows  # Creates workflow v3

# CORRECT - Update existing workflow
POST /api/v1/workflows  # Creates workflow
PUT /api/v1/workflows/$ID  # Updates same workflow
PUT /api/v1/workflows/$ID  # Updates same workflow
```

### Benefits of Single Workflow

1. Complete development history preserved
2. No orphaned test workflows
3. Easy rollback capability
4. Clear execution timeline

## Example: Building a Complete Workflow

### Target: Webhook → Scraper → Transform → Google Sheets

```
Step 1: Webhook only
        ✓ Tested - receives data

Step 2: Add Scraper
        Webhook → Scraper
        ✓ Tested - scrapes URL from webhook

Step 3: Add Transform
        Webhook → Scraper → Transform
        ✓ Tested - transforms scraped data

Step 4: Add Google Sheets
        Webhook → Scraper → Transform → Google Sheets
        ✓ Tested - data saved to sheet
```

### Contrast with Wrong Approach

```
❌ WRONG: Create all 4 nodes at once
   → Error: "WorkflowHasIssuesError"
   → Unknown which node has the issue
   → Must debug all configurations
```

## Completion Checklist

Before declaring a workflow complete:

- [ ] All nodes added sequentially
- [ ] Each node tested after addition
- [ ] Workflow activated
- [ ] Final end-to-end test passed
- [ ] Execution shows all nodes participated
- [ ] Workflow URL provided to user
