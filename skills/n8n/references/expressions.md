# n8n Expressions Reference

> Comprehensive guide to n8n's expression language

## Foundational Concept

**All dynamic content requires double curly braces** for expressions to be evaluated.

```javascript
// Static text (not evaluated)
Hello World

// Dynamic expression (evaluated)
{{ $json.name }}
```

## Core Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `$json` | Current item's JSON data | `{{ $json.email }}` |
| `$node` | Access other nodes' data | `{{ $node["HTTP Request"].json }}` |
| `$input` | Input data helpers | `{{ $input.first().json }}` |
| `$now` | Current timestamp | `{{ $now.toISO() }}` |
| `$env` | Environment variables | `{{ $env.API_KEY }}` |
| `$execution` | Execution metadata | `{{ $execution.id }}` |
| `$workflow` | Workflow information | `{{ $workflow.name }}` |

## Critical: Webhook Data Access

> **Common Mistake:** Webhook submissions are nested under `.body`, NOT at root level

```javascript
// ❌ WRONG - webhook data is NOT at root
{{ $json.email }}
{{ $json.userName }}

// ✅ CORRECT - webhook submissions are under .body
{{ $json.body.email }}
{{ $json.body.userName }}
```

## Data Access Methods

### Simple Field Access

```javascript
{{ $json.fieldName }}
{{ $json.body.fieldName }}
```

### Nested Fields

```javascript
{{ $json.user.profile.email }}
{{ $json.body.data.items[0].name }}
```

### Array Access

```javascript
// First item
{{ $json.items[0] }}

// Last item
{{ $json.items[$json.items.length - 1] }}

// Specific index
{{ $json.items[2].name }}
```

### Bracket Notation (Special Characters)

```javascript
// Fields with spaces
{{ $json.body["First Name"] }}

// Fields with special characters
{{ $json["field-with-dashes"] }}

// Dynamic field names
{{ $json[$json.fieldKey] }}
```

## Cross-Node References

### Using $node

```javascript
// Access another node's output
{{ $node["HTTP Request"].json.data }}

// Access specific item
{{ $node["Split In Batches"].json.items[0] }}
```

### Using $() Function

```javascript
// Shorthand for $node
{{ $("HTTP Request").item.json.data }}

// First item from node
{{ $("Get Data").first().json }}

// All items from node
{{ $("Get Data").all() }}
```

## Conditionals

### Ternary Operator

```javascript
{{ $json.status === "active" ? "Yes" : "No" }}

{{ $json.count > 10 ? "Many" : "Few" }}
```

### Nullish Coalescing

```javascript
// Use default if null/undefined
{{ $json.value ?? "default" }}

{{ $json.name ?? $json.username ?? "Anonymous" }}
```

### Optional Chaining

```javascript
// Safe nested access
{{ $json.user?.profile?.email }}

{{ $json.data?.items?.[0]?.name }}
```

### Logical Operators

```javascript
// AND
{{ $json.isActive && $json.isVerified ? "Valid" : "Invalid" }}

// OR
{{ $json.email || $json.username }}
```

## String Manipulation

### Concatenation

```javascript
{{ "Hello, " + $json.name + "!" }}

{{ `Hello, ${$json.name}!` }}
```

### Common Methods

```javascript
// Uppercase
{{ $json.name.toUpperCase() }}

// Lowercase
{{ $json.email.toLowerCase() }}

// Trim whitespace
{{ $json.input.trim() }}

// Replace
{{ $json.text.replace("old", "new") }}

// Split
{{ $json.tags.split(",") }}

// Substring
{{ $json.description.substring(0, 100) }}
```

## Mathematical Operations

```javascript
// Basic math
{{ $json.price * 1.1 }}

// Rounding
{{ Math.round($json.value) }}
{{ Math.floor($json.value) }}
{{ Math.ceil($json.value) }}

// Min/Max
{{ Math.min($json.a, $json.b) }}
{{ Math.max($json.a, $json.b) }}
```

## Array Methods

```javascript
// Length
{{ $json.items.length }}

// Map
{{ $json.items.map(item => item.name) }}

// Filter
{{ $json.items.filter(item => item.active) }}

// Find
{{ $json.items.find(item => item.id === 5) }}

// Join
{{ $json.tags.join(", ") }}

// Includes
{{ $json.roles.includes("admin") }}
```

## Date/Time (Luxon)

n8n uses Luxon's DateTime library.

```javascript
// Current time
{{ $now }}

// Format date
{{ $now.toFormat("yyyy-MM-dd") }}
{{ $now.toFormat("HH:mm:ss") }}

// ISO format
{{ $now.toISO() }}

// Add/subtract time
{{ $now.plus({ days: 7 }).toISO() }}
{{ $now.minus({ hours: 2 }).toISO() }}

// Parse date string
{{ DateTime.fromISO($json.date) }}

// Compare dates
{{ DateTime.fromISO($json.date) > $now }}
```

## Where Expressions Shouldn't Be Used

Some fields don't support expressions:
- Node type selection
- Credential selection
- Some dropdown options

## Debugging Expressions

### Test in n8n UI

1. Open node settings
2. Click expression editor
3. Use "Result" panel to see output

### Common Issues

```javascript
// Issue: undefined result
// Check: Field path correct? Data exists?

// Issue: [object Object]
// Solution: Access specific property
{{ $json.data }}        // Wrong
{{ $json.data.value }}  // Correct

// Issue: Expression not evaluated
// Check: Using {{ }} braces?
```

## Quick Reference

| Pattern | Example |
|---------|---------|
| Field access | `{{ $json.field }}` |
| Webhook body | `{{ $json.body.field }}` |
| Nested field | `{{ $json.a.b.c }}` |
| Array item | `{{ $json.items[0] }}` |
| Other node | `{{ $node["Name"].json }}` |
| Conditional | `{{ $json.x ? "yes" : "no" }}` |
| Default value | `{{ $json.x ?? "default" }}` |
| Safe access | `{{ $json.x?.y?.z }}` |
| Current time | `{{ $now.toISO() }}` |
| Environment | `{{ $env.VAR_NAME }}` |
