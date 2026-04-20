import React, { useRef, useState, useEffect } from "react";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [pathLen, setPathLen] = useState(0);

  const SIZE = 500;
  const STROKE = 56;
  const R = 72;
  const PAD = STROKE / 2;
  const INNER = SIZE - STROKE;

  const pathData = `
    M ${PAD + R},${PAD}
    H ${PAD + INNER - R}
    A ${R},${R} 0 0 1 ${PAD + INNER},${PAD + R}
    V ${PAD + INNER - R}
    A ${R},${R} 0 0 1 ${PAD + INNER - R},${PAD + INNER}
    H ${PAD + R}
    A ${R},${R} 0 0 1 ${PAD},${PAD + INNER - R}
    V ${PAD + R}
    A ${R},${R} 0 0 1 ${PAD + R},${PAD}
  `;

  useEffect(() => {
    if (!pathRef.current) return;
    try {
      setPathLen(pathRef.current.getTotalLength());
    } catch {
      setPathLen(0);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      setProgress((video.currentTime / d) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
      setProgress(0);
    };

    const handlers: Record<string, EventListener> = {
      timeupdate: updateProgress,
      loadedmetadata: updateProgress,
      ended: handleEnded,
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
    };

    Object.entries(handlers).forEach(([event, handler]) =>
      video.addEventListener(event, handler)
    );
    return () => {
      Object.entries(handlers).forEach(([event, handler]) =>
        video.removeEventListener(event, handler)
      );
    };
  }, []);

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {}
    } else {
      video.pause();
    }
  };

  // Calculate progress along the rounded rectangle path
  const calculateProgressFromCursor = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pathRef.current) return 0;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const path = pathRef.current;
    const totalLen = path.getTotalLength();

    // Sample points along the path to find the closest point to the cursor
    const samples = 200; // increase for more accuracy
    let closestDist = Infinity;
    let closestLen = 0;

    for (let i = 0; i <= samples; i++) {
      const len = (i / samples) * totalLen;
      const pt = path.getPointAtLength(len);
      const dx = pt.x - x;
      const dy = pt.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closestLen = len;
      }
    }

    return (closestLen / totalLen) * 100; // progress %
  };

  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoverProgress(calculateProgressFromCursor(e));
  };

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
      return;

    const pct = calculateProgressFromCursor(e);
    video.currentTime = (pct / 100) * video.duration;
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const duration = videoRef.current?.duration ?? 0;
  const currentTime = (progress / 100) * duration;
  const hoverTime =
    hoverProgress !== null ? (hoverProgress / 100) * duration : null;

  const renderHoverIndicator = () => {
    if (hoverProgress === null || !pathRef.current || pathLen === 0)
      return null;
    const pt = pathRef.current.getPointAtLength(
      (hoverProgress / 100) * pathLen
    );
    return (
      <circle
        cx={pt.x}
        cy={pt.y}
        r={8}
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth={3}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="relative w-[min(92vw,540px)] aspect-square">
        {/* Background path and progress */}
        <div
          className="absolute inset-4 cursor-pointer rounded-[78px]"
          onClick={handleSeekBarClick}
          onMouseMove={handleSeekBarHover}
          onMouseLeave={() => setHoverProgress(null)}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            <defs>
              <linearGradient
                id="progressStroke"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={pathData}
              fill="none"
              stroke="rgba(15,23,42,0.14)"
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
            <path
              ref={pathRef}
              d={pathData}
              fill="none"
              stroke="url(#progressStroke)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray={`${progress} ${100 - progress}`}
              filter="url(#softGlow)"
            />
            {renderHoverIndicator()}
          </svg>

          {hoverTime !== null && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/85 ring-1 ring-slate-200/50 text-white text-xs tracking-wide">
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Video */}
        <div className="absolute inset-[72px] rounded-[44px] overflow-hidden bg-black ring-1 ring-slate-300/80 shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src="/demo.mp4"
            playsInline
            controls={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

          {/* Play/Pause */}
          <button
            type="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="absolute inset-0 flex items-center justify-center group"
            onClick={togglePlayPause}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isPlaying
                  ? "bg-white/80 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                  : "bg-white/95 scale-100"
              }`}
            >
              {!isPlaying ? (
                <div className="w-0 h-0 border-t-[13px] border-t-transparent border-l-[22px] border-l-black border-b-[13px] border-b-transparent ml-1" />
              ) : (
                <div className="flex gap-2">
                  <div className="w-2 h-8 bg-black rounded-sm" />
                  <div className="w-2 h-8 bg-black rounded-sm" />
                </div>
              )}
            </div>
          </button>

          {/* Time */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 px-2">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : "00:00"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
