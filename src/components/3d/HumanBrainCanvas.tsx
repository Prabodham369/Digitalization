import React, { useEffect, useRef } from 'react';

export interface FlyingTrigger {
  id: string;
  text: string;
  icon: string;
  startX: number;
  startY: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

interface HumanBrainCanvasProps {
  activePulse: boolean;
  incomingTrigger?: { text: string; icon: string } | null;
  onImpact?: (text: string) => void;
}

export const HumanBrainCanvas: React.FC<HumanBrainCanvasProps> = ({
  activePulse,
  incomingTrigger,
  onImpact,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flyingTriggersRef = useRef<FlyingTrigger[]>([]);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; opacity: number; color: string }[]>([]);
  const dopamineParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; alpha: number; text: string; color: string }[]>([]);

  // Spawn flying trigger animation
  useEffect(() => {
    if (!incomingTrigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    // Spawn from screen edges (left, right, or top)
    const sides = ['left', 'right', 'top'];
    const side = sides[Math.floor(Math.random() * sides.length)];

    let startX = 50;
    let startY = 100;

    if (side === 'left') {
      startX = 30 + Math.random() * 60;
      startY = h * 0.15 + Math.random() * (h * 0.25);
    } else if (side === 'right') {
      startX = w - (30 + Math.random() * 60);
      startY = h * 0.15 + Math.random() * (h * 0.25);
    } else {
      startX = w * 0.2 + Math.random() * (w * 0.6);
      startY = 40 + Math.random() * 40;
    }

    const newTrigger: FlyingTrigger = {
      id: Math.random().toString(36).substring(2, 9),
      text: incomingTrigger.text,
      icon: incomingTrigger.icon,
      startX,
      startY,
      progress: 0,
      speed: 0.025 + Math.random() * 0.008, // FAST SPEED on click
      color: ['#FF0055', '#FF3366', '#FFB800', '#00F0FF', '#00FF88'][Math.floor(Math.random() * 5)],
    };

    flyingTriggersRef.current.push(newTrigger);
  }, [incomingTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Sagittal Cross-Section Brain Center
    const getBrainCenter = () => ({
      cx: width / 2,
      cy: Math.max(210, height * 0.42),
    });

    // Anatomical Neurons with Soma, Dendrites & Axon branches
    interface Neuron {
      x: number;
      y: number;
      dendrites: { x: number; y: number }[];
      axonTip: { x: number; y: number };
      activation: number;
      region: 'prefrontal' | 'accumbens' | 'vta' | 'cortex' | 'cerebellum' | 'stem';
    }

    const neurons: Neuron[] = [];
    const neuronCount = 45;

    // Generate Neurons inside sagittal brain regions
    for (let i = 0; i < neuronCount; i++) {
      let x = 0;
      let y = 0;
      let region: Neuron['region'] = 'cortex';

      const randRegion = Math.random();
      if (i < 8) {
        // Nucleus Accumbens & VTA (Reward Core)
        region = i < 4 ? 'accumbens' : 'vta';
        x = (Math.random() - 0.5) * 40 - 15;
        y = (Math.random() - 0.5) * 30 + 10;
      } else if (randRegion < 0.35) {
        // Prefrontal Cortex (Frontal left side)
        region = 'prefrontal';
        x = -130 + Math.random() * 80;
        y = -80 + Math.random() * 90;
      } else if (randRegion < 0.75) {
        // Upper Cerebral Cortex Folds
        region = 'cortex';
        x = -60 + Math.random() * 150;
        y = -120 + Math.random() * 100;
      } else if (randRegion < 0.9) {
        // Cerebellum (Back bottom)
        region = 'cerebellum';
        x = 70 + Math.random() * 60;
        y = 50 + Math.random() * 50;
      } else {
        // Brain Stem
        region = 'stem';
        x = -10 + Math.random() * 30;
        y = 80 + Math.random() * 60;
      }

      // Generate random dendrite branches radiating from soma
      const dendrites: { x: number; y: number }[] = [];
      const branchCount = 3 + Math.floor(Math.random() * 3);
      for (let b = 0; b < branchCount; b++) {
        const angle = Math.random() * Math.PI * 2;
        const len = 8 + Math.random() * 15;
        dendrites.push({
          x: x + Math.cos(angle) * len,
          y: y + Math.sin(angle) * len,
        });
      }

      // Axon projection tip
      const axonAngle = Math.random() * Math.PI * 2;
      const axonLen = 20 + Math.random() * 25;
      const axonTip = {
        x: x + Math.cos(axonAngle) * axonLen,
        y: y + Math.sin(axonAngle) * axonLen,
      };

      neurons.push({
        x,
        y,
        dendrites,
        axonTip,
        activation: 0,
        region,
      });
    }

    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const { cx, cy } = getBrainCenter();
      pulseAngle += 0.03;

      // ----------------------------------------------------------------------
      // 1. LIGHT ANATOMICAL SCALE & GRID LINES (Medical / Scientific Cross-Section)
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // Subtle Grid
      const gridSize = 60;
      for (let gx = 0; gx < width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Scale Ticks & Crosshair around Brain Center
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.moveTo(cx - 240, cy);
      ctx.lineTo(cx + 240, cy);
      ctx.moveTo(cx, cy - 180);
      ctx.lineTo(cx, cy + 200);
      ctx.stroke();

      // Millimeter Scale Ruler Marks at Bottom Right of Brain
      const scaleX = cx + 100;
      const scaleY = cy + 180;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY);
      ctx.lineTo(scaleX + 80, scaleY);
      ctx.moveTo(scaleX, scaleY - 5);
      ctx.lineTo(scaleX, scaleY + 5);
      ctx.moveTo(scaleX + 80, scaleY - 5);
      ctx.lineTo(scaleX + 80, scaleY + 5);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('10 cm Scale', scaleX + 15, scaleY - 8);
      ctx.fillText('SAGITTAL MIDLINE CROSS-SECTION', cx - 230, cy - 160);

      ctx.restore();

      // ----------------------------------------------------------------------
      // 2. SAGITTAL CROSS-SECTION OF THE HUMAN BRAIN (COMBINING IMAGE 1 & IMAGE 2)
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      // Scale brain dynamically to ensure 100% full visibility on all screen sizes
      const brainScale = Math.min(1.15, Math.min(width / 460, height / 500));
      ctx.scale(brainScale, brainScale);

      // --- IMAGE 1: REALISTIC 3D ANATOMICAL SAGITTAL BRAIN BASE ---

      // A. Atmospheric Deep Brain Radial Warm Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 220);
      glowGrad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 240, 0, Math.PI * 2);
      ctx.fill();

      // B. Outer Cerebral Cortex (Cerebrum) Silhouette & Realistic Pink 3D Tissue
      ctx.beginPath();
      ctx.moveTo(-160, -30); // Prefrontal tip
      ctx.bezierCurveTo(-185, -90, -135, -150, -50, -155); // Frontal to Parietal
      ctx.bezierCurveTo(40, -160, 130, -130, 160, -60);   // Parietal to Occipital
      ctx.bezierCurveTo(185, -10, 175, 40, 130, 75);      // Occipital
      ctx.bezierCurveTo(110, 95, 80, 80, 60, 75);         // Transverse Fissure
      ctx.bezierCurveTo(110, 90, 130, 130, 90, 150);      // Cerebellum (Posterior)
      ctx.bezierCurveTo(60, 165, 30, 135, 10, 120);       // Cerebellum to Brainstem
      ctx.bezierCurveTo(0, 150, -5, 190, -20, 190);      // Brainstem descending
      ctx.bezierCurveTo(-38, 190, -32, 140, -42, 115);   // Brainstem anterior (Pons)
      ctx.bezierCurveTo(-72, 110, -112, 80, -125, 40);   // Temporal Lobe
      ctx.bezierCurveTo(-145, 25, -145, -5, -160, -30);  // Back to Prefrontal tip
      ctx.closePath();

      // 3D Shaded Tissue Gradient (Image 1 realistic pink/coral gradient)
      const tissueGrad = ctx.createLinearGradient(-150, -150, 150, 150);
      tissueGrad.addColorStop(0, '#E87A90');   // Rich Coral Pink
      tissueGrad.addColorStop(0.3, '#D65D75'); // Deep Pink Tissue
      tissueGrad.addColorStop(0.7, '#A83B52'); // Shadowed Burgundy/Pink
      tissueGrad.addColorStop(1, '#6B1F33');   // Deep Anatomical Shadow

      ctx.fillStyle = tissueGrad;
      ctx.fill();
      ctx.strokeStyle = '#F3A4B5';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FF6B8B';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // C. Corpus Callosum (Translucent White Arching Ribbon)
      ctx.beginPath();
      ctx.moveTo(-80, -40);
      ctx.bezierCurveTo(-70, -85, 40, -85, 65, -35);
      ctx.bezierCurveTo(50, -55, -50, -55, -80, -40);
      const callosumGrad = ctx.createLinearGradient(-80, -80, 65, -35);
      callosumGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      callosumGrad.addColorStop(1, 'rgba(220, 235, 252, 0.85)');
      ctx.fillStyle = callosumGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // D. Thalamus & Limbic Core (Warm Tan / Beige Core)
      ctx.beginPath();
      ctx.ellipse(-5, -10, 34, 24, 0, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(-5, -10, 5, -5, -10, 35);
      coreGrad.addColorStop(0, '#F7D0B5');
      coreGrad.addColorStop(0.7, '#D49B7A');
      coreGrad.addColorStop(1, '#9E6548');
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.strokeStyle = '#EAC0A2';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // E. Cerebellum Arbor Vitae (Tree of Life White Branching Folds)
      ctx.save();
      ctx.translate(85, 115);
      // Darker reddish cerebellum background
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#7A2234';
      ctx.fill();
      ctx.strokeStyle = '#D86B80';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White Tree Branches
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 15); ctx.lineTo(-5, -10);
      ctx.moveTo(-5, -10); ctx.lineTo(-22, -22);
      ctx.moveTo(-5, -10); ctx.lineTo(8, -25);
      ctx.moveTo(-5, -10); ctx.lineTo(22, -12);
      ctx.moveTo(-22, -22); ctx.lineTo(-30, -18);
      ctx.moveTo(8, -25); ctx.lineTo(12, -32);
      ctx.stroke();
      ctx.restore();

      // F. Brainstem Stalk (Smooth Light Beige / Tan Stalk)
      ctx.beginPath();
      ctx.moveTo(0, 120);
      ctx.bezierCurveTo(0, 150, -5, 190, -20, 190);
      ctx.bezierCurveTo(-38, 190, -32, 140, -42, 115);
      ctx.closePath();
      const stemGrad = ctx.createLinearGradient(-40, 115, 0, 190);
      stemGrad.addColorStop(0, '#E8C5AF');
      stemGrad.addColorStop(1, '#B88F78');
      ctx.fillStyle = stemGrad;
      ctx.fill();
      ctx.strokeStyle = '#F0D0BC';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- IMAGE 2: ELECTRIC CYAN DIGITAL WIREFRAME CONTOURS & SYNAPSING NODES OVERLAY ---

      // A. Digital Wireframe Contour Lines across Brain Gyri (Image 2 Style)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      // Contour Ring 1 (Outer Prefrontal to Parietal)
      ctx.moveTo(-150, -40); ctx.bezierCurveTo(-165, -80, -120, -135, -45, -140);
      ctx.bezierCurveTo(35, -145, 115, -115, 145, -50);

      // Contour Ring 2 (Mid Cortex)
      ctx.moveTo(-130, -30); ctx.bezierCurveTo(-140, -65, -95, -110, -35, -115);
      ctx.bezierCurveTo(25, -120, 95, -95, 120, -40);

      // Contour Ring 3 (Temporal & Lower Folds)
      ctx.moveTo(-115, 25); ctx.bezierCurveTo(-90, 65, -40, 50, -10, 65);
      ctx.moveTo(-75, 75); ctx.bezierCurveTo(-45, 95, 10, 85, 45, 65);

      // Digital Cross Grid Connectors (Wireframe mesh effect)
      ctx.moveTo(-120, -90); ctx.lineTo(-100, -120);
      ctx.moveTo(-60, -115); ctx.lineTo(-45, -140);
      ctx.moveTo(0, -120); ctx.lineTo(15, -145);
      ctx.moveTo(60, -100); ctx.lineTo(80, -125);
      ctx.moveTo(110, -60); ctx.lineTo(135, -85);

      ctx.stroke();
      ctx.shadowBlur = 0;

      // B. Electric Energy Pulses along Digital Contours & Starburst Flare Nodes
      const wirePulseOffset = (pulseAngle * 50) % 180;

      // Define static and dynamic starburst flare node positions matching the Digital Brain image flare points
      const flarePoints = [
        { x: -130, y: -80, color: '#00F0FF', secColor: '#B026FF' }, // Frontal Lobe flare
        { x: -40, y: -130, color: '#FFFFFF', secColor: '#00F0FF' }, // Parietal Lobe peak flare
        { x: 50, y: -110, color: '#00F0FF', secColor: '#B026FF' },  // Upper Cortex flare
        { x: 120, y: -45, color: '#FFFFFF', secColor: '#00F0FF' },  // Occipital flare
        { x: -90, y: 35, color: '#00F0FF', secColor: '#FF00AA' },   // Temporal Lobe flare
        { x: 80, y: 95, color: '#00FFFF', secColor: '#B026FF' },   // Cerebellum flare
      ];

      // Helper to draw 4-point Starburst Lens Flare (exact match to Digital Brain image flare nodes)
      const drawStarburst = (x: number, y: number, radius: number, alpha: number, mainColor: string, haloColor: string) => {
        ctx.save();
        ctx.translate(x, y);

        // Radial Halo
        const haloGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, radius * 3.5);
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')');
        haloGrad.addColorStop(0.3, mainColor);
        haloGrad.addColorStop(0.7, haloColor);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Starburst Cross Spikes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 12;

        // Main Cross Spikes
        const spikeLen = radius * 4.5 * alpha;
        ctx.beginPath();
        ctx.moveTo(-spikeLen, 0); ctx.lineTo(spikeLen, 0);
        ctx.moveTo(0, -spikeLen); ctx.lineTo(0, spikeLen);
        ctx.stroke();

        // Diagonal Minor Spikes
        const diagLen = spikeLen * 0.6;
        ctx.beginPath();
        ctx.moveTo(-diagLen, -diagLen); ctx.lineTo(diagLen, diagLen);
        ctx.moveTo(diagLen, -diagLen); ctx.lineTo(-diagLen, diagLen);
        ctx.stroke();

        // Bright Center Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      // Draw active Starburst Flares across the digital brain contour points
      flarePoints.forEach((fp, idx) => {
        const pMod = Math.sin(pulseAngle * 2.5 + idx * 1.2);
        const flareAlpha = 0.6 + 0.4 * Math.max(0, pMod);
        const flareSize = 4 + 3 * Math.max(0, pMod);
        drawStarburst(fp.x, fp.y, flareSize, flareAlpha, fp.color, fp.secColor);
      });

      // Energy Pulses traversing the digital wireframe
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-140 + wirePulseOffset * 1.2, -60 - Math.sin(wirePulseOffset * 0.05) * 40, 4, 0, Math.PI * 2);
      ctx.arc(-110 + wirePulseOffset * 1.1, -10 + Math.cos(wirePulseOffset * 0.04) * 35, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ----------------------------------------------------------------------
      // 3. MESOLIMBIC DOPAMINE PATHWAY (VTA -> Nucleus Accumbens -> Prefrontal)
      // ----------------------------------------------------------------------
      const vtaX = -15;
      const vtaY = 35;
      const accumbensX = -35;
      const accumbensY = 5;
      const prefrontalX = -110;
      const prefrontalY = -35;

      // Pathway Flow Line (Pulsing glowing trajectory inside brain)
      ctx.beginPath();
      ctx.moveTo(vtaX, vtaY);
      ctx.bezierCurveTo(accumbensX, accumbensY + 10, -60, -10, prefrontalX, prefrontalY);
      ctx.strokeStyle = '#FF0055';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#FF0055';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dopamine Surge Pulses traveling along pathway
      const surgeOffset = (pulseAngle * 40) % 120;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(vtaX - surgeOffset * 0.8, vtaY - surgeOffset * 0.6, 5, 0, Math.PI * 2);
      ctx.fill();

      // NUCLEUS ACCUMBENS (REWARD CORE) GLOWING SPOTLIGHT
      const pulseRadius = 16 + Math.sin(pulseAngle * 3) * 4;
      const accGrad = ctx.createRadialGradient(accumbensX, accumbensY, 2, accumbensX, accumbensY, pulseRadius * 2);
      accGrad.addColorStop(0, '#FFFFFF');
      accGrad.addColorStop(0.3, '#FF0066');
      accGrad.addColorStop(0.7, 'rgba(255, 0, 102, 0.5)');
      accGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = accGrad;
      ctx.beginPath();
      ctx.arc(accumbensX, accumbensY, pulseRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF0066';
      ctx.beginPath();
      ctx.arc(accumbensX, accumbensY, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // ----------------------------------------------------------------------
      // 4. ANATOMICAL REGION POINTER LABELS & CALLOUTS (Positioned cleanly)
      // ----------------------------------------------------------------------
      ctx.font = 'bold 10px monospace';
      ctx.lineWidth = 1.5;

      // Label 1: Nucleus Accumbens
      ctx.strokeStyle = '#FF0066';
      ctx.beginPath();
      ctx.moveTo(accumbensX, accumbensY);
      ctx.lineTo(accumbensX + 55, accumbensY + 45);
      ctx.lineTo(accumbensX + 110, accumbensY + 45);
      ctx.stroke();
      ctx.fillStyle = '#FF0066';
      ctx.textAlign = 'left';
      ctx.fillText('NUCLEUS ACCUMBENS', accumbensX + 60, accumbensY + 40);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText('(Dopamine Reward Center)', accumbensX + 60, accumbensY + 53);

      // Label 2: Prefrontal Cortex
      ctx.strokeStyle = '#00F0FF';
      ctx.beginPath();
      ctx.moveTo(prefrontalX, prefrontalY);
      ctx.lineTo(prefrontalX - 40, prefrontalY - 30);
      ctx.lineTo(prefrontalX - 90, prefrontalY - 30);
      ctx.stroke();
      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'right';
      ctx.fillText('PREFRONTAL CORTEX', prefrontalX - 45, prefrontalY - 34);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText('(Decision & Impulse Control)', prefrontalX - 45, prefrontalY - 21);

      // Label 3: Ventral Tegmental Area (VTA)
      ctx.strokeStyle = '#FFB800';
      ctx.beginPath();
      ctx.moveTo(vtaX, vtaY);
      ctx.lineTo(vtaX - 50, vtaY + 50);
      ctx.lineTo(vtaX - 90, vtaY + 50);
      ctx.stroke();
      ctx.fillStyle = '#FFB800';
      ctx.textAlign = 'right';
      ctx.fillText('VTA (Dopamine Factory)', vtaX - 55, vtaY + 46);

      // ----------------------------------------------------------------------
      // 5. DRAW DIGITAL SYNAPSING NODES (IMAGE 2 GLOWING CYAN NODES)
      // ----------------------------------------------------------------------
      neurons.forEach((neuron) => {
        // Draw Dendrite Branches
        ctx.strokeStyle = neuron.activation > 0 ? 'rgba(0, 240, 255, 0.95)' : 'rgba(0, 200, 255, 0.35)';
        ctx.lineWidth = 1;
        neuron.dendrites.forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        });

        // Draw Axon Extension
        ctx.strokeStyle = neuron.activation > 0 ? '#FF0055' : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(neuron.x, neuron.y);
        ctx.lineTo(neuron.axonTip.x, neuron.axonTip.y);
        ctx.stroke();

        // Draw Glowing Synaptic Node (Image 2 Style)
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.activation > 0 ? 5 : 3, 0, Math.PI * 2);
        if (neuron.activation > 0) {
          ctx.fillStyle = '#00FF88';
          ctx.shadowColor = '#00FF88';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#00F0FF';
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 6;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (neuron.activation > 0) {
          neuron.activation -= 0.02;
        }
      });

      ctx.restore(); // End brain translation matrix

      // ----------------------------------------------------------------------
      // 6. ANIMATE FLYING NOTIFICATION BADGES STRAIGHT TO REWARD CORE
      // ----------------------------------------------------------------------
      const targetBrainX = cx - 35; // Accumbens X
      const targetBrainY = cy + 5;  // Accumbens Y

      for (let i = flyingTriggersRef.current.length - 1; i >= 0; i--) {
        const ft = flyingTriggersRef.current[i];
        ft.progress += ft.speed;

        // Curved Bezier trajectory into the brain cross-section core
        const controlX = (ft.startX + targetBrainX) / 2 + (ft.startX < cx ? -70 : 70);
        const controlY = Math.min(ft.startY, targetBrainY) - 110;

        const t = ft.progress;
        // Quadratic Bezier point
        const currX = (1 - t) * (1 - t) * ft.startX + 2 * (1 - t) * t * controlX + t * t * targetBrainX;
        const currY = (1 - t) * (1 - t) * ft.startY + 2 * (1 - t) * t * controlY + t * t * targetBrainY;

        // Draw Glowing Trailing Beam
        ctx.beginPath();
        ctx.moveTo(ft.startX, ft.startY);
        ctx.quadraticCurveTo(controlX, controlY, currX, currY);
        ctx.strokeStyle = ft.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Floating Notification Badge Pill
        ctx.save();
        ctx.translate(currX, currY);

        // High Contrast Badge Container
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.strokeStyle = ft.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 18;

        const badgeText = `${ft.icon} ${ft.text}`;
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(badgeText).width;
        const pillW = textWidth + 28;
        const pillH = 32;

        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // White bold notification text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, 0, 1);

        ctx.restore();

        // On Arrival at Brain Reward Center
        if (ft.progress >= 1) {
          // Trigger Shockwave
          shockwavesRef.current.push({
            x: targetBrainX,
            y: targetBrainY,
            radius: 5,
            maxRadius: 200,
            opacity: 0.95,
            color: ft.color,
          });

          // Fire Neural Action Potentials across all neurons
          neurons.forEach((n) => {
            n.activation = 1;
          });

          // Spawn Dopamine Particle Release
          for (let p = 0; p < 14; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            dopamineParticlesRef.current.push({
              x: targetBrainX,
              y: targetBrainY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1.5,
              alpha: 1,
              text: p % 3 === 0 ? '+DOPAMINE!' : '⚡',
              color: ft.color,
            });
          }

          if (onImpact) {
            onImpact(ft.text);
          }

          flyingTriggersRef.current.splice(i, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 7. ANIMATE SHOCKWAVES & DOPAMINE NEUROTRANSMITTER SURGE
      // ----------------------------------------------------------------------
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 4.5;
        sw.opacity -= 0.02;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.opacity);
        ctx.lineWidth = 3;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // Animate Dopamine Particle Floaters
      for (let i = dopamineParticlesRef.current.length - 1; i >= 0; i--) {
        const dp = dopamineParticlesRef.current[i];
        dp.x += dp.vx;
        dp.y += dp.vy;
        dp.alpha -= 0.02;

        ctx.save();
        ctx.globalAlpha = Math.max(0, dp.alpha);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = dp.color;
        ctx.shadowColor = dp.color;
        ctx.shadowBlur = 10;
        ctx.fillText(dp.text, dp.x, dp.y);
        ctx.restore();

        if (dp.alpha <= 0) {
          dopamineParticlesRef.current.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onImpact]);

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none z-0" />;
};
