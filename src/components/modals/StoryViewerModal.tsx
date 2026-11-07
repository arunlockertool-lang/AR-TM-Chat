import React, { useState, useEffect, useRef } from 'react';
import { Story, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { X, ChevronLeft, ChevronRight, Eye, Send, Play, Pause } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface StoryViewerModalProps {
  initialStory: Story;
  allStories: Story[];
  currentUser: User;
  onClose: () => void;
  onViewStory: (storyId: string) => void;
  onReplyToStory: (story: Story, text: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  initialStory,
  allStories,
  currentUser,
  onClose,
  onViewStory,
  onReplyToStory,
}) => {
  // Filter stories for this user
  const userStories = allStories.filter((s) => s.userId === initialStory.userId);
  const initialIndex = userStories.findIndex((s) => s.id === initialStory.id);
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = userStories[currentIndex] || initialStory;
  const timerRef = useRef<number | null>(null);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory) {
      onViewStory(currentStory.id);
    }
  }, [currentStory, onViewStory]);

  // Auto-progress timer
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000; // 5 seconds per story
    const step = 50;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + (step / duration) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, step);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReplyToStory(currentStory, replyText.trim());
    soundEffects.playSent();
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Container card */}
      <div className="relative w-full max-w-sm h-[680px] max-h-[92vh] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col justify-between select-none">
        {/* Top Story Header & Progress Bars */}
        <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 mb-3">
            {userStories.map((s, idx) => (
              <div
                key={s.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={currentStory.userAvatar}
                name={currentStory.userName}
                size="sm"
              />
              <div>
                <p className="text-xs font-bold text-white">{currentStory.userName}</p>
                <p className="text-[10px] text-white/70 font-mono tabular-nums">
                  {new Date(currentStory.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Body Canvas */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6 text-center cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.type === 'image' ? (
            <div className="w-full h-full flex flex-col justify-center items-center relative">
              <img
                src={currentStory.content}
                alt="Story"
                className="max-h-full max-w-full object-contain rounded-2xl"
              />
              {currentStory.caption && (
                <div className="absolute bottom-20 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium max-w-[90%]">
                  {currentStory.caption}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8 rounded-2xl"
              style={{
                background: currentStory.backgroundStyle || 'linear-gradient(135deg, #3390EC, #8B5CF6)',
              }}
            >
              <p className="text-xl font-bold text-white leading-relaxed drop-shadow-md">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Left / Right Click Nav Zones */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 top-20 bottom-24 w-1/3 z-10"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 top-20 bottom-24 w-1/3 z-10"
          />
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < userStories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Bottom Bar: Views & Quick Reply */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2">
          {currentStory.userId === currentUser.id ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/80 py-1">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>
                {currentStory.views.length} view{currentStory.views.length !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder={`Reply to ${currentStory.userName.split(' ')[0]}...`}
                className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-xs text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-1 focus:ring-white"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-2 rounded-full bg-[#3390EC] hover:bg-sky-600 disabled:opacity-50 text-white transition-transform active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
