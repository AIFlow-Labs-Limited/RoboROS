# Component Templates

Pre-approved component templates for Robot Flow Labs. Copy these patterns exactly.

## Section Component (Light Background)

```typescript
import React from 'react';
import { CONTENT, IMAGES } from '../constants';
import { Language } from '../types';
import { IconName } from 'lucide-react';

interface Props {
  lang: Language;
}

const SectionName: React.FC<Props> = ({ lang }) => {
  const content = CONTENT[lang].sectionName;

  return (
    <section id="sectionname" className="bg-[#f3f3f3] py-24 border-b-4 border-black">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[#FF3B00] font-mono text-xs font-bold mb-2 border border-[#FF3B00] px-3 py-1 rounded-full">
            <IconName size={14} />
            {content.subtitle}
          </div>
          <h2 className="font-display text-5xl md:text-6xl uppercase font-bold">
            {content.title}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Content here */}
        </div>

      </div>
    </section>
  );
};

export default SectionName;
```

## Section Component (Dark Background)

```typescript
import React from 'react';
import { CONTENT } from '../constants';
import { Language } from '../types';
import { IconName } from 'lucide-react';

interface Props {
  lang: Language;
}

const SectionName: React.FC<Props> = ({ lang }) => {
  const content = CONTENT[lang].sectionName;

  return (
    <section id="sectionname" className="bg-black text-white py-24 border-b-4 border-[#FF3B00]">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-6">
          <div>
            <div className="text-[#FF3B00] font-mono text-xs font-bold mb-2 flex items-center gap-2">
              <IconName size={14} />
              {content.subtitle}
            </div>
            <h2 className="font-display text-5xl uppercase font-bold">
              {content.title}
            </h2>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800 border border-gray-800">
          {/* Content here */}
        </div>

      </div>
    </section>
  );
};

export default SectionName;
```

## Card Component (Light)

```tsx
<div className="border-2 border-black bg-white group hover:-translate-y-2 transition-transform duration-300">
  {/* Image Header */}
  <div className="h-48 overflow-hidden relative border-b-2 border-black bg-gray-200">
    <img
      src={imageUrl}
      alt={item.title}
      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
    />
    <div className="absolute top-4 left-4 bg-black text-white p-2">
      <IconName size={24} />
    </div>
  </div>

  {/* Content */}
  <div className="p-6">
    <h3 className="font-display text-2xl font-bold uppercase mb-1">{item.title}</h3>
    <h4 className="font-mono text-xs font-bold text-[#FF3B00] mb-4">{item.subtitle}</h4>
    <p className="font-mono text-sm leading-relaxed text-gray-600 mb-6">
      {item.description}
    </p>

    {/* Tags */}
    <div className="flex flex-wrap gap-2">
      {item.tags.map((tag, i) => (
        <span key={i} className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 uppercase group-hover:border-[#FF3B00] transition-colors">
          {tag}
        </span>
      ))}
    </div>
  </div>
</div>
```

## Card Component (Dark)

```tsx
<div className="bg-[#1a1a1a] border border-gray-800 hover:border-[#FF3B00] transition-colors group">
  {/* Image Container */}
  <div className="relative aspect-[4/5] overflow-hidden bg-black">
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110"
    />

    {/* Overlay UI */}
    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
      <div className="flex justify-between items-start">
        <span className="bg-[#FF3B00] text-black text-[10px] font-bold px-2 py-0.5 font-mono">
          {id}
        </span>
        <IconName className="text-white w-4 h-4 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="p-6 border-t border-gray-800 group-hover:bg-[#FF3B00] group-hover:text-black transition-colors">
    <h3 className="font-display text-2xl font-bold uppercase">{name}</h3>
    <div className="flex items-center gap-2 mt-2 font-mono text-xs opacity-60 group-hover:opacity-100">
      <IconName size={12} />
      <span>STATUS_TEXT</span>
    </div>
  </div>
</div>
```

## Button Components

### Primary Button
```tsx
<button className="bg-black text-white py-4 px-8 font-display text-xl uppercase font-bold hover:bg-[#FF3B00] hover:text-black transition-colors flex items-center justify-center gap-2">
  <IconName size={20} />
  {buttonText}
</button>
```

### Secondary Button
```tsx
<button className="border-2 border-black px-6 py-3 font-mono text-sm font-bold hover:bg-black hover:text-white transition-colors">
  {buttonText}
</button>
```

### Badge Button
```tsx
<span className="border-2 border-black px-3 py-1 rounded-full flex items-center gap-2 font-mono text-xs font-bold">
  <span className="w-2 h-2 bg-[#FF3B00] rounded-full animate-ping"></span>
  {statusText}
</span>
```

## Form Elements

### Text Input
```tsx
<div className="space-y-1">
  <label className="font-mono text-xs font-bold uppercase">{label}</label>
  <input
    name="fieldname"
    required
    type="text"
    className="w-full bg-[#f3f3f3] border-b-2 border-black p-3 focus:outline-none focus:bg-[#FF3B00] focus:text-white transition-colors"
  />
</div>
```

### Textarea
```tsx
<div className="space-y-1">
  <label className="font-mono text-xs font-bold uppercase">{label}</label>
  <textarea
    name="fieldname"
    required
    rows={4}
    className="w-full bg-[#f3f3f3] border-b-2 border-black p-3 focus:outline-none focus:bg-[#FF3B00] focus:text-white transition-colors"
  ></textarea>
</div>
```

### Select
```tsx
<div className="space-y-1">
  <label className="font-mono text-xs font-bold uppercase">{label}</label>
  <select
    name="fieldname"
    className="w-full bg-[#f3f3f3] border-b-2 border-black p-3 focus:outline-none focus:bg-[#FF3B00] focus:text-white transition-colors font-mono text-sm"
  >
    <option value="option1">OPTION 1</option>
    <option value="option2">OPTION 2</option>
  </select>
</div>
```

## Layout Patterns

### Two Column (Image + Text)
```tsx
<div className="flex flex-col md:flex-row gap-12 items-center">
  {/* Image Column */}
  <div className="md:w-1/2 relative group">
    <div className="absolute top-0 left-0 w-full h-full border-2 border-[#FF3B00] translate-x-4 translate-y-4"></div>
    <div className="relative border-2 border-black bg-gray-100 p-2 overflow-hidden">
      <img
        src={imageUrl}
        alt="Description"
        className="w-full h-auto grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute bottom-4 left-4 bg-black text-white px-2 py-1 font-mono text-xs font-bold">
        LABEL // TEXT
      </div>
    </div>
  </div>

  {/* Text Column */}
  <div className="md:w-1/2">
    <div className="text-[#FF3B00] font-mono text-xs font-bold mb-2 flex items-center gap-2">
      <IconName size={18} />
      {subtitle}
    </div>
    <h2 className="font-display text-5xl uppercase font-bold mb-6 leading-tight">{title}</h2>
    <p className="font-mono text-sm mb-8 opacity-80 max-w-md border-l-4 border-[#FF3B00] pl-4">
      {description}
    </p>
  </div>
</div>
```

### Three Column Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map((item, index) => (
    <div key={index}>
      {/* Card content */}
    </div>
  ))}
</div>
```

## Status Indicators

### Active Status
```tsx
<span className="flex items-center gap-2">
  <div className="w-2 h-2 bg-[#FF3B00] rounded-full animate-pulse"></div>
  STATUS: ACTIVE
</span>
```

### Badge
```tsx
<span className="bg-[#FF3B00] text-black text-[10px] font-bold px-2 py-0.5 font-mono">
  LABEL
</span>
```

### Tag
```tsx
<span className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 uppercase">
  {tagText}
</span>
```
