import React, { useEffect, useRef, useState } from 'react';

export type AvatarStyle = 'realistic' | 'contrast' | 'holographic';

interface Avatar3DViewProps {
  activeSign: string;
  isPlaying: boolean;
  highContrast: boolean;
  speed: number;
  avatarStyle?: AvatarStyle;
  focusMode?: boolean;
}

export const Avatar3DView: React.FC<Avatar3DViewProps> = ({
  activeSign,
  isPlaying,
  highContrast,
  speed,
  avatarStyle = 'realistic',
  focusMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<string>('GRAVE');

  useEffect(() => {
    const s = (activeSign || 'MÚSICA').toUpperCase().trim();
    if (s.includes('GRAVE') || s.includes('BAIXO') || s.includes('SUB')) setCurrentGesture('GRAVE');
    else if (s.includes('SENTIR') || s.includes('EMOÇÃO') || s.includes('SENTIMENTO')) setCurrentGesture('SENTIR');
    else if (s.includes('CORAÇÃO') || s.includes('CORACAO') || s.includes('AMOR')) setCurrentGesture('CORAÇÃO');
    else if (s.includes('PEITO') || s.includes('CORPO') || s.includes('FUNDO')) setCurrentGesture('PEITO');
    else if (s.includes('LUZ') || s.includes('NEON') || s.includes('BRILHO') || s.includes('CLARO')) setCurrentGesture('LUZ');
    else if (s.includes('VIBRA') || s.includes('ONDA') || s.includes('RESSOAR')) setCurrentGesture('VIBRAÇÃO');
    else if (s.includes('LIBERDADE') || s.includes('LIVRE') || s.includes('VOAR')) setCurrentGesture('LIBERDADE');
    else if (s.includes('DANÇA') || s.includes('DANCA') || s.includes('FESTA') || s.includes('ALEGRIA')) setCurrentGesture('DANÇA');
    else if (s.includes('FORÇA') || s.includes('FORCA') || s.includes('ENERGIA') || s.includes('POTÊNCIA')) setCurrentGesture('FORÇA');
    else if (s.includes('COMEÇAR') || s.includes('INÍCIO') || s.includes('LOCAL') || s.includes('APARELHO')) setCurrentGesture('INÍCIO');
    else if (s.includes('FINAL') || s.includes('PAZ') || s.includes('SILÊNCIO') || s.includes('FIM')) setCurrentGesture('FINAL');
    else if (s.includes('MÚSICA') || s.includes('MUSICA') || s.includes('SOM') || s.includes('OUVIR') || s.includes('CANTAR') || s.includes('MELODIA')) setCurrentGesture('MÚSICA');
    else setCurrentGesture('RITMO');
  }, [activeSign]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.035 * (isPlaying ? speed : 0.3);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Camera transformation
      ctx.save();
      const centerX = w / 2;
      const centerY = h * 0.52;

      if (focusMode) {
        // Zoom on face and upper chest/hands
        ctx.translate(centerX, centerY - 25);
        ctx.scale(1.35, 1.35);
        ctx.translate(-centerX, -(centerY - 25));
      }

      // 1. PROFESSIONAL ACCESSIBILITY BROADCAST STUDIO BACKGROUND
      // Deep dark slate/charcoal with subtle cyan-purple rim vignette (WCAG high contrast standards for Libras broadcasting)
      const bgGrad = ctx.createRadialGradient(centerX, centerY - 60, 50, centerX, centerY, w * 0.7);
      if (avatarStyle === 'holographic') {
        bgGrad.addColorStop(0, '#0a1926');
        bgGrad.addColorStop(1, '#02070c');
      } else {
        bgGrad.addColorStop(0, '#1c1b24');
        bgGrad.addColorStop(0.5, '#121218');
        bgGrad.addColorStop(1, '#09090d');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft studio rim light beam
      const beamGrad = ctx.createLinearGradient(centerX - 160, 0, centerX + 160, h);
      beamGrad.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
      beamGrad.addColorStop(0.5, 'rgba(255, 75, 137, 0.03)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. PALETTE & HUMAN SHADING (Warm expressive skin tones with dark professional blazer for high hand-contrast)
      const isHolo = avatarStyle === 'holographic';
      const skinBase = isHolo ? '#244e66' : '#c68d69'; // Warm golden-brown skin
      const skinShadow = isHolo ? '#122c3b' : '#9e6745';
      const skinHighlight = isHolo ? '#4585a8' : '#e4ad89';
      const hairColor = isHolo ? '#0b1d28' : '#1f1b1a';
      const clothingColor = isHolo ? '#09151e' : '#1b2230'; // Dark navy blazer (mandatory broadcast standard)
      const clothingAccent = isHolo ? '#00f2fe' : '#2b364a';

      // 3. HUMAN TORSO & CLOTHING (Professional Blazer with Lapels)
      ctx.save();

      // Shoulders & Torso silhouette
      ctx.beginPath();
      ctx.moveTo(centerX - 85, centerY + 45); // Left shoulder
      ctx.bezierCurveTo(centerX - 55, centerY + 15, centerX - 35, centerY + 10, centerX - 20, centerY - 2); // Left neck base
      ctx.lineTo(centerX + 20, centerY - 2); // Right neck base
      ctx.bezierCurveTo(centerX + 35, centerY + 10, centerX + 55, centerY + 15, centerX + 85, centerY + 45); // Right shoulder
      ctx.lineTo(centerX + 70, centerY + 140); // Right waist
      ctx.lineTo(centerX - 70, centerY + 140); // Left waist
      ctx.closePath();

      const suitGrad = ctx.createLinearGradient(centerX - 80, centerY, centerX + 80, centerY + 130);
      suitGrad.addColorStop(0, clothingColor);
      suitGrad.addColorStop(0.5, '#141822');
      suitGrad.addColorStop(1, '#0e1118');
      ctx.fillStyle = suitGrad;
      ctx.fill();

      // Blazer lapels (V-neck opening showing inner dark shirt)
      ctx.beginPath();
      ctx.moveTo(centerX - 24, centerY);
      ctx.lineTo(centerX, centerY + 65);
      ctx.lineTo(centerX + 24, centerY);
      ctx.fillStyle = '#0f1218';
      ctx.fill();

      // Left & Right lapel folds
      ctx.strokeStyle = clothingAccent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 24, centerY);
      ctx.lineTo(centerX - 8, centerY + 68);
      ctx.lineTo(centerX - 35, centerY + 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + 24, centerY);
      ctx.lineTo(centerX + 8, centerY + 68);
      ctx.lineTo(centerX + 35, centerY + 95);
      ctx.stroke();

      // Tactile Resonant Sternum Indicator (Glows gently with the bass)
      if (isPlaying) {
        const chestPulse = 18 + Math.sin(t * 3.8) * 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 42, chestPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 4. NECK & CLAVICLES
      ctx.beginPath();
      ctx.moveTo(centerX - 16, centerY - 28);
      ctx.lineTo(centerX - 19, centerY + 6);
      ctx.lineTo(centerX + 19, centerY + 6);
      ctx.lineTo(centerX + 16, centerY - 28);
      ctx.closePath();
      const neckGrad = ctx.createLinearGradient(centerX - 15, centerY - 25, centerX + 15, centerY);
      neckGrad.addColorStop(0, skinHighlight);
      neckGrad.addColorStop(0.5, skinBase);
      neckGrad.addColorStop(1, skinShadow);
      ctx.fillStyle = neckGrad;
      ctx.fill();

      // Subtle shadow under chin
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 26, 15, 6, 0, 0, Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // 5. HUMAN HEAD & EXPRESSIVE FACE (Marcas Não-Manuais de Libras)
      const headY = centerY - 58;
      const headRadiusX = 27;
      const headRadiusY = 35;

      // Head shape with soft jawline
      ctx.beginPath();
      ctx.ellipse(centerX, headY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
      const faceGrad = ctx.createRadialGradient(centerX - 8, headY - 8, 8, centerX, headY, 36);
      faceGrad.addColorStop(0, skinHighlight);
      faceGrad.addColorStop(0.6, skinBase);
      faceGrad.addColorStop(1, skinShadow);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      // Subtle warm blush on cheeks
      ctx.beginPath();
      ctx.ellipse(centerX - 14, headY + 5, 8, 5, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 100, 100, 0.15)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 14, headY + 5, 8, 5, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 100, 100, 0.15)';
      ctx.fill();

      // --- BEAUTIFUL HUMAN HAIR (Modern elegant parted style) ---
      ctx.beginPath();
      ctx.moveTo(centerX - 29, headY - 10);
      ctx.bezierCurveTo(centerX - 35, headY - 44, centerX + 35, headY - 44, centerX + 29, headY - 10);
      ctx.bezierCurveTo(centerX + 32, headY + 15, centerX + 28, headY + 28, centerX + 23, headY + 32);
      ctx.bezierCurveTo(centerX + 18, headY - 18, centerX - 18, headY - 18, centerX - 23, headY + 32);
      ctx.bezierCurveTo(centerX - 28, headY + 28, centerX - 32, headY + 15, centerX - 29, headY - 10);
      ctx.closePath();
      const hairGrad = ctx.createLinearGradient(centerX - 30, headY - 40, centerX + 30, headY + 20);
      hairGrad.addColorStop(0, hairColor);
      hairGrad.addColorStop(0.4, '#382b26');
      hairGrad.addColorStop(1, '#181412');
      ctx.fillStyle = hairGrad;
      ctx.fill();

      // Hair strands highlight
      ctx.beginPath();
      ctx.moveTo(centerX - 15, headY - 32);
      ctx.bezierCurveTo(centerX - 5, headY - 36, centerX + 15, headY - 28, centerX + 22, headY - 12);
      ctx.strokeStyle = 'rgba(200, 160, 130, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // --- EXPRESSIVE EYES (Human almond shape with realistic blinking & gaze tracking) ---
      const blinkCycle = Math.sin(t * 0.85);
      const isBlinking = blinkCycle > 0.94;
      const eyeOpenHeight = isBlinking ? 0.8 : 4.5;
      const eyeY = headY - 3;

      // Draw human eye helper
      const drawHumanEye = (ex: number, ey: number, isRight: boolean) => {
        // Eye socket shadow
        ctx.beginPath();
        ctx.ellipse(ex, ey - 2, 7, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fill();

        // White Sclera
        ctx.beginPath();
        ctx.ellipse(ex, ey, 6.5, eyeOpenHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f8f8fb';
        ctx.fill();
        ctx.strokeStyle = 'rgba(60, 40, 30, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (!isBlinking) {
          // Iris (Warm expressive amber/brown)
          ctx.beginPath();
          ctx.arc(ex + (isRight ? 0.3 : -0.3), ey, 3, 0, Math.PI * 2);
          ctx.fillStyle = isHolo ? '#00f2fe' : '#452b1b';
          ctx.fill();

          // Pupil
          ctx.beginPath();
          ctx.arc(ex + (isRight ? 0.3 : -0.3), ey, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#0a0807';
          ctx.fill();

          // Specular light catch reflection (gives life to the eyes!)
          ctx.beginPath();
          ctx.arc(ex - 1, ey - 1, 1, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        // Eyelash contour
        ctx.beginPath();
        ctx.arc(ex, ey - 1, 6, Math.PI + 0.3, Math.PI * 2 - 0.3);
        ctx.strokeStyle = '#221814';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      };

      drawHumanEye(centerX - 12, eyeY, false);
      drawHumanEye(centerX + 12, eyeY, true);

      // --- HIGH-VISIBILITY EXPRESSIVE EYEBROWS (Marcas Não-Manuais) ---
      // Crucial for Libras: Raised for questioning/melody, furrowed for bass weight & grammar intensity
      const isFurrowed = currentGesture === 'GRAVE' || currentGesture === 'PEITO';
      const browTilt = isFurrowed ? 3.2 : -1.8;
      const browBaseY = headY - 11;

      // Left Eyebrow (Arching smoothly)
      ctx.beginPath();
      ctx.moveTo(centerX - 19, browBaseY + browTilt);
      ctx.quadraticCurveTo(centerX - 12, browBaseY - 3 - (isFurrowed ? 0 : 2), centerX - 5, browBaseY - 1 - browTilt);
      ctx.strokeStyle = '#1e1612';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Right Eyebrow
      ctx.beginPath();
      ctx.moveTo(centerX + 5, browBaseY - 1 - browTilt);
      ctx.quadraticCurveTo(centerX + 12, browBaseY - 3 - (isFurrowed ? 0 : 2), centerX + 19, browBaseY + browTilt);
      ctx.strokeStyle = '#1e1612';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // --- NOSE ---
      ctx.beginPath();
      ctx.moveTo(centerX, headY - 1);
      ctx.lineTo(centerX - 1.5, headY + 11);
      ctx.lineTo(centerX + 2.5, headY + 11.5);
      ctx.strokeStyle = 'rgba(120, 70, 45, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // --- EXPRESSIVE MOUTH (Lips articulate sign words) ---
      const mouthY = headY + 20;
      const mouthOpen = 1.5 + Math.abs(Math.sin(t * 2.6)) * 3;

      // Upper lip
      ctx.beginPath();
      ctx.moveTo(centerX - 8, mouthY);
      ctx.quadraticCurveTo(centerX, mouthY - 2.5, centerX + 8, mouthY);
      ctx.strokeStyle = isHolo ? '#00f2fe' : '#9c544e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mouth opening (morpheme)
      ctx.beginPath();
      ctx.ellipse(centerX, mouthY + mouthOpen * 0.4, 6, mouthOpen * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a2323';
      ctx.fill();

      // Lower lip
      ctx.beginPath();
      ctx.moveTo(centerX - 7, mouthY + 1);
      ctx.quadraticCurveTo(centerX, mouthY + 4 + mouthOpen * 0.5, centerX + 7, mouthY + 1);
      ctx.strokeStyle = isHolo ? '#6ff6ff' : '#a85f57';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 6. ANATOMICALLY CLEAR HUMAN ARMS & HANDS (Fingers 100% Legible for Libras)
      let rightX = centerX + 25;
      let rightY = centerY + 20;
      let leftX = centerX - 45;
      let leftY = centerY + 30;
      let config: 'B_FLAT' | 'OPEN_5' | 'MIDDLE_TOUCH' | 'FIST_A' = 'OPEN_5';

      // Specific Libras Phonological Choreography
      if (currentGesture === 'GRAVE') {
        // Dominant right hand in flat 'B' firmly oscillating over the upper chest (peito/esterno)
        rightX = centerX + 12 + Math.sin(t * 14) * 3;
        rightY = centerY + 30 + Math.cos(t * 14) * 2;
        leftX = centerX - 55 + Math.sin(t * 1.8) * 4;
        leftY = centerY + 50;
        config = 'B_FLAT';
      } else if (currentGesture === 'SENTIR') {
        // Hand in '25' with middle finger touching the cardiac center
        rightX = centerX - 4 + Math.sin(t * 2) * 3;
        rightY = centerY + 28;
        leftX = centerX - 52;
        leftY = centerY + 45;
        config = 'MIDDLE_TOUCH';
      } else if (currentGesture === 'CORAÇÃO') {
        // Double pulse on left heart region
        const beatPop = Math.sin(t * 4) > 0.45 ? 6 : 0;
        rightX = centerX - 16 + beatPop;
        rightY = centerY + 28;
        leftX = centerX - 48;
        leftY = centerY + 52;
        config = 'MIDDLE_TOUCH';
      } else if (currentGesture === 'PEITO') {
        // Flat hand contacting chest
        rightX = centerX + 20;
        rightY = centerY + 35;
        leftX = centerX - 56;
        leftY = centerY + 40;
        config = 'B_FLAT';
      } else if (currentGesture === 'LUZ') {
        // Hand blooms open upward into 3D space
        rightX = centerX + 30 + Math.sin(t * 2) * 18;
        rightY = centerY - 15 - Math.abs(Math.sin(t * 2)) * 25;
        leftX = centerX - 40 + Math.cos(t * 2) * 15;
        leftY = centerY + 10;
        config = 'OPEN_5';
      } else if (currentGesture === 'LIBERDADE') {
        // Hands soaring outwards in bilateral expansion
        rightX = centerX + 45 + Math.sin(t * 2.5) * 20;
        rightY = centerY - 5 + Math.cos(t * 2.5) * 15;
        leftX = centerX - 60 - Math.sin(t * 2.5) * 20;
        leftY = centerY - 5 + Math.cos(t * 2.5) * 15;
        config = 'OPEN_5';
      } else if (currentGesture === 'DANÇA') {
        // Bouncy alternating rhythmic sway
        rightX = centerX + 25 + Math.sin(t * 4) * 25;
        rightY = centerY + 15 + Math.cos(t * 4) * 18;
        leftX = centerX - 35 - Math.sin(t * 4) * 25;
        leftY = centerY + 35 - Math.cos(t * 4) * 18;
        config = 'OPEN_5';
      } else if (currentGesture === 'FORÇA') {
        // Both hands in power fists
        rightX = centerX + 35;
        rightY = centerY + 10 + Math.sin(t * 3) * 6;
        leftX = centerX - 45;
        leftY = centerY + 10 + Math.sin(t * 3) * 6;
        config = 'FIST_A';
      } else if (currentGesture === 'INÍCIO') {
        // Open hands presenting forward
        rightX = centerX + 25 + Math.sin(t * 2) * 10;
        rightY = centerY + 25;
        leftX = centerX - 35 - Math.sin(t * 2) * 10;
        leftY = centerY + 25;
        config = 'B_FLAT';
      } else if (currentGesture === 'FINAL') {
        // Peaceful crossed release over heart
        rightX = centerX - 5;
        rightY = centerY + 38;
        leftX = centerX + 5;
        leftY = centerY + 42;
        config = 'B_FLAT';
      } else if (currentGesture === 'VIBRAÇÃO') {
        // Rapid bilateral pulsation
        rightX = centerX + 30 + Math.sin(t * 16) * 5;
        rightY = centerY + 20 + Math.cos(t * 16) * 4;
        leftX = centerX - 45 - Math.sin(t * 16) * 5;
        leftY = centerY + 20 - Math.cos(t * 16) * 4;
        config = 'OPEN_5';
      } else {
        // MÚSICA & RITMO: Beautiful bilateral sweeping wave in open '5'
        rightX = centerX + 28 + Math.cos(t * 2.6) * 35;
        rightY = centerY + 8 + Math.sin(t * 3.0) * 28;
        leftX = centerX - 48 + Math.sin(t * 2.2) * 28;
        leftY = centerY + 25 + Math.cos(t * 2.5) * 22;
        config = 'OPEN_5';
      }

      // --- SLEEVES & FOREARMS ---
      // Left Arm
      const leftShoulderX = centerX - 78;
      const leftShoulderY = centerY + 38;
      const leftElbowX = leftShoulderX - 22 + (leftX - leftShoulderX) * 0.42;
      const leftElbowY = leftShoulderY + 45;

      // Sleeve
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbowX, leftElbowY);
      ctx.strokeStyle = clothingColor;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Forearm
      ctx.beginPath();
      ctx.moveTo(leftElbowX, leftElbowY);
      ctx.lineTo(leftX, leftY);
      ctx.strokeStyle = skinBase;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Right Arm (Dominant Sign Hand)
      const rightShoulderX = centerX + 78;
      const rightShoulderY = centerY + 38;
      const rightElbowX = rightShoulderX + 22 + (rightX - rightShoulderX) * 0.42;
      const rightElbowY = rightShoulderY + 48;

      // Sleeve
      ctx.beginPath();
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rightElbowX, rightElbowY);
      ctx.strokeStyle = clothingColor;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Forearm
      ctx.beginPath();
      ctx.moveTo(rightElbowX, rightElbowY);
      ctx.lineTo(rightX, rightY);
      ctx.strokeStyle = skinBase;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.stroke();

      // --- DETAILED ANATOMICAL HUMAN HANDS (Clearly legible 5 fingers & joints) ---
      const drawClearHumanHand = (
        hx: number,
        hy: number,
        isRight: boolean,
        handConfig: 'B_FLAT' | 'OPEN_5' | 'MIDDLE_TOUCH' | 'FIST_A'
      ) => {
        ctx.save();
        ctx.translate(hx, hy);

        const handScale = 1.05; // Slightly enhanced scale for maximum video visibility
        ctx.scale(handScale, handScale);

        // Palm base with thenar muscle definition
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 13, isRight ? -0.2 : 0.2, 0, Math.PI * 2);
        const palmGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
        palmGrad.addColorStop(0, skinHighlight);
        palmGrad.addColorStop(0.7, skinBase);
        palmGrad.addColorStop(1, skinShadow);
        ctx.fillStyle = palmGrad;
        ctx.fill();

        // High contrast outline around the hand so fingers pop against dark clothing!
        ctx.strokeStyle = isHolo ? '#00f2fe' : 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // DRAW 5 ARTICULATED FINGERS
        // Index [1], Middle [2], Ring [3], Little [4], Thumb [0]
        const fingerData = [
          { name: 'Thumb', baseAngle: isRight ? -2.3 : -0.8, len: 15, width: 4.8 },
          { name: 'Index', baseAngle: isRight ? -1.7 : -1.4, len: 21, width: 4.2 },
          { name: 'Middle', baseAngle: isRight ? -1.45 : -1.65, len: 23, width: 4.3 },
          { name: 'Ring', baseAngle: isRight ? -1.2 : -1.9, len: 20, width: 4.1 },
          { name: 'Little', baseAngle: isRight ? -0.95 : -2.15, len: 17, width: 3.8 },
        ];

        fingerData.forEach((finger, idx) => {
          let fLen = finger.len;
          let fAngle = finger.baseAngle;

          // Adjust based on Libras configuration
          if (handConfig === 'B_FLAT') {
            // Flat 'B': fingers 1-4 held parallel tightly together, thumb folded across palm
            if (idx === 0) {
              // Thumb tucked across
              fAngle = isRight ? -0.8 : -2.3;
              fLen = 11;
            } else {
              // Four fingers straight up together
              fAngle = isRight ? -1.5 : -1.6;
              fLen = idx === 2 ? 22 : idx === 1 ? 20 : idx === 3 ? 19 : 16;
            }
          } else if (handConfig === 'MIDDLE_TOUCH') {
            // '25' Touch: Middle finger curved/extended toward chest, other fingers relaxed
            if (idx === 2) {
              fLen = 25; // Middle finger prominent
              fAngle = isRight ? -1.45 : -1.65;
            } else if (idx === 0) {
              fLen = 12;
            } else {
              fLen = 13; // Others gently curved
            }
          } else {
            // OPEN_5: All 5 fingers spread wide apart (maximum visibility)
            fLen = finger.len * 1.1;
          }

          // Compute joint positions (Proximal, Knuckle, Distal Phalanx)
          const p1X = Math.cos(fAngle) * (fLen * 0.5);
          const p1Y = Math.sin(fAngle) * (fLen * 0.5);
          const tipX = Math.cos(fAngle) * fLen;
          const tipY = Math.sin(fAngle) * fLen;

          // Finger segment
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p1X, p1Y);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = skinBase;
          ctx.lineWidth = finger.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Clear outer highlight line for individual finger separation
          ctx.strokeStyle = isHolo ? '#00f2fe' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Knuckle fold & Fingertip highlight
          ctx.beginPath();
          ctx.arc(tipX, tipY, finger.width * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = skinHighlight;
          ctx.fill();
        });

        // Ambient glow ring on dominant signing hand
        if (isRight && isPlaying) {
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      };

      // Draw both hands (Left supportive hand, Right dominant active signing hand)
      drawClearHumanHand(leftX, leftY, false, config);
      drawClearHumanHand(rightX, rightY, true, config);

      ctx.restore(); // end avatar drawing

      ctx.restore(); // end camera

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, highContrast, speed, activeSign, avatarStyle, focusMode, currentGesture]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0c0c10] select-none">
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        className="w-full h-full object-contain"
      />

      {/* Floating HUD status */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-cyan-500/30 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="text-[10px] font-mono text-cyan-300 font-extrabold uppercase tracking-wider">
          Intérprete 3D • Sinal: {currentGesture}
        </span>
      </div>
    </div>
  );
};
