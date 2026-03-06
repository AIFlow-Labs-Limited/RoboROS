# Robot Flow Labs - Web Designer & Maintainer Skill

## Skill Identity

**Name:** Robot Flow Labs Website Designer & Maintainer  
**Version:** 1.0.0  
**Author:** AIFlow Labs Limited  
**Purpose:** Maintain, expand, and protect the unique industrial cyberpunk aesthetic of the Robot Flow Labs website.

---

## 🎯 What This Skill Does

When activated, this skill transforms the AI into a specialized web designer and maintainer for the Robot Flow Labs website. The AI will:

1. **Preserve the industrial aesthetic** on all new pages and components
2. **Follow the strict design system** (colors, typography, layout)
3. **Manage content via constants.ts** (never hardcode text)
4. **Support bilingual content** (English + Chinese)
5. **Create components** following established patterns
6. **Protect the visual identity** from accidental style breaks

---

## ⚡ THE STYLE IS SACRED

This website has a **unique paid designer aesthetic** that must be preserved at all costs.

### Visual Identity: Industrial Cyberpunk / High-Tech Brutalism

The design feels like:
- A robot factory control panel
- Military/industrial terminal UI
- Futuristic cargo container labeling
- High-contrast technical documentation

### The 5 Style Pillars

| Pillar | Rule |
|--------|------|
| **Brutal Geometry** | Sharp 90° corners only. NO rounded corners ever. |
| **Industrial Colors** | ONLY `#FF3B00`, `#050505`, `#f3f3f3`, `#1A1A1A` |
| **Technical Typography** | Oswald (headlines, UPPERCASE), JetBrains Mono (data) |
| **Factory UI Elements** | Status indicators, technical labels, grid layouts |
| **High Contrast** | Black/white/orange only. No gradients. No soft colors. |

---

## 🎨 Design System Reference

### Colors (STRICT - NO EXCEPTIONS)

```css
/* Primary Accent - Industrial Orange */
--accent: #FF3B00;

/* Backgrounds */
--bg-light: #f3f3f3;    /* Off-white - main content */
--bg-dark: #050505;     /* Void black - hero, footer */
--bg-panel: #1A1A1A;    /* Dark gray - cards on dark */

/* Text */
--text-light: white;    /* On dark backgrounds */
--text-dark: black;     /* On light backgrounds */
```

### Typography

```css
/* Headlines - Industrial Strength */
font-family: 'Oswald', sans-serif;
text-transform: uppercase;
font-weight: 700 or 900;

/* Body/Data - Technical Feel */
font-family: 'JetBrains Mono', monospace;
font-weight: 400 or 500;

/* Decorative (optional) */
font-family: 'Chakra Petch', sans-serif;
```

### Tailwind Classes Reference

```
Headlines:    font-display uppercase font-bold (or font-black)
Body/Data:    font-mono text-sm
Section Light: bg-[#f3f3f3] py-24 border-b-4 border-black
Section Dark:  bg-[#050505] text-white py-24
Cards:        border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
Buttons:      bg-black text-white hover:bg-[#FF3B00] hover:text-black
Tags:         bg-black text-[#FF3B00] px-3 py-1 font-mono text-xs uppercase
```

---

## 📁 Project Structure

```
robot-flow-labs/
├── App.tsx              # Main layout, assembles all sections
├── constants.ts         # 🧠 ALL TEXT & IMAGES (the brain)
├── types.ts             # TypeScript interfaces
├── components/
│   ├── IndustrialHeader.tsx
│   ├── Hero.tsx
│   ├── Hardware.tsx
│   ├── Datasets.tsx
│   ├── Research.tsx
│   ├── Prototypes.tsx
│   ├── ContactForm.tsx  # Formspree: mzddrjlv
│   └── Footer.tsx
└── services/
    └── geminiService.ts
```

---

## ✅ Common Tasks Guide

### Task: Change Text Content

1. Open `constants.ts`
2. Find section in `CONTENT.EN` 
3. Update the text
4. **ALSO update `CONTENT.CN`** (Chinese translation required)

```typescript
// Example: Change hero headline
CONTENT: {
  EN: { hero: { headline: 'NEW HEADLINE' } },
  CN: { hero: { headline: '新标题' } }  // Don't forget!
}
```

### Task: Change an Image

1. Open `constants.ts`
2. Find the image in `IMAGES` object
3. Replace the URL

```typescript
export const IMAGES = {
  hardware: 'https://new-url.com/image.jpg',
};
```

### Task: Add New Section

1. **Create component** (copy structure from `Hardware.tsx`)
2. **Add content** to `constants.ts` (both EN and CN)
3. **Add nav item** to `CONTENT[lang].nav`
4. **Import in App.tsx** and add to `<main>`

```tsx
// New section template
import React from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const NewSection: React.FC<Props> = ({ lang }) => {
  const content = CONTENT[lang].newSection;
  
  return (
    <section id="new-section" className="bg-[#f3f3f3] py-24 border-b-4 border-black">
      <div className="container mx-auto px-4">
        {/* Content using industrial patterns */}
      </div>
    </section>
  );
};

export default NewSection;
```

### Task: Add Navigation Item

```typescript
// In constants.ts
nav: {
  hardware: 'HARDWARE',
  datasets: 'DATASETS',
  newItem: 'NEW ITEM',  // Add here
  contact: 'ACCESS',
},
```

---

## 🧱 Copy-Paste UI Patterns

### Section Header

```tsx
<div className="mb-12">
  <div className="inline-flex items-center gap-2 bg-black text-[#FF3B00] px-4 py-1 font-mono text-sm font-bold mb-4">
    <IconName size={14} />
    SUBTITLE_LABEL
  </div>
  <h2 className="font-display text-5xl uppercase font-bold">MAIN TITLE</h2>
</div>
```

### Card with Brutal Shadow

```tsx
<div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
  {/* Content */}
</div>
```

### Dark Card

```tsx
<div className="bg-[#1A1A1A] border border-gray-800 p-6">
  {/* Content */}
</div>
```

### Status Indicator

```tsx
<div className="flex items-center gap-2 font-mono text-xs">
  <div className="w-2 h-2 bg-[#FF3B00]"></div>
  <span>STATUS: ONLINE</span>
</div>
```

### Technical Label/Tag

```tsx
<span className="bg-black text-[#FF3B00] px-3 py-1 font-mono text-xs uppercase">
  TECH_LABEL
</span>
```

### Primary Button

```tsx
<button className="bg-black text-white py-4 px-8 font-display text-xl uppercase font-bold hover:bg-[#FF3B00] hover:text-black transition-colors flex items-center gap-2">
  <IconName size={20} />
  BUTTON TEXT
</button>
```

### Orange Accent Button

```tsx
<button className="bg-[#FF3B00] text-black py-4 px-8 font-display uppercase font-bold hover:bg-black hover:text-white transition-colors">
  BUTTON TEXT
</button>
```

### Image with Industrial Frame

```tsx
<div className="relative border-2 border-black">
  <img src={url} alt="Description" className="w-full grayscale hover:grayscale-0 transition-all" />
  <div className="absolute bottom-0 left-0 bg-black text-[#FF3B00] px-4 py-2 font-mono text-xs">
    LABEL // CODE
  </div>
</div>
```

### Light Section

```tsx
<section className="bg-[#f3f3f3] py-24 border-b-4 border-black">
  <div className="container mx-auto px-4">
    {/* Content */}
  </div>
</section>
```

### Dark Section

```tsx
<section className="bg-[#050505] text-white py-24">
  <div className="container mx-auto px-4">
    {/* Content */}
  </div>
</section>
```

---

## 🚫 FORBIDDEN - Style Killers

These will BREAK the industrial aesthetic. NEVER use them:

| ❌ Forbidden | ✅ Use Instead |
|-------------|----------------|
| `rounded-*` | `rounded-none` |
| `border-gray-*` | `border-black` |
| Gradients | Flat solid colors |
| Drop shadows | `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]` |
| Soft/pastel colors | Black, white, orange only |
| Inter, Roboto, Arial | Oswald, JetBrains Mono |
| Thin borders (`border`) | Thick borders (`border-2`, `border-4`) |
| Centered-everything layouts | Asymmetric grid layouts |
| "Friendly" rounded UI | Industrial sharp edges |
| Lowercase headlines | UPPERCASE HEADLINES |

---

## 🔧 Technical Reference

### Contact Form (Formspree)

- **Form ID:** `mzddrjlv`
- **Emails go to:** `ilessio@aiflowlabs.io`
- **Dashboard:** https://formspree.io/forms
- **Free tier:** 50 submissions/month

### Icons

Use **Lucide React** only:

```tsx
import { Terminal, Cpu, Database } from 'lucide-react';
<Terminal size={20} className="text-[#FF3B00]" />
```

### Running Locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Building for Production

```bash
npm run build
# Output in /dist
```

---

## 📋 Pre-Flight Checklist

Before committing any changes, verify:

- [ ] No rounded corners added
- [ ] Colors are only from the palette
- [ ] Text is in `constants.ts`, not hardcoded
- [ ] Both EN and CN translations exist
- [ ] Headlines are UPPERCASE with `font-display`
- [ ] Data/labels use `font-mono`
- [ ] Borders are `border-2` or `border-4 border-black`
- [ ] Shadows use brutal offset pattern
- [ ] Component receives `lang: Language` prop
- [ ] Section has proper `id` for navigation

---

## 🎯 Design Philosophy

When creating anything new, ask:

1. **"Does it look like it belongs in a robot factory?"**
2. **"Does it feel like a military/industrial control panel?"**
3. **"Would it fit on a futuristic cargo container?"**
4. **"Is it brutally simple and high-contrast?"**

If any answer is NO → Redesign until all answers are YES.

---

## 📚 Related Files

- `.cursorrules` - Quick reference for Cursor AI
- `.cursor/rules/robot-flow-labs.mdc` - Detailed documentation
- `CLAUDE_DESIGN_GUIDELINES.md` - Design guidelines document
- `constants.ts` - All content and images
- `types.ts` - TypeScript definitions

---

## 🔌 MCP Integration

This skill works with the following MCP servers for complete web design capabilities:

### Available MCP Servers

| Server | Purpose | Key Actions |
|--------|---------|-------------|
| **playwright** | Browser automation | Screenshots, UI testing, responsive checks |
| **puppeteer** | DOM inspection | Element capture, PDF generation |
| **filesystem** | File operations | Read/write project files |
| **fetch** | HTTP requests | Download images, test APIs |
| **github** | Version control | Commits, PRs, issues |
| **memory** | Persistence | Remember design decisions |
| **brave-search** | Web search | Find images, inspiration |

### Using Playwright for Design Verification

After making changes:

1. **Start dev server**: `npm run dev`
2. **Take screenshot**: Navigate to localhost:3000 and capture
3. **Test responsive**: Check mobile, tablet, desktop breakpoints
4. **Verify hover states**: Capture interactive element states
5. **Check console**: Look for JavaScript errors

### Design Verification Checklist (with MCP)

```
[ ] Screenshot full page - verify industrial aesthetic
[ ] Screenshot mobile view - check responsive layout
[ ] Capture hover states - verify orange accent appears
[ ] Test form submission - check Formspree integration
[ ] Verify both languages - toggle EN/CN and screenshot both
```

### Finding Images with Brave Search

Search queries for industrial aesthetic:
- "industrial robot manufacturing high contrast"
- "cyberpunk robot arm factory"
- "POV camera wearable technology"
- "humanoid robot dark background"

### Memory for Design Decisions

Store important decisions:
- Color choices and why
- Component patterns established
- Content structure decisions
- Feature requests and status

---

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Install Playwright browsers (first time)
npx playwright install

# Check MCP status
claude mcp list
```

---

## 🖥️ Infrastructure & Deployment

This website runs in production. Understanding the infrastructure is essential.

### Production Stack

| Component | Technology | Status |
|-----------|------------|--------|
| **Domain** | robotflowlabs.com | Live |
| **SSL** | Let's Encrypt | Auto-renew |
| **Proxy** | Nginx (Docker) | Running |
| **Process** | PM2 | Auto-restart |

### Key Commands

```bash
# Check if site is running
pm2 status

# Restart after code changes
pm2 restart robotflowlabs

# View live logs
pm2 logs robotflowlabs

# Check Nginx
docker compose ps  # in /home/ilessio/web/nginix/
```

### Important Files

| File | Purpose |
|------|---------|
| `PM2.md` | Full PM2 documentation |
| `ecosystem.config.cjs` | PM2 configuration |
| `vite.config.ts` | Must keep `allowedHosts` for proxy |
| `/home/ilessio/web/nginix/` | Nginx + SSL config |

### After Making Changes

1. Test locally: `npm run dev`
2. If PM2 is running: `pm2 restart robotflowlabs`
3. Check site: https://robotflowlabs.com

### Infrastructure Rules

See: `.claude/rules/infrastructure.md`

---

*This skill was created to protect and maintain the unique industrial aesthetic of Robot Flow Labs. The style was professionally designed and must be preserved across all future expansions.*
