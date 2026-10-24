# Stervox mountain artwork

Generated on 24 October 2026 with the built-in image generation tool. The tool does not expose a selectable “GPT Images 2.5” model name. The returned native image is **2172 × 724**; it is not represented as a native 8K image and was not artificially upscaled.

The original is preserved at `output/imagegen/stervox-mountain-source.png`. Production derivatives are under `frontend/public/assets/projects/stervox/mountains/`:

| Width | AVIF (quality 88) | WebP (quality 90) |
| --- | --- | --- |
| 960 | 33.6 KiB | 27.7 KiB |
| 1600 | 77.7 KiB | 64.3 KiB |
| 2172 | 119.7 KiB | 102.8 KiB |

Exports preserve the composition and colour; smaller variants use Lanczos downsampling. The footer uses lazy loading and a viewport-appropriate high-resolution source, with masks that blend the same image behind the closing content and footer. No image animation or parallax runs on scroll. The full-resolution source remains available independently of the production encodings.

## Final generation prompt

Use case: photorealistic-natural. Asset type: ultra-wide premium website footer background photograph for STERVOX, a financial systems architecture project. Primary request: a magnificent remote mountain range at blue hour, very dark deep navy and near-black slate rock ridges, subtle soft gold dawn rim light along distant summits, delicate mist in the valleys, realistic geological detail and atmospheric depth. Composition: panoramic landscape, highest available native resolution and maximum photographic detail, 8K-quality art direction, mountains concentrated in lower two thirds, generous almost-black empty sky above for seamless fade behind website text; quiet restrained luxury, realistic and elegant. Color palette must blend into #07090d and #10141c, tiny warm #d6a84f highlights only. Mountains should be discernible and beautiful without being bright; natural photographic textures, no exaggerated CGI. No people, buildings, text, lettering, logos, watermarks, borders, stars, gradients rendered as visible bands, or neon. Deliver a single wide landscape image, as high resolution as the tool supports. Designed to feather into a deep navy website at both its top and bottom.
