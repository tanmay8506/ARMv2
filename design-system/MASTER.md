## Design System: LUXURY BRIDAL MEHENDI STUDIO, APPOINTMENT BOOKING, INDIA

### Pattern
- **Name:** Storytelling-Driven + Hero-Centric
- **CTA Placement:** Above fold
- **Sections:** Hero > Features > CTA

### Style
- **Name:** Motion-Driven
- **Mode Support:** Light Γ£ô Full | Dark Γ£ô Full
- **Keywords:** Animation-heavy, microinteractions, smooth transitions, scroll effects, parallax, entrance anim, page transitions
- **Best For:** Portfolio sites, storytelling platforms, interactive experiences, entertainment apps, creative, SaaS
- **Performance:** ΓÜá Good | **Accessibility:** ΓÜá Prefers-reduced-motion

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0284C7` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#0EA5E9` | `--color-secondary` |
| Accent/CTA | `#059669` | `--color-accent` |
| Background | `#F0F9FF` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#EFF7FB` | `--color-muted` |
| Border | `#E0F0F8` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0284C7` | `--color-ring` |

*Notes: Calendar blue + available green*

### Typography
- **Heading:** Great Vibes
- **Body:** Cormorant Infant
- **Mood:** wedding, romance, elegant, script, invitation, feminine
- **Best For:** Wedding sites, invitations, romantic brands, bridal
- **Google Fonts:** https://fonts.google.com/share?selection.family=Cormorant+Infant:wght@300;400;500;600;700|Great+Vibes
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:wght@300;400;500;600;700&family=Great+Vibes&display=swap');
```

### Key Effects
Scroll anim (Intersection Observer), hover (300-400ms), entrance, parallax (3-5 layers), page transitions

### Avoid (Anti-patterns)
- Heavy text
- Poor image showcase

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

