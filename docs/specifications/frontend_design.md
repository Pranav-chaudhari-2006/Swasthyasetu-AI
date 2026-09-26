# SwasthyaSetu "Stitch" Frontend Design System & UI Specification

> **Source of Truth**: [docs/index.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/docs/index.md)  
> **Target Applications**: Patient PWA, Frontline ASHA Portal, Doctor & Facility Command, DHO Dashboard  
> **Frontend Codebase**: [frontend/](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/frontend/)

---

## 1. Design Vision & The "Stitch" Philosophy

### 1.1 What is "The Stitch"?
The **"Stitch"** is a unified, high-aesthetic healthcare design philosophy engineered specifically for the Indian public health ecosystem. It bridges the extreme operational divide between two contrasting healthcare realities:
1. **The Rural Frontline**: Low-cost mobile smartphones, intermittent 2G/3G connectivity, sunlight glare, operated by village ASHAs and rural patients under high stress.
2. **The Clinical Command Center**: Multi-monitor desktop workstations in District Hospitals and Chief Medical Officer command rooms requiring high-density, real-time data visualization.

"The Stitch" ensures that whether viewed on a cracked 5-inch Android screen in a remote hamlet or a 4K display in a state capital, the application feels **seamless, cohesive, authoritative, and utterly uncluttered**.

---

### 1.2 Decluttering Directives: "Zero Cognitive Overload"
Public health interfaces frequently fail because they overwhelm users with cramped forms, dense tables, and competing alert colors. The Stitch enforces **strict visual decluttering**:
- **Generous Whitespace (Breathing Room)**: Containers use `p-6` to `p-8` (24px - 32px) padding and `gap-4` to `gap-6` (16px - 24px) spacing. Elements are never crammed edge-to-edge.
- **The 60-30-10 Color Rule**: 60% neutral surface, 30% structural contrast (cards/borders), and only 10% high-intent accent color.
- **Asynchronous Visual Layers**: Telemetry metrics, clinical actions, and metadata are visually partitioned with subtle glass surfaces (`backdrop-blur-md`, `border: 1px solid rgba(255,255,255,0.06)`), preventing "wall of boxes" visual fatigue.
- **Strict Visual Hierarchy**: Never present two primary action buttons on the same card. Secondary actions use ghost or outline styling.
- **Thumb-Zone Usability**: In mobile views, primary action targets (QR scan, Start Intake, Record Vitals) are placed strictly within the bottom 45% of the viewport (thumb-accessible zone) with a minimum hit target of `48px × 48px`.

---

## 2. Modern, Less-Clustered Typography System

The typography is chosen to eliminate visual noise, ensure instant legibility across all age groups and lighting conditions, and deliver an ultra-premium, modern editorial feel.

### 2.1 Font Families
1. **Primary Display & Headings: `Plus Jakarta Sans`**
   - *Why*: Geometric, clean, open counter-spaces, highly modern. It delivers instant visual polish without feeling generic or cold. Wide letter apertures maximize readability even at small sizes.
   - *Weights*: SemiBold (`600`), Bold (`700`).
   - *Alternative*: `Outfit` or `Manrope`.
2. **Body, Interface & Forms: `Inter`**
   - *Why*: The gold standard for modern interface design. Features a tall x-height, contextual alternate characters, and exceptional micro-legibility on low-DPI Android screens. Zero visual vibration.
   - *Weights*: Regular (`400`), Medium (`500`), SemiBold (`600`).
   - *Alternative*: `DM Sans`.
3. **Clinical Telemetry, Identifiers & Codes: `JetBrains Mono`**
   - *Why*: Monospaced font with tabular numerals (`font-variant-numeric: tabular-nums`). Essential for heart rates, SpO2 percentages, blood pressures, ICD-10 diagnostic codes, and cryptographic HMAC token strings so numbers don't jump around during live streaming.
   - *Weights*: Medium (`500`), Bold (`700`).

---

### 2.2 Typographic Hierarchy & Scale

```css
/* Typography Scale Tokens */
--font-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs:   0.75rem;   /* 12px - Line height: 1.5 - Metadata, Timestamps, Badges */
--text-sm:   0.875rem;  /* 14px - Line height: 1.5 - Form Labels, Secondary Text */
--text-base: 1.00rem;   /* 16px - Line height: 1.6 - Body Paragraphs, Chat Intake */
--text-lg:   1.125rem;  /* 18px - Line height: 1.5 - Section Subtitles, Card Headers */
--text-xl:   1.25rem;   /* 20px - Line height: 1.4 - Module Titles, Modal Headers */
--text-2xl:  1.50rem;   /* 24px - Line height: 1.3 - Portal Page Titles */
--text-3xl:  1.875rem;  /* 30px - Line height: 1.2 - Telemetry Metrics (SpO2, Pulse) */
--text-4xl:  2.25rem;   /* 36px - Line height: 1.1 - Hero Metrics, Large Display */
```

### 2.3 Decluttered Typography Rules
- **Line Length**: Paragraphs and chat messages are capped at `max-w-prose` (~65 characters) to prevent eye fatigue.
- **Letter Spacing**: Small text (`12px-14px`) uses slight positive tracking (`letter-spacing: 0.02em`), while large headings (`24px+`) use tight negative tracking (`letter-spacing: -0.02em`) for crispness.
- **Line Height**: Strict minimum of `1.6` on body copy to ensure generous vertical breathing room between lines.

---

## 3. Curated Color Theme Options

Here are **4 meticulously designed color theme options**. Each provides distinct psychological characteristics, high-contrast accessibility (WCAG 2.1 AA/AAA), and dark/light mode definitions.

---

### 🌿 Option 1: "Ayurvedic Slate & Emerald" (Recommended for SIH / Public Health)
> **Personality**: Calming, deeply trustworthy, rooted in wellness and Indian public health, scientifically grounded. Soothing for anxious patients and frontline workers.

#### Visual Palette
```
Primary Emerald:     #059669 (Dark) / #10b981 (Accent)
Background Dark:     #090d16 (Obsidian Night)
Surface Card:        #111827 (Deep Slate Card)
Surface Border:      rgba(255, 255, 255, 0.08)
Text Primary:        #f8fafc (Pure Slate Ice)
Text Muted:          #94a3b8 (Soft Mist)
Emergency Accent:    #ef4444 (Vibrant Coral)
Urgent Amber:        #f59e0b (Golden Honey)
Verified Mint:       #34d399 (Spring Mint)
```

#### CSS Token Variables
```css
/* Theme 1: Ayurvedic Slate & Emerald */
:root {
  --color-bg: #090d16;
  --color-surface: #111827;
  --color-surface-hover: #1e293b;
  --color-border: rgba(255, 255, 255, 0.08);
  
  --color-primary: #10b981;
  --color-primary-hover: #059669;
  --color-primary-soft: rgba(16, 185, 129, 0.12);
  
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;
  
  --color-emergency: #ef4444;
  --color-emergency-soft: rgba(239, 68, 68, 0.12);
  --color-urgent: #f59e0b;
  --color-urgent-soft: rgba(245, 158, 11, 0.12);
  --color-routine: #10b981;
  --color-routine-soft: rgba(16, 185, 129, 0.12);
}
```

---

### ⚡ Option 2: "Deep Obsidian & Bio-Cyan Glow" (High-Tech Clinical Command)
> **Personality**: High precision, futuristic, ultra-modern command center. Perfect for hospital command rooms, real-time 108 GPS streams, and telemetry monitoring.

#### Visual Palette
```
Primary Cyan:        #06b6d4 (Neon Cyan) / #22d3ee (Bright Cyan)
Background Dark:     #06080e (Deep Void Black)
Surface Card:        #0d1322 (Midnight Navy Slate)
Surface Border:      rgba(6, 182, 212, 0.15)
Text Primary:        #ffffff (Crisp Ice)
Text Muted:          #94a3b8 (Cool Fog)
Emergency Accent:    #f43f5e (Neon Crimson)
Urgent Amber:        #fbbf24 (Solar Gold)
Bio-Glow Accent:     rgba(6, 182, 212, 0.25)
```

#### CSS Token Variables
```css
/* Theme 2: Deep Obsidian & Bio-Cyan Glow */
:root {
  --color-bg: #06080e;
  --color-surface: #0d1322;
  --color-surface-hover: #151e34;
  --color-border: rgba(6, 182, 212, 0.15);
  
  --color-primary: #06b6d4;
  --color-primary-hover: #22d3ee;
  --color-primary-soft: rgba(6, 182, 212, 0.15);
  
  --color-text: #ffffff;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;
  
  --color-emergency: #f43f5e;
  --color-emergency-soft: rgba(244, 63, 94, 0.15);
  --color-urgent: #fbbf24;
  --color-urgent-soft: rgba(251, 191, 36, 0.15);
  --color-routine: #06b6d4;
  --color-routine-soft: rgba(6, 182, 212, 0.15);
}
```

---

### 🇮🇳 Option 3: "National Health Sovereign" (Royal Bharat Navy & Saffron Flame)
> **Personality**: Official government platform, patriotic warmth, high institutional authority, recognizable across national healthcare missions (ABDM, Ayushman Bharat).

#### Visual Palette
```
Primary Royal Navy:  #1e3a8a (Deep Bharat Blue) / #3b82f6 (Bright Cobalt)
Saffron Accent:      #ea580c (Deep Saffron) / #f97316 (Vibrant Amber)
Background Dark:     #080c18 (Imperial Night)
Surface Card:        #0f172a (Navy Slate)
Surface Border:      rgba(249, 115, 22, 0.15)
Text Primary:        #f8fafc (Pure White)
Text Muted:          #94a3b8 (Silver Cloud)
Emergency Accent:    #dc2626 (National Crimson)
Verified Green:      #16a34a (Ashok Green)
```

#### CSS Token Variables
```css
/* Theme 3: National Health Sovereign */
:root {
  --color-bg: #080c18;
  --color-surface: #0f172a;
  --color-surface-hover: #1e293b;
  --color-border: rgba(249, 115, 22, 0.15);
  
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-soft: rgba(59, 130, 246, 0.12);
  
  --color-saffron: #f97316;
  --color-saffron-soft: rgba(249, 115, 22, 0.15);
  
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;
  
  --color-emergency: #dc2626;
  --color-emergency-soft: rgba(220, 38, 38, 0.12);
  --color-urgent: #f59e0b;
  --color-urgent-soft: rgba(245, 158, 11, 0.12);
  --color-routine: #16a34a;
  --color-routine-soft: rgba(22, 163, 74, 0.12);
}
```

---

### ❄️ Option 4: "Nordic Minimalist" (Frosted Sage & Clean Bio-Ice)
> **Personality**: Extreme decluttering, sterile hospital cleanliness, zero-distraction serenity. Designed for minimal eye strain during grueling 12-hour doctor shifts.

#### Visual Palette
```
Primary Sage:        #15803d (Forest Sage) / #22c55e (Clean Bio-Green)
Background Dark:     #0c1017 (Deep Charcoal Mist)
Surface Card:        #151c27 (Frosted Glass Slate)
Surface Border:      rgba(255, 255, 255, 0.05)
Text Primary:        #f1f5f9 (Soft Pearl)
Text Muted:          #8899a6 (Pewter Muted)
Sky Blue Accent:     #0284c7 (Ice Blue)
Emergency Coral:     #e11d48 (Ruby Alert)
```

#### CSS Token Variables
```css
/* Theme 4: Nordic Minimalist */
:root {
  --color-bg: #0c1017;
  --color-surface: #151c27;
  --color-surface-hover: #1e2738;
  --color-border: rgba(255, 255, 255, 0.05);
  
  --color-primary: #22c55e;
  --color-primary-hover: #16a34a;
  --color-primary-soft: rgba(34, 197, 94, 0.10);
  
  --color-text: #f1f5f9;
  --color-text-muted: #8899a6;
  --color-text-subtle: #4b5563;
  
  --color-emergency: #e11d48;
  --color-emergency-soft: rgba(225, 29, 72, 0.10);
  --color-urgent: #d97706;
  --color-urgent-soft: rgba(217, 119, 6, 0.10);
  --color-routine: #22c55e;
  --color-routine-soft: rgba(34, 197, 94, 0.10);
}
```

---

## 4. Component "Stitch" Specifications

### 4.1 De-clustered Card Stitch (`.card-stitch`)
Cards are the primary container in SwasthyaSetu. They feature rounded edges, subtle frosted translucent backgrounds, and soft border highlights that separate without cluttering.
```css
.card-stitch {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), 
              border-color 0.2s ease, 
              box-shadow 0.2s ease;
}

.card-stitch:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.5);
}
```

---

### 4.2 Triage Urgency Status Badges (`.badge-triage`)
Instant visual classification without alarming routine patients:
- **`EMERGENCY`**: Pulsing crimson dot (`animation: pulse 1.5s infinite`), bold red typography, tinted red glass background.
- **`SAME_DAY`**: Warm amber dot, amber text, golden amber glass background.
- **`ROUTINE`**: Calming emerald dot, soft green text, emerald glass background.

```css
.badge-triage {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-emergency {
  background: var(--color-emergency-soft);
  color: var(--color-emergency);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-same-day {
  background: var(--color-urgent-soft);
  color: var(--color-urgent);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-routine {
  background: var(--color-routine-soft);
  color: var(--color-routine);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
```

---

### 4.3 AI Chat Intake Stitch (`.chat-stitch`)
- **Patient Bubbles**: Right-aligned, primary emerald gradient, crisp white text.
- **AI Structured Bubbles**: Left-aligned, dark slate card with subtle border glow, accompanied by an explicit micro-badge: `[AI Non-Authoritative]`.
- **Typing Indicator**: 3 floating dots pulsing with stagger animation.

---

### 4.4 Cryptographic QR Code Modal Stitch
- **Backdrop**: Deep frosted glass blur (`backdrop-filter: blur(12px)`).
- **QR Container**: Pure white padded enclosure (`p-6 rounded-2xl`) providing maximum scanning contrast for low-quality hospital barcode scanners.
- **Token Telemetry**: Tabular monospace HMAC-SHA256 signature preview with 1-click copy and countdown expiration timer.

---

### 4.5 Point-of-Care Vital Telemetry HUD
- **Metric Cards**: 4-column responsive grid (BP, Pulse, SpO2, Temp).
- **Typography**: Big bold numbers (`text-3xl font-mono font-bold`) paired with small muted unit descriptors (`text-xs text-muted uppercase`).
- **Dynamic Threshold Alerts**: Text dynamically glows red if SpO2 drops below 92% or pulse exceeds 110 bpm.

---

## 5. Implementation Roadmap for Theme Switcher

1. **CSS Variables Foundation**: Token variables defined in `:root` and `[data-theme="ayurvedic"]`, `[data-theme="obsidian"]`, `[data-theme="sovereign"]`, `[data-theme="minimalist"]`.
2. **Persistence**: User selection stored in `localStorage.getItem('swasthyasetu_theme')`.
3. **Typography CDN**: Google Fonts imported for `Plus Jakarta Sans`, `Inter`, and `JetBrains Mono`.
