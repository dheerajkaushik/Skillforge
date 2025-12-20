import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HlsPlayer({ src, poster }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!src) return;

    // 1. If HLS.js is supported (Desktop Chrome/Firefox/Edge)
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    // 2. Native HLS support (Safari on Mac/iOS)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      style={{ width: "100%", maxHeight: "400px", background: "black" }}
    />
  );
}