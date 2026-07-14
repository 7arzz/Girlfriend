import { useState } from 'react';
import './App.css';
import PetalsBackground from './components/PetalsBackground';
import ArcheryGame from './components/ArcheryGame';
import GirlfriendQuestion from './components/GirlfriendQuestion';
import SoundFX from './utils/audio';
import DATA from './data';

function App() {
  const [stage, setStage] = useState('welcome'); // 'welcome', 'archery', 'question'
  const [particleMood, setParticleMood] = useState('calm'); // 'calm', 'excited', 'celebrate'

  const handleStartGame = () => {
    SoundFX.init();
    SoundFX.playPop();
    setStage('archery');
    setParticleMood('calm');
  };

  const handleGameComplete = () => {
    setStage('question');
    setParticleMood('excited');
  };

  const handleProposalAccepted = () => {
    setParticleMood('celebrate');
  };

  const handleRestart = () => {
    setStage('welcome');
    setParticleMood('calm');
  };

  return (
    <div className="app-container">
      {/* Background decoration particles */}
      <PetalsBackground mood={particleMood} />

      <main className="main-content">
        {stage === 'welcome' && (
          <div className="welcome-screen pop-in">
            <div className="welcome-love-icon">{DATA.welcome.icon}</div>
            <h1 className="welcome-title">{DATA.welcome.title}</h1>
            <p className="welcome-tagline">
              {DATA.welcome.tagline}
            </p>
            <button className="btn-start" onClick={handleStartGame}>
              {DATA.welcome.startButton}
            </button>
          </div>
        )}

        {stage === 'archery' && (
          <ArcheryGame onGameComplete={handleGameComplete} />
        )}

        {stage === 'question' && (
          <GirlfriendQuestion 
            onRestart={handleRestart} 
            onAccepted={handleProposalAccepted}
          />
        )}
      </main>
    </div>
  );
}

export default App;
