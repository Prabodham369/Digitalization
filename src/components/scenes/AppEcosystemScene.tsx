import React, { useState } from 'react';
import { AppEcosystemCanvas } from '../3d/AppEcosystemCanvas';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/soundEngine';
import { Sparkles, Radio } from 'lucide-react';

export const AppEcosystemScene: React.FC = () => {
  const [exploded, setExploded] = useState(true);

  const toggleExplode = () => {
    soundEngine.playGlitchSound();
    setExploded(!exploded);
  };

  const apps = [
    { name: 'Instagram', labelEn: 'Short Reels & Feeds', color: 'border-pink-500/40 text-pink-400' },
    { name: 'TikTok / Shorts', labelEn: 'Micro-Video Loops', color: 'border-cyan-500/40 text-cyan-400' },
    { name: 'YouTube', labelEn: 'Endless Video Queue', color: 'border-red-500/40 text-red-500' },
    { name: 'Snapchat', labelEn: 'Ephemeral Streaks', color: 'border-yellow-500/40 text-yellow-400' },
    { name: 'Facebook', labelEn: 'Social Network Matrix', color: 'border-blue-500/40 text-blue-400' },
    { name: 'WhatsApp', labelEn: 'Instant Ping Stream', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  return (
    <section className="h-screen w-full bg-black text-white relative flex flex-col justify-between py-10 px-4 overflow-hidden snap-start snap-always shrink-0">
      {/* 3D Canvas Background */}
      <AppEcosystemCanvas exploded={exploded} />

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-2 pt-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>The App Ecosystem Explosion</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          Designed to capture every second of your attention.
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 font-sans">
          Engineered by world-class behavioral scientists to maximize time-on-screen.
        </p>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="relative z-10 max-w-2xl mx-auto text-center my-auto space-y-5">
        <button
          onClick={toggleExplode}
          className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-xl glow-red flex items-center space-x-2 mx-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{exploded ? 'Collapse App Orbit' : 'Explode App Orbit'}</span>
        </button>

        {/* Orbiting App Cards List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {apps.map((app, idx) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`apple-card p-3 rounded-2xl border ${app.color} text-center space-y-1 backdrop-blur-md bg-neutral-950/80`}
            >
              <div className="text-xs font-bold font-sans">{app.name}</div>
              <div className="text-[10px] text-neutral-400">{app.labelEn}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Quote */}
      <div className="relative z-10 text-center text-[11px] text-neutral-500 font-mono pb-2">
        Every icon and animation is optimized to trigger emotional attachment and repeat opens.
      </div>
    </section>
  );
};
