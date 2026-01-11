import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Video2Ascii from 'video2ascii';
import BackgroundBoxes from '../components/BackgroundBoxes';
import AsciiGrid from '../components/AsciiGrid';
import '../App.css';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const navigate = useNavigate();
  const appRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [numColumns] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 200 : 150;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/user/${query.trim()}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      appRef.current?.classList.add('scrollable');

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        });

        tl.fromTo(
          signalRef.current,
          { opacity: 1 },
          { opacity: 0, ease: 'none' },
          0
        );
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app" ref={appRef}>
      {/* Search bar overlay */}
      <div className="search-overlay">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GitHub username..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            →
          </button>
        </form>
      </div>

      {/* ASCII video background */}
      <div className="video-bg">
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

      {/* White bars */}
      <BackgroundBoxes />

      {/* SIGNAL title */}
      <div className="signal-container" ref={signalRef}>
        <AsciiGrid />
      </div>
    </div>
  );
}
