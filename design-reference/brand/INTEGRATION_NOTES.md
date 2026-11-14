# Fact Flight brand assets — UI/UX handoff

**Use the source-derived icon crop and traced SVG outlines as review candidates, not as proof that original vector source exists.**

1. Compare all candidates against `REFERENCE_selected_brand_sheet.png` and `ASSET_QA_Preview.png`.
2. Open `asset_review.html` locally to compare color, monochrome, and dark variants.
3. Use `horizontal_color_source_traced.svg` as the **candidate** light header asset. Use `horizontal_dark_source_traced.svg` for dark-theme header after review.
4. Use `mark_color_source_traced.svg` for the icon-only logo *after* checking its small-size legibility. Use the source-derived 32px/48px icons for favicon tests.
5. The PWA icon files `icon_192_source_derived.png` and `icon_512_source_derived.png` are actual reference resamples; 512px is an upscale. `icon_maskable_512_candidate.png` is a proposed maskable composition, not a source export.
6. Consume `brand_tokens.css` and `palette.json` as **proposed** CSS tokens. No page or app source code was modified.
7. The exact logo typeface is unknown. Wordmark SVG letters are outlines. The UI text candidates in `BRAND_SPEC.md` are suggestions, **not** evidence of the original font. Do not assume an exact match or fetch external fonts silently.
8. Before using in a v6-development build, check visual results at native 32px, 48px, 192px and 512px and verify contrast & colorblind accessibility with actual controls.

No changes to `main`, `v6-development`, speech recognition, or quiz history were made in this work.
