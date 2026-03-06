# Image Management Guide for Robot Flow Labs

## Current Image Sources

All images are loaded from **Unsplash CDN** - there are NO local image files.

### Image Configuration Location

All image URLs are stored in `constants.ts`:

```typescript
export const IMAGES = {
  hero: '',  // Currently using CSS/SVG
  hardware: 'https://images.unsplash.com/...',
  datasets: {
    manipulation: 'https://...',
    interaction: 'https://...',
    longHorizon: 'https://...'
  }
};
```

## Finding Better Images

### Recommended Sources

1. **Unsplash** (https://unsplash.com) - Free, high-quality
   - Search: robotics, industrial, cyberpunk, AI, automation, factory

2. **Pexels** (https://pexels.com) - Free, diverse
   - Search: robot, technology, machinery, electronics

3. **Custom Images** - If you have your own:
   - Upload to Cloudinary, Imgix, or AWS S3
   - Use the CDN URL

### Image Requirements

| Aspect | Specification |
|--------|---------------|
| **Format** | JPEG or WebP preferred |
| **Min Width** | 800px (1000px recommended) |
| **Aspect Ratio** | Depends on section |
| **Style** | Industrial, technical, high-contrast |
| **Colors** | Should work with orange/black palette |

### Recommended Aspect Ratios

| Section | Ratio | Suggested Size |
|---------|-------|----------------|
| Hardware | 16:9 or 4:3 | 1000x750 |
| Datasets | 4:3 | 800x600 |
| Prototypes | 4:5 (portrait) | 800x1000 |

## URL Format for Unsplash

```
https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&q=80&w={width}
```

Parameters:
- `auto=format` - Auto-select best format
- `fit=crop` - Crop to fit dimensions
- `q=80` - Quality 80% (good balance)
- `w=800` - Width in pixels

## How to Update Images

### Step 1: Find Image

1. Go to Unsplash.com
2. Search for relevant term (e.g., "industrial robot")
3. Click on image you like
4. Copy the URL from browser
5. Extract the photo ID (e.g., `photo-1589254065878-42c9da997008`)

### Step 2: Create Optimized URL

```
https://images.unsplash.com/photo-YOUR_ID?auto=format&fit=crop&q=80&w=800
```

### Step 3: Update constants.ts

```typescript
export const IMAGES = {
  hardware: 'https://images.unsplash.com/photo-YOUR_ID?auto=format&fit=crop&q=80&w=1000',
  // ...
};
```

### Step 4: Verify

- Check dev server (hot reload should show new image)
- Test grayscale-to-color hover effect
- Verify responsive sizing

## Image Treatment in Components

All images should use these Tailwind classes:

```jsx
// Standard treatment
<img
  className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
/>

// With scale effect (prototypes)
<img
  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110"
/>
```

## Adding Local Images (Optional)

If you want to use local images instead:

### Step 1: Create Images Directory

```bash
mkdir -p public/images
```

### Step 2: Add Images

Place images in `/public/images/`:
```
public/
└── images/
    ├── hardware.jpg
    ├── dataset-1.jpg
    └── robot-1.jpg
```

### Step 3: Reference in constants.ts

```typescript
export const IMAGES = {
  hardware: '/images/hardware.jpg',
  // ...
};
```

### Step 4: Update vite.config.ts (if needed)

Vite serves `/public` as root automatically.

## Image Optimization Tips

1. **Use WebP format** when possible (smaller files)
2. **Compress before upload** (TinyPNG, Squoosh)
3. **Use appropriate sizes** (don't load 4K for a 400px container)
4. **Add `loading="lazy"`** for below-fold images

## Suggested Image Searches

For different sections, try these search terms:

### Hardware Section
- "smart glasses technology"
- "AR VR headset"
- "wearable technology"
- "POV camera"

### Datasets Section
- "robot arm manufacturing"
- "industrial automation"
- "assembly line robot"
- "robotic manipulation"

### Prototypes Section
- "humanoid robot"
- "mobile robot"
- "drone technology"
- "autonomous robot"

### Research Section
- "AI research lab"
- "robotics laboratory"
- "computer vision"
- "machine learning"

## Current Image URLs Reference

```typescript
// Hardware
https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=1000

// Datasets
manipulation: https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=800
interaction: https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800
longHorizon: https://images.unsplash.com/photo-1531966662811-c18d5f1e8489?auto=format&fit=crop&q=80&w=800

// Prototypes
NB-01: https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800
NB-02: https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800
NB-03: https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800
```
