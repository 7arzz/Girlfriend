import { useState, useEffect } from 'react';
import './GirlfriendQuestion.css';
import SoundFX from '../utils/audio';
import DATA from '../data';

export default function GirlfriendQuestion({ onRestart, onAccepted }) {
  const [stage, setStage] = useState('question'); // 'question', 'success'
  const [noBtnPos, setNoBtnPos] = useState({ position: 'static' });
  const [hoverCount, setHoverCount] = useState(0);
  const [funnyText, setFunnyText] = useState(DATA.question.dodgeDialogues[0]);

  // Dodge function to move the "No" button randomly
  const dodgeButton = () => {
    SoundFX.playPop();
    setHoverCount(prev => prev + 1);

    const btnWidth = 100;
    const btnHeight = 45;
    
    // Bounds boundaries
    const padding = 40;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

    setNoBtnPos({
      position: 'fixed',
      left: `${randomX}px`,
      top: `${randomY}px`,
      zIndex: 9999
    });

    // Update funny dialogue text periodically
    const dialogues = DATA.question.dodgeDialogues;
    setFunnyText(dialogues[Math.floor(Math.random() * dialogues.length)]);
  };

  const handleYes = () => {
    SoundFX.playSuccess();
    setStage('success');
    if (onAccepted) {
      onAccepted();
    }
  };

  // Get current date formatted nicely
  const getFormattedDate = () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <div className="question-page-container">
      {stage === 'question' ? (
        <div className="card-container pop-in-card">
          <div className="love-icon-wrapper">
            <div className="heart-globe">
              <span className="heart-icon">💖</span>
            </div>
          </div>
          
          <h1 className="question-title">{DATA.question.title}</h1>
          
          <p className="question-subtitle">
            {DATA.question.subtitle}
          </p>

          {hoverCount > 0 && (
            <div className="dodge-dialogue">
              <span>{funnyText}</span>
            </div>
          )}

          <div className="button-group">
            <button 
              className="btn btn-yes" 
              onClick={handleYes}
              id="btn-yes"
            >
              {DATA.question.yesButton}
            </button>
            <button 
              className="btn btn-no" 
              style={noBtnPos}
              onMouseEnter={dodgeButton}
              onTouchStart={(e) => {
                e.preventDefault();
                dodgeButton();
              }}
              onClick={(e) => {
                e.preventDefault();
                dodgeButton();
              }}
              id="btn-no"
            >
              {DATA.question.noButton}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-container success-card pop-in-card">
          <div className="success-particles">
            {DATA.success.floatingHearts.map((heart, i) => (
              <span key={i} className={`floating-heart h${i + 1}`}>{heart}</span>
            ))}
          </div>

          <div className="love-success-couple">
            <span className="couple-emoji">{DATA.success.coupleEmoji}</span>
          </div>

          <h1 className="success-title">{DATA.success.title}</h1>
          
          <p className="success-text">
            {DATA.success.text}
          </p>

          <div className="anniversary-calendar">
            <div className="calendar-header">{DATA.success.calendarHeader}</div>
            <div className="calendar-body">
              <div className="calendar-month">{DATA.success.calendarIcon}</div>
              <div className="calendar-date-number">{DATA.success.calendarLocked}</div>
              <div className="calendar-date-text">{getFormattedDate()}</div>
            </div>
          </div>

          <button className="btn btn-replay" onClick={onRestart}>
            {DATA.success.replayButton}
          </button>
        </div>
      )}
    </div>
  );
}
