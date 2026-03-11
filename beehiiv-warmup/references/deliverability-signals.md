# Deliverability Signals — What to Watch and When to Act

## Setting Up Gmail Postmaster Tools (Do This First)

1. Go to https://postmaster.google.com
2. Sign in with your Google account
3. Click **+** to add domain → enter `whiskeytribe.com`
4. Verify ownership by adding the TXT record to your DNS
5. After verification, you'll see:
   - **Domain Reputation** (Bad / Low / Medium / High)
   - **IP Reputation**
   - **Spam Rate**

**Target:** Domain Reputation = High. If it drops to Medium or Low, slow down the warm-up.

---

## Week-by-Week Signals to Check

### After Each Send (within 24 hours)
In beehiiv → Posts → [your sent post] → Analytics:

| Metric | Healthy | Caution | Stop & Fix |
|--------|---------|---------|------------|
| Open rate | > 25% | 15–25% | < 15% |
| Click rate | > 0.5% | 0.2–0.5% | < 0.2% |
| Bounce rate | < 0.2% | 0.2–0.5% | > 0.5% |
| Unsubscribe rate | < 0.3% | 0.3–0.5% | > 0.5% |
| Spam complaints | < 0.05% | 0.05–0.1% | > 0.1% |

### The Inbox Placement Test
Send a test email to these accounts before each warm-up send:
- A Gmail account you own
- A personal Outlook or Hotmail account
- Check: does it land in Primary inbox, Promotions tab, or Spam?

**Primary inbox** = green light
**Promotions tab** = acceptable, can improve over time
**Spam** = do not send to full segment until resolved

---

## Common Problems and Fixes

### Problem: Open rate drops below 15% suddenly
**Likely cause:** Emails going to spam or Promotions
**Fix:**
1. Do the inbox placement test above
2. Check beehiiv Settings → Domains → confirm still ✅ Authenticated
3. Check Gmail Postmaster → look for domain reputation drop
4. If spam: contact beehiiv support immediately — they can investigate IP reputation

### Problem: Bounce rate spikes above 0.5%
**Likely cause:** Bad emails in the imported segment
**Fix:**
1. Pause sending to that segment
2. Export the bounced emails from beehiiv
3. Remove them from your CSV and re-import cleaned version
4. Do not retry bounced addresses — they permanently hurt sender reputation

### Problem: Unsubscribe rate spikes above 0.5%
**Likely cause:** Tier 3 subscribers not recognizing WhiskeyTribe on beehiiv, or content mismatch
**Fix:**
1. Review your From Name — make sure it exactly matches what subscribers saw in AC
2. Check subject line style — keep it consistent with your AC style
3. Consider adding a one-line footer note: "You're receiving this because you subscribed to WhiskeyTribe"

### Problem: Spam complaints above 0.1%
**This is serious — act immediately**
1. Stop all sends
2. Contact beehiiv support: https://app.beehiiv.com/?new_support_ticket
3. Run a list hygiene check on the affected segment
4. Do not resume until beehiiv confirms IP reputation is clean

---

## Tools for Ongoing Monitoring

| Tool | URL | What it checks |
|------|-----|---------------|
| Gmail Postmaster | postmaster.google.com | Domain & IP reputation, spam rate |
| Mail Tester | mail-tester.com | Overall deliverability score (send test email to their address) |
| MXToolbox | mxtoolbox.com/blacklists | Check if whiskeytribe.com is on any blacklists |
| beehiiv Analytics | In-platform | Opens, clicks, bounces, unsubscribes per send |
