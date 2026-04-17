# Custom Section Patterns for Cheersworthy on Dawn

These are the custom Liquid sections and blocks that Dawn doesn't provide natively. Each section includes the full Liquid template, schema, and CSS.

## Table of Contents

1. [Age Gate Overlay](#age-gate-overlay)
2. [Flavor Cloud Block (PDP)](#flavor-cloud-block-pdp)
3. [Trust Row Block (PDP)](#trust-row-block-pdp)
4. [Badge Block (PDP)](#badge-block-pdp)
5. [Flavor Discovery Section (Homepage)](#flavor-discovery-section-homepage)
6. [Pill Stats Row Block (PDP)](#pill-stats-row-block-pdp)

---

## Age Gate Overlay

**File:** `snippets/age-verification.liquid` + JS in `assets/age-verification.js`
**Inserted in:** `layout/theme.liquid`
**Purpose:** Full-screen DOB verification overlay — blocks all content until confirmed.

### Implementation Strategy

The age gate is NOT a section (sections can be removed by merchants). It's a snippet rendered directly in `theme.liquid` before any page content, gated by a cookie check.

```liquid
{%- comment -%} snippets/age-verification.liquid {%- endcomment -%}
{%- comment -%}
  Age verification overlay. Renders a full-screen modal requiring date of birth entry.
  Persists verification via cookie for 30 days.
  Skips rendering on policy pages (privacy, terms) and captcha pages.
{%- endcomment -%}

<div id="age-gate" class="age-gate" role="dialog" aria-modal="true" aria-label="Age verification">
  <div class="age-gate__content">
    <div class="age-gate__logo">
      {%- if settings.logo != blank -%}
        {{ settings.logo | image_url: width: 200 | image_tag: alt: shop.name }}
      {%- else -%}
        <span class="age-gate__shop-name h2">{{ shop.name }}</span>
      {%- endif -%}
    </div>

    <p class="age-gate__heading h3">You must be 21 or older to enter this site.</p>
    <p class="age-gate__prompt">What's your date of birth?</p>

    <form id="age-gate-form" class="age-gate__form" novalidate>
      <div class="age-gate__fields">
        <div class="age-gate__field">
          <label for="age-gate-month" class="visually-hidden">Month</label>
          <select id="age-gate-month" required>
            <option value="" disabled selected>Month</option>
            {%- for i in (1..12) -%}
              <option value="{{ i }}">{{ i }}</option>
            {%- endfor -%}
          </select>
        </div>
        <div class="age-gate__field">
          <label for="age-gate-day" class="visually-hidden">Day</label>
          <select id="age-gate-day" required>
            <option value="" disabled selected>Day</option>
            {%- for i in (1..31) -%}
              <option value="{{ i }}">{{ i }}</option>
            {%- endfor -%}
          </select>
        </div>
        <div class="age-gate__field">
          <label for="age-gate-year" class="visually-hidden">Year</label>
          <select id="age-gate-year" required>
            <option value="" disabled selected>Year</option>
            {%- comment -%} Years from current year down to 1920 {%- endcomment -%}
          </select>
        </div>
      </div>

      <button type="submit" class="age-gate__submit button button--primary">
        Enter Site
      </button>

      <p class="age-gate__legal">
        By entering, you confirm you are 21 years of age or older and agree to our
        <a href="/policies/terms-of-service">Terms of Use</a>.
      </p>
    </form>

    <p id="age-gate-error" class="age-gate__error" hidden>
      You must be 21 or older to access this site.
    </p>
  </div>
</div>
```

### Adding to theme.liquid

Insert this right after the opening `<body>` tag in `layout/theme.liquid`:

```liquid
{%- unless request.page_type == 'policy' or request.page_type == 'captcha' -%}
  {% render 'age-verification' %}
{%- endunless -%}
```

### CSS (assets/age-verification.css)

```css
.age-gate {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--cw-charred-oak, 26, 17, 13));
}

.age-gate.verified { display: none; }

.age-gate__content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
  color: rgb(var(--cw-barrel-paper, 244, 237, 227));
}

.age-gate__logo { margin-bottom: 2rem; }
.age-gate__logo img { max-width: 200px; height: auto; }

.age-gate__heading {
  font-family: var(--font-heading-family);
  margin-bottom: 0.5rem;
}

.age-gate__prompt {
  font-family: var(--font-body-family);
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.age-gate__fields {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.age-gate__field select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(244, 237, 227, 0.3);
  border-radius: 4px;
  background: transparent;
  color: rgb(var(--cw-barrel-paper, 244, 237, 227));
  font-family: var(--font-body-family);
  font-size: 1rem;
  min-width: 90px;
  appearance: auto;
}

.age-gate__submit {
  width: 100%;
  margin-bottom: 1rem;
}

.age-gate__legal {
  font-size: 0.75rem;
  opacity: 0.6;
  line-height: 1.4;
}

.age-gate__legal a { color: inherit; text-decoration: underline; }

.age-gate__error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 1rem;
}
```

### JavaScript (assets/age-verification.js)

```javascript
// Age verification — checks DOB and sets 30-day cookie
(function() {
  const COOKIE_NAME = 'cw_age_verified';
  const COOKIE_DAYS = 30;

  // If already verified, hide gate immediately
  if (document.cookie.includes(COOKIE_NAME + '=true')) {
    const gate = document.getElementById('age-gate');
    if (gate) gate.classList.add('verified');
    return;
  }

  // Prevent scrolling while gate is visible
  document.body.style.overflow = 'hidden';

  // Populate year dropdown
  const yearSelect = document.getElementById('age-gate-year');
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1920; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
  }

  const form = document.getElementById('age-gate-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const month = parseInt(document.getElementById('age-gate-month').value);
      const day = parseInt(document.getElementById('age-gate-day').value);
      const year = parseInt(document.getElementById('age-gate-year').value);

      if (!month || !day || !year) return;

      const dob = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age >= 21) {
        // Set cookie
        const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
        document.cookie = COOKIE_NAME + '=true;expires=' + expires + ';path=/;SameSite=Lax';
        // Hide gate
        document.getElementById('age-gate').classList.add('verified');
        document.body.style.overflow = '';
      } else {
        document.getElementById('age-gate-error').hidden = false;
      }
    });
  }
})();
```

---

## Flavor Cloud Block (PDP)

**File:** Custom Liquid block within `main-product` section
**Purpose:** Renders the interactive word cloud from `cheersworthy.flavor_profile_json` metafield.

### Implementation as Custom Liquid Block

In the theme editor, add a "Custom Liquid" block to the main-product section with this code:

```liquid
{%- assign flavor_json = product.metafields.cheersworthy.flavor_profile_json.value -%}
{%- if flavor_json != blank -%}
  {{ 'component-flavor-cloud.css' | asset_url | stylesheet_tag }}

  <div class="cw-flavor-cloud" data-flavor-cloud>
    <div class="cw-flavor-cloud__inner" id="flavor-cloud-{{ product.id }}">
      {%- comment -%}
        Rendered by JavaScript from the JSON metafield.
        Falls back to a simple comma list if JS fails.
      {%- endcomment -%}
      <noscript>
        {%- for flavor in flavor_json -%}
          <span class="cw-flavor-cloud__tag">{{ flavor.note }}</span>
          {%- unless forloop.last -%}, {%- endunless -%}
        {%- endfor -%}
      </noscript>
    </div>
    <p class="cw-flavor-cloud__caption">
      Taste is personal — but these are the flavors most people find in this whiskey.
    </p>
  </div>

  <script type="application/json" data-flavor-data>
    {{ flavor_json | json }}
  </script>
  <script src="{{ 'flavor-cloud.js' | asset_url }}" defer></script>
{%- endif -%}
```

### CSS (assets/component-flavor-cloud.css)

```css
.cw-flavor-cloud {
  background: rgb(var(--cw-aged-parchment, 229, 217, 202));
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.cw-flavor-cloud__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
  min-height: 80px;
}

.cw-flavor-cloud__tag {
  font-family: var(--font-body-family);
  color: rgb(var(--cw-charred-oak, 26, 17, 13));
  line-height: 1.3;
  transition: opacity 150ms ease;
}

/* Size tiers — applied by JavaScript based on normalized weight */
.cw-flavor-cloud__tag--tier-1 { font-size: 0.75rem; opacity: 0.55; font-weight: 400; }
.cw-flavor-cloud__tag--tier-2 { font-size: 0.9375rem; opacity: 0.7; font-weight: 400; }
.cw-flavor-cloud__tag--tier-3 { font-size: 1.125rem; opacity: 0.85; font-weight: 500; }
.cw-flavor-cloud__tag--tier-4 { font-size: 1.375rem; opacity: 0.95; font-weight: 500; }
.cw-flavor-cloud__tag--tier-5 {
  font-size: 1.625rem;
  font-weight: 600;
  color: rgb(var(--cw-copper, 168, 84, 31));  /* Accent color on top terms */
}

.cw-flavor-cloud__caption {
  text-align: center;
  font-size: 0.8125rem;
  color: rgb(var(--cw-charred-oak, 26, 17, 13) / 0.6);
  margin-top: 0.75rem;
  font-style: italic;
}
```

### JavaScript (assets/flavor-cloud.js)

```javascript
// Flavor Cloud renderer — reads JSON metafield and renders weighted word cloud
(function() {
  const containers = document.querySelectorAll('[data-flavor-cloud]');
  containers.forEach(container => {
    const dataEl = container.querySelector('[data-flavor-data]');
    if (!dataEl) return;

    let flavors;
    try {
      flavors = JSON.parse(dataEl.textContent);
    } catch(e) { return; }

    if (!Array.isArray(flavors) || flavors.length === 0) return;

    // Sort by count descending
    flavors.sort((a, b) => (b.count || 0) - (a.count || 0));

    // Normalize to 5 tiers
    const maxCount = flavors[0].count || 1;
    const minCount = flavors[flavors.length - 1].count || 0;
    const range = maxCount - minCount || 1;

    const inner = container.querySelector('.cw-flavor-cloud__inner');
    inner.innerHTML = '';

    // Shuffle for organic layout (but keep tier assignments from sorted order)
    const tiered = flavors.map(f => {
      const normalized = (f.count - minCount) / range;
      let tier;
      if (normalized > 0.8) tier = 5;
      else if (normalized > 0.6) tier = 4;
      else if (normalized > 0.4) tier = 3;
      else if (normalized > 0.2) tier = 2;
      else tier = 1;
      return { note: f.note, tier };
    });

    // Shuffle for visual variety
    for (let i = tiered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiered[i], tiered[j]] = [tiered[j], tiered[i]];
    }

    tiered.forEach(f => {
      const span = document.createElement('span');
      span.className = 'cw-flavor-cloud__tag cw-flavor-cloud__tag--tier-' + f.tier;
      span.textContent = f.note;
      inner.appendChild(span);
    });
  });
})();
```

---

## Trust Row Block (PDP)

**File:** Custom Liquid block within `main-product` section
**Purpose:** Shows shipping state eligibility, estimated cost, and adult signature notice.

```liquid
{%- comment -%} Trust Row — Custom Liquid block for main-product {%- endcomment -%}
<div class="cw-trust-row">
  <div class="cw-trust-row__item">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6l2-4h8l2 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M6 14V8h4v6" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span>Ships to your state</span>
  </div>
  <div class="cw-trust-row__item">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 4v4l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span>Estimated shipping from $8.99</span>
  </div>
  <div class="cw-trust-row__item cw-trust-row__item--notice">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1l7 13H1L8 1z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 6v3M8 11v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span>Adult signature required on delivery</span>
  </div>
</div>

<style>
  .cw-trust-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 0;
    border-top: 1px solid rgb(var(--color-foreground) / 0.08);
    border-bottom: 1px solid rgb(var(--color-foreground) / 0.08);
    margin: 0.75rem 0;
  }
  .cw-trust-row__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgb(var(--color-foreground) / 0.7);
  }
  .cw-trust-row__item svg {
    flex-shrink: 0;
    color: rgb(var(--cw-forest-green, 44, 85, 69));
  }
  .cw-trust-row__item--notice svg {
    color: rgb(var(--cw-amber, 196, 125, 26));
  }
</style>
```

---

## Badge Block (PDP)

**File:** Custom Liquid block within `main-product` section
**Purpose:** Renders the product badge (Community Pick, Limited Release, New Arrival).

```liquid
{%- assign badge = product.metafields.cheersworthy.badge.value -%}
{%- if badge != blank -%}
  {%- case badge -%}
    {%- when 'limited_release' -%}
      <span class="cw-badge cw-badge--amber">Limited Release</span>
    {%- when 'community_pick' -%}
      <span class="cw-badge cw-badge--green">Community Pick</span>
    {%- when 'new_arrival' -%}
      <span class="cw-badge cw-badge--copper">New Arrival</span>
    {%- when 'staff_pick' -%}
      <span class="cw-badge cw-badge--green">Staff Pick</span>
  {%- endcase -%}
{%- endif -%}

<style>
  .cw-badge {
    display: inline-block;
    font-family: var(--font-body-family);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.25rem 0.625rem;
    border-radius: 2px;
    margin-bottom: 0.5rem;
  }
  .cw-badge--amber {
    background: rgba(196, 125, 26, 0.15);
    color: rgb(196, 125, 26);
  }
  .cw-badge--green {
    background: rgba(44, 85, 69, 0.15);
    color: rgb(44, 85, 69);
  }
  .cw-badge--copper {
    background: rgba(168, 84, 31, 0.15);
    color: rgb(168, 84, 31);
  }
</style>
```

---

## Flavor Discovery Section (Homepage)

**File:** `sections/cw-flavor-discovery.liquid`
**Purpose:** Grid of tappable flavor family cards on the homepage. Links to filtered collection views.

```liquid
{{ 'section-cw-flavor-discovery.css' | asset_url | stylesheet_tag }}

<div class="cw-flavor-discovery color-scheme--{{ section.settings.color_scheme }} section-{{ section.id }}-padding">
  <div class="page-width">
    {%- if section.settings.heading != blank -%}
      <h2 class="cw-flavor-discovery__heading {{ section.settings.heading_size }}">
        {{ section.settings.heading }}
      </h2>
    {%- endif -%}

    <div class="cw-flavor-discovery__grid">
      {%- for block in section.blocks -%}
        <a href="{{ block.settings.link }}"
           class="cw-flavor-discovery__card"
           style="--card-accent: {{ block.settings.accent_color }}"
           {{ block.shopify_attributes }}>
          {%- if block.settings.icon != blank -%}
            <div class="cw-flavor-discovery__icon">
              {{ block.settings.icon | image_url: width: 80 | image_tag }}
            </div>
          {%- endif -%}
          <span class="cw-flavor-discovery__label">{{ block.settings.label }}</span>
        </a>
      {%- endfor -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Flavor Discovery",
  "tag": "section",
  "class": "cw-flavor-discovery-section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Find a whiskey that tastes like what you love"
    },
    {
      "type": "select",
      "id": "heading_size",
      "label": "Heading size",
      "options": [
        { "value": "h3", "label": "Small" },
        { "value": "h2", "label": "Medium" },
        { "value": "h1", "label": "Large" }
      ],
      "default": "h2"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "range",
      "id": "padding_top",
      "min": 0, "max": 100, "step": 4,
      "default": 60,
      "label": "Top padding"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "min": 0, "max": 100, "step": 4,
      "default": 60,
      "label": "Bottom padding"
    }
  ],
  "blocks": [
    {
      "type": "flavor_card",
      "name": "Flavor family",
      "settings": [
        {
          "type": "text",
          "id": "label",
          "label": "Flavor name",
          "default": "Sweet"
        },
        {
          "type": "image_picker",
          "id": "icon",
          "label": "Icon image"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Link"
        },
        {
          "type": "color",
          "id": "accent_color",
          "label": "Card accent color",
          "default": "#A8541F"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Flavor Discovery",
      "blocks": [
        { "type": "flavor_card", "settings": { "label": "Sweet" } },
        { "type": "flavor_card", "settings": { "label": "Smoky" } },
        { "type": "flavor_card", "settings": { "label": "Spicy" } },
        { "type": "flavor_card", "settings": { "label": "Fruity" } },
        { "type": "flavor_card", "settings": { "label": "Rich" } },
        { "type": "flavor_card", "settings": { "label": "Smooth" } },
        { "type": "flavor_card", "settings": { "label": "Floral" } },
        { "type": "flavor_card", "settings": { "label": "Woody" } }
      ]
    }
  ]
}
{% endschema %}
```

---

## Pill Stats Row Block (PDP)

**File:** Custom Liquid block within `main-product` section
**Purpose:** Renders the "86 proof · 12 year · 750mL" stats row as pill-shaped elements.

```liquid
{%- assign proof = product.metafields.cheersworthy.proof.value -%}
{%- assign age = product.metafields.cheersworthy.age_statement.value -%}
{%- comment -%} Volume comes from variant title or a metafield {%- endcomment -%}
{%- assign volume = product.selected_or_first_available_variant.title -%}

{%- if proof != blank or age != blank -%}
<div class="cw-pill-stats">
  {%- if proof != blank -%}
    <span class="cw-pill">{{ proof }} proof</span>
  {%- endif -%}
  {%- if age != blank and age != 'NAS' -%}
    <span class="cw-pill">{{ age }}</span>
  {%- endif -%}
  {%- if volume != blank and volume != 'Default Title' -%}
    <span class="cw-pill">{{ volume }}</span>
  {%- endif -%}
</div>
{%- endif -%}

<style>
  .cw-pill-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  .cw-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    font-family: var(--font-body-family);
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgb(var(--color-foreground) / 0.7);
    background: rgb(var(--color-foreground) / 0.06);
    border-radius: 100px;
    white-space: nowrap;
  }
</style>
```
