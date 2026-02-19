# n8n Automation Skill

> Complete n8n workflow automation via REST API with incremental testing

## Activation

This skill activates when users mention:
- n8n workflows, automation, or integrations
- Building or modifying n8n workflows
- n8n API operations
- Workflow triggers, nodes, or webhooks

## On Load - MUST DO IMMEDIATELY

1. **Read critical reference files:**
   - `references/pitfalls.md` - Common mistakes to avoid
   - `references/build-process.md` - Incremental build methodology

2. **Verify .env configuration** has:
   - `N8N_API_URL` - Your n8n instance URL
   - `N8N_API_KEY` - API authentication key
   - `N8N_CREDENTIALS_TEMPLATE_URL` - Template for node configurations

3. **Create a todo list** after understanding the user's request

## Fundamental Principles

### CRITICAL RULES - NEVER VIOLATE

1. **Honor user tool preferences** - Never substitute requested services
2. **Debug errors rather than simplify** - Maintain correct architecture
3. **Use only installed node types** with matching typeVersion values
4. **Test incrementally** - Add and validate one node at a time
5. **Update instead of replace** - Maintain single workflow ID throughout
6. **Prioritize native nodes** before HTTP requests or code solutions
7. **Avoid mock data** - Use real credentials and values
8. **Test with limited datasets** (limit=2) for rapid validation
9. **Only interact with user-specified workflows**

## Build Workflow Process

### Standard Build Flow

```
1. Create trigger (webhook, schedule, form, etc.)
2. Add nodes sequentially with testing between each
3. Activate and verify final workflow state
4. Report completion with workflow URL and status
```

### The Golden Rule

```
ADD ONE NODE → TEST → ADD ONE NODE → TEST → REPEAT
```

This prevents debugging nightmares where multiple simultaneous additions obscure which component failed.

## API Operations Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Create workflow | POST | `/api/v1/workflows` |
| Get workflow | GET | `/api/v1/workflows/{id}` |
| Update workflow | PUT | `/api/v1/workflows/{id}` |
| Delete workflow | DELETE | `/api/v1/workflows/{id}` |
| Activate | POST | `/api/v1/workflows/{id}/activate` |
| Deactivate | POST | `/api/v1/workflows/{id}/deactivate` |
| Execute webhook | POST | `/webhook/{path}` |
| Get executions | GET | `/api/v1/executions` |

### Important API Notes

- Use **PUT** for updates (not PATCH)
- Use **POST** for activation endpoints
- Never attempt to activate before executing webhooks
- Always test workflows yourself before reporting success

## Expression Syntax

### Webhook Data Access

```javascript
// WRONG - webhook data is NOT at root
{{ $json.fieldName }}

// CORRECT - webhook submissions are under .body
{{ $json.body.fieldName }}
```

### Core Variables

| Variable | Purpose |
|----------|---------|
| `$json` | Current item's JSON data |
| `$node` | Access other nodes' data |
| `$input` | Input data helpers |
| `$now` | Current timestamp |
| `$env` | Environment variables |
| `$execution` | Execution metadata |
| `$workflow` | Workflow information |

### Common Patterns

```javascript
// Access nested fields
{{ $json.body.user.email }}

// Cross-node reference
{{ $node["NodeName"].json.fieldName }}

// Ternary conditional
{{ $json.status === "active" ? "Yes" : "No" }}

// Optional chaining
{{ $json.data?.nested?.value }}

// Nullish coalescing
{{ $json.value ?? "default" }}
```

## Code Node Patterns

### JavaScript Template

```javascript
// Access input items
const items = $input.all();

// Process each item
const results = items.map(item => {
  return {
    json: {
      // Your transformed data
      processed: item.json.value
    }
  };
});

return results;
```

### Python Template

```python
# Access input items
items = _input.all()

# Process each item
results = []
for item in items:
    results.append({
        "json": {
            "processed": item["json"]["value"]
        }
    })

return results
```

## Testing Guidelines

1. **Use real data** - Never use mock/dummy data
2. **Limit results** - Set `limit=2` for rapid validation
3. **Check executions** - Verify nodes participate in execution
4. **Validate output** - Confirm expected data structure

## Common Node Types

- **Triggers:** Webhook, Schedule, Form, Manual
- **Data:** HTTP Request, Code, Set, Split In Batches
- **Services:** Airtable, Google Sheets, Slack, Gmail
- **Flow:** IF, Switch, Merge, Loop Over Items

## Completion Checklist

Before reporting success:
- [ ] All nodes added and tested
- [ ] Workflow activated
- [ ] Final execution verified
- [ ] Workflow URL provided to user
