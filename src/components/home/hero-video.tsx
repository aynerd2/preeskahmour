'use client';

import * as React from 'react';
import { Pause, Play } from 'lucide-react';

type Source = { src: string; type: string };

/**
 * The hero film.
 *
 * Rendered with `preload="none"` and no `autoplay` attribute, so nothing
 * beyond the poster frame is fetched until the client decides playback is
 * appropriate. It then starts only if the visitor has not asked for reduced
 * motion and is not on a data-saving connection — a looping 2–3 MB film is a
 * real cost on a Nigerian mobile plan, and the poster alone still shows her.
 *
 * WCAG 2.2.2 requires a way to pause moving content that runs longer than
 * five seconds, hence the control in the corner.
 */
export function HeroVideo({
  sources,
  poster,
  label,
}: {
  sources: Source[];
  poster: string;
  label: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const saveData = connection?.saveData === true;

    // The play button stays available either way — this only decides whether
    // playback starts on its own.
    if (reducedMotion || saveData) return;

    video.preload = 'auto';
    // Muted inline playback is permitted without a gesture in every current
    // browser; if one still refuses, the poster simply stays up.
    video.play().catch(() => undefined);
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;

    if (video.paused) {
      video.preload = 'auto';
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        // State follows the element's real events, not our own calls: the
        // browser pauses video by itself (background tabs, power saving), and
        // the control must never offer "pause" for a film that is not moving.
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {sources.map((source) => (
          <source key={source.type} src={source.src} type={source.type} />
        ))}
      </video>

      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center bg-ink/55 text-ivory backdrop-blur-sm transition-colors hover:bg-ink/80"
        aria-label={playing ? 'Pause the film' : 'Play the film'}
        aria-pressed={playing}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </>
  );
}
