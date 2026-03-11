# Warm-Up Troubleshooting — Specific Scenarios

## Scenario 1: Week 1 open rate is only 18% (below the 30% target)

**Context:** Tier 1 should be your most engaged people. 18% is a warning sign.

**Steps:**
1. Check inbox placement on Gmail and Outlook immediately
2. Log into Gmail Postmaster — check Domain Reputation
3. Verify domain authentication in beehiiv Settings → Domains
4. Check if the send volume was correct (~5,500 — not accidentally the full list)
5. If emails are in Promotions tab: this can account for lower measured opens — acceptable
6. If emails are in Spam: stop. Contact beehiiv support before Week 2 send.

**Decision:** Do not proceed to Week 2 until Week 1 open rate is > 20% or beehiiv support clears the IP.

---

## Scenario 2: Week 2 send goes out but opens on the Tier 2 portion are very low

**Context:** Tier 2 is moderately engaged — some lower opens are expected.

**Steps:**
1. Calculate open rates separately for Tier 1 vs Tier 2 using beehiiv segment analytics
2. If Tier 1 open rate is still strong (>30%) but Tier 2 is low (<10%): this is normal, proceed
3. If BOTH are low (<15%): deliverability issue — follow Scenario 1 steps
4. If Tier 2 bounce rate is high (>0.5%): the Tier 2 CSV had dirty data — clean and re-import

---

## Scenario 3: Several subscribers reply saying they didn't sign up for this

**Context:** This can happen with Tier 3 — low engagement means they may have forgotten.

**Steps:**
1. Immediately honor any unsubscribe requests manually if they reply rather than clicking unsubscribe
2. Unsubscribe them in beehiiv: Audience → Subscribers → find email → change status to Unsubscribed
3. If multiple people respond this way from Tier 3: consider skipping Tier 3 entirely
4. The value of Tier 3 is low — if they haven't opened in months, they may not be worth the risk to your sender reputation

---

## Scenario 4: The Friday send worked great but now beehiiv has a different unsubscribe link format and subscribers are confused

**Context:** beehiiv uses its own unsubscribe management system.

**Steps:**
1. This is normal — beehiiv handles unsubscribes automatically
2. Subscribers who click unsubscribe are removed from your beehiiv list automatically
3. You do not need to sync these back to AC (during the 30-day overlap, manage unsubscribes in both platforms manually if needed)
4. After migration is complete, AC is no longer sending so this is not an issue

---

## Scenario 5: You accidentally sent to all 25,500 on Week 1

**Context:** Skipped the phased approach and imported + sent to everyone at once.

**Immediate steps:**
1. Monitor inbox placement and open rates closely for 48 hours
2. If open rate > 20% and bounces < 0.5%: you may have gotten lucky — monitor closely for next 2 weeks
3. If open rate < 15% or spam complaints appear: contact beehiiv support immediately
4. Do not send another campaign until deliverability is confirmed healthy
5. Going forward, use the phased approach for any large new segment additions

---

## Scenario 6: beehiiv support says your IP is flagged

**Steps:**
1. Pause all sends immediately
2. Work with beehiiv support — they can move you to a different IP pool or request IP remediation
3. While paused: continue sending from ActiveCampaign so subscribers don't miss a week
4. Do not resume beehiiv sends until support confirms IP is clean
5. When resuming: restart the warm-up from Week 1 with Tier 1 only

---

## When to Contact beehiiv Support
- Spam complaints > 0.1%
- IP flagged or blacklisted
- Domain authentication not verifying after 48 hours
- Bounce rate suddenly spikes with no obvious list quality cause
- Open rates drop to near-zero (< 5%)

**Contact:** https://app.beehiiv.com/?new_support_ticket
