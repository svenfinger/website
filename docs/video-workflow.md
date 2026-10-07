# Video workflow

Export full-resolution masters at High quality, 60 fps, and Low motion blur.
Keep those originals; the script generates delivery files directly from them.
FFmpeg (`ffmpeg` and `ffprobe`) and the existing Wrangler login are required.

Keep a folder of masters named to match the videos on the page:

```text
video-masters/flip-absences/
  cover.mp4
  detail.mp4
```

Run one command from the project root:

```sh
pnpm video:sync flip-absences
```

The command processes every MP4, MOV, or WebM master in that folder. For each
changed video it generates three silent H.264 MP4s, uploads them to the existing
`website` R2 bucket, and updates the case study's URLs and responsive sources.
Inline video dimensions are also updated. Unchanged videos are skipped.

Filenames include an automatic hash of the master and encoding settings. To
replace a video, replace its master under the same name and run the same command
again. There is no manual version counter or URL editing. Old files remain
available for visitors viewing older versions of the page.

Case study references are updated only after every upload succeeds. A failed run
can be retried with the same command; completed encodes are reused. The command
updates local content and uploads assets, but does not deploy the website.
Review the page, then publish through the usual site workflow.

Both `video-masters/` and `video-output/` are ignored by Git. Masters can also live
outside the repository; pass their folder as the second argument:

```sh
pnpm video:sync flip-absences "/path/to/exports/flip-absences"
```

For a new video, author its component once with a source matching the master's
filename. For example, add `walkthrough.mp4` to the folder and this component to
`src/content/work/flip-absences.mdx`:

```mdx
<WorkMedia
  type="video"
  src="walkthrough.mp4"
  poster="/images/work/flip-absences/walkthrough-poster.jpg"
  alt="Mobile steps for requesting time off"
/>
```

Run `pnpm video:sync flip-absences` to replace that source with CDN URLs and add
`videoSources`, width, and height automatically. All later video updates require
only replacing the master and rerunning the command. Posters, descriptions, and
layout remain authored in the case study. Use the standard `WorkCover` and
`WorkMedia` import names, literal string sources, inline `videoSources` objects,
and numeric dimensions so the script can update those attributes safely.

Header videos use maximum widths of 1120, 1680, and 2240 pixels; inline videos use
1280, 1920, and 2560. Small and medium files use up to 30 fps, large files up to
60 fps. Aspect ratio is preserved without upscaling or adding frames. Encoding
uses CRF 20, the slow preset, and fast start. `pnpm video:encode --help` remains
available for generating standalone variants with custom widths.

Videos select one file when first loaded: small below 48rem, medium from 48rem,
and large from 90rem viewport width. A phone in landscape normally remains on a
30 fps variant. Selection does not multiply resolution by device pixel ratio or
restart playback when the viewport changes. Reload to test a different breakpoint.
Posters remain visible when reduced motion is requested; inline videos retain
their existing lazy loading and pause behavior.
