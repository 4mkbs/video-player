import type React from "react";
import { useRef, useState, useEffect } from "react";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d === 0) return;
      setProgress(Math.max(0, Math.min(100, (video.currentTime / d) * 100)));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
      setProgress(0);
    };

    const handlers = {
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

  useEffect(() => {
    if (pathRef.current) {
      try {
        setPathLen(pathRef.current.getTotalLength());
      } catch {
        setPathLen(0);
      }
    }
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.ended) video.currentTime = 0;
    video.paused ? void video.play() : video.pause();
  };

  const calculateProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = rect;
    const threshold = 40;

    const edges = [
      { condition: y < threshold, calc: (x / width) * 25 },
      { condition: x > width - threshold, calc: 25 + (y / height) * 25 },
      { condition: y > height - threshold, calc: 50 + ((width - x) / width) * 25 },
      { condition: x < threshold, calc: 75 + ((height - y) / height) * 25 },
    ];

    const edge = edges.find((e) => e.condition);
    if (edge) return Math.min(100, Math.max(0, edge.calc));

    const distances = [y, width - x, height - y, x];
    const edgeIndex = distances.indexOf(Math.min(...distances));
    return Math.min(
      100,
      Math.max(0, edges[edgeIndex].calc)
    );
  };

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (calculateProgress(e) / 100) * video.duration;
  };

  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoverProgress(calculateProgress(e));
  };

  const SIZE = 500;
  const STROKE = 80;
  const R = 80;
  const PAD = STROKE / 2;
  const INNER = SIZE - STROKE;
  const pathData = `M ${PAD + R},${PAD} H ${PAD + INNER - R} A ${R},${R} 0 0 1 ${PAD + INNER},${PAD + R} V ${PAD + INNER - R} A ${R},${R} 0 0 1 ${PAD + INNER - R},${PAD + INNER} H ${PAD + R} A ${R},${R} 0 0 1 ${PAD},${PAD + INNER - R} V ${PAD + R} A ${R},${R} 0 0 1 ${PAD + R},${PAD}`;

  const renderHoverIndicator = () => {
    if (hoverProgress === null || !pathRef.current || pathLen === 0) return null;

    const pt = pathRef.current.getPointAtLength((hoverProgress / 100) * pathLen);
    const distances = [
      Math.abs(pt.y - PAD),
      Math.abs(pt.x - (PAD + INNER)),
      Math.abs(pt.y - (PAD + INNER)),
      Math.abs(pt.x - PAD),
    ];
    const minEdge = Math.min(...distances);
    const LEN = 30;
    const isVertical = minEdge === distances[0] || minEdge === distances[2];

    return (
      <line
        x1={isVertical ? pt.x : pt.x - LEN}
        y1={isVertical ? pt.y - LEN : pt.y}
        x2={isVertical ? pt.x : pt.x + LEN}
        y2={isVertical ? pt.y + LEN : pt.y}
        stroke="#fbbf24"
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      <div className="relative w-[500px] h-[500px]">
        <div
          className="absolute inset-0 cursor-pointer rounded-[80px] overflow-visible"
          onClick={handleSeekBarClick}
          onMouseMove={handleSeekBarHover}
          onMouseLeave={() => setHoverProgress(null)}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
            <g>
              <path
                d={pathData}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={STROKE}
                strokeLinecap="round"
              />
              <path
                ref={pathRef}
                d={pathData}
                fill="none"
                stroke="#ef4444"
                strokeWidth={STROKE}
                strokeLinecap="square"
                pathLength={100}
                strokeDasharray={`${progress} ${100 - progress}`}
              />
              {renderHoverIndicator()}
            </g>
          </svg>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-[50px] overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src="/demo.mp4"
            playsInline
            controls={false}
          />

          <button
            type="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlayPause}
          >
            {!isPlaying ? (
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-black border-b-[15px] border-b-transparent ml-1" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center gap-2">
                <div className="w-2 h-8 bg-black" />
                <div className="w-2 h-8 bg-black" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
