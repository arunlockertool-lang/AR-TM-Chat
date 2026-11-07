import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Reply,
  Smile,
  MoreVertical,
  Pin,
  Copy,
  Trash2,
  Edit2,
  Share2,
  FileText,
  Clock,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  currentUser: User;
  isGroup: boolean;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
  onForward: (msg: Message) => void;
  onPin: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onCopyText: (text: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '🚀', '👀'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  currentUser,
  isGroup,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onPin,
  onReact,
  onCopyText,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<number | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      if (progressInterval.current) clearInterval(progressInterval.current);
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      soundEffects.playClick();

      // If simulated or real audio URL exists
      if (audioRef.current && message.mediaUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        // Synthetic waveform progress simulation for demo audio
        const totalDuration = message.voiceDuration || 8;
        let current = 0;
        progressInterval.current = window.setInterval(() => {
          current += 0.2;
          if (current >= totalDuration) {
            clearInterval(progressInterval.current!);
            setIsPlayingAudio(false);
            setAudioProgress(0);
          } else {
            setAudioProgress((current / totalDuration) * 100);
          }
        }, 200);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || message.voiceDuration || 1;
      setAudioProgress((audioRef.current.currentTime / dur) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
        setShowDropdown(false);
      }}
      className={`group relative flex gap-2.5 px-3 sm:px-6 py-1.5 transition-colors ${
        message.isPinned ? 'bg-sky-500/5 dark:bg-sky-500/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
      } ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Sender Avatar in Group */}
      {(!isCurrentUser && isGroup) && (
        <Avatar
          src={message.senderAvatar}
          name={message.senderName}
          size="sm"
          className="mt-1"
        />
      )}

      {/* Bubble Container */}
      <div className={`relative max-w-[85%] sm:max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name in Group */}
        {(!isCurrentUser && isGroup) && (
          <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 mb-0.5 ml-1">
            {message.senderName}
          </span>
        )}

        {/* Pinned Tag */}
        {message.isPinned && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-sky-500 dark:text-sky-400 mb-0.5 px-1">
            <Pin className="w-3 h-3 fill-current rotate-45" />
            <span>Pinned Message</span>
          </div>
        )}

        {/* Reply Quote preview */}
        {message.replyTo && (
          <div
            className={`w-full text-xs rounded-t-xl px-3 py-1.5 mb-0.5 border-l-2 bg-black/5 dark:bg-white/5 ${
              isCurrentUser
                ? 'border-sky-300 dark:border-sky-400 text-sky-900 dark:text-sky-200'
                : 'border-slate-400 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="font-semibold block text-[10px] opacity-80">{message.replyTo.senderName}</span>
            <span className="line-clamp-1 italic">{message.replyTo.text}</span>
          </div>
        )}

        {/* Message Bubble Body */}
        <div
          className={`relative rounded-2xl p-3 shadow-xs transition-shadow ${
            isCurrentUser
              ? 'bg-[#3390EC] text-white rounded-br-xs'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
          }`}
        >
          {/* Image Message */}
          {message.type === 'image' && message.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-xl cursor-pointer">
              <img
                src={message.mediaUrl}
                alt="Shared attachment"
                onClick={() => setImageModalOpen(true)}
                className="max-h-72 w-full object-cover rounded-xl hover:opacity-95 transition-opacity"
              />
            </div>
          )}

          {/* Voice Note Message */}
          {message.type === 'voice' && (
            <div className="flex items-center gap-3 py-1 min-w-[210px] sm:min-w-[260px]">
              <button
                onClick={toggleAudio}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 ${
                  isCurrentUser
                    ? 'bg-white text-[#3390EC] hover:bg-slate-100'
                    : 'bg-[#3390EC] text-white hover:bg-sky-600'
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 flex flex-col justify-center gap-1.5">
                {/* Waveform bars simulation */}
                <div className="flex items-center gap-0.5 h-6 w-full">
                  {[40, 65, 85, 30, 95, 70, 50, 80, 100, 60, 45, 90, 75, 40, 60, 85, 50, 70, 90, 40].map((h, i) => {
                    const barPercent = (i / 20) * 100;
                    const isActive = audioProgress >= barPercent;
                    return (
                      <span
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-full transition-colors ${
                          isActive
                            ? isCurrentUser ? 'bg-white' : 'bg-[#3390EC]'
                            : isCurrentUser ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] opacity-80 font-mono tabular-nums">
                  <span>Voice Note</span>
                  <span>{message.voiceDuration || 8}s</span>
                </div>
              </div>

              {message.mediaUrl && (
                <audio
                  ref={audioRef}
                  src={message.mediaUrl}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              )}
            </div>
          )}

          {/* File Attachment Message */}
          {message.type === 'file' && (
            <div
              className={`flex items-center gap-3 p-2 rounded-xl mb-1 ${
                isCurrentUser ? 'bg-black/10' : 'bg-slate-100 dark:bg-slate-700/50'
              }`}
            >
              <FileText className="w-8 h-8 text-sky-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{message.mediaFileName || 'Document.pdf'}</p>
                <p className="text-[10px] opacity-75">{message.mediaFileSize || '1.4 MB'}</p>
              </div>
            </div>
          )}

          {/* Text Message Content */}
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}

          {/* Message Meta Info: Timestamp, Edited tag, Status icon */}
          <div
            className={`flex items-center gap-1.5 mt-1 text-[10px] select-none ${
              isCurrentUser ? 'justify-end text-white/80' : 'justify-end text-slate-400 dark:text-slate-500'
            }`}
          >
            {message.scheduledAt && (
              <span className="flex items-center gap-0.5 text-amber-300">
                <Clock className="w-3 h-3" />
                <span>Scheduled</span>
              </span>
            )}
            {message.isEdited && <span className="italic">edited</span>}
            <span className="font-mono tabular-nums">{formatTime(message.timestamp)}</span>
            {isCurrentUser && (
              <span className="inline-flex items-center">
                {message.status === 'sending' && <Clock className="w-3 h-3 animate-spin" />}
                {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
                {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />}
              </span>
            )}
          </div>
        </div>

        {/* Reactions List */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 z-10">
            {Object.entries(message.reactions).map(([emoji, users]) => {
              const hasReacted = users.includes(currentUser.id);
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    soundEffects.playReaction();
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 ${
                    hasReacted
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400/80 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-mono tabular-nums font-semibold">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover Floating Action Bar */}
      {showActions && (
        <div
          className={`absolute top-0 z-20 flex items-center gap-0.5 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg ${
            isCurrentUser ? 'left-4' : 'right-4'
          }`}
        >
          {/* Reaction Button */}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="React"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Reply Button */}
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>

          {/* Forward Button */}
          <button
            onClick={() => onForward(message)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Forward"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div
                className={`absolute ${
                  isCurrentUser ? 'left-0' : 'right-0'
                } top-8 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs z-30`}
              >
                <button
                  onClick={() => {
                    onCopyText(message.text);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy text</span>
                </button>
                <button
                  onClick={() => {
                    onPin(message.id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{message.isPinned ? 'Unpin message' : 'Pin message'}</span>
                </button>
                {isCurrentUser && (
                  <button
                    onClick={() => {
                      onEdit(message);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit message</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(message.id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Quick Reaction Bubble */}
      {showReactionPicker && (
        <div
          className={`absolute ${
            isCurrentUser ? 'left-6 -top-9' : 'right-6 -top-9'
          } z-30 flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl animate-in zoom-in-90 duration-150`}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji);
                setShowReactionPicker(false);
                soundEffects.playReaction();
              }}
              className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {imageModalOpen && message.mediaUrl && (
        <div
          onClick={() => setImageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <img
            src={message.mediaUrl}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
