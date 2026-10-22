# Bringing the SAI Claude account onto the baseline

The SAI account runs Claude Code with `CLAUDE_CONFIG_DIR=~/.claude-sai` (alias
`claude-sai`). Layer 1 already covers SAI repos: the global git hook is per Mac,
not per Claude account.

1. Link this skill into the SAI config (same pattern as the session skills):
   `ln -s ~/Projects/claude-skills/security-baseline ~/.claude-sai/skills/security-baseline`
2. Link the global security rule:
   `mkdir -p ~/.claude-sai/rules && ln -sf ~/Projects/claude-skills/rules/security.md ~/.claude-sai/rules/security.md`
3. Install the Cloudflare skill for the SAI account:
   `CLAUDE_CONFIG_DIR=~/.claude-sai npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global`
   If it lands in `~/.claude/skills` instead, symlink that folder into
   `~/.claude-sai/skills/`.
4. Start `claude-sai` and confirm `security-baseline` and `security-audit` both
   appear in the skills list.
5. Each SAI repo gets a `CLAUDE_API_KEY` secret from an SAI-billed Anthropic key,
   so review costs stay off Days LLC.
6. Apply in order: sai-visas, sai-platform, sai-portal — all Tier 1, stacks
   `student-data` plus whatever the code uses (nextjs, supabase).
   `bash scripts/apply-to-repo.sh ~/Projects/<path>/<repo> student-data,nextjs,supabase`
7. After merge: `bash scripts/repo-settings.sh Brandondaymdr/<repo> --tier1`.
8. Deep audit (2–3 runs) on sai-visas and sai-platform before student data goes live;
   work the student-data checklist.
9. If SAI should own the repos, transfer them to an SAI GitHub organization
   before step 5, so secrets and rulesets are set up once in their final home.
