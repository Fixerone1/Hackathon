# Beacon design foundation

Beacon's brand promise is **Light your way forward.** Keep the experience useful on mobile and low-data connections; preserve the existing routes, user data, and 70 / 15 / 15 Economic Mobility Score.

## Design tokens

`src/app/globals.css` is the source of truth for the CSS variables. Tailwind aliases in `tailwind.config.ts` reference these tokens so components can use semantic utility classes instead of raw colour values.

| Token | Value | Meaning |
| --- | --- | --- |
| `--beacon-yellow` | `#FFC400` | Primary action and highlights |
| `--beacon-yellow-600` | `#E6B000` | Hover and pressed action |
| `--beacon-yellow-100` | `#FFF4CC` | Soft callout background |
| `--ink` | `#0A0A0A` | Primary text and dark surfaces |
| `--deep-blue` | `#0B2A5B` | Links, information, and Money pillar |
| `--blue-100` | `#E6EEFB` | Information background |
| `--white` | `#FFFFFF` | Card and content surface |
| `--gray-50` | `#F8FAFC` | App background |
| `--gray-100` | `#F1F5F9` | Muted surface |
| `--gray-200` | `#E2E8F0` | Borders and dividers |
| `--gray-500` | `#64748B` | Secondary text |
| `--gray-700` | `#334155` | Body text |
| `--gray-900` | `#0F172A` | Strong neutral text |
| `--success` / `--success-bg` | `#12B76A` / `#E7F8EF` | Success and Growth |
| `--warning` / `--warning-bg` | `#F79009` / `#FEF0DB` | Deadlines and warnings |
| `--error` / `--error-bg` | `#D92D20` / `#FDECEA` | Errors |

Yellow is a fill, never small text on white. Put ink text on yellow. Pair pillar colours with an icon and label; do not rely on colour alone.
Use the companion `--success-text`, `--warning-text`, and `--error-text` tokens for normal-size status text rather than the brighter status colours.

## Typography and shape

- Self-host Poppins 600/700 for headings and Inter 400/500 for body text. Their Latin font files are loaded from Fontsource with `font-display: swap`.
- Use sentence case and tabular figures for scores and amounts.
- Cards use a 12px radius and subtle card shadow. Inputs and buttons use an 8px radius; chips are pills.
- Keep touch targets at least 44px, visible focus indicators, and reduced-motion support.
- `src/components/BrandLogo.tsx` owns the temporary lowercase Beacon wordmark. `public/logo/` holds the replaceable brand asset.

## Contrast checks

Ratios calculated from the listed sRGB colours using the WCAG relative-luminance formula. Text pairs below meet WCAG AA 4.5:1 for normal text. Yellow itself is reserved for fills and non-text emphasis.

| Foreground | Background | Ratio | Use |
| --- | --- | ---: | --- |
| `#0A0A0A` | `#FFC400` | 12.40:1 | Primary button text |
| `#0A0A0A` | `#FFF4CC` | 17.97:1 | Soft yellow callout text |
| `#0B2A5B` | `#FFFFFF` | 14.03:1 | Links and information |
| `#334155` | `#FFFFFF` | 10.35:1 | Body text |
| `#64748B` | `#FFFFFF` | 4.76:1 | Secondary text |
| `#FFFFFF` | `#0A0A0A` | 19.80:1 | Dark surface text |
| `#0B2A5B` | `#E6EEFB` | 12.02:1 | Information callout |
| `#027A48` | `#E7F8EF` | 4.92:1 | Success text |
| `#B54708` | `#FEF0DB` | 4.83:1 | Warning text |
| `#B42318` | `#FDECEA` | 5.75:1 | Error text |

## Component and rollout rules

- Primary actions use yellow with ink text; secondary actions use a dark outline; tertiary actions use underlined deep-blue text.
- Keep one primary action per section. Cards have a clear heading, content, and action.
- Use semantic status labels alongside colour. Keep loading, empty, error, hover, focus, disabled, and active states visible.
- Reuse the existing feature components and routes. Do not change learner data models or score weighting as part of visual updates.
- This foundation is being rolled out in phases. Navigation, page layouts, responsive screenshots, cross-browser checks, and Lighthouse targets remain to be reviewed before release.
