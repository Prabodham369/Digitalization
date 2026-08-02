import React, { useState, useEffect, useCallback } from 'react';
import { HumanBrainCanvas } from '../3d/HumanBrainCanvas';
import { soundEngine } from '../../utils/soundEngine';
import { Zap, Play, Pause, Sparkles, Activity, ShieldAlert, Heart, MessageSquare, Share2, Flame } from 'lucide-react';

const REWARD_FEED = [
  { text: '🚨 Shocking Highway Accident Video Released!', icon: '💥', label: 'Graphic Shock' },
  { text: '🍔 Secret Street Food Spot in Delhi You Must Try!', icon: '🍕', label: 'Food Craving' },
  { text: '🏷️ 70% OFF Flash Sale on Branded Clothes Today!', icon: '🛍️', label: 'Shopping Offer' },
  { text: '⚡ Viral Street Fight Video Trending in Metro!', icon: '📹', label: 'Sensational Alert' },
  { text: '🍜 Must-Visit Night Market Buffet at Flat 50% OFF', icon: '🔥', label: 'Food Deal' },
  { text: '😱 Unbelievable Horrific Crash Caught on Camera!', icon: '⚠️', label: 'Viral News' },
  { text: '👗 Massive Clothing Clearance Sale near your City!', icon: '✨', label: 'Flash Sale' },
  { text: '🍰 Best Desserts in Town — 1 Free on Every Order!', icon: '🎂', label: 'Local Food' },
];

export const DopamineScene: React.FC = () => {
  const [pulseActive, setPulseActive] = useState(false);
  const [hitCount, setHitCount] = useState(1);
  const [lastReward, setLastReward] = useState<{ text: string; icon: string; label: string } | null>(null);
  const [incomingTrigger, setIncomingTrigger] = useState<{ text: string; icon: string } | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [impactHistory, setImpactHistory] = useState<string[]>([]);

  // Trigger dopamine notification flight straight to human brain
  const triggerDopamineHit = useCallback((customItem?: { text: string; icon: string; label: string }) => {
    soundEngine.playDopamineTrigger();
    setPulseActive(true);
    setHitCount((prev) => prev + 1);

    const reward = customItem || REWARD_FEED[Math.floor(Math.random() * REWARD_FEED.length)];
    setLastReward(reward);
    setIncomingTrigger({ text: reward.text, icon: reward.icon });

    setTimeout(() => {
      setPulseActive(false);
    }, 1200);
  }, []);

  // Automatic periodic incoming notifications shooting straight to brain (slow & easy to read)
  useEffect(() => {
    if (!isAutoPlay) return;

    // Trigger initial hit
    triggerDopamineHit();

    const interval = setInterval(() => {
      triggerDopamineHit();
    }, 4200);

    return () => clearInterval(interval);
  }, [isAutoPlay, triggerDopamineHit]);

  const handleImpact = useCallback((text: string) => {
    soundEngine.playNotificationPing();
    setImpactHistory((prev) => [text, ...prev.slice(0, 3)]);
  }, []);

  return (
    <section className="h-screen w-full bg-black text-white relative flex flex-col justify-between py-6 px-4 overflow-hidden snap-start snap-always shrink-0">
      {/* Background Human Anatomical Brain Canvas */}
      <HumanBrainCanvas
        activePulse={pulseActive}
        incomingTrigger={incomingTrigger}
        onImpact={handleImpact}
      />

      {/* Header Banner */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-1 pt-1">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans">
          The Human Brain Dopamine Loop
        </h2>
      </div>

      {/* Floating Interactive Controls & Live Impact Feed */}
      <div className="relative z-10 max-w-2xl w-full mx-auto mt-auto mb-2 space-y-3">
        {/* Active Notification Flight Card */}
        {lastReward && (
          <div className="flex items-center justify-center">
            <div className="apple-card px-4 py-2 rounded-2xl border border-pink-500/60 bg-neutral-950/90 text-pink-300 font-mono text-xs font-bold animate-bounce shadow-2xl flex items-center space-x-2 backdrop-blur-md">
              <span className="text-base">{lastReward.icon}</span>
              <span>{lastReward.text}</span>
              <span className="text-[10px] text-pink-400/80 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                {lastReward.label}
              </span>
            </div>
          </div>
        )}

        {/* Big Trigger Button & Auto Feed Mode Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => triggerDopamineHit()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-2xl glow-red hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Shoot Dopamine Hit to Brain (Refresh / Like)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickTone();
              setIsAutoPlay(!isAutoPlay);
            }}
            className={`px-4 py-3 rounded-full border text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
              isAutoPlay
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-md'
                : 'bg-neutral-900 border-white/20 text-neutral-400 hover:text-white'
            }`}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isAutoPlay ? 'Auto-Feed Live' : 'Paused Auto-Feed'}</span>
          </button>
        </div>

        {/* Recent Brain Hits Reel */}
        {impactHistory.length > 0 && (
          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-white/10 text-center space-y-1 backdrop-blur-md">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-center space-x-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span>Recent Social Signals Ingested by Brain:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
              {impactHistory.map((line, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 border border-white/10 text-cyan-300"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Quote */}
      <div className="relative z-10 max-w-xl mx-auto text-center text-[11px] text-neutral-400 font-sans pb-1">
        "Unpredictable notifications trigger twice as much dopamine release as expected events — creating addictive habit loops."
      </div>
    </section>
  );
};
