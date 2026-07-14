import { useEffect, useState } from 'react';
import './Envelope.css';
import SoundFX from '../utils/audio';
import DATA from '../data';

export default function Envelope({ isHit, onOpenComplete }) {
  const [starState, setStarState] = useState('center'); // 'center', 'side'
  const [flapState, setFlapState] = useState('closed'); // 'closed', 'open'
  const [flapZIndex, setFlapZIndex] = useState(4);
  const [paperState, setPaperState] = useState('inside'); // 'inside', 'outside'

  useEffect(() => {
    if (isHit) {
      // Begin sequence of opening after hit
      const startOpening = async () => {
        // Play hit sound, delay opening slightly
        SoundFX.playHit();
        
        await new Promise(resolve => setTimeout(resolve, 800));

        // 1. Move star seal to side
        setStarState('side');
        SoundFX.playOpenEnvelope();

        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Open flap
        setFlapState('open');

        await new Promise(resolve => setTimeout(resolve, 600));

        // 3. Move flap z-index back and slide paper out
        setFlapZIndex(1);
        setPaperState('outside');

        // Let the paper fully rise
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Invoke finished callback
        if (onOpenComplete) {
          onOpenComplete();
        }
      };

      startOpening();
    }
  }, [isHit]);

  return (
    <div className="envelope-wrapper">
      <div className="envelope-container">
        {/* Back panel of envelope */}
        <div className="envelope-back"></div>
        
        {/* Letter paper */}
        <div className={`envelope-paper ${paperState === 'outside' ? 'outside' : 'inside'}`}>
          <div className="paper-content">
            <h3 className="paper-title">{DATA.envelope.paperTitle}</h3>
            <p className="paper-text">
              {DATA.envelope.paperText}
            </p>
            <p className="paper-text highlight">
              {DATA.envelope.paperHighlight}
            </p>
            <p className="paper-footer">
              {DATA.envelope.paperFooter}
            </p>
          </div>
        </div>

        {/* Front panels (left, right, bottom flaps) */}
        <div className="front-flap-left"></div>
        <div className="front-flap-right"></div>
        <div className="front-flap-bottom"></div>

        {/* Top flap */}
        <div 
          className={`envelope-top-flap ${flapState === 'closed' ? 'closed' : ''}`}
          style={{ zIndex: flapZIndex }}
        ></div>

        {/* Heart/Star seal button */}
        <div className={`envelope-seal ${starState === 'side' ? 'side' : 'center'}`}>
          {DATA.envelope.sealEmoji}
        </div>
      </div>
    </div>
  );
}
