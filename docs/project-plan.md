# FocusFlow — Complete App Design

## 1. App Concept

FocusFlow is a clean Pomodoro productivity web app for students and developers.

The app helps users:

- Start focus sessions
- Manage study/coding tasks
- Track completed Pomodoros
- View daily productivity stats
- Build a focus habit
- Stay consistent with daily goals

The app should feel modern, calm, professional, and recruiter-friendly.

---

# 2. Design Style

## Overall Look

The design should look like a modern SaaS productivity dashboard.

Style keywords:

- Clean
- Minimal
- Soft
- Focused
- Professional
- Calm
- Responsive
- Card-based
- Recruiter-friendly

## Visual Direction

Use a light background with soft cards, rounded corners, subtle shadows, and a strong accent color.

The UI should not look like a basic school project.
It should feel like a real app that someone can use every day.

---

# 3. Color System

## Light Mode

```css
:root {
	--bg-primary: #f6f8fc;
	--bg-secondary: #ffffff;
	--bg-soft: #eef2ff;

	--text-primary: #111827;
	--text-secondary: #6b7280;
	--text-muted: #9ca3af;

	--accent-primary: #6366f1;
	--accent-secondary: #8b5cf6;
	--accent-soft: #e0e7ff;

	--success: #22c55e;
	--warning: #f59e0b;
	--danger: #ef4444;

	--border: #e5e7eb;
	--shadow: 0 10px 30px rgba(15, 23, 42, 0.08);

	--radius-sm: 8px;
	--radius-md: 14px;
	--radius-lg: 22px;
	--radius-xl: 30px;
}
```

## Dark Mode

```css
[data-theme="dark"] {
	--bg-primary: #0f172a;
	--bg-secondary: #111827;
	--bg-soft: #1e293b;

	--text-primary: #f9fafb;
	--text-secondary: #cbd5e1;
	--text-muted: #94a3b8;

	--accent-primary: #818cf8;
	--accent-secondary: #a78bfa;
	--accent-soft: #312e81;

	--border: #334155;
	--shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
```

---

# 4. Typography

Use a clean modern font.

Recommended font:

```css
font-family:
	Inter,
	system-ui,
	-apple-system,
	BlinkMacSystemFont,
	"Segoe UI",
	sans-serif;
```

## Font Scale

```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--text-4xl: 3rem;
--text-5xl: 4.5rem;
```

## Typography Usage

- App title: 28px–36px
- Subtitle: 15px–17px
- Timer text: 64px–88px desktop, 48px–60px mobile
- Section title: 18px–22px
- Card label: 13px–14px
- Stats number: 24px–32px

---

# 5. Main Layout

## Desktop Layout

The desktop screen should use a dashboard layout.

```txt
---------------------------------------------------------
| Header: Logo + Subtitle + Theme Toggle + Sound Toggle |
---------------------------------------------------------
|                                                       |
|  Timer Card                    Stats / Goal Card      |
|  - Mode tabs                   - Today sessions       |
|  - Big countdown               - Focus minutes        |
|  - Controls                    - Goal progress        |
|  - Active task                 - Active task summary  |
|                                                       |
---------------------------------------------------------
|                                                       |
|  Task Manager                  Session History        |
|  - Add task form               - Recent sessions      |
|  - Task list                   - Clear history        |
|                                                       |
---------------------------------------------------------
```

Use a max-width container:

```css
.app-container {
	width: min(1180px, 92%);
	margin: 0 auto;
}
```

Main grid:

```css
.dashboard-grid {
	display: grid;
	grid-template-columns: 1.4fr 1fr;
	gap: 24px;
}
```

Lower grid:

```css
.content-grid {
	display: grid;
	grid-template-columns: 1.2fr 1fr;
	gap: 24px;
}
```

## Mobile Layout

On mobile, everything becomes one column.

```txt
Header
Timer Card
Stats Cards
Daily Goal
Task Manager
Session History
```

---

# 6. Header Design

## Header Content

Left side:

```txt
FocusFlow
Plan your tasks, stay focused, track your progress.
```

Right side:

```txt
Theme Toggle
Sound Toggle
```

## Header Visual

- Use flexible layout
- Keep title bold
- Subtitle muted
- Toggles should be pill-shaped buttons

Example:

```txt
FocusFlow
Plan your tasks, stay focused, track your progress.

[🌙 Dark] [🔔 Sound]
```

---

# 7. Timer Card Design

The timer card is the main visual focus of the app.

## Card Structure

```txt
------------------------------------------------
| Pomodoro Timer                               |
| Stay focused. One session at a time.         |
|                                              |
| [Focus] [Short Break] [Long Break]           |
|                                              |
|              25:00                           |
|                                              |
| Active task: Build JavaScript project        |
| Session 2 of 4 before long break             |
|                                              |
| [Start] [Pause] [Reset] [Skip]               |
------------------------------------------------
```

## Timer Card Styling

- Big rounded card
- Large countdown in center
- Slight gradient background or soft accent section
- Main button should be filled
- Secondary buttons should be outline/soft

## Timer Modes

Mode buttons:

- Focus
- Short Break
- Long Break

Active mode should have:

- Accent background
- White text
- Slight shadow

Inactive mode should have:

- Soft background
- Muted text

## Countdown

Timer text:

```css
.timer-display {
	font-size: clamp(3rem, 8vw, 5.5rem);
	font-weight: 800;
	letter-spacing: -0.05em;
}
```

## Timer Controls

Buttons:

- Start: primary filled button
- Pause: secondary button
- Reset: ghost button
- Skip: ghost button

Button style:

```css
.btn {
	border: none;
	border-radius: 999px;
	padding: 12px 20px;
	font-weight: 700;
	cursor: pointer;
}
```

---

# 8. Stats Dashboard Design

Stats should make the app feel more useful than a simple timer.

## Stats Card Layout

```txt
------------------------------------------------
| Today's Productivity                         |
|                                              |
| [ 4 ] Focus Sessions                         |
| [ 100 ] Focus Minutes                        |
| [ 18 ] Total Sessions                        |
| [ Coding ] Best Category                     |
|                                              |
| Daily Goal                                   |
| ███████████░░░░  100 / 120 min               |
------------------------------------------------
```

## Stats Cards

Use small cards inside the stats section.

Each stat should have:

- Small label
- Big number
- Small helper text

Example:

```txt
Today
4 sessions
Completed focus rounds
```

## Daily Goal Progress

Progress bar:

- Rounded
- Light background
- Accent filled area
- Percentage or minutes shown below

Example:

```txt
Daily Goal
100 / 120 minutes
[████████████░░░░░░]
```

---

# 9. Task Manager Design

This is where the project becomes recruiter-impressive.

## Task Section Layout

```txt
------------------------------------------------
| Tasks                                        |
| Add and select what you want to focus on.    |
|                                              |
| Task Title                                   |
| [ Enter task name...                  ]      |
|                                              |
| Category          Estimated Pomodoros        |
| [ Coding v ]      [ 4 ]                      |
|                                              |
| [ Add Task ]                                 |
|                                              |
| Task List                                    |
|                                              |
| ● Build portfolio project                    |
|   Coding · 2 / 4 pomodoros                   |
|   [Set Active] [Complete] [Delete]           |
|                                              |
| ● Read chapter 3                             |
|   Study · 1 / 3 pomodoros                    |
|   [Set Active] [Complete] [Delete]           |
------------------------------------------------
```

## Add Task Form

Fields:

- Task title input
- Category select
- Estimated Pomodoros number input
- Add Task button

Categories:

- Study
- Coding
- Reading
- Writing
- Other

## Task Item Design

Each task item should show:

- Task title
- Category badge
- Pomodoro progress
- Completed status
- Action buttons

## Active Task

Active task should have:

- Accent border
- Soft accent background
- “Active” badge

Example:

```txt
Active
Build JavaScript project
Coding · 2/4 completed
```

## Completed Task

Completed tasks should have:

- Slight opacity
- Check icon
- Strikethrough title optional

---

# 10. Session History Design

## History Layout

```txt
------------------------------------------------
| Session History                     [Clear]  |
|                                              |
| Today, 10:30 PM                              |
| Focus · Build portfolio project · 25 min     |
|                                              |
| Today, 10:00 PM                              |
| Short Break · No active task · 5 min         |
|                                              |
| Yesterday, 8:20 PM                           |
| Focus · Read chapter 3 · 25 min              |
------------------------------------------------
```

## History Item

Each item should include:

- Mode badge
- Task name
- Duration
- Date
- Time

Focus badge:

```txt
Focus
```

Break badge:

```txt
Break
```

Use different soft colors for focus and break badges.

## Empty State

If no history exists:

```txt
No sessions yet.
Complete your first focus session to see history here.
```

---

# 11. Empty States

Good empty states make the app feel polished.

## No Tasks

```txt
No tasks yet.
Add your first study or coding task to begin focusing.
```

## No Active Task

```txt
No active task selected.
You can still start the timer, or select a task to track progress.
```

## No History

```txt
No sessions completed yet.
Your focus and break history will appear here.
```

---

# 12. Components List

## Main Components

- Header
- Theme toggle
- Sound toggle
- Timer card
- Mode switcher
- Timer display
- Timer controls
- Active task display
- Stats card
- Daily goal card
- Progress bar
- Add task form
- Task item
- Category badge
- Session history item
- Empty state
- Toast notification

---

# 13. Button Design

## Primary Button

Used for:

- Start
- Add Task
- Save Goal

Style:

```css
.btn-primary {
	background: linear-gradient(
		135deg,
		var(--accent-primary),
		var(--accent-secondary)
	);
	color: #ffffff;
	box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
}
```

## Secondary Button

Used for:

- Pause
- Set Active
- Complete

```css
.btn-secondary {
	background: var(--accent-soft);
	color: var(--accent-primary);
}
```

## Ghost Button

Used for:

- Reset
- Skip
- Clear history

```css
.btn-ghost {
	background: transparent;
	color: var(--text-secondary);
	border: 1px solid var(--border);
}
```

## Danger Button

Used for:

- Delete task
- Clear all

```css
.btn-danger {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger);
}
```

---

# 14. Form Design

Inputs should look clean and modern.

```css
.input,
.select {
	width: 100%;
	border: 1px solid var(--border);
	border-radius: var(--radius-md);
	padding: 12px 14px;
	background: var(--bg-secondary);
	color: var(--text-primary);
	outline: none;
}
```

Focus state:

```css
.input:focus,
.select:focus {
	border-color: var(--accent-primary);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
}
```

---

# 15. Badge Design

Use badges for category, mode, status.

Examples:

```txt
Coding
Study
Focus
Break
Active
Completed
```

Badge style:

```css
.badge {
	display: inline-flex;
	align-items: center;
	border-radius: 999px;
	padding: 5px 10px;
	font-size: 0.75rem;
	font-weight: 700;
}
```

---

# 16. Toast Notification Design

Show a small toast when:

- Task added
- Task completed
- Timer session completed
- History cleared
- Goal updated

Toast position:

```txt
Bottom-right on desktop
Bottom-center on mobile
```

Example messages:

```txt
Focus session completed!
Task added successfully.
Daily goal updated.
```

---

# 17. Interaction Flow

## User Flow

```txt
User opens app
↓
User adds task
↓
User selects active task
↓
User starts focus timer
↓
Timer counts down
↓
Session ends
↓
Sound plays
↓
Session saved to history
↓
Stats update
↓
Task pomodoro count increases
↓
App switches to break mode
```

---

# 18. Timer Behavior

## Focus Session Complete

When a focus session ends:

- Save session to history
- Increase today’s focus minutes
- Increase today’s focus session count
- Increase completed pomodoro count for active task
- Play alert sound if sound is enabled
- Show toast
- Automatically switch to short break
- Every 4 focus sessions, switch to long break

## Break Session Complete

When a break ends:

- Save break session to history
- Do not add to focus minutes
- Do not increase task completed count
- Play alert sound
- Show toast
- Switch back to focus mode

---

# 19. Responsive Design

## Desktop

- Two-column dashboard
- Timer card on left
- Stats on right
- Task manager and history side by side

## Tablet

- Keep two columns if enough width
- Reduce gaps
- Timer text slightly smaller

## Mobile

- Single-column layout
- Buttons wrap into two rows
- Form fields stack vertically
- Timer card full width
- Header stacks vertically
- Toggles move below title

Mobile layout:

```txt
FocusFlow
Subtitle
Theme/Sound Toggles

Timer
Stats
Daily Goal
Tasks
History
```

---

# 20. Accessibility Design

The app must include:

- Semantic HTML
- Proper form labels
- Visible focus states
- Buttons with clear text
- Good color contrast
- Keyboard navigable controls
- No icon-only important actions unless they have labels
- Timer status text understandable for screen readers

Example:

```html
<button aria-label="Start focus timer">Start</button>
```

---

# 21. Premium UI Details

Add these details to make it look professional:

- Soft gradient on timer card
- Smooth button hover animation
- Progress bar animation
- Active task highlight
- Empty state illustrations using simple CSS icons or emoji
- Subtle shadows
- Rounded cards
- Consistent spacing
- Sticky header optional
- Smooth theme transition

---

# 22. Suggested Screen Sections

## Full Page Order

```txt
1. Header
2. Timer + Stats Dashboard
3. Task Manager + Session History
4. Footer
```

## Footer

Footer should be simple:

```txt
Built with HTML, CSS & JavaScript · FocusFlow
```

---

# 23. Final Visual Wireframe

```txt
=================================================================
 FocusFlow                                      [Dark] [Sound]
 Plan your tasks, stay focused, track your progress.
=================================================================

┌──────────────────────────────────────┐ ┌───────────────────────┐
│ Pomodoro Timer                       │ │ Today's Productivity  │
│ Stay focused. One session at a time. │ │                       │
│                                      │ │ Focus Sessions        │
│ [Focus] [Short Break] [Long Break]   │ │ 4                     │
│                                      │ │                       │
│              25:00                   │ │ Focus Minutes         │
│                                      │ │ 100                   │
│ Active Task: Build Portfolio App     │ │                       │
│ Session 2 of 4 before long break     │ │ Daily Goal            │
│                                      │ │ 100 / 120 min         │
│ [Start] [Pause] [Reset] [Skip]       │ │ ███████████░░░        │
└──────────────────────────────────────┘ └───────────────────────┘

┌──────────────────────────────────────┐ ┌───────────────────────┐
│ Tasks                                │ │ Session History       │
│ Add and select focus tasks.          │ │              [Clear]  │
│                                      │ │                       │
│ Task Title                           │ │ Focus                 │
│ [ Build JavaScript project      ]    │ │ Build Portfolio App   │
│                                      │ │ Today, 10:30 PM       │
│ Category        Estimate             │ │                       │
│ [ Coding ]      [ 4 ]                │ │ Break                 │
│                                      │ │ No active task        │
│ [ Add Task ]                         │ │ Today, 10:00 PM       │
│                                      │ │                       │
│ Build Portfolio App        [Active]  │ │                       │
│ Coding · 2 / 4 pomodoros             │ │                       │
│ [Set Active] [Complete] [Delete]     │ │                       │
└──────────────────────────────────────┘ └───────────────────────┘
```

---

# 24. Recruiter-Friendly Features to Highlight

The design should clearly show that the project includes:

- Real-world daily use case
- JavaScript state management
- localStorage persistence
- Responsive design
- Dark/light mode
- CRUD task management
- Session history
- Productivity dashboard
- Clean modular structure
- Accessibility awareness
- Professional UI/UX thinking

---

# 25. Final Design Goal

The final app should look like a small professional productivity product.

It should not feel like:

- A basic timer
- A beginner tutorial clone
- A plain HTML project
- A random practice app

It should feel like:

- A useful daily tool
- A polished portfolio project
- A frontend dashboard
- A recruiter-ready GitHub project
