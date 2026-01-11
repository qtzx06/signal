import Video2Ascii from 'video2ascii';
import SignalMask from './components/SignalMask';
import './App.css';

function App() {
  return (
    <div className="app">
      <SignalMask />

      {/* Base video layer - normal brightness */}
      <div className="video-bg">
        <Video2Ascii
          src="/matrix.mp4"
          numColumns={150}
          colored={true}
          brightness={1.0}
          charset="detailed"
          isPlaying={true}
          autoPlay={true}
          enableMouse={false}
          enableRipple={false}
          audioEffect={0}
          className="video-ascii-bg"
        />
      </div>

      {/* Bright layer masked to SIGNAL - makes SIGNAL pop */}
      <div className="video-bright">
        <Video2Ascii
          src="/matrix.mp4"
          numColumns={150}
          colored={true}
          brightness={2.5}
          charset="detailed"
          isPlaying={true}
          autoPlay={true}
          enableMouse={false}
          enableRipple={false}
          audioEffect={0}
          className="video-ascii-bright"
        />
      </div>

      <div className="scanlines"></div>
    </div>
  );
}

export default App;
