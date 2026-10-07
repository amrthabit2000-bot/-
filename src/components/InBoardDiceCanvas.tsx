import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GamePhase, Player } from '../types/tawla';
import { toArabicDigits } from '../utils/rules31';
import { sound } from '../utils/audio';
import { aiDiceEngine } from '../utils/aiDiceEngine';

interface InBoardDiceCanvasProps {
  phase: GamePhase;
  turn: Player;
  roll: [number, number] | null;
  initialRoll: [number, number] | null;
  initialRollStep?: 'white' | 'black' | 'done';
  initialWhiteDie?: number | null;
  initialBlackDie?: number | null;
  remainingDice: number[];
  isRolling: boolean;
  onRollComplete: (result: [number, number]) => void;
  isAiTurn: boolean;
  isSpectator?: boolean;
  selectedDie?: number | null;
  onSelectDie?: (die: number | null) => void;
  diceStyle?: string;
}

type Vec3 = [number, number, number];

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const norm = (v: Vec3): Vec3 => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
};

// True Solid Rigid Body 3D Cube Die with fixed, immutable faces (1 opposite 6, 2 opposite 5, 3 opposite 4)
// High-Fidelity Porcelain White Resin with Rounded Bevel Corners & Drilled 3D Pips
class Physical3DDie {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  vx: number = 0;
  vy: number = 0;
  vz: number = 0;

  // 3D Orthonormal Basis
  uX: Vec3 = [1, 0, 0];
  uY: Vec3 = [0, 1, 0];
  uZ: Vec3 = [0, 0, 1];

  // 3D Angular Velocity
  wx: number = 0;
  wy: number = 0;
  wz: number = 0;

  size: number = 48;
  halfSize: number = 24;
  isRolling: boolean = false;
  isUsed: boolean = false;

  minX: number = 0;
  maxX: number = 0;
  minY: number = 0;
  maxY: number = 0;

  currentFrame: number = 0;
  maxFrames: number = 45; // ~0.75 seconds snappy roll
  wallHits: number = 0;

  // Realistic rolling motion trail & settle radiance
  trail: Array<{ x: number; y: number; z: number; alpha: number }> = [];
  settleGlow: number = 0;

  // Adaptive learned parameters
  feltFriction: number = 0.965;
  wallRestitution: number = 0.58;
  angularDamping: number = 0.960;

  constructor(x: number, y: number, size: number = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.halfSize = size / 2;
  }

  setBounds(minX: number, maxX: number, minY: number, maxY: number) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  setRestingFace(faceVal: number) {
    switch (faceVal) {
      case 1:
        this.uX = [1, 0, 0];
        this.uY = [0, 1, 0];
        this.uZ = [0, 0, 1];
        break;
      case 6:
        this.uX = [1, 0, 0];
        this.uY = [0, -1, 0];
        this.uZ = [0, 0, -1];
        break;
      case 2:
        this.uX = [0, 0, 1];
        this.uY = [0, 1, 0];
        this.uZ = [-1, 0, 0];
        break;
      case 5:
        this.uX = [0, 0, -1];
        this.uY = [0, 1, 0];
        this.uZ = [1, 0, 0];
        break;
      case 3:
        this.uX = [1, 0, 0];
        this.uY = [0, 0, 1];
        this.uZ = [0, -1, 0];
        break;
      case 4:
        this.uX = [1, 0, 0];
        this.uY = [0, 0, -1];
        this.uZ = [0, 1, 0];
        break;
      default:
        break;
    }

    // Natural slight resting tilt
    const tilt = 0.04;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const oldX = this.uX;
    const oldY = this.uY;
    this.uX = [oldX[0] * cosT - oldY[0] * sinT, oldX[1] * cosT - oldY[1] * sinT, oldX[2] * cosT - oldY[2] * sinT];
    this.uY = [oldX[0] * sinT + oldY[0] * cosT, oldX[1] * sinT + oldY[1] * cosT, oldX[2] * sinT + oldY[2] * cosT];

    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.wx = 0;
    this.wy = 0;
    this.wz = 0;
    this.isRolling = false;
  }

  tossWithAIVectors(
    startX: number,
    startY: number,
    vectors: {
      vx: number;
      vy: number;
      vz: number;
      wx: number;
      wy: number;
      wz: number;
      friction: number;
      wallRestitution: number;
      angularDamping: number;
    }
  ) {
    this.x = startX;
    this.y = startY;
    this.z = 16 + Math.random() * 8;
    this.currentFrame = 0;
    this.wallHits = 0;

    this.vx = vectors.vx;
    this.vy = vectors.vy;
    this.vz = vectors.vz;
    this.wx = vectors.wx;
    this.wy = vectors.wy;
    this.wz = vectors.wz;

    this.feltFriction = vectors.friction;
    this.wallRestitution = vectors.wallRestitution;
    this.angularDamping = vectors.angularDamping;

    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 2;
    this.uX = norm([Math.cos(a), Math.sin(a), Math.sin(b)]);
    this.uY = norm(cross([0, 0, 1], this.uX));
    this.uZ = norm(cross(this.uX, this.uY));

    this.trail = [];
    this.settleGlow = 0;
    this.isRolling = true;
  }

  update(): { hitWall: boolean; hitFloor: boolean; x: number; y: number; speed: number; isRolling: boolean } {
    if (!this.isRolling) {
      if (this.settleGlow > 0.01) {
        this.settleGlow *= 0.88;
      } else {
        this.settleGlow = 0;
      }
      return { hitWall: false, hitFloor: false, x: this.x, y: this.y, speed: 0, isRolling: false };
    }

    this.currentFrame++;
    let hitWall = false;
    let hitFloor = false;

    // Track motion blur velocity trail
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 1.2 || Math.abs(this.vz) > 0.6) {
      this.trail.unshift({
        x: this.x,
        y: this.y - this.z * 0.35,
        z: this.z,
        alpha: 0.65,
      });
      if (this.trail.length > 7) {
        this.trail.pop();
      }
    }
    this.trail.forEach((pt) => {
      pt.alpha *= 0.82;
    });

    // 1. Move position
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    // 2. Gravity
    this.vz -= 0.65;

    // 3. Table floor bounce
    if (this.z <= 0) {
      this.z = 0;
      if (this.vz < -0.9) {
        this.vz = -this.vz * 0.35;
        sound.playDiceWoodImpact(false);
        hitFloor = true;
      } else {
        this.vz = 0;
      }
    }

    // 4. Wooden wall ricochets
    const half = this.halfSize + 2;
    if (this.x - half < this.minX) {
      this.x = this.minX + half;
      this.vx = Math.abs(this.vx) * this.wallRestitution;
      this.wz += (Math.random() - 0.5) * 0.2;
      this.wallHits++;
      hitWall = true;
      sound.playDiceWoodImpact(false);
    } else if (this.x + half > this.maxX) {
      this.x = this.maxX - half;
      this.vx = -Math.abs(this.vx) * this.wallRestitution;
      this.wz += (Math.random() - 0.5) * 0.2;
      this.wallHits++;
      hitWall = true;
      sound.playDiceWoodImpact(false);
    }

    if (this.y - half < this.minY) {
      this.y = this.minY + half;
      this.vy = Math.abs(this.vy) * this.wallRestitution;
      this.wz += (Math.random() - 0.5) * 0.2;
      this.wallHits++;
      hitWall = true;
      sound.playDiceWoodImpact(false);
    } else if (this.y + half > this.maxY) {
      this.y = this.maxY - half;
      this.vy = -Math.abs(this.vy) * this.wallRestitution;
      this.wz += (Math.random() - 0.5) * 0.2;
      this.wallHits++;
      hitWall = true;
      sound.playDiceWoodImpact(false);
    }

    // 5. 3D Angular step
    const W: Vec3 = [this.wx, this.wy, this.wz];
    const rotSpeed = Math.sqrt(dot(W, W));
    if (rotSpeed > 0.0001) {
      const dX = cross(W, this.uX);
      const dY = cross(W, this.uY);

      this.uX = norm([this.uX[0] + dX[0], this.uX[1] + dX[1], this.uX[2] + dX[2]]);
      this.uY = norm([this.uY[0] + dY[0], this.uY[1] + dY[1], this.uY[2] + dY[2]]);
      const proj = dot(this.uX, this.uY);
      this.uY = norm([this.uY[0] - this.uX[0] * proj, this.uY[1] - this.uX[1] * proj, this.uY[2] - this.uX[2] * proj]);
      this.uZ = norm(cross(this.uX, this.uY));
    }

    // 6. Progressive deceleration using learned AI friction and damping
    if (this.currentFrame < 28) {
      this.vx *= this.feltFriction;
      this.vy *= this.feltFriction;
      this.wx *= this.angularDamping;
      this.wy *= this.angularDamping;
      this.wz *= this.angularDamping;
    } else if (this.currentFrame < 38) {
      this.vx *= this.feltFriction * 0.89;
      this.vy *= this.feltFriction * 0.89;
      this.wx *= this.angularDamping * 0.86;
      this.wy *= this.angularDamping * 0.86;
      this.wz *= this.angularDamping * 0.86;
    } else {
      this.vx *= 0.65;
      this.vy *= 0.65;
      this.wx *= 0.6;
      this.wy *= 0.6;
      this.wz *= 0.6;
    }

    // Finish at maxFrames
    if (this.currentFrame >= this.maxFrames) {
      const winningFace = this.getTopFace();
      this.setRestingFace(winningFace);
      this.isRolling = false;
      this.settleGlow = 0.95;
      this.vx = 0;
      this.vy = 0;
      this.vz = 0;
      this.wx = 0;
      this.wy = 0;
      this.wz = 0;
      this.z = 0;
      this.trail = [];
    }

    return { hitWall, hitFloor, x: this.x, y: this.y + this.halfSize * 0.6, speed, isRolling: this.isRolling };
  }

  getTopFace(): number {
    const candidates = [
      { z: this.uZ[2], val: 1 },
      { z: -this.uZ[2], val: 6 },
      { z: this.uX[2], val: 2 },
      { z: -this.uX[2], val: 5 },
      { z: this.uY[2], val: 3 },
      { z: -this.uY[2], val: 4 },
    ];

    candidates.sort((a, b) => b.z - a.z);
    return candidates[0].val;
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean = false, diceStyle: string = 'ivory') {
    ctx.save();

    const S = this.halfSize;

    // 0. Dynamic Motion Trail (مسار دحرجة الزهر الانسيابي السريع)
    if (this.trail.length > 1) {
      ctx.save();
      for (let i = 0; i < this.trail.length - 1; i++) {
        const p1 = this.trail[i];
        const p2 = this.trail[i + 1];
        const ratio = 1 - i / this.trail.length;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(245, 158, 11, ${p1.alpha * ratio * 0.38})`;
        ctx.lineWidth = Math.max(1.5, S * 1.3 * ratio);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }

    // 1. Soft Realistic Diffused Cast Shadow on Wood / Felt
    const shadowDist = 8 + this.z * 0.45;
    const shadowScale = Math.max(0.55, 1 - this.z / 140);
    const shadowAlpha = Math.max(0.08, 0.42 - this.z / 190);

    ctx.fillStyle = `rgba(16, 9, 4, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      this.x + 8 + this.z * 0.15,
      this.y + 10 + shadowDist,
      S * 1.5 * shadowScale,
      S * 0.85 * shadowScale,
      0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 2. Crisp Contact Occlusion Shadow directly under the lowest point touching the wood
    if (this.z < 12) {
      const contactAlpha = (1 - this.z / 12) * 0.68;
      ctx.fillStyle = `rgba(8, 4, 2, ${contactAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        this.x + 3,
        this.y + S * 0.72,
        S * 1.05,
        S * 0.38,
        0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const toScreen = (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
      const wx = lx * this.uX[0] + ly * this.uY[0] + lz * this.uZ[0];
      const wy = lx * this.uX[1] + ly * this.uY[1] + lz * this.uZ[1];
      const wz = lx * this.uX[2] + ly * this.uY[2] + lz * this.uZ[2];
      return {
        x: this.x + wx,
        y: this.y + wy - wz * 0.2 - this.z,
        z: wz + this.z,
      };
    };

    const faces = [
      {
        val: 1,
        normal: this.uZ,
        localCenter: [0, 0, S] as Vec3,
        localU: [1, 0, 0] as Vec3,
        localV: [0, 1, 0] as Vec3,
        verts: [
          toScreen(-S, -S, S),
          toScreen(S, -S, S),
          toScreen(S, S, S),
          toScreen(-S, S, S),
        ],
      },
      {
        val: 6,
        normal: [-this.uZ[0], -this.uZ[1], -this.uZ[2]] as Vec3,
        localCenter: [0, 0, -S] as Vec3,
        localU: [-1, 0, 0] as Vec3,
        localV: [0, 1, 0] as Vec3,
        verts: [
          toScreen(S, -S, -S),
          toScreen(-S, -S, -S),
          toScreen(-S, S, -S),
          toScreen(S, S, -S),
        ],
      },
      {
        val: 2,
        normal: this.uX,
        localCenter: [S, 0, 0] as Vec3,
        localU: [0, -1, 0] as Vec3,
        localV: [0, 0, 1] as Vec3,
        verts: [
          toScreen(S, -S, S),
          toScreen(S, -S, -S),
          toScreen(S, S, -S),
          toScreen(S, S, S),
        ],
      },
      {
        val: 5,
        normal: [-this.uX[0], -this.uX[1], -this.uX[2]] as Vec3,
        localCenter: [-S, 0, 0] as Vec3,
        localU: [0, 1, 0] as Vec3,
        localV: [0, 0, 1] as Vec3,
        verts: [
          toScreen(-S, -S, -S),
          toScreen(-S, -S, S),
          toScreen(-S, S, S),
          toScreen(-S, S, -S),
        ],
      },
      {
        val: 3,
        normal: this.uY,
        localCenter: [0, S, 0] as Vec3,
        localU: [1, 0, 0] as Vec3,
        localV: [0, 0, 1] as Vec3,
        verts: [
          toScreen(-S, S, S),
          toScreen(S, S, S),
          toScreen(S, S, -S),
          toScreen(-S, S, -S),
        ],
      },
      {
        val: 4,
        normal: [-this.uY[0], -this.uY[1], -this.uY[2]] as Vec3,
        localCenter: [0, -S, 0] as Vec3,
        localU: [1, 0, 0] as Vec3,
        localV: [0, 0, -1] as Vec3,
        verts: [
          toScreen(-S, -S, -S),
          toScreen(S, -S, -S),
          toScreen(S, -S, S),
          toScreen(-S, -S, S),
        ],
      },
    ];

    const visibleFaces = faces.filter((f) => f.normal[2] > -0.05);

    visibleFaces.sort((a, b) => {
      const avgZa = a.verts.reduce((sum, v) => sum + v.z, 0) / 4;
      const avgZb = b.verts.reduce((sum, v) => sum + v.z, 0) / 4;
      return avgZa - avgZb;
    });

    if (this.isUsed) {
      ctx.globalAlpha = 0.28;
    }

    // Directional light from top-left
    const lightDir: Vec3 = norm([-0.38, -0.62, 0.72]);

    visibleFaces.forEach((face) => {
      const cosAngle = Math.max(0, dot(face.normal, lightDir));
      const isTopFace = face.normal[2] > 0.55;

      // 1. Build rounded beveled face quad path
      const len = face.verts.length;
      const bevelRatio = 0.20; // 20% pillowy rounded bevel corners

      const buildFacePath = () => {
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const prev = face.verts[(i + len - 1) % len];
          const curr = face.verts[i];
          const next = face.verts[(i + 1) % len];

          const pStart = {
            x: curr.x + (prev.x - curr.x) * bevelRatio,
            y: curr.y + (prev.y - curr.y) * bevelRatio,
          };
          const pEnd = {
            x: curr.x + (next.x - curr.x) * bevelRatio,
            y: curr.y + (next.y - curr.y) * bevelRatio,
          };

          if (i === 0) {
            ctx.moveTo(pStart.x, pStart.y);
          } else {
            ctx.lineTo(pStart.x, pStart.y);
          }
          ctx.quadraticCurveTo(curr.x, curr.y, pEnd.x, pEnd.y);
        }
        ctx.closePath();
      };

      // 2. High-grade authentic material gradient matching diceStyle
      const grad = ctx.createLinearGradient(
        face.verts[0].x,
        face.verts[0].y,
        face.verts[2].x,
        face.verts[2].y
      );

      if (diceStyle === 'ebony') {
        if (isTopFace) {
          grad.addColorStop(0, '#2b2f3a');
          grad.addColorStop(0.5, '#181b22');
          grad.addColorStop(1, '#0e1015');
        } else if (cosAngle > 0.25) {
          grad.addColorStop(0, '#20232c');
          grad.addColorStop(0.5, '#13151b');
          grad.addColorStop(1, '#090a0d');
        } else {
          grad.addColorStop(0, '#15171e');
          grad.addColorStop(0.5, '#0c0d11');
          grad.addColorStop(1, '#050607');
        }
      } else if (diceStyle === 'ruby') {
        if (isTopFace) {
          grad.addColorStop(0, '#ef4444');
          grad.addColorStop(0.5, '#b91c1c');
          grad.addColorStop(1, '#7f1d1d');
        } else if (cosAngle > 0.25) {
          grad.addColorStop(0, '#b91c1c');
          grad.addColorStop(0.5, '#991b1b');
          grad.addColorStop(1, '#500724');
        } else {
          grad.addColorStop(0, '#881337');
          grad.addColorStop(0.5, '#6b1125');
          grad.addColorStop(1, '#3b0718');
        }
      } else if (diceStyle === 'walnut') {
        if (isTopFace) {
          grad.addColorStop(0, '#65351a');
          grad.addColorStop(0.5, '#48210f');
          grad.addColorStop(1, '#2c1207');
        } else if (cosAngle > 0.25) {
          grad.addColorStop(0, '#4e2513');
          grad.addColorStop(0.5, '#38180a');
          grad.addColorStop(1, '#200b03');
        } else {
          grad.addColorStop(0, '#381708');
          grad.addColorStop(0.5, '#260e03');
          grad.addColorStop(1, '#160701');
        }
      } else if (diceStyle === 'casinoWhite') {
        if (isTopFace) {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, '#f8fafc');
          grad.addColorStop(1, '#e2e8f0');
        } else if (cosAngle > 0.25) {
          grad.addColorStop(0, '#f1f5f9');
          grad.addColorStop(0.5, '#e2e8f0');
          grad.addColorStop(1, '#cbd5e1');
        } else {
          grad.addColorStop(0, '#e2e8f0');
          grad.addColorStop(0.5, '#cbd5e1');
          grad.addColorStop(1, '#94a3b8');
        }
      } else {
        // Default Authentic Vintage Egyptian Bone & Antique Ivory (عاج عتيق دافئ وعظم مصري أصيل غير فاقع)
        if (isTopFace) {
          grad.addColorStop(0, '#fef9ee');
          grad.addColorStop(0.25, '#faedd2');
          grad.addColorStop(0.65, '#ebd09e');
          grad.addColorStop(1, '#d5b379');
        } else if (cosAngle > 0.25) {
          grad.addColorStop(0, '#ebd09e');
          grad.addColorStop(0.5, '#d4b176');
          grad.addColorStop(1, '#b79051');
        } else {
          grad.addColorStop(0, '#c79f5f');
          grad.addColorStop(0.5, '#ab8243');
          grad.addColorStop(1, '#8a642e');
        }
      }

      buildFacePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Dynamic Specular Light Glint while tumbling
      if (this.isRolling) {
        const sweepPhase = (this.currentFrame * 0.35 + dot(face.normal, [1, 0.7, 0.4])) % (Math.PI * 2);
        const glint = Math.max(0, Math.sin(sweepPhase)) * 0.32;
        if (glint > 0.03) {
          ctx.save();
          buildFacePath();
          ctx.clip();
          const glintGrad = ctx.createLinearGradient(
            face.verts[0].x,
            face.verts[0].y,
            face.verts[2].x,
            face.verts[2].y
          );
          glintGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          glintGrad.addColorStop(0.5, `rgba(255, 255, 255, ${glint})`);
          glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glintGrad;
          ctx.fill();
          ctx.restore();
        }
      }

      // 3. Delicate rounded bevel edge highlight
      if (isSelected) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.95)';
        ctx.shadowBlur = 16;
        buildFacePath();
        ctx.stroke();
        ctx.shadowColor = 'transparent';
      } else {
        ctx.strokeStyle = isTopFace
          ? (diceStyle === 'ebony'
              ? 'rgba(251, 191, 36, 0.35)'
              : diceStyle === 'casinoWhite'
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(254, 249, 238, 0.85)')
          : (diceStyle === 'ebony'
              ? 'rgba(15, 17, 22, 0.7)'
              : `rgba(180, 142, 85, ${0.45 + cosAngle * 0.35})`);
        ctx.lineWidth = 1.0;
        buildFacePath();
        ctx.stroke();
      }

      // 4. Draw face dots: on ALL visible faces in exact 3D perspective!
      // STRICTLY CLIPPED inside the rounded quad boundaries so zero dots can ever spill or protrude outside
      ctx.save();
      buildFacePath();
      ctx.clip(); // Guaranteed zero spilling outside the face polygon

      this.drawFaceDots(ctx, face.val, face.localCenter, face.localU, face.localV, toScreen, diceStyle);
      ctx.restore();
    });

    // 5. Golden Radiant Bloom Aura when coming to rest
    if (this.settleGlow > 0.02) {
      ctx.save();
      const bloom = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, S * 2.4);
      bloom.addColorStop(0, `rgba(251, 191, 36, ${this.settleGlow * 0.42})`);
      bloom.addColorStop(0.45, `rgba(245, 158, 11, ${this.settleGlow * 0.20})`);
      bloom.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(this.x, this.y, S * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // True 3D Sunken Drilled Concave Pips with exact affine 3D perspective projection
  drawFaceDots(
    ctx: CanvasRenderingContext2D,
    val: number,
    localCenter: Vec3,
    localU: Vec3,
    localV: Vec3,
    toScreen: (lx: number, ly: number, lz: number) => { x: number; y: number; z: number },
    diceStyle: string = 'ivory'
  ) {
    const dotOffsets: [number, number][] = [];
    const step = this.halfSize * 0.46;

    switch (val) {
      case 1:
        dotOffsets.push([0, 0]);
        break;
      case 2:
        dotOffsets.push([-step, -step], [step, step]);
        break;
      case 3:
        dotOffsets.push([-step, -step], [0, 0], [step, step]);
        break;
      case 4:
        dotOffsets.push([-step, -step], [step, -step], [-step, step], [step, step]);
        break;
      case 5:
        dotOffsets.push([-step, -step], [step, -step], [0, 0], [-step, step], [step, step]);
        break;
      case 6:
        dotOffsets.push(
          [-step, -step],
          [step, -step],
          [-step, 0],
          [step, 0],
          [-step, step],
          [step, step]
        );
        break;
      default:
        break;
    }

    const dotRadius = this.size * 0.088;

    dotOffsets.forEach(([du, dv]) => {
      // Local 3D coordinate of the pip on the cube face
      const lx = localCenter[0] + localU[0] * du + localV[0] * dv;
      const ly = localCenter[1] + localU[1] * du + localV[1] * dv;
      const lz = localCenter[2] + localU[2] * du + localV[2] * dv;

      const pScreen = toScreen(lx, ly, lz);

      // Tangent vector along local U in screen coordinates
      const pU = toScreen(
        lx + localU[0] * dotRadius,
        ly + localU[1] * dotRadius,
        lz + localU[2] * dotRadius
      );
      const tuX = pU.x - pScreen.x;
      const tuY = pU.y - pScreen.y;

      // Tangent vector along local V in screen coordinates
      const pV = toScreen(
        lx + localV[0] * dotRadius,
        ly + localV[1] * dotRadius,
        lz + localV[2] * dotRadius
      );
      const tvX = pV.x - pScreen.x;
      const tvY = pV.y - pScreen.y;

      // Ensure minimum non-degenerate transform
      const det = tuX * tvY - tuY * tvX;
      if (Math.abs(det) < 0.001) return; // Completely edge-on, skip

      ctx.save();
      // Apply exact 3D affine matrix: transforms local unit pip to screen perspective!
      ctx.transform(tuX, tuY, tvX, tvY, pScreen.x, pScreen.y);

      if (diceStyle === 'ebony') {
        // Luxury Inlaid Gold Pip for royal ebony
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#92400e';
        ctx.fill();

        const innerGrad = ctx.createLinearGradient(-0.8, -0.8, 0.7, 0.7);
        innerGrad.addColorStop(0, '#fef08a');
        innerGrad.addColorStop(0.45, '#f59e0b');
        innerGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 0.88, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 0.95, Math.PI * 0.75, Math.PI * 1.75);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 0.15;
        ctx.stroke();
      } else if (diceStyle === 'ruby') {
        // Pure Ivory White Pip for rich crimson ruby
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#4c0519';
        ctx.fill();

        const innerGrad = ctx.createLinearGradient(-0.8, -0.8, 0.7, 0.7);
        innerGrad.addColorStop(0, '#ffffff');
        innerGrad.addColorStop(0.6, '#fef3c7');
        innerGrad.addColorStop(1, '#fde68a');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 0.88, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Deep Obsidian Black Drilled Cavity with Inset Shadow (Ivory, Walnut, Casino White)
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fillStyle = diceStyle === 'walnut' ? '#080402' : '#0a0c10';
        ctx.fill();

        const innerGrad = ctx.createLinearGradient(-0.8, -0.8, 0.7, 0.7);
        innerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
        innerGrad.addColorStop(0.5, 'rgba(15, 17, 22, 0.65)');
        innerGrad.addColorStop(1, 'rgba(40, 44, 52, 0.25)');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 0.95, Math.PI * 0.75, Math.PI * 1.75);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 0.18;
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}

// True Solid Rigid Body Collision: Guaranteed ZERO penetration / clipping
const resolveSolidCollision = (d1: Physical3DDie, d2: Physical3DDie, onCollide?: () => void) => {
  const dx = d2.x - d1.x;
  const dy = d2.y - d1.y;
  const dist = Math.hypot(dx, dy);
  const minSolidDist = d1.size * 1.34; // ~64px: strict bounding diameter for non-penetrating 3D cubes

  if (dist < minSolidDist && dist > 0.001) {
    const nx = dx / dist;
    const ny = dy / dist;

    // 1. Hard Positional Separation: Push them apart IMMEDIATELY so they never intersect
    const overlap = minSolidDist - dist;
    const sepX = nx * (overlap * 0.5 + 0.5);
    const sepY = ny * (overlap * 0.5 + 0.5);

    d1.x -= sepX;
    d1.y -= sepY;
    d2.x += sepX;
    d2.y += sepY;

    // 2. Hard Elastic Momentum Reflection
    const rvx = d2.vx - d1.vx;
    const rvy = d2.vy - d1.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    if (velAlongNormal < 0) {
      const restitution = 0.65; // hard solid bounce
      const impulse = (-(1 + restitution) * velAlongNormal) / 2;

      d1.vx -= impulse * nx;
      d1.vy -= impulse * ny;
      d2.vx += impulse * nx;
      d2.vy += impulse * ny;

      // Impart rotational spin from solid impact
      const spinImpulse = (Math.random() - 0.5) * 0.2;
      d1.wz += spinImpulse;
      d2.wz -= spinImpulse;
      d1.wx += ny * 0.15;
      d2.wx -= ny * 0.15;

      sound.playDiceWoodImpact(false);
      onCollide?.();
    }
  }
};

export const InBoardDiceCanvas: React.FC<InBoardDiceCanvasProps> = ({
  phase,
  turn,
  roll,
  initialRoll,
  initialRollStep = 'white',
  initialWhiteDie = null,
  initialBlackDie = null,
  remainingDice,
  isRolling,
  onRollComplete,
  isAiTurn,
  isSpectator = false,
  selectedDie = null,
  onSelectDie,
  diceStyle = 'ivory',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const diceRef = useRef<Physical3DDie[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const collisionCountRef = useRef<number>(0);
  const shockwavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; opacity: number }>>([]);
  const sparksRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>>([]);

  const [isSimRolling, setIsSimRolling] = useState<boolean>(false);
  const [canvasDim, setCanvasDim] = useState<{ width: number; height: number }>({ width: 800, height: 400 });

  const isInitial = phase === 'initialRoll';
  const isDoubles = !isInitial && roll && roll[0] === roll[1];

  const totalMovesCount = isDoubles ? 4 : 2;
  const usedMovesCount = totalMovesCount - remainingDice.length;

  // Launch the true 3D Physical Toss using the External Adaptive AI Physics Engine
  const launchPhysicalToss = useCallback(() => {
    const width = canvasDim.width || 800;
    const height = canvasDim.height || 400;

    setIsSimRolling(true);
    collisionCountRef.current = 0;
    shockwavesRef.current = [];
    sparksRef.current = [];

    const spineX = width / 2;
    const spineHalf = 14;

    let currentDice: Physical3DDie[] = [];

    if (isInitial) {
      if (initialRollStep === 'white') {
        // White tosses ONE single die on White's side (right half)
        const d1 = new Physical3DDie(0, 0, 48);
        d1.setBounds(spineX + spineHalf + 8, width - 14, 14, height - 14);
        const v1 = aiDiceEngine.generateTossVectors(-1, 0);
        d1.tossWithAIVectors(width - 45, height / 2 - 20, v1);
        currentDice = [d1];
      } else {
        // Black tosses ONE single die on Black's side (left half), while White's die rests on White's side
        const d1 = new Physical3DDie(width - 65, height / 2, 48);
        d1.setRestingFace(initialWhiteDie || 1);
        d1.isRolling = false;

        const d2 = new Physical3DDie(0, 0, 48);
        d2.setBounds(14, spineX - spineHalf - 8, 14, height - 14);
        const v2 = aiDiceEngine.generateTossVectors(1, 1);
        d2.tossWithAIVectors(45, height / 2 + 20, v2);
        currentDice = [d1, d2];
      }
    } else {
      const d1 = new Physical3DDie(0, 0, 48);
      const d2 = new Physical3DDie(0, 0, 48);

      if (turn === 0) {
        const minX = spineX + spineHalf + 6;
        const maxX = width - 12;
        d1.setBounds(minX, maxX, 14, height - 14);
        d2.setBounds(minX, maxX, 14, height - 14);

        const v1 = aiDiceEngine.generateTossVectors(-1, 0);
        const v2 = aiDiceEngine.generateTossVectors(-1, 0);

        d1.tossWithAIVectors(maxX - 40, height / 2 - 35, v1);
        d2.tossWithAIVectors(maxX - 40, height / 2 + 35, v2);
      } else {
        const minX = 12;
        const maxX = spineX - spineHalf - 6;
        d1.setBounds(minX, maxX, 14, height - 14);
        d2.setBounds(minX, maxX, 14, height - 14);

        const v1 = aiDiceEngine.generateTossVectors(1, 1);
        const v2 = aiDiceEngine.generateTossVectors(1, 1);

        d1.tossWithAIVectors(minX + 40, height / 2 - 35, v1);
        d2.tossWithAIVectors(minX + 40, height / 2 + 35, v2);
      }
      currentDice = [d1, d2];
    }

    diceRef.current = currentDice;

    const finalizeRoll = () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      currentDice.forEach((d) => {
        d.setRestingFace(d.getTopFace());
        d.isRolling = false;
        d.settleGlow = 0.95;
      });

      // Final check: Ensure resting dice never overlap
      if (currentDice.length >= 2) {
        resolveSolidCollision(currentDice[0], currentDice[1]);
      }

      let outcome1 = currentDice[0].getTopFace();
      let outcome2 = currentDice.length > 1 ? currentDice[1].getTopFace() : 0;

      if (isInitial) {
        if (initialRollStep === 'white') {
          outcome2 = 0; // only White rolled
        } else {
          outcome1 = initialWhiteDie || currentDice[0].getTopFace();
          outcome2 = currentDice[1].getTopFace();
        }
      }

      // Synchronize authentic wooden settling impact clack at exact landing moment!
      const isDoublesResult = !isInitial && outcome1 === outcome2;
      sound.playDiceWoodImpact(true, isDoublesResult);

      // Record telemetry in Adaptive AI Engine
      const totalFrames = currentDice.length > 1 ? Math.max(currentDice[0].currentFrame, currentDice[1].currentFrame) : currentDice[0].currentFrame;
      const wallHits = currentDice.reduce((acc, d) => acc + d.wallHits, 0);
      aiDiceEngine.recordRollResult([outcome1, outcome2 || outcome1], totalFrames, wallHits, collisionCountRef.current);

      // Animate settling bloom radiance smoothly over a few frames
      let glowFrame = 0;
      const animateSettleGlow = () => {
        glowFrame++;
        const cvs = canvasRef.current;
        if (cvs) {
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            currentDice.forEach((die) => {
              die.settleGlow *= 0.84;
              die.draw(ctx, false, diceStyle);
            });
          }
        }
        if (glowFrame < 12) {
          requestAnimationFrame(animateSettleGlow);
        }
      };
      requestAnimationFrame(animateSettleGlow);

      setIsSimRolling(false);
      onRollComplete([outcome1, outcome2]);
    };

    // Safety fallback: guaranteed completion in 900ms under any device conditions
    safetyTimerRef.current = window.setTimeout(() => {
      finalizeRoll();
    }, 900);

    const runAnimation = () => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw floor shockwaves / impact rings on the wooden table
      const sws = shockwavesRef.current;
      for (let i = sws.length - 1; i >= 0; i--) {
        const sw = sws[i];
        sw.radius += 2.2;
        sw.opacity *= 0.88;
        if (sw.opacity <= 0.02 || sw.radius >= sw.maxRadius) {
          sws.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 180, 50, ${sw.opacity * 0.7})`;
        ctx.lineWidth = Math.max(0.6, 2.5 * (1 - sw.radius / sw.maxRadius));
        ctx.stroke();
        ctx.restore();
      }

      // 2. Update physical dice & spawn impact effects
      let anyRolling = false;

      currentDice.forEach((die) => {
        const evt = die.update();
        if (evt.isRolling) anyRolling = true;

        // When die bounces on felt floor or hits wooden borders: emit impact shockwave & sparks!
        if (evt.hitFloor || evt.hitWall) {
          sws.push({
            x: evt.x,
            y: evt.y,
            radius: 5,
            maxRadius: die.halfSize * 2.4,
            opacity: 0.8,
          });

          for (let s = 0; s < 4; s++) {
            sparksRef.current.push({
              x: evt.x + (Math.random() - 0.5) * 10,
              y: evt.y + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 3 - die.vx * 0.1,
              vy: -Math.random() * 2.2 - 0.5,
              life: 1,
              maxLife: 15 + Math.random() * 8,
              size: 1.5 + Math.random() * 1.5,
              color: Math.random() > 0.4 ? '#fde047' : '#f59e0b',
            });
          }
        }
      });

      // Rigid body solid collision: zero intersection + collision shockwave & sparks
      if (currentDice.length >= 2) {
        resolveSolidCollision(currentDice[0], currentDice[1], () => {
          collisionCountRef.current++;
          const midX = (currentDice[0].x + currentDice[1].x) / 2;
          const midY = (currentDice[0].y + currentDice[1].y) / 2;
          sws.push({
            x: midX,
            y: midY,
            radius: 6,
            maxRadius: currentDice[0].halfSize * 2.6,
            opacity: 0.9,
          });
          for (let s = 0; s < 5; s++) {
            sparksRef.current.push({
              x: midX,
              y: midY,
              vx: (Math.random() - 0.5) * 3.5,
              vy: (Math.random() - 0.5) * 3.5,
              life: 1,
              maxLife: 16,
              size: 2,
              color: '#fef08a',
            });
          }
        });
      }

      // 3. Draw physical 3D dice (with motion trail, cast shadows, dynamic face glints, and bevels)
      currentDice.forEach((die) => {
        die.draw(ctx, false, diceStyle);
      });

      // 4. Draw & update micro-sparks on top layer
      const sps = sparksRef.current;
      for (let i = sps.length - 1; i >= 0; i--) {
        const sp = sps[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.16; // gravity
        sp.life -= 1 / sp.maxLife;
        if (sp.life <= 0) {
          sps.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.life);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (anyRolling) {
        animFrameRef.current = requestAnimationFrame(runAnimation);
      } else {
        finalizeRoll();
      }
    };

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(runAnimation);
  }, [canvasDim, isInitial, initialRollStep, initialWhiteDie, turn, onRollComplete, diceStyle]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  // Trigger when isRolling flips
  useEffect(() => {
    if (isRolling && !isSimRolling) {
      launchPhysicalToss();
    }
  }, [isRolling, isSimRolling, launchPhysicalToss]);

  // ResizeObserver for canvas resolution
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        setCanvasDim({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, []);

  // Redraw resting dice when state updates or when selection changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isSimRolling || isRolling) return;

    const { width, height } = canvasDim;
    ctx.clearRect(0, 0, width, height);

    let targetValues: number[] = [];
    if (isInitial) {
      if (initialRoll) {
        targetValues = [initialRoll[0], initialRoll[1]];
      } else if (initialRollStep === 'black' && initialWhiteDie) {
        targetValues = [initialWhiteDie];
      }
    } else if (roll) {
      // In Egyptian Tawla (31, Mahbousa, Backgammon): ALWAYS exactly 2 physical dice cubes on the board! Never 4!
      targetValues = [roll[0], roll[1]];
    }

    if (targetValues.length === 0) {
      return;
    }

    const spineX = width / 2;
    const spineHalf = 14;

    if (diceRef.current.length === targetValues.length) {
      diceRef.current.forEach((die, idx) => {
        die.setRestingFace(targetValues[idx]);
        if (isDoubles) {
          // When doubles roll (e.g. [5, 5]), 4 total moves are available in remainingDice:
          // 4 or 3 moves remaining -> both dice active
          // 2 or 1 moves remaining -> first die used, second die active
          // 0 moves remaining -> both dice used
          die.isUsed = idx === 0 ? remainingDice.length <= 2 : remainingDice.length === 0;
        } else if (roll) {
          const countInRemaining = remainingDice.filter((d) => d === targetValues[idx]).length;
          const countInRoll = roll.filter((d) => d === targetValues[idx]).length;
          die.isUsed = idx === 0 ? countInRemaining < countInRoll : countInRemaining === 0;
        }
        const isSelected = selectedDie === targetValues[idx] && !die.isUsed;
        die.draw(ctx, isSelected, diceStyle);
      });
    } else {
      const count = targetValues.length;
      const freshDice: Physical3DDie[] = [];

      for (let i = 0; i < count; i++) {
        let minX = 14;
        let maxX = width - 14;
        if (isInitial) {
          if (targetValues.length === 1) {
            minX = spineX + spineHalf + 8;
            maxX = width - 14;
          } else if (i === 0) {
            minX = spineX + spineHalf + 8;
            maxX = width - 14;
          } else {
            minX = 14;
            maxX = spineX - spineHalf - 8;
          }
        } else {
          if (turn === 0) {
            minX = spineX + spineHalf + 8;
            maxX = width - 14;
          } else {
            minX = 14;
            maxX = spineX - spineHalf - 8;
          }
        }

        const posX = minX + (maxX - minX) * ((i + 1) / (count + 1));
        const posY = height / 2;
        const die = new Physical3DDie(posX, posY, 48);
        die.setRestingFace(targetValues[i]);

        if (isDoubles) {
          die.isUsed = i === 0 ? remainingDice.length <= 2 : remainingDice.length === 0;
        } else if (roll) {
          const countInRemaining = remainingDice.filter((d) => d === targetValues[i]).length;
          const countInRoll = roll.filter((d) => d === targetValues[i]).length;
          die.isUsed = i === 0 ? countInRemaining < countInRoll : countInRemaining === 0;
        }

        const isSelected = selectedDie === targetValues[i] && !die.isUsed;
        die.draw(ctx, isSelected, diceStyle);
        freshDice.push(die);
      }
      diceRef.current = freshDice;
    }

    // Ensure resting dice never overlap
    if (diceRef.current.length >= 2) {
      resolveSolidCollision(diceRef.current[0], diceRef.current[1]);
    }
  }, [canvasDim, roll, initialRoll, initialRollStep, initialWhiteDie, initialBlackDie, remainingDice, selectedDie, isSimRolling, isRolling, isDoubles, usedMovesCount, isInitial, turn, diceStyle]);

  const showResult = !isSimRolling && !isRolling && (roll !== null || initialRoll !== null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30 select-none overflow-hidden"
    >
      {/* 3D Physical Solid Dice Canvas: 100% clean, NO text overlays on the playing board */}
      <canvas
        ref={canvasRef}
        style={{ pointerEvents: 'none' }}
        className="w-full h-full block"
      />

      {/* Clean Interactive Hitboxes Directly Over Each Resting Die (NO text or badges beside dice) */}
      {showResult && !isRolling && !isSimRolling && (
        <div className="absolute inset-0 pointer-events-none z-35">
          {diceRef.current.map((die, idx) => {
            const topVal = die.getTopFace();
            const isSelected = selectedDie === topVal && !die.isUsed;
            const isUsed = die.isUsed;
            const boxSize = die.size + 10;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${die.x}px`,
                  top: `${die.y}px`,
                }}
                className="pointer-events-auto"
              >
                {/* Clean Hitbox over the solid 3D die */}
                <button
                  type="button"
                  disabled={isUsed || isAiTurn || isSpectator}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUsed && !isAiTurn && !isSpectator) {
                      sound.playCheckerMove('move');
                      onSelectDie?.(isSelected ? null : topVal);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${-boxSize / 2}px`,
                    top: `${-boxSize / 2}px`,
                    width: `${boxSize}px`,
                    height: `${boxSize}px`,
                  }}
                  className={`rounded-2xl transition-all outline-none ${
                    isUsed
                      ? 'cursor-default'
                      : isAiTurn || isSpectator
                      ? 'cursor-default'
                      : isSelected
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950/80 bg-amber-400/10 cursor-pointer shadow-[0_0_16px_rgba(251,191,36,0.6)]'
                      : 'hover:ring-1 hover:ring-amber-400/50 cursor-pointer'
                  }`}
                  title={`زهرة ${toArabicDigits(topVal)}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
