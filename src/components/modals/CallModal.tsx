import React, { useState, useEffect } from 'react';
import { User, Chat } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface CallModalProps {
  chat: Chat;
  callType: 'audio' | 'video';
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  chat,
  callType,
  onEndCall,
}) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    soundEffects.playReceived();
    const interval = window.setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200 select-none">
      <div className="relative w-full max-w-lg h-[580px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Background Visualizer or Video Feed */}
        {isVideoOn ? (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex items-center justify-center">
            {/* Simulated clean camera stream graphic */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={chat.avatarUrl}
                alt={chat.name}
                className="w-full h-full object-cover opacity-60 filter blur-xs"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute text-center z-10">
                <Avatar src={chat.avatarUrl} name={chat.name} size="xl" className="mx-auto mb-3" />
                <p className="text-white font-bold text-lg">{chat.name}</p>
                <p className="text-emerald-400 text-xs font-mono">HD Encrypted Stream (60 FPS)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Animated Audio Ripple Rings */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-48 h-48 rounded-full bg-sky-500/10 animate-ping" />
              <span className="absolute w-36 h-36 rounded-full bg-sky-500/20 animate-pulse" />
              <Avatar
                src={chat.avatarUrl}
                name={chat.name}
                size="xl"
                className="relative z-10 w-24 h-24 ring-4 ring-sky-500/30"
              />
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="relative z-20 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <h3 className="text-base font-bold text-white">{chat.name}</h3>
            <p className="text-xs text-emerald-400 font-mono tabular-nums flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatTimer(duration)}</span>
            </p>
          </div>
          <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 to-transparent">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              isMuted
                ? 'bg-rose-600 text-white'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              !isVideoOn
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-sky-600 text-white'
            }`}
            title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              !isSpeakerOn
                ? 'bg-amber-600 text-white'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title="Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onEndCall();
            }}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-90"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
