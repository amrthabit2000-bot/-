/**
 * High-Fidelity Web Audio API Sound Synthesizer & Speech Announcer
 * Specially engineered for authentic Egyptian Backgammon (Tawla 31 & Mahbousa)
 * Features realistic physical modeling of wooden boards, acrylic dice tumbling,
 * checker clacks, pinning strikes, and Egyptian café announcer voice.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public voiceEnabled: boolean = true;
  public volume: number = 0.85;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Helper: Generate a synthetic impulse buffer for wooden transient clicks
   */
  private createImpulseBuffer(duration: number, decay: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * decay);
    }
    return buffer;
  }

  /**
   * Realistic Dice Shaking & Tumbling on Hardwood Backgammon Board
   * Simulates:
   * 1. Cup/hand pre-roll rattle (two dice clattering together)
   * 2. Multiple bouncing impacts on the wooden frame with acoustic wood resonance
   * 3. Natural deceleration and settling double-tap
   */
  playDiceRoll() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      // --- PHASE 1: Pre-roll Hand/Cup Rattle (0.00s to 0.15s) ---
      const rattleDuration = 0.16;
      const rattleBuffer = this.createImpulseBuffer(rattleDuration, 35);
      if (rattleBuffer) {
        const rattleSource = this.ctx.createBufferSource();
        rattleSource.buffer = rattleBuffer;

        const rattleFilter = this.ctx.createBiquadFilter();
        rattleFilter.type = 'bandpass';
        rattleFilter.frequency.setValueAtTime(1800, now);
        rattleFilter.Q.setValueAtTime(4.0, now);

        const rattleGain = this.ctx.createGain();
        rattleGain.gain.setValueAtTime(0.35, now);
        rattleGain.gain.exponentialRampToValueAtTime(0.01, now + rattleDuration);

        rattleSource.connect(rattleFilter);
        rattleFilter.connect(rattleGain);
        rattleGain.connect(masterGain);
        rattleSource.start(now);
      }

      // --- PHASE 2: Two Dice Tumbling and Bouncing on Hardwood (0.08s to 0.55s) ---
      // Die 1 impacts (slightly lower pitched acrylic contact)
      const die1Bounces = [
        { time: 0.08, vol: 0.55, freq: 360, tone: 1600, pan: -0.2 },
        { time: 0.17, vol: 0.42, freq: 380, tone: 1800, pan: -0.15 },
        { time: 0.26, vol: 0.32, freq: 410, tone: 1950, pan: -0.1 },
        { time: 0.35, vol: 0.22, freq: 440, tone: 2100, pan: -0.05 },
        { time: 0.43, vol: 0.14, freq: 460, tone: 2200, pan: -0.05 },
      ];

      // Die 2 impacts (slightly higher pitched acrylic contact, interleaved timing)
      const die2Bounces = [
        { time: 0.11, vol: 0.50, freq: 390, tone: 2100, pan: 0.25 },
        { time: 0.21, vol: 0.38, freq: 420, tone: 2250, pan: 0.2 },
        { time: 0.30, vol: 0.28, freq: 450, tone: 2350, pan: 0.15 },
        { time: 0.39, vol: 0.18, freq: 470, tone: 2450, pan: 0.1 },
        { time: 0.47, vol: 0.10, freq: 490, tone: 2500, pan: 0.08 },
      ];

      const allBounces = [...die1Bounces, ...die2Bounces];

      allBounces.forEach((bounce) => {
        if (!this.ctx) return;
        const bTime = now + bounce.time + (Math.random() * 0.015 - 0.007);

        // A. Sharp surface contact click (bone/acrylic hitting lacquer/wood)
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        const clickFilter = this.ctx.createBiquadFilter();

        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(bounce.tone + (Math.random() * 80 - 40), bTime);
        clickFilter.Q.setValueAtTime(6.0, bTime);

        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(bounce.tone, bTime);
        clickOsc.frequency.exponentialRampToValueAtTime(300, bTime + 0.025);

        clickGain.gain.setValueAtTime(bounce.vol * 0.65, bTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.025);

        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);

        // B. Hollow wood box resonance (the backgammon wooden cavity thump)
        const woodOsc = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        const woodFilter = this.ctx.createBiquadFilter();

        woodFilter.type = 'lowpass';
        woodFilter.frequency.setValueAtTime(800, bTime);

        woodOsc.type = 'sine';
        const bodyFreq = bounce.freq + (Math.random() * 20 - 10);
        woodOsc.frequency.setValueAtTime(bodyFreq, bTime);
        woodOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.6, bTime + 0.05);

        woodGain.gain.setValueAtTime(bounce.vol * 0.5, bTime);
        woodGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.055);

        woodOsc.connect(woodFilter);
        woodFilter.connect(woodGain);

        // Stereo panning if supported
        if (typeof this.ctx.createStereoPanner === 'function') {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(bounce.pan, bTime);
          clickGain.connect(panner);
          woodGain.connect(panner);
          panner.connect(masterGain);
        } else {
          clickGain.connect(masterGain);
          woodGain.connect(masterGain);
        }

        clickOsc.start(bTime);
        clickOsc.stop(bTime + 0.03);
        woodOsc.start(bTime);
        woodOsc.stop(bTime + 0.06);
      });

      // Mobile haptic vibration pattern for tactile immersion
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([18, 30, 22, 15, 12]);
      }
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * Authentic Wooden Dice Impact & Settling Sound
   * Accurately synchronized with the visual physics animation:
   * - isFinalSettle = false: Crisp mid-roll wooden bounce / boundary ricochet
   * - isFinalSettle = true: Definitive, resonant wooden impact when the dice come to a dead flat rest
   */
  playDiceWoodImpact(isFinalSettle: boolean = false, isDoubles: boolean = false) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      const pitchMod = 0.96 + Math.random() * 0.08;

      if (isFinalSettle) {
        // --- FINAL SETTLING ON HARDWOOD & FELT (لحظة استقرار الزهر على الخشب واللباد) ---
        // Generates the classic physical signature:
        // 1. Primary sharp impact (face slap against wood)
        // 2. Micro-rebound secondary tap (14ms later, settling flat)
        // 3. If doubles/two dice, interleaved second die micro-clack (20ms later)
        // 4. Warm resonant 170Hz - 220Hz wooden box cavity thump

        const settleTaps = [
          { delay: 0.000, freq: 1950 * pitchMod, vol: 0.75, dur: 0.024 },
          { delay: 0.014, freq: 2400 * pitchMod, vol: 0.45, dur: 0.018 },
        ];

        if (isDoubles) {
          settleTaps.push(
            { delay: 0.020, freq: 2100 * pitchMod, vol: 0.65, dur: 0.022 },
            { delay: 0.034, freq: 2600 * pitchMod, vol: 0.40, dur: 0.016 }
          );
        } else {
          settleTaps.push(
            { delay: 0.018, freq: 1750 * pitchMod, vol: 0.50, dur: 0.020 }
          );
        }

        settleTaps.forEach((tap) => {
          if (!this.ctx) return;
          const t = now + tap.delay;

          const clickOsc = this.ctx.createOscillator();
          const clickGain = this.ctx.createGain();
          const clickFilter = this.ctx.createBiquadFilter();

          clickFilter.type = 'bandpass';
          clickFilter.frequency.setValueAtTime(tap.freq, t);
          clickFilter.Q.setValueAtTime(5.5, t);

          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(tap.freq, t);
          clickOsc.frequency.exponentialRampToValueAtTime(320, t + tap.dur);

          clickGain.gain.setValueAtTime(tap.vol * 0.8, t);
          clickGain.gain.exponentialRampToValueAtTime(0.001, t + tap.dur);

          clickOsc.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(masterGain);

          clickOsc.start(t);
          clickOsc.stop(t + tap.dur + 0.01);
        });

        // Acoustic wooden box cavity resonance (خشب الطاولة الأصيل)
        const woodThump = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        const woodFilter = this.ctx.createBiquadFilter();

        woodFilter.type = 'lowpass';
        woodFilter.frequency.setValueAtTime(520, now);

        woodThump.type = 'sine';
        const thumpFreq = 185 * pitchMod;
        woodThump.frequency.setValueAtTime(thumpFreq, now);
        woodThump.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        woodGain.gain.setValueAtTime(0.65, now);
        woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        woodThump.connect(woodFilter);
        woodFilter.connect(woodGain);
        woodGain.connect(masterGain);

        woodThump.start(now);
        woodThump.stop(now + 0.1);

        // Tactile haptic vibration for final settle
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(isDoubles ? [20, 25, 20] : [22]);
        }
      } else {
        // --- MID-ROLL BOUNCE / WALL RICOCHET (ارتطام خفيف أثناء الدحرجة) ---
        const bTime = now;
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        const clickFilter = this.ctx.createBiquadFilter();

        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(1600 * pitchMod, bTime);
        clickFilter.Q.setValueAtTime(5.0, bTime);

        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1400 * pitchMod, bTime);
        clickOsc.frequency.exponentialRampToValueAtTime(280, bTime + 0.022);

        clickGain.gain.setValueAtTime(0.35, bTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.022);

        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(masterGain);

        clickOsc.start(bTime);
        clickOsc.stop(bTime + 0.025);

        // Light wooden thump
        const woodOsc = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        woodOsc.type = 'sine';
        woodOsc.frequency.setValueAtTime(220 * pitchMod, bTime);
        woodOsc.frequency.exponentialRampToValueAtTime(100, bTime + 0.045);
        woodGain.gain.setValueAtTime(0.28, bTime);
        woodGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.045);

        woodOsc.connect(woodGain);
        woodGain.connect(masterGain);
        woodOsc.start(bTime);
        woodOsc.stop(bTime + 0.05);
      }
    } catch {
      // Audio playback fails gracefully
    }
  }

  /**
   * Authentic Wooden Checker Move / Placement Sound
   * Supports specific acoustic variations:
   * - 'move': Solid, weighty Egyptian walnut/rosewood tap against the wooden triangle.
   * - 'stack': Crisp, resonant wood-on-wood clatter when placing atop another checker.
   * - 'pin' (المحبوسة): Heavy, dramatic slam with clamping lock chime.
   * - 'bearOff': Smooth sliding friction followed by drop into wooden bin.
   */
  playCheckerMove(actionType: 'move' | 'stack' | 'pin' | 'bearOff' = 'move') {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      // Random micro-pitch variation for organic variety (+/- 5%)
      const pitchMod = 0.95 + Math.random() * 0.1;

      if (actionType === 'pin') {
        // --- 1. PINNING STRIKE (حبس الخصم بالمحبوسة) ---
        // A heavy dramatic double wood slam + firm lock chime
        const heavyOsc = this.ctx.createOscillator();
        const heavyGain = this.ctx.createGain();
        heavyOsc.type = 'triangle';
        heavyOsc.frequency.setValueAtTime(260 * pitchMod, now);
        heavyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.09);
        heavyGain.gain.setValueAtTime(0.7, now);
        heavyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        heavyOsc.connect(heavyGain);
        heavyGain.connect(masterGain);
        heavyOsc.start(now);
        heavyOsc.stop(now + 0.11);

        // Clamping snap
        const snapOsc = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snapOsc.type = 'square';
        snapOsc.frequency.setValueAtTime(920 * pitchMod, now + 0.015);
        snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        snapGain.gain.setValueAtTime(0.35, now + 0.015);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        snapOsc.connect(snapGain);
        snapGain.connect(masterGain);
        snapOsc.start(now + 0.015);
        snapOsc.stop(now + 0.07);

        // Lock bell ding
        const lockOsc = this.ctx.createOscillator();
        const lockGain = this.ctx.createGain();
        lockOsc.type = 'sine';
        lockOsc.frequency.setValueAtTime(1480, now + 0.03);
        lockGain.gain.setValueAtTime(0.2, now + 0.03);
        lockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        lockOsc.connect(lockGain);
        lockGain.connect(masterGain);
        lockOsc.start(now + 0.03);
        lockOsc.stop(now + 0.3);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([25, 40, 35]);
        }
        return;
      }

      if (actionType === 'bearOff') {
        // --- 2. BEARING OFF (لم القشاط) ---
        // Quick wooden slide brush + hollow drop into side wooden tray
        const slideBuf = this.createImpulseBuffer(0.07, 40);
        if (slideBuf) {
          const slideSource = this.ctx.createBufferSource();
          slideSource.buffer = slideBuf;
          const slideFilter = this.ctx.createBiquadFilter();
          slideFilter.type = 'bandpass';
          slideFilter.frequency.setValueAtTime(1200, now);
          const slideGain = this.ctx.createGain();
          slideGain.gain.setValueAtTime(0.3, now);
          slideGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
          slideSource.connect(slideFilter);
          slideFilter.connect(slideGain);
          slideGain.connect(masterGain);
          slideSource.start(now);
        }

        // Tray drop thump
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        dropOsc.type = 'triangle';
        dropOsc.frequency.setValueAtTime(280 * pitchMod, now + 0.04);
        dropOsc.frequency.exponentialRampToValueAtTime(95, now + 0.12);
        dropGain.gain.setValueAtTime(0.5, now + 0.04);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        dropOsc.connect(dropGain);
        dropGain.connect(masterGain);
        dropOsc.start(now + 0.04);
        dropOsc.stop(now + 0.14);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15, 20]);
        }
        return;
      }

      if (actionType === 'stack') {
        // --- 3. STACKING ON EXISTING CHECKER (رص فوق قشاط) ---
        // Brighter wood/acrylic clack with overtone
        const clackOsc = this.ctx.createOscillator();
        const clackGain = this.ctx.createGain();
        clackOsc.type = 'triangle';
        clackOsc.frequency.setValueAtTime(680 * pitchMod, now);
        clackOsc.frequency.exponentialRampToValueAtTime(240, now + 0.04);
        clackGain.gain.setValueAtTime(0.48, now);
        clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        clackOsc.connect(clackGain);
        clackGain.connect(masterGain);
        clackOsc.start(now);
        clackOsc.stop(now + 0.06);

        // High rim ring
        const rimOsc = this.ctx.createOscillator();
        const rimGain = this.ctx.createGain();
        rimOsc.type = 'sine';
        rimOsc.frequency.setValueAtTime(1650 * pitchMod, now);
        rimGain.gain.setValueAtTime(0.18, now);
        rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        rimOsc.connect(rimGain);
        rimGain.connect(masterGain);
        rimOsc.start(now);
        rimOsc.stop(now + 0.04);

        // Body thump
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(210 * pitchMod, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(110, now + 0.06);
        bodyGain.gain.setValueAtTime(0.35, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(masterGain);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.08);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(12);
        }
        return;
      }

      // --- 4. STANDARD SOLID WOOD CHECKER TAP (نزول القشاط على الخشب) ---
      // Real Egyptian backgammon "Taqq" (طَق) sound:
      // Layer A: Sharp attack transient (fingertip releasing checker onto wood)
      const attackOsc = this.ctx.createOscillator();
      const attackGain = this.ctx.createGain();
      const attackFilter = this.ctx.createBiquadFilter();

      attackFilter.type = 'bandpass';
      attackFilter.frequency.setValueAtTime(1450 * pitchMod, now);
      attackFilter.Q.setValueAtTime(4.5, now);

      attackOsc.type = 'triangle';
      attackOsc.frequency.setValueAtTime(420 * pitchMod, now);
      attackOsc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      attackGain.gain.setValueAtTime(0.55, now);
      attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      attackOsc.connect(attackFilter);
      attackFilter.connect(attackGain);
      attackGain.connect(masterGain);
      attackOsc.start(now);
      attackOsc.stop(now + 0.06);

      // Layer B: Heavy wooden board cavity resonance (180Hz warm mahogany thump)
      const woodBody = this.ctx.createOscillator();
      const woodBodyGain = this.ctx.createGain();
      woodBody.type = 'sine';
      woodBody.frequency.setValueAtTime(195 * pitchMod, now);
      woodBody.frequency.exponentialRampToValueAtTime(90, now + 0.07);

      woodBodyGain.gain.setValueAtTime(0.42, now);
      woodBodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      woodBody.connect(woodBodyGain);
      woodBodyGain.connect(masterGain);
      woodBody.start(now);
      woodBody.stop(now + 0.085);

      // Layer C: Subtle micro-bounce settle (natural tactile flutter 14ms later)
      const microOsc = this.ctx.createOscillator();
      const microGain = this.ctx.createGain();
      microOsc.type = 'triangle';
      microOsc.frequency.setValueAtTime(320 * pitchMod, now + 0.016);
      microGain.gain.setValueAtTime(0.15, now + 0.016);
      microGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      microOsc.connect(microGain);
      microGain.connect(masterGain);
      microOsc.start(now + 0.016);
      microOsc.stop(now + 0.05);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // Audio fails gracefully
    }
  }

  /**
   * Victorious Egyptian Celebration Fanfare with Oriental Arabesque Melody
   */
  playWinFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      // Arabesque victory melody: Bayati/Hijaz inspired notes
      const notes = [
        { f: 293.66, d: 0.18 }, // D4
        { f: 311.13, d: 0.18 }, // Eb4
        { f: 369.99, d: 0.22 }, // F#4
        { f: 392.0, d: 0.22 },  // G4
        { f: 440.0, d: 0.24 },  // A4
        { f: 554.37, d: 0.35 }, // C#5
        { f: 587.33, d: 0.65 }, // D5 (final triumphant note)
      ];

      let t = now;
      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + note.d + 0.05);
        t += note.d * 0.85;
      });
    } catch {
      // Audio fails gracefully
    }
  }

  /**
   * Sparkling Golden Achievement Unlock Chime
   */
  playCelebration() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      // Ascending triumphant golden chime chord (C6, E6, G6, C7)
      const chimes = [
        { f: 1046.5, t: 0.00, d: 0.25 }, // C6
        { f: 1318.5, t: 0.10, d: 0.30 }, // E6
        { f: 1567.9, t: 0.20, d: 0.35 }, // G6
        { f: 2093.0, t: 0.32, d: 0.55 }, // C7 (Golden sparkle)
      ];

      chimes.forEach((c) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.f, now + c.t);

        gain.gain.setValueAtTime(0.28, now + c.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.t + c.d);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + c.t);
        osc.stop(now + c.t + c.d + 0.05);
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 30, 40]);
      }
    } catch {
      // Audio fails gracefully
    }
  }

  /**
   * Voice announcer removed as per user request
   */
  speakDiceCall(_phrase?: string, _d1?: number, _d2?: number) {
    // Voice announcer disabled
  }
}

export const sound = new SoundController();
