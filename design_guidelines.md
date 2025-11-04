# AstraMind Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (Productivity + AI Interface Hybrid)

**Primary References**:
- Linear: Minimalist futuristic aesthetic, clean typography hierarchy
- Notion: Approachable yet powerful dashboard layout
- ChatGPT/Claude: Effective conversational AI patterns
- Apple HIG: Content-focused restraint and clarity

**Key Design Principles**:
1. Futuristic Minimalism: Clean, spacious, with subtle sci-fi undertones
2. Conversational Focus: Chat interface is the primary interaction point
3. Intelligent Hierarchy: Guide users naturally from chat → insights → goals
4. Trust Through Clarity: Transparent AI interactions, clear data visualization

---

## Typography

**Font Families** (via Google Fonts CDN):
- Primary: Inter (weights: 400, 500, 600, 700)
- Monospace: JetBrains Mono (for timestamps, data, code snippets) (weight: 400, 500)

**Type Scale**:
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-semibold (18px)
- Body Text: text-base font-normal (16px)
- Meta/Timestamps: text-sm font-mono (14px)
- Labels: text-xs font-medium uppercase tracking-wide (12px)

**Line Height**: Use leading-relaxed (1.625) for body text, leading-tight for headings

---

## Layout System

**Spacing Primitives** (Tailwind units):
- Micro spacing: 1, 2 units (4px, 8px) - element padding, icon margins
- Standard spacing: 4, 6, 8 units (16px, 24px, 32px) - component padding, gaps
- Macro spacing: 12, 16, 20 units (48px, 64px, 80px) - section separation, page margins

**Container Strategy**:
- App Shell: Full viewport (w-full h-screen)
- Content Max Width: max-w-7xl mx-auto
- Chat Container: max-w-3xl mx-auto (optimal reading width)
- Dashboard Cards: No max-width, use grid responsive columns

**Grid System**:
- Dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- Stat Cards: grid-cols-2 md:grid-cols-4 with gap-4
- Goal List: Single column stacked layout

---

## Component Library

### Navigation
**Top App Bar**:
- Fixed position at top, h-16 with px-6
- Logo/Brand left, user profile/settings right
- Minimal navigation tabs (Dashboard, Chat, Goals) centered
- Subtle bottom border separator

### Chat Interface (Primary Component)
**Chat Container**:
- Central column layout, max-w-3xl
- Conversation fills available height with scrollable area
- Message bubbles with distinct user vs AI styling
- User messages: right-aligned, compact width
- AI messages: left-aligned, full width for longer responses
- Input bar fixed at bottom with h-20, rounded-2xl text area
- Send button integrated into input (icon-only, right side)
- Timestamp in text-xs font-mono below each message cluster

**Suggested Actions**:
- Floating pill buttons below AI responses
- Horizontal scroll for multiple suggestions
- px-4 py-2 rounded-full with subtle borders

### Dashboard Widgets
**Stat Cards**:
- Grid layout for multiple metrics
- Each card: p-6 rounded-xl with subtle border
- Large number display (text-3xl font-bold)
- Label below in text-sm text-muted
- Optional trend indicator (↑/↓ icon + percentage)

**Goal Cards**:
- Stacked list with gap-4
- Each goal: p-5 rounded-lg border
- Title: text-lg font-semibold
- Progress bar: h-2 rounded-full with partial fill
- Metadata row: due date, category tag, completion %

**Recent Notes/Memory**:
- Compact list view with dividers
- Each item: py-3 with text-sm preview
- Timestamp in font-mono text-xs
- Expandable on click

**Activity Timeline**:
- Vertical timeline with connecting line
- Event nodes: small circle (w-3 h-3) on line
- Event cards extend right: p-4 rounded-md
- Time labels in font-mono

### Forms & Inputs
**Text Input**:
- h-12 px-4 rounded-lg border focus:ring-2
- Placeholder in text-muted

**Text Area** (for chat):
- min-h-16 max-h-32 px-4 py-3 rounded-xl border
- Auto-resize based on content

**Buttons**:
- Primary CTA: px-6 py-3 rounded-lg font-semibold
- Secondary: px-4 py-2 rounded-md with border
- Icon-only: w-10 h-10 rounded-lg centered icon

**Toggle Switches**:
- Standard size with smooth transition
- Use for settings, preferences

### Data Display
**Progress Indicators**:
- Circular progress for goal completion (stroke-based SVG)
- Linear bars for daily productivity (h-2 rounded-full)

**Tags/Badges**:
- px-3 py-1 rounded-full text-xs font-medium
- Multiple categories (goals, productivity, learning)

### Modal Overlays
**Dialog/Modal**:
- Centered overlay with max-w-md
- p-6 rounded-2xl with backdrop blur
- Header (text-xl font-semibold), content, action buttons at bottom

**Sidepanel** (for settings/details):
- Slide from right, w-96 fixed h-full
- p-6 with scrollable content

---

## Icons

**Library**: Heroicons (via CDN)
- Use outline style for navigation, actions
- Use solid style for completed states, active indicators
- Standard size: w-5 h-5 for inline, w-6 h-6 for standalone

**Key Icons Needed**:
- Navigation: chat bubble, chart bar, target (goals), cog (settings)
- Actions: plus, arrow right, check, x-mark
- Status: clock, check circle, exclamation
- AI indicator: sparkles, lightning bolt

---

## Images

**Hero Section**: Not applicable (dashboard app, not marketing)

**Placeholder Usage**:
- User avatar: rounded-full w-10 h-10 in top bar
- Empty states: Centered illustrations with text-muted messaging
- AI avatar: Small icon/logo in chat bubbles (w-8 h-8 rounded-full)

---

## Animations

**Minimal, Purposeful Only**:
- Message appearance: Subtle fade-in (150ms)
- Modal entry: Scale from 95% to 100% (200ms ease-out)
- Button hover: Transform scale(1.02) (100ms)
- Progress bars: Smooth width transition (300ms)

**No Animations**:
- Page transitions
- Scroll-triggered effects
- Loading spinners beyond simple rotate

---

## Accessibility

**Focus States**: 
- Visible ring-2 focus indicator on all interactive elements
- ring-offset-2 for clarity against backgrounds

**ARIA Labels**:
- All icon buttons require aria-label
- Chat messages with role="log" for screen readers
- Progress indicators with aria-valuenow

**Keyboard Navigation**:
- Tab order: Top bar → Chat input → Messages → Dashboard cards
- Enter to send messages, Escape to close modals

---

## Responsive Behavior

**Breakpoints**:
- Mobile (< 768px): Single column, collapsible sidebar, bottom tab navigation
- Tablet (768px - 1024px): Two-column dashboard, side navigation visible
- Desktop (> 1024px): Full layout with three-column dashboard

**Mobile Specific**:
- Chat input sticky at bottom with safe-area-inset-bottom
- Dashboard cards stack vertically
- Top bar condenses with hamburger menu

---

## Layout Patterns

**App Shell**:
```
[Top App Bar - fixed]
[Main Content Area - flex-1]
  [Sidebar Nav - hidden on mobile, w-64 on desktop]
  [Primary Content - flex-1]
    [Page specific layout]
[No footer for app interface]
```

**Chat View**:
- Full height with fixed input at bottom
- Messages scroll in middle section
- Suggested actions below AI responses

**Dashboard View**:
- Grid of widgets with consistent gap-6
- Priority order: Daily summary → Active goals → Recent activity → Stats

This design creates a clean, futuristic AI companion experience that balances powerful functionality with approachable simplicity, drawing from the best of modern productivity tools while establishing its own identity as an intelligent life OS.