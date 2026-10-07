export type WorkVideoSources = {
  medium: string;
  large: string;
};

export function getWorkVideoSource(video: HTMLVideoElement) {
  if (window.matchMedia("(min-width: 90rem)").matches) {
    return video.dataset.srcLarge ?? video.dataset.src;
  }
  if (window.matchMedia("(min-width: 48rem)").matches) {
    return video.dataset.srcMedium ?? video.dataset.src;
  }
  return video.dataset.src;
}
