import { useEffect, useRef } from 'react';

export default function PetalsBackground({ mood = 'calm' }) {
  const canvasRef = useRef(null);

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

    const particles = [];
    const maxParticles = mood === 'celebrate' ? 120 : mood === 'excited' ? 80 : 40;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.size = Math.random() * 8 + (mood === 'celebrate' ? 4 : 5);
        this.speedX = Math.random() * 2 - 1;
        
        if (mood === 'celebrate') {
          // Confetti particles going in different directions
          this.y = Math.random() * canvas.height * 0.8;
          this.x = Math.random() * canvas.width;
          this.speedY = Math.random() * 4 + 2;
          this.speedX = Math.random() * 6 - 3;
          this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
          this.type = Math.random() > 0.5 ? 'circle' : 'rect';
          this.rot = Math.random() * Math.PI;
          this.rotSpeed = Math.random() * 0.1 - 0.05;
        } else {
          // Falling petals / hearts
          this.speedY = Math.random() * 1.5 + 1.2;
          this.color = Math.random() > 0.6 
            ? `rgba(255, ${Math.floor(Math.random() * 60) + 150}, ${Math.floor(Math.random() * 60) + 180}, ${Math.random() * 0.4 + 0.3})` // soft pink
            : `rgba(255, ${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 100}, ${Math.random() * 0.3 + 0.2})`; // lighter orange/pink
          this.type = Math.random() > 0.4 ? 'heart' : 'petal';
          this.rot = Math.random() * Math.PI * 2;
          this.rotSpeed = Math.random() * 0.02 - 0.01;
        }
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.type === 'heart' || this.type === 'petal') {
          this.rot += this.rotSpeed;
          this.x += Math.sin(this.y / 30) * 0.5; // sway gently
        } else if (mood === 'celebrate') {
          this.rot += this.rotSpeed;
        }

        // Reset if bottom or sides exceeded
        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
          if (mood === 'celebrate') {
            // keep confetti falling downwards
            this.y = -20;
            this.x = Math.random() * canvas.width;
            this.speedY = Math.random() * 4 + 2;
            this.speedX = Math.random() * 4 - 2;
          } else {
            this.reset();
          }
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = this.color;

        if (this.type === 'heart') {
          // Draw heart
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-this.size, -this.size, -this.size * 2, this.size / 3, 0, this.size * 1.5);
          ctx.bezierCurveTo(this.size * 2, this.size / 3, this.size, -this.size, 0, 0);
          ctx.fill();
        } else if (this.type === 'petal') {
          // Draw oval petal
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'rect') {
          ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
        }

        ctx.restore();
      }
    }

    // Populate initial particles
    for (let i = 0; i < maxParticles; i++) {
      const p = new Particle();
      // stagger initial Y positions to start immediately
      if (mood !== 'celebrate') {
        p.y = Math.random() * canvas.height;
      }
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mood]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
