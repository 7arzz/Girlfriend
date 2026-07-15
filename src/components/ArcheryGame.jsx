import { useEffect, useRef, useState } from 'react';
import './ArcheryGame.css';
import Envelope from './Envelope';
import SoundFX from '../utils/audio';
import DATA from '../data';

export default function ArcheryGame({ onGameComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const envelopeContainerRef = useRef(null);

  const [isEnvelopeHit, setIsEnvelopeHit] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [currentDrag, setCurrentDrag] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [arrowStatus, setArrowStatus] = useState('idle'); // 'idle', 'flying', 'stuck', 'missed'
  const [floatingOffset, setFloatingOffset] = useState(0);

  // Shared responsive helpers (used by both canvas loop and event handlers)
  const getResponsiveScale = () => {
    const w = window.innerWidth;
    if (w <= 360) return 0.5;
    if (w <= 480) return 0.6;
    if (w <= 768) return 0.75;
    return 1.0;
  };

  const getAnchorPosition = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = getResponsiveScale();
    if (w <= 480) return { x: 50 + 20 * scale, y: h - 70 };
    if (w <= 768) return { x: 80 + 20 * scale, y: h - 100 };
    return { x: 140, y: h / 2 };
  };

  // Game physics config
  const GRAVITY = 0.12;
  const PULL_FACTOR = 0.55; // Controls firing speed
  const MAX_PULL = 120;

  // Let's hold flying arrow state in mutable refs to avoid excessive React renders during 60 FPS animation
  const arrowRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    trail: []
  });

  const hitParticlesRef = useRef([]);

  // Heart floating animation offset (for collision tracking)
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 0.05;
      setFloatingOffset(Math.sin(tick) * 12);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Responsive scale factor for canvas-drawn elements
    const getScale = () => {
      const w = canvas.width;
      if (w <= 360) return 0.5;
      if (w <= 480) return 0.6;
      if (w <= 768) return 0.75;
      return 1.0;
    };

    // Responsive anchor position helper
    const getAnchor = () => {
      const w = canvas.width;
      const scale = getScale();
      if (w <= 480) return { x: 50 + 20 * scale, y: canvas.height - 70 };
      if (w <= 768) return { x: 80 + 20 * scale, y: canvas.height - 100 };
      return { x: 140, y: canvas.height / 2 };
    };

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const anchor = getAnchor();
      const anchorX = anchor.x;
      const anchorY = anchor.y;
      const scale = getScale();

      // Draw Bow Anchor base or guidance circle
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 105, 180, 0.1)';
      ctx.fill();

      // Check collision if arrow is flying
      if (arrowStatus === 'flying') {
        const arrow = arrowRef.current;
        arrow.x += arrow.vx;
        arrow.y += arrow.vy;
        arrow.vy += GRAVITY;
        arrow.angle = Math.atan2(arrow.vy, arrow.vx);
        
        // Add to trail
        arrow.trail.push({ x: arrow.x, y: arrow.y });
        if (arrow.trail.length > 8) arrow.trail.shift();

        // Draw trail
        ctx.beginPath();
        for (let i = 0; i < arrow.trail.length; i++) {
          const point = arrow.trail[i];
          const opacity = (i + 1) / arrow.trail.length;
          ctx.strokeStyle = `rgba(255, 182, 193, ${opacity * 0.4})`;
          ctx.lineWidth = 4;
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();

        // Collision Check: relative to envelope DOM position
        if (envelopeContainerRef.current) {
          const rect = envelopeContainerRef.current.getBoundingClientRect();
          // Pad the hit bounding area slightly for easy gameplay
          const padding = 15;
          const hitLeft = rect.left - padding;
          const hitRight = rect.right + padding;
          const hitTop = rect.top - padding;
          const hitBottom = rect.bottom + padding;

          if (
            arrow.x >= hitLeft &&
            arrow.x <= hitRight &&
            arrow.y >= hitTop &&
            arrow.y <= hitBottom
          ) {
            setArrowStatus('stuck');
            setIsEnvelopeHit(true);
            
            // Create particle explosion
            createExplosion(arrow.x, arrow.y);
          }
        }

        // Out of bounds reset
        if (
          arrow.y > canvas.height + 100 ||
          arrow.x > canvas.width + 100 ||
          arrow.x < -100
        ) {
          setArrowStatus('idle');
        }
      }

      // Update and draw hit particles
      const particles = hitParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // tiny gravity
        p.alpha -= 0.015;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = `rgba(255, ${p.g}, ${p.b}, ${p.alpha})`;

          // Draw a small heart or star particle
          ctx.beginPath();
          if (p.type === 'heart') {
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-p.size, -p.size, -p.size * 2, p.size / 3, 0, p.size * 1.5);
            ctx.bezierCurveTo(p.size * 2, p.size / 3, p.size, -p.size, 0, 0);
          } else {
            // Star
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }
      }

      // Unified arrow drawing helper function
      const drawArrow = (arrowCtx, x, y, angle, nockOffset = 0, isStuck = false, arrowScale = 1) => {
        arrowCtx.save();
        arrowCtx.translate(x, y);
        arrowCtx.rotate(angle);
        arrowCtx.scale(arrowScale, arrowScale);

        const nockX = -45 - nockOffset;
        const arrowLength = 250;
        const tipX = nockX + arrowLength;

        // 1. Draw shaft (Gold neon line)
        arrowCtx.beginPath();
        arrowCtx.moveTo(nockX, 0);
        arrowCtx.lineTo(isStuck ? tipX - 35 : tipX, 0); // embeds arrowhead when stuck in target
        arrowCtx.strokeStyle = '#ffd700'; // Gold shaft!
        arrowCtx.lineWidth = 7;
        arrowCtx.lineCap = 'round';
        arrowCtx.shadowColor = '#ffd700';
        arrowCtx.stroke();
        arrowCtx.shadowColor = 'transparent';

        // 2. Draw feathers (Fletching) at the back
        arrowCtx.fillStyle = '#ff4d6d';
        
        // Upper feather
        arrowCtx.beginPath();
        arrowCtx.moveTo(nockX + 8, 0);
        arrowCtx.quadraticCurveTo(nockX, -18, nockX - 15, -18);
        arrowCtx.lineTo(nockX - 8, 0);
        arrowCtx.closePath();
        arrowCtx.fill();
        
        // Lower feather
        arrowCtx.beginPath();
        arrowCtx.moveTo(nockX + 8, 0);
        arrowCtx.quadraticCurveTo(nockX, 18, nockX - 15, 18);
        arrowCtx.lineTo(nockX - 8, 0);
        arrowCtx.closePath();
        arrowCtx.fill();

        // Feather ribs detailing
        arrowCtx.strokeStyle = '#ffccd5';
        arrowCtx.lineWidth = 2.5;
        arrowCtx.beginPath();
        arrowCtx.moveTo(nockX + 4, -3);
        arrowCtx.lineTo(nockX - 8, -14);
        arrowCtx.moveTo(nockX - 3, 0);
        arrowCtx.lineTo(nockX - 12, 0);
        arrowCtx.moveTo(nockX + 4, 3);
        arrowCtx.lineTo(nockX - 8, 14);
        arrowCtx.stroke();

        // 3. Draw Arrow Head (Rose Love Heart!)
        if (!isStuck) {
          arrowCtx.fillStyle = '#ff2a5f';
          arrowCtx.shadowColor = '#ff2a5f';
          arrowCtx.shadowBlur = 8;
          
          const size = 12;
          arrowCtx.save();
          arrowCtx.translate(tipX, 0);
          arrowCtx.rotate(-Math.PI / 2); // points forward (+X)
          arrowCtx.beginPath();
          arrowCtx.moveTo(0, 0);
          arrowCtx.bezierCurveTo(-size, -size, -size * 2, size / 3, 0, size * 1.5);
          arrowCtx.bezierCurveTo(size * 2, size / 3, size, -size, 0, 0);
          arrowCtx.fill();
          arrowCtx.restore();
        }

        arrowCtx.restore();
      };

      // Draw Bow and String
      if (arrowStatus !== 'flying') {
        let pullDist = 0;
        let aimAngle = Math.PI / 4; // default pointing up-right

        if (isDragging && dragStart && currentDrag) {
          const dx = dragStart.x - currentDrag.x;
          const dy = dragStart.y - currentDrag.y;
          pullDist = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_PULL);
          aimAngle = Math.atan2(dy, dx);
        }

        ctx.save();
        ctx.translate(anchorX, anchorY);
        ctx.rotate(aimAngle);
        ctx.scale(scale, scale);

        const bowRadius = 85;
        const bowAngle = Math.PI / 2.6; // 69 degrees
        const bowCenterX = -30;
        
        const tipX = bowCenterX + bowRadius * Math.cos(bowAngle);
        const tipY = bowRadius * Math.sin(bowAngle);

        // Draw Bow limbs arc
        ctx.beginPath();
        ctx.arc(bowCenterX, 0, bowRadius, -bowAngle, bowAngle);
        ctx.strokeStyle = '#ff4d6d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#ff4d6d';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        // Bow tips - gold hearts/beads
        ctx.fillStyle = '#ffb3c1';
        ctx.beginPath();
        ctx.arc(tipX, -tipY, 6, 0, Math.PI * 2);
        ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw Bowstring (elastic white line)
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        
        const nockX = -45 - pullDist;
        ctx.moveTo(tipX, -tipY);
        ctx.lineTo(nockX, 0);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        // Draw loaded arrow if idle
        if (arrowStatus === 'idle') {
          drawArrow(ctx, 0, 0, 0, pullDist, false, 1); // already scaled via bow ctx.scale
        }
        ctx.restore();
      }

      // If arrow is flying or stuck, draw the flying/stuck arrow
      if (arrowStatus === 'flying') {
        drawArrow(ctx, arrowRef.current.x, arrowRef.current.y, arrowRef.current.angle, 0, false, scale);
      } else if (arrowStatus === 'stuck') {
        // Draw stuck arrow at recorded position
        drawArrow(ctx, arrowRef.current.x, arrowRef.current.y, arrowRef.current.angle, 0, true, scale);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const createExplosion = (x, y) => {
      const colors = [
        { g: 50, b: 100 },  // Pinkish-red
        { g: 154, b: 255 }, // Yellow/Goldish-orange
        { g: 182, b: 193 }, // Soft pink
        { g: 30, b: 255 }   // Magenta
      ];
      
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        hitParticlesRef.current.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 4,
          type: Math.random() > 0.4 ? 'heart' : 'star',
          alpha: 1.0,
          g: color.g,
          b: color.b,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: Math.random() * 0.2 - 0.1
        });
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [arrowStatus, isDragging, dragStart, currentDrag]);

  // Handle Aiming Input
  const handleStart = (clientX, clientY) => {
    if (arrowStatus !== 'idle') return;
    SoundFX.init(); // Init AudioContext on click

    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: anchorX, y: anchorY } = getAnchorPosition();

    // Check if dragging near bow anchor coordinates
    const dx = clientX - anchorX;
    const dy = clientY - anchorY;
    const clickDistance = Math.sqrt(dx * dx + dy * dy);

    // Accept clicks/touches within 200px of bow for friendly UX
    if (clickDistance < 200) {
      setDragStart({ x: clientX, y: clientY });
      setCurrentDrag({ x: clientX, y: clientY });
      setIsDragging(true);
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    setCurrentDrag({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    if (!isDragging || !dragStart || !currentDrag) return;
    setIsDragging(false);

    const dx = dragStart.x - currentDrag.x;
    const dy = dragStart.y - currentDrag.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      // Shoot!
      const canvas = canvasRef.current;
      const { x: anchorX, y: anchorY } = getAnchorPosition();

      const pull = Math.min(distance, MAX_PULL);
      const angle = Math.atan2(dy, dx);

      // Arrow velocity based on pull vector length and direction
      const vx = Math.cos(angle) * pull * PULL_FACTOR;
      const vy = Math.sin(angle) * pull * PULL_FACTOR;

      arrowRef.current = {
        x: anchorX,
        y: anchorY,
        vx: vx,
        vy: vy,
        angle: angle,
        trail: []
      };

      setArrowStatus('flying');
      SoundFX.playShoot();
    } else {
      setArrowStatus('idle');
    }

    setDragStart(null);
    setCurrentDrag(null);
  };

  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();

  const onTouchStart = (e) => {
    const t = e.touches[0];
    handleStart(t.clientX, t.clientY);
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  };
  const onTouchEnd = () => handleEnd();

  return (
    <div
      ref={containerRef}
      className={`archery-game-wrapper ${isEnvelopeHit ? 'scenery-blur' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Target description overlay */}
      <div className="game-instructions">
        <h2>{DATA.archery.instructionTitle}</h2>
        <p>{DATA.archery.instructionText}</p>
      </div>

      {/* Renders the game canvas */}
      <canvas ref={canvasRef} className="game-canvas" />

      {/* Floating Envelope target absolute positioned */}
      <div
        ref={envelopeContainerRef}
        className="envelope-target-container"
        style={{
          transform: `translate(-50%, ${floatingOffset}px)`,
        }}
        onClick={(e) => {
          // Allow instant hit on clicking/tapping the envelope directly (great for testing & accessibility!)
          if (!isEnvelopeHit) {
            e.stopPropagation();
            setIsEnvelopeHit(true);
            setArrowStatus('stuck');

            const container = envelopeContainerRef.current;
            if (container) {
              const rect = container.getBoundingClientRect();
              arrowRef.current = {
                x: rect.left + rect.width / 2 - 20,
                y: rect.top + rect.height / 2,
                vx: 0,
                vy: 0,
                angle: 0.1,
                trail: []
              };
            }
            SoundFX.playHit();
          }
        }}
      >
        <Envelope 
          isHit={isEnvelopeHit} 
          onOpenComplete={onGameComplete} 
        />
      </div>
    </div>
  );
}
