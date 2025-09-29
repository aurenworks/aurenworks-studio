# AurenWorks Studio Design Tokens

This document outlines the design system and color palette for AurenWorks Studio, ensuring consistent visual design across the application.

## Color Palette

### Primary Colors

- **Auren Gold** (`#FFD166`) - Primary brand color, warm golden-yellow inspired by the dragon mascot
- **Deep Slate** (`#2F2F3A`) - Secondary color, dark neutral for backgrounds and text

### Accent Colors

- **Ember** (`#F25C54`) - Fiery accent for buttons, links, and highlights
- **Sky** (`#06AED5`) - Cool counterpoint for secondary highlights and links

## Semantic Color Mappings

### Primary Colors

```css
--color-primary: #ffd166 /* Auren Gold */ --color-primary-foreground: #2f2f3a
  /* Deep Slate */;
```

### Secondary Colors

```css
--color-secondary: #2f2f3a /* Deep Slate */
  --color-secondary-foreground: #ffffff /* White */;
```

### Accent Colors

```css
--color-accent: #f25c54 /* Ember */ --color-accent-secondary: #06aed5 /* Sky */
  --color-accent-foreground: #ffffff /* White */;
```

### Background Colors

```css
--color-background: #ffffff /* White */ --color-background-secondary: #f8f9fa
  /* Light gray */ --color-background-dark: #2f2f3a /* Deep Slate */;
```

### Text Colors

```css
--color-foreground: #2f2f3a /* Deep Slate */
  --color-foreground-secondary: #6b7280 /* Medium gray */
  --color-foreground-muted: #9ca3af /* Light gray */;
```

### Border Colors

```css
--color-border: #e5e7eb /* Light border */ --color-border-secondary: #d1d5db
  /* Medium border */;
```

### Status Colors

```css
--color-success: #10b981 /* Green */ --color-success-background: #d1fae5
  /* Light green */ --color-success-foreground: #065f46 /* Dark green */
  --color-warning: #f59e0b /* Orange */ --color-warning-background: #fef3c7
  /* Light orange */ --color-warning-foreground: #92400e /* Dark orange */
  --color-error: #ef4444 /* Red */ --color-error-background: #fee2e2
  /* Light red */ --color-error-foreground: #991b1b /* Dark red */;
```

## Tailwind CSS Classes

### Brand Colors

```css
.auren-gold     /* #FFD166 */
.auren-slate    /* #2F2F3A */
.auren-ember    /* #F25C54 */
.auren-sky      /* #06AED5 */
```

### Semantic Classes

```css
.bg-primary              /* Primary background */
.text-primary-foreground  /* Primary text */
.bg-secondary            /* Secondary background */
.text-secondary-foreground /* Secondary text */
.bg-accent               /* Accent background */
.text-accent-foreground   /* Accent text */
```

### Component Classes

#### Buttons

```css
.btn-primary     /* Primary button with Auren Gold background */
.btn-secondary   /* Secondary button with Deep Slate background */
.btn-accent      /* Accent button with Ember background */
.btn-outline     /* Outline button with border */
```

#### Cards

```css
.card           /* Card container with shadow and border */
```

#### Inputs

```css
.input          /* Form input with focus states */
```

#### Status Indicators

```css
.status-active    /* Active status (green) */
.status-inactive  /* Inactive status (gray) */
.status-warning   /* Warning status (orange) */
.status-error     /* Error status (red) */
```

## Usage Guidelines

### Primary Actions

Use `btn-primary` for main call-to-action buttons (New Project, Create Record, etc.)

### Secondary Actions

Use `btn-secondary` for secondary actions or `btn-outline` for less prominent actions

### Accent Elements

Use `text-accent` for links and `bg-accent` for important highlights

### Status Indicators

- `status-active` for active/success states
- `status-inactive` for inactive/neutral states
- `status-warning` for pending/deploying states
- `status-error` for failed/error states

### Typography

- Use `text-foreground` for primary text
- Use `text-foreground-secondary` for secondary text
- Use `text-foreground-muted` for disabled or less important text

### Layout

- Use `bg-background` for main content areas
- Use `bg-background-secondary` for subtle background variations
- Use `bg-background-dark` for dark sections or overlays

## Shadows

```css
.shadow-auren     /* Standard shadow with Deep Slate tint */
.shadow-auren-lg  /* Large shadow with Deep Slate tint */
```

## Font Family

The application uses Inter as the primary font family:

```css
font-family: 'Inter', system-ui, sans-serif;
```

## Accessibility Considerations

- All color combinations meet WCAG AA contrast requirements
- Interactive elements have clear hover and focus states
- Status indicators use both color and text to convey meaning
- The color palette provides sufficient contrast for text readability

## Implementation Notes

- All colors are defined in both CSS custom properties and Tailwind configuration
- Component classes are available for consistent styling
- The design system supports both light and dark themes (dark theme colors are defined but not yet implemented)
- All interactive elements include transition effects for smooth user experience
