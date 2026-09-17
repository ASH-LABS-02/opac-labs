# Banner recreation design QA

final result: passed

Source visual truth: C:/Users/AR/AppData/Local/Temp/codex-clipboard-16075e59-37f1-489b-a04a-999e7b37c91e.png
Implementation: http://localhost:3000/#start-project
Screenshot: C:/Users/AR/Documents/Codex/2026-09-13/ps-c-users-ar-downloads-opac/outputs/banner-recreated.png
Combined comparison: C:/Users/AR/Documents/Codex/2026-09-13/ps-c-users-ar-downloads-opac/work/banner-comparison.png
Mobile evidence: C:/Users/AR/Documents/Codex/2026-09-13/ps-c-users-ar-downloads-opac/work/banner-mobile.png

## Comparison method
Desktop CSS viewport 1440x900; browser capture 1425x891. Source 680x117, banner region extracted at x5 y19, 674x91. The implementation region was cropped from a full viewport screenshot using measured DOM bounds and independent x/y density factors, then normalized to 674x91. Source and implementation were inspected together in a single 674x198 comparison image. The whole subject is one focused banner; no other region crops are necessary. Mobile checked at 390x844, with no horizontal overflow.

## Findings and iteration history
- Initial P2: heading too narrow; matched its proportions using Anton and adjusted horizontal scale. Final comparison shows matching two-line silhouette and readable native text.
- Initial P2: primary action too tall and offset; adjusted grid to 45/26/29 percent and button line height. Recapture confirms compact alignment close to the supplied reference.
- Initial P2: floating assistant overlapped the artwork; IntersectionObserver hides the redundant shortcut while this banner is visible. Final desktop and mobile captures show unobstructed art.
- No remaining actionable P0/P1/P2 differences.

## Required fidelity surfaces
- Typography: condensed Anton display face with matching two-line text; native sans-serif action labels. Minor font-rendering differences from generated reference are P3.
- Spacing/layout: compact horizontal desktop strip, left heading, centered actions, diagonally clipped right illustration. Mobile intentionally stacks to preserve text and artwork legibility.
- Colors/tokens: pale blue paper, ink text, dark rules, black button. Reference paper grain is subtler in implementation, P3.
- Image quality: dedicated 840x400 WebP, 55,552 bytes, lazy-loaded through Next Image. Regenerated artwork retains smiling short-haired character, hoodie, speed lines, and cream speech bubble. Fine linework differs from source, P3.
- Copy/content: headline and both link labels match exactly; speech bubble preserves IDEAS TODAY A BRIGHTER TOMORROW !.

## Verification
Production build passed with the existing WorldMap image lint warning. Both banner links opened their existing destinations: /build-project and /request-project. Keyboard activation verified. Production console error log empty. No external forms submitted. Screenshot at an anchor can produce a development-only LCP priority suggestion; lazy loading is intentional because the banner is below the fold during normal homepage entry.

## Implementation checklist
- [x] Responsive native headline and working links
- [x] Optimized manga asset and angled divider
- [x] Desktop and mobile visual inspection
- [x] Final combined source/implementation comparison
- [x] Production build and navigation checks
