import { useEffect, useState } from 'react';
import './BackgroundBoxes.css';

export default function BackgroundBoxes() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`portal-container ${loaded ? 'loaded' : ''}`}>
      <div className="panel panel-top" />
      <div className="panel panel-bottom" />
      <div className="panel panel-left" />
      <div className="panel panel-right" />
    </div>
  );
}
