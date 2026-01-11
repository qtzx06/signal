import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Video2Ascii from 'video2ascii';
import BackgroundBoxes from './components/BackgroundBoxes';
import AsciiGrid from './components/AsciiGrid';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const [numColumns] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 200 : 150;
  });

  useEffect(() => {
    // After 3 seconds: expand page, then set up GSAP
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      appRef.current?.classList.add('scrollable');

      // Give DOM time to update, then set up ScrollTrigger
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();

        gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        }).to(
          signalRef.current,
          { filter: 'blur(20px)', opacity: 0, ease: 'none' },
          0
        );
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app" ref={appRef}>
      {/* ASCII video background */}
      <div className="video-bg" ref={videoRef}>
        <Video2Ascii
          src="/matrix.mp4"
          numColumns={numColumns}
          colored={true}
          brightness={1.2}
          charset="detailed"
          isPlaying={true}
          autoPlay={true}
          enableMouse={false}
          enableRipple={false}
          audioEffect={0}
        />
      </div>

      {/* Portal panels */}
      <BackgroundBoxes />

      {/* SIGNAL text centered */}
      <div className="signal-container" ref={signalRef}>
        <AsciiGrid />
      </div>
    </div>
  );
}

export default App;
