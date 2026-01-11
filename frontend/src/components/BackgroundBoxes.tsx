import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './BackgroundBoxes.css';

gsap.registerPlugin(ScrollTrigger);

export default function BackgroundBoxes() {
  const [loaded, setLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    // Wait for page to become scrollable (3s) before setting up GSAP
    const setupTimer = setTimeout(() => {
      const panels = [topRef.current, bottomRef.current, leftRef.current, rightRef.current];
      if (panels.some(p => !p)) return;

      // Remove CSS transitions so GSAP has full control
      panels.forEach(p => {
        if (p) p.style.transition = 'none';
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();

        gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        })
        .fromTo(
          bottomRef.current,
          { height: '24px' },
          { height: '60vh', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          topRef.current,
          { height: '24px' },
          { height: '40vh', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          leftRef.current,
          { width: '24px' },
          { width: '50vw', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          rightRef.current,
          { width: '24px' },
          { width: '50vw', ease: 'power2.inOut' },
          0
        );
      });
    }, 3000);

    return () => clearTimeout(setupTimer);
  }, [loaded]);

  return (
    <div className={`portal-container ${loaded ? 'loaded' : ''}`}>
      <div className="panel panel-top" ref={topRef} />
      <div className="panel panel-bottom" ref={bottomRef} />
      <div className="panel panel-left" ref={leftRef} />
      <div className="panel panel-right" ref={rightRef} />
    </div>
  );
}
