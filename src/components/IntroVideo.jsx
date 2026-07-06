import React, { useState, useRef, useEffect } from 'react';

export default function IntroVideo({ onClose, onStartFade }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let animationFrameId;

    // Play video immediately with SOUND ON
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.defaultMuted = false;
      videoRef.current.volume = 1.0;

      videoRef.current.play().catch((err) => {
        console.warn("Unmuted autoplay blocked by browser policy. Falling back to muted with tap-to-unmute listener:", err);
        // If browser security policy blocks unmuted autoplay without prior interaction,
        // start muted so animation runs, and unmute instantly on first user click/tap/keypress anywhere.
        if (videoRef.current && isMounted) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(e => console.error("Playback attempt failed:", e));

          const enableSound = () => {
            if (videoRef.current && isMounted) {
              videoRef.current.muted = false;
              videoRef.current.volume = 1.0;
            }
            window.removeEventListener('click', enableSound);
            window.removeEventListener('touchstart', enableSound);
            window.removeEventListener('keydown', enableSound);
          };
          window.addEventListener('click', enableSound);
          window.addEventListener('touchstart', enableSound);
          window.addEventListener('keydown', enableSound);
        }
      });
    }

    // 60fps buttery-smooth synchronization of loading ring with video playback
    const updateProgress = () => {
      if (!isMounted) return;
      if (videoRef.current && videoRef.current.duration > 0) {
        const current = videoRef.current.currentTime || 0;
        const total = videoRef.current.duration;
        const pct = Math.min(100, (current / total) * 100);
        setProgress(pct);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleVideoEnd = () => {
    setProgress(100);
    setIsFading(true);
    if (onStartFade) onStartFade();
    setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('giftme_intro_shown', 'true');
      } catch (e) {}
      if (onClose) onClose();
    }, 1000); // 1000ms hardware-accelerated fade out
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#101010] bg-[radial-gradient(ellipse_at_center,_#241f12_0%,_#101010_70%,_#0a0a0a_100%)] flex items-center justify-center overflow-hidden transition-all duration-1000 ease-out transform-gpu ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Centered Wrapper for Ring + Perfect Circle Video */}
      <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
        {/* Circular Loading Ring Animating Simultaneously with Video Playback */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none transform-gpu drop-shadow-[0_0_15px_rgba(200,169,81,0.4)]"
          viewBox="0 0 100 100"
        >
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#24221b"
            strokeWidth="1.5"
          />
          {/* Smooth Animated Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#luxuryGoldGradient)"
            strokeWidth="2.5"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 - (301.59 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-75 ease-out"
          />
          <defs>
            <linearGradient id="luxuryGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8A951" />
              <stop offset="50%" stopColor="#F3E5AB" />
              <stop offset="100%" stopColor="#9A7B2C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Perfect Circular Video Container */}
        <div className="w-[270px] h-[270px] sm:w-[360px] sm:h-[360px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden relative shadow-[0_0_100px_rgba(201,168,76,0.45)] border border-gold/40 bg-charcoal-950 flex items-center justify-center transform-gpu">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover scale-105 transform-gpu pointer-events-none select-none"
            src="/assets/intro-video.mp4"
          />
        </div>
      </div>
    </div>
  );
}
