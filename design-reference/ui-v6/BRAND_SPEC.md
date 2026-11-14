# Fact Flight — brand asset handoff (v1 draft)

**Source of truth:** `FactFlight_BrandKit_v2.png`, selected by the family in the design discussion, 14 November 2026. The original is a **composite AI-generated raster presentation**, not layered designer artwork. It contains no metadata identifying a wordmark font family or any editable font assets.

**Approval status:** The design direction is selected. Assets below are **source-derived crops or automatic contour traces** intended for inspection, **not original designer exports or officially approved vector master files**. Review at 16, 32, 48, 192 and 512 px before shipping. Images generated in this packet have not changed the Fact Flight application or repo.

## Inventory

- `horizontal_source_derived.png`: transparent crop of approved horizontal logo, with pixel-based background removal.
- `mark_source_derived.png`: transparent source-derived two-flashcard + airplane symbol.
- `stacked_source_derived.png`: transparent source-derived stacked version.
- `app_icon_source_derived.png`: rounded-square app icon clipped from original sheet, with transparency outside the square.
- `horizontal_*_source_traced.svg`, `mark_*_source_traced.svg`, `stacked_*_source_traced.svg`: **automatic source contour traces** in `color`, `dark`, `mono`, `mono_inverse` styles. Text is outlined as shapes, not editable text. These are approximations to the pixels, not new invented marks. Review before deploying.
- `*_source_traced.png`: raster render at 2× from traced SVG, useful for comparison.
- `icon_32`, `icon_48`, `icon_96`, `icon_180`, `icon_192`, `icon_512` PNGs: resized from original concept icon. 512px is upscaled because source icon is only ~270px wide.
- `icon_maskable_512_candidate.png`: prepared maskable PWA candidate with safe margins; review before production.
- `favicon.ico`: multi-resolution favicons derived from the selected icon.
- `asset_review.html`: offline visual review page for light/dark/monochrome.
- `palette.json`: palette and calculated contrast examples.
- `brand_tokens.css`: proposed app-wide CSS custom properties without remote font loads.
- `typography_status.json`: explicit unknown original font status and unapproved implementation candidates.
- `INTEGRATION_NOTES.md`: handoff checklist and usage warnings.

## Color specification (derived from text on the selected brand board)

| Role | Hex | Recommended use |
|---|---|---|
| Golden yellow | `#FBBF24` | Primary buttons, logo, active state accents |
| Soft amber | `#FCD873` | Secondary surfaces, cards, illustration accents |
| Near black | `#0B0B0F` | Main body text, outlines and icons |
| Off-white | `#FFF9E6` | Light app background and card surfaces |
| Sky blue | `#7DD3E9` | Noncritical secondary accents, illustrative flight/growth |
| Dark background (proposed, **not from board**) | `#19191D` | Dark theme canvas for preview only |

### WCAG contrast notes

- Near-black on golden yellow: **11.77:1**.
- Near-black on soft amber: **14.23:1**.
- Near-black on off-white: **18.66:1**.
- Golden yellow on off-white: **1.59:1** — **do not use for small body text**.
- Sky blue on off-white: **1.61:1** — **do not use for body text or status without a dark outline and labels**.
- Off-white on proposed dark background: **16.65:1**.
- Golden yellow on proposed dark background: **10.5:1**.

For red-green colorblind learners, the base palette avoids red/green dependence. Still test interface controls with a deuteranopia/protanopia simulator, and always pair correctness feedback with symbols and text (e.g., checkmark + “Correct”, cross + “Try again”). Aim for >=4.5:1 regular text and >=3:1 essential control boundaries. Color selection alone is not certification of accessibility.

## Typography specification — status and implementation proposal

**Source fact:** The brand board depicts a heavy, rounded display wordmark, but does **not name the exact font, supply editable text, supply source vectors, or include font files**. The logo wordmark must not be described as "Fredoka", "Nunito", or any other exact family based on resemblance alone.

**Current safe method:** Use source-traced **outlined artwork** for the logo (after visual acceptance). This does not require a runtime font. Avoid setting the wordmark as ordinary HTML text until the family is chosen.

**Future candidate typography (NOT approved original):**
- Candidate display/UI heading: `Fredoka` (rounded, friendly) — exploratory only, **not identified as the source font**.
- Candidate general UI text and math labels: `Nunito Sans` (clear, rounded) — exploratory only, **not identified as the source font**.
- Privacy-first default until font approval: `system-ui, -apple-system, "Segoe UI", sans-serif` with no remote font requests.

Do not embed remote Google Fonts automatically. If the team selects a font later, verify the license and choose either an appropriately licensed self-hosted build or OS-local fallback. **No font files are included in this package.**

## Suggested app integration (only after approval)

- Website header: `horizontal_color_source_traced.svg` on cream / light surfaces.
- Dark header: `horizontal_dark_source_traced.svg`, but visually confirm outline/contrast first.
- Small menu/nav: `mark_color_source_traced.svg`.
- App icons: source-derived icon exports; replace the upscaled 512px with a native vector artboard master as a final polish step.
- Favicon: `icon_48_source_derived.png` or `icon_32_source_derived.png`, inspect for clarity and consider a simplified custom version when approved.
- Preserve `main` and `v6-development` runtime behavior until UI/UX implementation approval. Do not change v5 storage keys or voice recognition.

## Remaining gap (cannot infer from raster)

1. No original approved layered vector design exists in this handoff; the SVGs are auto-traces of a composite image.
2. Exact typeface family, weight, tracking, licensing and font file are **unknown**. A future font decision is required for non-logo text.
3. Review the extracted/auto-traced files to confirm they preserve visual intent, especially dark-mode and small-size variants.
