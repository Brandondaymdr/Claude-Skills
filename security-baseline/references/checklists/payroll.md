# Checklist — payroll and timekeeping

- [ ] Bank account and tax ID fields encrypted at the column level; decrypted only server-side.
- [ ] Every read/write of a payroll, timesheet or employee record checks the caller's
      company and role (two-company test).
- [ ] No employee PII (SSN, bank, address, DOB) in logs, analytics or error reports.
- [ ] Pay calculations and approvals recorded in an append-only audit log.
- [ ] Exports (CSV, PDFs, ACH files) generated on demand with short-lived links, not stored publicly.
