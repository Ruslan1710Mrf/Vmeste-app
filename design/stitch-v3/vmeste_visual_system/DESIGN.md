---
name: Vmeste Visual System
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-money:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1200px
---

## Brand & Style
The design system for this application is built upon a **Corporate Modern** aesthetic with a heavy emphasis on high-performance data density and technical reliability. It utilizes a deep, immersive dark-mode environment to reduce eye strain and establish a premium, focused atmosphere for users managing finances or social connections.

The design movement draws from **Minimalism** and **Glassmorphism**, using subtle light-source effects and crisp geometry to create a sense of organized complexity. The interface should feel authoritative yet accessible, using light-weight outlines and high-contrast typography to ensure clarity against the dark canvases.

## Colors
The palette is rooted in a "Deep Space" hierarchy. The primary background is a rich navy-black, providing a stable foundation for elevated layers.

- **Primary Blue (#3B82F6):** Used for all interactive focal points, progress indicators, and primary branding elements. It replaces all legacy teal accents.
- **Success Green (#10B981):** Reserved strictly for semantic indicators of growth, positive monetary transactions, and completed states.
- **Surface Tiers:** Containers use a lighter slate to create separation from the background. 
- **Typography:** The primary text is a crisp off-white for maximum legibility, while secondary text uses a muted slate-gray to maintain hierarchy.

## Typography
This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. The typeface is optimized for screen readability and provides a technical, professional feel.

Hierarchy is established through weight and color rather than excessive size shifts. Large headings should use a tighter letter-spacing for a more modern, "locked-in" appearance. For financial data and balance displays, use tabular figures to ensure numbers align vertically in lists and tables.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

- **Rhythm:** An 8px base grid governs all spatial relationships. 
- **Padding:** Containers and cards should utilize "lg" (24px) internal padding to maintain an airy, premium feel despite the dark palette.
- **Responsiveness:** On mobile devices, side margins shrink to 16px. Elements like buttons and inputs remain at full width to maximize hit areas.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and subtle **Ambient Shadows**. In this dark environment, shadows are rendered with a very high blur and low opacity to avoid "dirty" edges.

- **Level 0 (Background):** #0F172A.
- **Level 1 (Cards/Panels):** #1E293B.
- **Level 2 (Modals/Popovers):** #334155 with a soft 15% black shadow and a subtle 1px border of #475569 to define the edge against the dark background.
- **Glass Effects:** Use backdrop-blur (12px) on navigation bars and floating headers to provide context of the content beneath them.

## Shapes
The design system employs a **Pill-shaped** (Full Rounded) philosophy for high-frequency interactive elements. This softens the technical nature of the navy palette, making the app feel more approachable and modern.

- **Primary Actions:** Buttons and Chips must use "rounded-full" (pill) shapes.
- **Structural Elements:** Cards and input fields use a slightly more restrained "rounded-xl" (1.5rem) to maintain structural integrity while remaining cohesive with the button style.

## Components
- **Buttons:** Primary buttons are filled with #3B82F6 with white text. Secondary buttons use a ghost style with a #3B82F6 border. All buttons use pill-shaped corners.
- **Chips/Tags:** Used for categories. These should have a subtle background tint of the primary color (e.g., #3B82F6 at 15% opacity) with the solid primary color for the text.
- **Cards:** Background is #1E293B. Borders should be avoided unless the card is being hovered, in which case a 1px border of #3B82F6 is applied.
- **Input Fields:** Background is #0F172A (inset from the card) with a 1px #334155 border. On focus, the border transitions to #3B82F6.
- **Financial Indicators:** Any text representing positive balance or successful payment must be rendered in #10B981. Negative or alert states should use a standard System Red.
- **Lists:** Use subtle #1E293B dividers between items. Icons within lists should use the Primary Blue to draw the eye.