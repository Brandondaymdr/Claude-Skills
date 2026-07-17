# Audit Report Template

Canonical output format for `folder-forensic-audit` Phases 1–5, plus the scoring guide. SKILL.md points here — this file is the source of truth for report structure and scoring.

## Report Format

```markdown
# Project Audit Report: [Project Name]
Date: [date]
Auditor: Claude (session-forensic-audit)

## Executive Summary
[2-3 sentences: overall health assessment and top priority]

## Severity Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

## Findings

### Critical
1. **[Finding title]** — [Location/context]
   - Issue: [What's wrong]
   - Impact: [Why it matters]
   - Fix: [Specific steps to resolve]

### High
[Same format]

### Medium
[Same format]

### Low
[Same format]

## Recommendations
[Prioritized action plan — what to fix first, what can wait]

## Health Scorecard
| Domain | Weight | Score (0-max) | Notes |
|---|---|---|---|
| Folder Structure | 10 | [0-10] | [One-line summary] |
| Documentation | 15 | [0-15] | [One-line summary] |
| Claude Config | 10 | [0-10] | [One-line summary] |
| Code Health (general) | 15 | [0-15] | [One-line summary] |
| Testing Maturity | 20 | [0-20] | Coverage %, test/source ratio, regression test habit |
| Eval Coverage (AI projects) | 15 | [0-15] / N/A | Dataset size, history depth, threshold set |
| Commit Hygiene | 10 | [0-10] | Conventional Commits %, CI status, branch protection |
| Decision Documentation | 10 | [0-10] | ADR count, DECISIONS.md index, dependency ADRs |
| Git Hygiene (other) | 5 | [0-5] | Branch cleanup, stash hygiene, .gitignore |
| **Overall** | **100** | **[0-100]** | (Non-AI projects: renormalize to 85) |
```

## Scoring Guide

**Numeric scores are the source of truth.** Convert to a letter grade for quick scanning:

- **A (90-100):** Exemplary — follows best practices, minimal improvements possible
- **B (75-89):** Good — solid foundation with minor improvements available
- **C (60-74):** Adequate — functional but missing key best practices
- **D (40-59):** Below standard — significant gaps that impact development quality
- **F (<40):** Critical — fundamental issues that need immediate attention

**Per-dimension scoring hints:**

- **Testing Maturity (0-20):** 0 = no tests. 5 = smoke tests exist. 10 = unit tests for critical paths. 15 = coverage >50% and test/source ratio >0.3. 20 = coverage >75%, regression test habit observable (bug-fix commits always include test).
- **Eval Coverage (0-15):** 0 = no `/evals/`. 5 = scaffolded but empty. 10 = ≥20 dataset cases + threshold set. 15 = history of runs committed, evals wired into CI, regressions caught before merge.
- **Commit Hygiene (0-10):** 0 = <50% Conventional Commits compliance. 5 = ~75%. 8 = >90% + branch protection enabled. 10 = >95% + branch protection + CI required checks + direct-to-main count is 0.
- **Decision Documentation (0-10):** 0 = no `docs/decisions/`. 3 = directory exists but no ADRs. 6 = ≥3 ADRs + DECISIONS.md index. 10 = every major dependency and architectural choice has an ADR; ADRs referenced by recent commits.

**Tier 2 projects** should be graded more leniently on Eval Coverage, Testing Maturity, and Decision Documentation — they target lighter coverage by design. A B grade on a Tier 2 project for these dimensions is fine.

**Tier 3 projects** should not be audited with this scorecard at all — they're minimal by design. Audit Tier 3 only for a single check: does `STATUS.md` exist?
