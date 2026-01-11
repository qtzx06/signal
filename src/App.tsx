import { useState } from 'react';
import Video2Ascii from 'video2ascii';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="app">
      <div className="video-bg">
        <Video2Ascii
          src="/matrix.mp4"
          numColumns={150}
          colored={true}
          brightness={1.2}
          charset="detailed"
          isPlaying={true}
          autoPlay={true}
          enableMouse={false}
          enableRipple={false}
          className="video-ascii-bg"
        />
      </div>

      <div className="content">
        <h1 className="logo">SIGNAL</h1>
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
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
