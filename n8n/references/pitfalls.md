# Common n8n Pitfalls

> Critical mistakes to avoid when working with n8n workflows and APIs

## Command Format Mistakes

### Never Write JSON to Disk Before API Calls

```bash
# WRONG - creates file dependency
echo '{"nodes": [...]}' > workflow.json
curl -X POST ... -d @workflow.json

# CORRECT - inline JSON
curl -X POST ... -d '{"nodes": [...]}'
```

### Line Continuations in Curl

```bash
# WRONG - line continuations can cause issues
curl -X POST \
  -H "Content-Type: application/json" \
  -d '...'

# CORRECT - single line or heredoc
curl -X POST -H "Content-Type: application/json" -d '...'
```

### Environment Variables

```bash
# WRONG - source doesn't export properly
source .env

# CORRECT - export variables
export $(cat .env | grep -v '^#' | xargs)
```

### jq Filter Pitfalls

```bash
# WRONG - != null has shell interpretation issues
jq 'select(.value != null)'

# CORRECT - use truthiness check
jq 'select(.value)'
```

## Node Installation Errors

### "Install this node to use it"

This error indicates:
1. Missing node type in your n8n instance
2. Incompatible typeVersion value

**Solution:** Always extract node configurations from the credentials template rather than guessing versions from documentation.

### Checking Available Nodes

```bash
# Get list of installed node types
curl -X GET "$N8N_API_URL/api/v1/node-types" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Split In Batches Loop Mistakes

> **This is the #1 loop mistake!**

The Split In Batches node has two outputs:
- **Output 0 (done):** Fires when ALL batches are complete
- **Output 1 (loop):** Fires for EACH batch to process

```
WRONG: Processing nodes connected to Output 0
       ↳ Loop never executes

CORRECT: Processing nodes connected to Output 1
         ↳ Loop processes each batch
```

### Correct Connection Pattern

```
Split In Batches
├── Output 0 (done) → Final processing / End
└── Output 1 (loop) → Process batch → Connect back to Split In Batches
```

## Airtable Limitations

### No Table Creation via n8n

Airtable API doesn't support table creation. Tables must be created manually in Airtable first.

### Parameter Naming Inconsistency

| Node Type | Base Parameter | Table Parameter |
|-----------|----------------|-----------------|
| Data nodes | `base` | `table` |
| Trigger nodes | `baseId` | `tableId` |

### Field Name Matching

Field names must match Airtable's exact naming, including:
- Spaces
- Capitalization
- Special characters

```javascript
// If Airtable field is "First Name"
{{ $json.body["First Name"] }}  // Correct
{{ $json.body.firstName }}       // Wrong
```

## API Best Practices

### HTTP Methods

| Action | Method | Note |
|--------|--------|------|
| Create | POST | New resources |
| Update | PUT | Full replacement (NOT PATCH) |
| Activate | POST | `/workflows/{id}/activate` |
| Deactivate | POST | `/workflows/{id}/deactivate` |

### Webhook Execution Order

```bash
# WRONG - activating before testing webhook
curl -X POST "$N8N_API_URL/api/v1/workflows/$ID/activate"
curl -X POST "$N8N_API_URL/webhook/test"

# CORRECT - test first, then activate
curl -X POST "$N8N_API_URL/webhook-test/$PATH"  # Test execution
curl -X POST "$N8N_API_URL/api/v1/workflows/$ID/activate"
```

## Error Handling & Debugging

### Common HTTP Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check JSON syntax, required fields |
| 401 | Unauthorized | Verify API key |
| 404 | Not Found | Check workflow ID, endpoint URL |
| 422 | Unprocessable | Invalid node configuration |
| 500 | Server Error | Check n8n logs |

### WorkflowHasIssuesError

This error means the workflow has configuration problems. Debug by:

```bash
# Get workflow details
curl -X GET "$N8N_API_URL/api/v1/workflows/$ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.nodes[] | {name, type, issues}'
```

### Getting Execution Details

```bash
# List recent executions
curl -X GET "$N8N_API_URL/api/v1/executions?workflowId=$ID&limit=5" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"

# Get specific execution
curl -X GET "$N8N_API_URL/api/v1/executions/$EXEC_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Checking Node Output

```bash
# Get execution data with node outputs
curl -X GET "$N8N_API_URL/api/v1/executions/$EXEC_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data.resultData.runData'
```

## General Best Practices

1. **Always test yourself** before reporting success
2. **Use real data** - never mock data
3. **Limit results** - use `limit=2` for testing
4. **Maintain single workflow ID** - update, don't recreate
5. **Check execution participation** - verify all nodes ran
