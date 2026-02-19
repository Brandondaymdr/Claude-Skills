# Setting Up a Yoga Community on Circle.so

Complete guide for setting up a yoga/wellness community, specifically tailored for
communities like Carla Gentile Yoga (carlagentileyoga@circle.so).

## Table of Contents

1. [Recommended Community Structure](#recommended-community-structure)
2. [Space Setup](#space-setup)
3. [Membership Tiers](#membership-tiers)
4. [Class Schedule & Events](#class-schedule--events)
5. [Course Content](#course-content)
6. [Engagement & Gamification](#engagement--gamification)
7. [Payments & Monetization](#payments--monetization)
8. [Onboarding Flow](#onboarding-flow)
9. [Email Strategy](#email-strategy)

---

## Recommended Community Structure

Here's the ideal space group and space layout for a yoga community:

```
🏠 Getting Started
  ├── 👋 Welcome & Introductions (Discussion)
  ├── 📋 Community Guidelines (Discussion - pinned post)
  └── ❓ FAQ & Support (Discussion)

🧘 Classes & Practice
  ├── 📅 Class Schedule (Event space)
  ├── 🔥 Vinyasa Flow (Discussion - class-specific)
  ├── 🌙 Yin & Restorative (Discussion)
  ├── 🧘 Meditation & Breathwork (Discussion)
  └── 💪 Challenges & Accountability (Discussion)

📚 Learning
  ├── 🎓 Beginner Yoga Foundations (Course)
  ├── 📖 Yoga Philosophy & History (Course)
  ├── 🖼️ Pose Library (Image Gallery)
  └── 📹 Class Recordings Archive (Discussion - video posts)

💬 Community
  ├── 💬 General Chat (Chat space)
  ├── 🎉 Wins & Celebrations (Discussion)
  ├── 📸 Practice Photos & Videos (Image Gallery)
  └── 🍎 Wellness & Lifestyle (Discussion)

🎓 Teacher Training (Private - gated)
  ├── 📚 200hr YTT Program (Course)
  ├── 📝 Teaching Practicum (Discussion)
  └── 👥 YTT Chat (Chat space)
```

---

## Space Setup

### Step-by-Step: Creating the Structure

**1. Create Space Groups first:**
- Go to Admin → Spaces
- Create groups: "Getting Started", "Classes & Practice", "Learning", "Community", "Teacher Training"
- Set the Teacher Training group to private

**2. Create spaces within each group:**
For each space:
1. Click "+" next to the space group
2. Choose the appropriate type
3. Set name, description, and emoji
4. Configure visibility (Public or Private)
5. Add a cover image related to yoga

**3. Configure each space's settings:**
- Welcome space: Allow all members to post; pin a welcome post
- Class Schedule: Only admins create events; members can RSVP
- Discussion spaces: All members can post; enable liking
- Course spaces: Set to private and gate behind access groups for premium content
- Chat spaces: Open to all relevant members

### Cover Image Recommendations

- **Dimensions**: 1920×400px minimum for banner images
- **Style**: Calming yoga/nature imagery that reflects the community brand
- **Consistency**: Use a consistent color palette across spaces

---

## Membership Tiers

### Recommended Tier Structure

| Tier | Price | Access |
|------|-------|--------|
| **Free Community** | Free | Welcome, Community, FAQ spaces |
| **Monthly Unlimited** | $29-49/mo | All classes, events, recordings, community |
| **Annual Unlimited** | $249-449/yr | Same as monthly + annual savings |
| **Teacher Training** | $2,500-4,500 one-time | Everything + YTT program |

### Setting Up in Circle

**1. Create Access Groups:**
- Settings → Access Groups → Create
- Create: "Free", "Unlimited", "Teacher Training"

**2. Assign Spaces to Access Groups:**
- For each private space → Settings → Access
- Add the appropriate access groups

**3. Create Paywall Groups:**
- Settings → Payments → Paywall Groups
- Link each paywall group to:
  - A Stripe pricing plan
  - The corresponding access group

---

## Class Schedule & Events

### Setting Up the Weekly Schedule

For a typical yoga studio schedule:

| Day | Time | Class | Instructor |
|-----|------|-------|-----------|
| Mon | 9:00 AM | Morning Vinyasa | Carla |
| Mon | 6:00 PM | Evening Yin | Carla |
| Tue | 7:00 AM | Sunrise Flow | Carla |
| Wed | 9:00 AM | Hatha Yoga | Carla |
| Wed | 12:00 PM | Lunchtime Meditation | Carla |
| Thu | 6:00 PM | Power Yoga | Carla |
| Fri | 9:00 AM | Gentle Flow | Carla |
| Sat | 10:00 AM | Weekend Workshop | Carla |
| Sun | 9:00 AM | Restorative Yoga | Carla |

### Creating Each Class as a Recurring Event

1. Navigate to the **Class Schedule** event space
2. Click **Create Event**
3. Fill in:
   - Title: "Morning Vinyasa Flow with Carla"
   - Description: Class description, what to bring, level
   - Time: Set start and end times in your timezone
   - Recurrence: Weekly, on the appropriate day
   - Location: Virtual → Zoom link or Circle Live
4. Repeat for each class

### Tips for Event Spaces
- Use descriptive titles that include the class style and teacher name
- Include Zoom/virtual links in the event description
- Set up a pinned post with "How to Join Virtual Classes" instructions
- Consider creating a separate space for workshop-style special events

---

## Course Content

### Beginner Yoga Foundations Course

Suggested structure:

**Section 1: Getting Started**
- Lesson 1: What is Yoga? (Text + Video)
- Lesson 2: Setting Up Your Practice Space
- Lesson 3: Essential Equipment
- Lesson 4: Yoga Etiquette & Safety

**Section 2: Breath & Body Awareness**
- Lesson 1: Introduction to Pranayama
- Lesson 2: Ujjayi Breathing
- Lesson 3: Body Scan & Awareness
- Lesson 4: Alignment Basics

**Section 3: Foundational Poses**
- Lesson 1: Standing Poses
- Lesson 2: Seated Poses
- Lesson 3: Balancing Poses
- Lesson 4: Floor & Supine Poses

**Section 4: Your First Flow**
- Lesson 1: Sun Salutation A
- Lesson 2: Sun Salutation B
- Lesson 3: Putting It All Together
- Lesson 4: Developing a Home Practice

### Course Creation Tips
- Include video for every lesson (even if short)
- Add downloadable PDFs for pose references
- Use drip content: release one section per week
- Enable progress tracking so students feel accomplished
- Add a discussion component so students can ask questions

---

## Engagement & Gamification

### Recommended Gamification Setup

**Points System:**
| Action | Points |
|--------|--------|
| Create a post | 10 |
| Leave a comment | 5 |
| Receive a like | 2 |
| Attend an event | 15 |
| Complete a lesson | 10 |
| Daily login | 1 |

**Levels:**
| Level | Points Required | Name |
|-------|----------------|------|
| 1 | 0 | Yoga Seedling |
| 2 | 50 | Curious Yogi |
| 3 | 150 | Dedicated Practitioner |
| 4 | 400 | Yoga Enthusiast |
| 5 | 1000 | Community Guide |
| 6 | 2500 | Yoga Warrior |
| 7 | 5000 | Enlightened Member |

### Engagement Ideas
- **Monthly challenges**: "30-Day Meditation Challenge" with progress posts
- **Pose of the Week**: Post a pose in the Pose Library, members share their version
- **Practice logs**: Members share how many days they practiced this week
- **Q&A sessions**: Regular "Ask Carla Anything" events
- **Member spotlights**: Feature active members monthly

---

## Payments & Monetization

### Stripe Setup

1. **Connect Stripe**: Settings → Payments → Connect with Stripe
2. **Create Products in Stripe**: Monthly, Annual, and one-time plans
3. **Create Paywall Groups in Circle**:
   - Name: "Monthly Unlimited"
   - Stripe Plan: Select monthly subscription
   - Access Group: Link to "Unlimited" access group
4. **Create Checkout Links**: Share direct links for each plan

### Pricing Page

Create a public space or pinned post with pricing information:
- List each tier with features
- Include checkout links
- Add testimonials from current members
- Highlight the value proposition

---

## Onboarding Flow

### New Member Welcome Sequence

**Immediate (on join):**
1. Welcome email from Circle
2. Landing on Welcome space
3. See pinned "Start Here" post with community guide

**Day 1:**
- Automated DM from Carla welcoming them
- Prompt to introduce themselves in Welcome space
- Guide to download mobile app

**Day 3:**
- Email highlighting upcoming classes
- Invite to join their first event

**Day 7:**
- Check-in email: "How's your first week?"
- Highlight popular posts and community activity

**Setting this up:**
- Use Circle's automation workflows (Business plan) for the DM and emails
- Or use Zapier integration to trigger welcome sequences
- Pin a comprehensive "Start Here" post in the Welcome space

### Start Here Post Template

Title: "Welcome to Carla Gentile Yoga Community!"

Content should include:
1. Welcome message from Carla
2. Community guidelines (be kind, supportive, etc.)
3. How to navigate the community (which spaces are for what)
4. How to join your first class (link to Class Schedule space)
5. How to set up notifications
6. How to download the mobile app
7. Where to ask questions (FAQ space)

---

## Email Strategy

### Regular Emails

| Email | Frequency | Content |
|-------|-----------|---------|
| Weekly Digest | Weekly (auto) | Activity highlights, new posts, upcoming events |
| Class Schedule | Weekly (manual) | This week's classes with join links |
| Monthly Newsletter | Monthly | Yoga tips, member spotlight, announcements |
| New Content Alert | As needed | New course launches, workshop announcements |

### Email Best Practices
- Keep subject lines personal: "This week at Carla Gentile Yoga"
- Include direct links to spaces and events
- Feature member content and wins
- Keep emails concise — drive traffic back to Circle
