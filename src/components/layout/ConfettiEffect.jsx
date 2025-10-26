import { useEffect, useState, useRef, useCallback } from "react";

const COLORS = [
  "#FF7900", // Orange
  "#6200EA", // Purple
  "#FFB300", // Amber
  "#B71C1C", // Red
  "#EEEEEE", // White
  "#000000", // Black
  "#B388FF", // Light Purple
  "#F57C00", // Dark Orange
];

const SHAPES = ["circle", "square", "triangle"];

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.size = Math.random() * 15 + 5; // Size between 5 and 20
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.gravity = 0.5;
    this.resistance = 0.9;
    this.rotationSpeed = Math.random() * 0.2 - 0.1;
    this.rotation = Math.random() * 360;
    this.speed = {
      x: Math.random() * 6 - 3,
      y: Math.random() * -10 - 5,
    };
  }

  update() {
    // Apply gravity
    this.speed.y += this.gravity;

    // Apply drag resistance
    this.speed.x *= this.resistance;

    // Update position
    this.x += this.speed.x;
    this.y += this.speed.y;

    // Update rotation
    this.rotation += this.rotationSpeed;

    // Check if out of bounds
    if (this.y > this.canvas.height) {
      this.y = this.canvas.height;
      this.speed.y *= -0.6; // Bounce with energy loss
    }

    // Disappear when stopped
    if (this.y > this.canvas.height - 10 && Math.abs(this.speed.y) < 0.5) {
      this.speed.y = 0;
    }

    // Wrap horizontally
    if (this.x < -this.size) this.x = this.canvas.width + this.size;
    if (this.x > this.canvas.width + this.size) this.x = -this.size;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.fillStyle = this.color;

    switch (this.shape) {
      case "square":
        this.ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      case "triangle":
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.size / 2);
        this.ctx.lineTo(-this.size / 2, this.size / 2);
        this.ctx.lineTo(this.size / 2, this.size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      default: // circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    this.ctx.restore();
  }
}

const ConfettiEffect = ({
  intensity = 1,
  duration = 3000,
  autoStart = true,
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const createParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas and particles
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current = [];

    // Create new particles
    const particleCount = Math.floor(100 * intensity);
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(canvas));
    }
  }, [intensity]);

  const animate = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    // Continue animation
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Start animation when component mounts
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    // Set initial size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Handle confetti activation/deactivation
  useEffect(() => {
    if (isActive) {
      // Start confetti
      createParticles();
      animate();

      // Auto-stop after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsActive(false);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Stop animation
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }
  }, [isActive, duration, canvasSize, createParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default ConfettiEffect;
