# Design Guidelines: The Money Burner 3000

## Design Approach

**Reference-Based with Playful Twist**
Drawing inspiration from Linear's clean productivity aesthetic and Stripe's data visualization excellence, but injected with gamification elements and humorous personality. The design balances professional utility with entertainment value—this is a tool that makes boring meeting analytics actually engaging.

**Core Design Principles:**
1. **Immediate Impact**: Cost should be visceral and impossible to ignore
2. **Playful Professionalism**: Serious data, delivered with humor
3. **Visual Hierarchy**: Numbers and animations dominate, supporting text stays minimal
4. **Data Clarity**: Despite playfulness, all metrics must be instantly readable

## Typography

**Font System** (via Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - Clean, professional for UI text and data
- **Display**: Space Grotesk (700) - Bold, attention-grabbing for cost counters and grades

**Hierarchy:**
- Cost Display: Space Grotesk 700, text-6xl to text-8xl - dominant screen presence
- Timer/Duration: Inter 600, text-4xl to text-5xl
- Efficiency Grades: Space Grotesk 700, text-5xl 
- Grade Descriptions: Inter 500, text-xl to text-2xl
- Section Headers: Inter 600, text-2xl to text-3xl
- Body/Labels: Inter 400-500, text-base to text-lg
- Micro-copy: Inter 400, text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm

**Grid Structure:**
- Dashboard: Single-column focus with maximum 2-column splits for comparison data
- Meeting Setup: Centered form layout, max-w-2xl
- Live Meeting View: Fixed overlay positioning with absolute placement for cost counter
- Weekly Report: Card grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) for meeting cards

**Container Widths:**
- Main dashboard: max-w-7xl
- Forms/Setup: max-w-2xl  
- Data cards: Full-width within grid cells
- Live overlay: Fixed dimensions (400px width typical)

## Component Library

### Core Components

**1. Live Cost Counter (The Burner)**
Large, centered numeric display with currency formatting ($X,XXX.XX)
Positioned prominently - either top-center overlay or dedicated dashboard section
Updates every second with smooth number transitions
Accompanied by burning money animation (see Images section)

**2. Timer Display**
Split display showing:
- "Scheduled End: [TIME]" - neutral styling
- "Current Time: [TIME]" - with conditional formatting (green if on-time, red if over)
Side-by-side on larger screens, stacked on mobile
Large, readable clock faces using tabular numbers

**3. Efficiency Score Card**
Bold letter grade (A+ through F) in massive display typography
Humorous subtitle below grade ("Everyone Could've Been Napping", "Borderline Acceptable", "Actually Productive")
Score breakdown displayed as horizontal progress bars with point deductions/additions labeled
Color-coded by performance tier

**4. Meeting Setup Form**
Clean, stepped form interface
Attendee chips with role badges (Junior/Mid/Senior/Manager) - removable pills with salary band indicators
Duration input with increment/decrement buttons
Auto-calculating estimated cost preview that updates in real-time as attendees are added
Large, primary action button "Start Meeting Timer"

**5. Weekly Dashboard Cards**
Meeting history cards displaying:
- Meeting title and date
- Duration (scheduled vs actual) with visual bar comparison
- Cost amount in prominent display
- Efficiency grade badge in corner
- Hover/click to expand for full details
Sorted by date or cost, with filter toggles

**6. Easter Egg Interface**
Appears as playful alert/modal when overtime threshold hit (2x duration)
Contains:
- Cheeky message ("Uh oh, we've gone full overtime!")
- "Play Yakety Sax" button with speaker icon
- Small animation (bouncing clock or similar)
- Dismissible but memorable

### Navigation

Simple header bar with:
- Logo/App name "💸 Money Burner 3000" with emoji and bold wordmark
- Main nav: Dashboard | Active Meeting | Weekly Report | Settings
- Right-aligned user menu
Fixed positioning, sticky on scroll

### Data Visualization

Progress bars for score calculations - filled portions in accent, unfilled in muted
Simple sparkline charts showing meeting trends over time
Comparison bars (scheduled vs actual duration) - dual-colored horizontal bars
Cost breakdown pie charts - max 4-5 segments, bold segments for top cost categories

### Buttons & Interactions

Primary buttons: Bold, high-contrast with generous padding (px-8 py-4)
"Start Meeting" button: Extra prominent with pulsing/glow effect suggesting action
Secondary actions: Ghost buttons or text links
Destructive actions (end meeting, delete): Red accent with confirmation step
All buttons use Inter 600, text-base to text-lg

### Empty States & Onboarding

First-time user: Illustrated empty state showing "No meetings tracked yet" with clear CTA
Quick setup wizard: 3-step flow (Connect calendar → Set salary bands → You're ready)
Helpful tooltips on first use explaining efficiency score calculation

## Images

**Burning Money Animation:**
Central visual element for live meeting view. Animated SVG or Lottie animation of dollar bills with flame effect. Position: Adjacent to or behind the cost counter. Style: Pixel art aesthetic or smooth vector animation—should feel playful not realistic. Loop continuously during active meeting.

**Dashboard Hero (Optional Enhancement):**
Illustrated header showing stack of coins/money with timer - reinforces the "burning" metaphor. Position: Top of dashboard as visual anchor. Style: Flat illustration or 3D-rendered but optimistic/playful, not dark or ominous.

**Empty State Illustrations:**
Simple line art showing person at computer with clock/dollar signs. Style: Friendly, approachable spot illustrations. Placement: Center of empty meeting list or report views.

## Animations

**Use Sparingly:**
- Number counter animations for cost display (smooth increment)
- Burning flame animation (constant but subtle)
- Grade reveal animation on score calculation (quick pop-in with bounce)
- Easter egg entrance (playful slide-in when overtime triggered)

Avoid: Excessive page transitions, distracting scroll effects, or overuse of parallax

## Responsive Behavior

**Desktop (lg+):** Full multi-column layouts, side-by-side timers, expanded data tables
**Tablet (md):** 2-column grids collapse partially, timer displays stack, forms remain centered
**Mobile (base):** Single column everything, cost counter remains prominent but scales down, cards stack vertically, navigation collapses to hamburger

---

**Personality Notes:**
Maintain tongue-in-cheek humor in copy without undermining functionality. The tool should make users smile while showing them hard truths about meeting efficiency. Gradients and bold accents reinforce the "burning money" urgency, while clean spacing and professional typography ensure it's taken seriously as a productivity tool.