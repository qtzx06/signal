import Video2Ascii from 'video2ascii';
import AsciiGrid from './components/AsciiGrid';
import './App.css';

function App() {
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
          audioEffect={0}
          className="video-ascii-bg"
        />
      </div>

      <div className="signal-overlay">
        <AsciiGrid />
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
