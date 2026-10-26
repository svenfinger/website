# Video workflow

Export full-resolution masters at High quality, 60 fps, and Low motion blur.
Keep those originals; the script generates delivery files directly from them.
FFmpeg (`ffmpeg` and `ffprobe`) and the existing Wrangler login are required.

Keep a folder of masters named to match the videos on the page:

```text
video-masters/flip-livestream/
  post.mov
  details.mov
  studio.mov
```

Run one command from the project root:

```sh
pnpm video:sync flip-livestream
```

The command processes every MP4, MOV, or WebM master in that folder. For each
changed video it generates three silent H.264 MP4s, uploads them to the existing
`website` R2 bucket, and updates the work entry's URLs and responsive sources.
Inline video dimensions are also updated. Unchanged videos are skipped.

Filenames include an automatic hash of the master and encoding settings. To
replace a video, replace its master under the same name and run the same command
again. There is no manual version counter or URL editing. Old files remain
available for visitors viewing older versions of the page.

Work entry references are updated only after every upload succeeds. A failed run
can be retried with the same command; completed encodes are reused. The command
updates local content and uploads assets, but does not deploy the website.
Review the page, then publish through the usual site workflow.

Both `video-masters/` and `video-output/` are ignored by Git. Masters can also live
outside the repository; pass their folder as the second argument:

```sh
pnpm video:sync flip-livestream "/path/to/exports/flip-livestream"
```

For a new video, author its component once with a source matching the master's
filename. For example, add `walkthrough.mp4` to the folder and this component to
`src/content/work/flip-livestream.mdx`:

```mdx
<WorkMedia
  type="video"
  src="walkthrough.mp4"
  poster="/images/work/flip-livestream/walkthrough-poster.jpg"
  alt="A walkthrough of the Livestream studio"
/>
```

Run `pnpm video:sync flip-livestream` to replace that source with CDN URLs and add
`videoSources`, width, and height automatically. All later video updates require
only replacing the master and rerunning the command. Posters, descriptions, and
layout remain authored in the work entry. Use the standard `WorkMedia` import name, literal string sources, inline
`videoSources` objects,
and numeric dimensions so the script can update those attributes safely.

Videos use maximum widths of 1280, 1920, and 2560 pixels. Small and medium files
use up to 30 fps, large files up to
60 fps. Aspect ratio is preserved without upscaling or adding frames. Encoding
uses CRF 20, the slow preset, and fast start. `pnpm video:encode --help` remains
available for generating standalone variants with custom widths.

Videos select one file when first loaded: small below 48rem, medium from 48rem,
and large from 90rem viewport width. A phone in landscape normally remains on a
30 fps variant. Selection does not multiply resolution by device pixel ratio or
restart playback when the viewport changes. Reload to test a different breakpoint.
Posters remain visible when reduced motion is requested. Videos load lazily,
play and loop while visible, and pause when offscreen or the tab is hidden.

## Local drafts

Homepage entries still live in `src/content/work/` and render directly on the
home page. Each entry has a `title`, `year`, and `order` in its frontmatter.
`WorkMedia` supports `aspectRatio="16 / 9"`, `"1 / 1"`, and `"2 / 3"` for both
images and videos. Omit the prop to preserve the media's natural ratio.

Before final media is ready, put a delivery copy in
`public/videos/work/<project-slug>/` and use its public path:

```mdx
<WorkMedia
  type="video"
  src="/videos/work/flip-livestream/post.mp4"
  videoSources={{
    medium: "/videos/work/flip-livestream/post-medium.mp4",
    large: "/videos/work/flip-livestream/post-large.mp4",
  }}
  poster="/images/work/flip-livestream/post-poster.jpg"
  alt="A Flip Livestream post with a live broadcast preview"
  width={1600}
  height={1600}
  aspectRatio="1 / 1"
/>
```

Keep the full-quality master in `video-masters/<project-slug>/post.mov`.
When ready, the same `pnpm video:sync <project-slug>` command recognizes the local
path, uploads the responsive variants, and replaces every matching reference in
the entry. The authored aspect ratio and poster remain unchanged. The command
performs real uploads; local preview and build do not run it automatically.

The current homepage uses responsive R2 encodes of `post.mov` and
`details.mov` in square frames, followed by `studio.mov` in a 16:9 frame.
Their posters are the first decoded frame of each master. For example:

```sh
ffmpeg -i video-masters/flip-livestream/post.mov -map 0:v:0 \
  -frames:v 1 -q:v 2 -update 1 public/images/work/flip-livestream/post-poster.jpg
```

After syncing and verifying the R2 URLs, remove the corresponding local delivery
copies from `public/videos/`. Keep masters and encoded outputs in their ignored
folders. Old R2 objects remain available for previously published pages; syncing
does not delete them.
