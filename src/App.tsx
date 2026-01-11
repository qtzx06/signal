import Video2Ascii from 'video2ascii';
import BackgroundBoxes from './components/BackgroundBoxes';
import AsciiGrid from './components/AsciiGrid';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* ASCII video background */}
      <div className="video-bg">
        <Video2Ascii
          src="/matrix.mp4"
          numColumns={150}
          colored={true}
          brightness={1.2}
          charset="detailed"
          isPlaying={true}
          autoPlay={true}
          loop={true}
          enableMouse={false}
          enableRipple={false}
          audioEffect={0}
        />
      </div>

      {/* Portal panels */}
      <BackgroundBoxes />

      {/* SIGNAL text centered */}
      <div className="signal-container">
        <AsciiGrid />
      </div>
    </div>
  );
}

export default App;
