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

    // Wait for CSS transition to complete before setting up GSAP
    const setupTimer = setTimeout(() => {
      const panels = [topRef.current, bottomRef.current, leftRef.current, rightRef.current];
      if (panels.some(p => !p)) return;

      // Remove CSS transitions so GSAP has full control
      panels.forEach(p => {
        if (p) p.style.transition = 'none';
      });

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        });

        // All panels close in together with backdrop blur
        tl.fromTo(
          bottomRef.current,
          { height: '24px', backdropFilter: 'blur(0px)' },
          { height: '95vh', backdropFilter: 'blur(20px)', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          topRef.current,
          { height: '24px', backdropFilter: 'blur(0px)' },
          { height: '15vh', backdropFilter: 'blur(20px)', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          leftRef.current,
          { width: '24px', backdropFilter: 'blur(0px)' },
          { width: '50vw', backdropFilter: 'blur(20px)', ease: 'power2.inOut' },
          0
        )
        .fromTo(
          rightRef.current,
          { width: '24px', backdropFilter: 'blur(0px)' },
          { width: '50vw', backdropFilter: 'blur(20px)', ease: 'power2.inOut' },
          0
        );
      });

      return () => ctx.revert();
    }, 1400);

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
