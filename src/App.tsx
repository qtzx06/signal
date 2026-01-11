import { useState } from 'react';
import Video2Ascii from 'video2ascii';
import AsciiGrid from './components/AsciiGrid';
import './App.css';

// Set to true and provide videoSrc to use video2ascii instead of static grid
const USE_VIDEO = false;
const VIDEO_SRC = '/matrix.mp4'; // Put your video file in /public

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [xUrl, setXUrl] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="app">
      <div className="matrix-bg"></div>

      <div className="hero">
        <div className="grid-container">
          {USE_VIDEO ? (
            <Video2Ascii
              src={VIDEO_SRC}
              numColumns={100}
              colored={false}
              brightness={1.2}
              charset="detailed"
              isPlaying={true}
              autoPlay={true}
              enableMouse={false}
              enableRipple={false}
              className="video-ascii"
            />
          ) : (
            <AsciiGrid />
          )}
        </div>

        <div className="fade-overlay"></div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <span className="search-prefix">$</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="github username..."
                className="search-input"
                spellCheck={false}
              />
              <button type="submit" className="search-button">
                <span className="button-text">ANALYZE</span>
                <span className="button-cursor">_</span>
              </button>
            </div>
          </form>

          <div className="social-links">
            <p className="social-label">/* optional */</p>
            <div className="social-inputs">
              <div className="social-input-group">
                <label>linkedin://</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="profile-url"
                />
              </div>
              <div className="social-input-group">
                <label>x.com/</label>
                <input
                  type="text"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="handle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
