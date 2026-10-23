# Checklist — student and immigration data (SAI)

- [ ] Two-account test on every route and server action: student A cannot read,
      edit, list or download student B's records or files.
- [ ] Staff/admin roles enforced server-side; role never taken from client input.
- [ ] Passport, visa and ID uploads in a private bucket; served only through
      short-lived signed URLs (minutes, not days).
- [ ] No passport numbers, visa details, DOB or addresses in logs, analytics or error reports.
- [ ] Written retention and deletion rule for immigration documents, agreed with SAI.
- [ ] Access to production data limited to named people; reviewed each term.
