import React, { useState, useRef, useEffect } from 'react';
import { ReplyReference, Message } from '../../types';
import { EmojiPicker } from '../common/EmojiPicker';
import { VoiceRecorder } from '../../services/audioRecorder';
import { soundEffects } from '../../services/soundEffects';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image as ImageIcon,
  Clock,
  StopCircle,
  Trash2,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, type?: 'text' | 'image' | 'voice' | 'file', extra?: {
    mediaUrl?: string;
    mediaFileName?: string;
    mediaFileSize?: string;
    voiceDuration?: number;
    scheduledAt?: number;
  }) => void;
  replyTo?: ReplyReference | null;
  onCancelReply: () => void;
  editingMessage?: Message | null;
  onCancelEdit: () => void;
  onSaveEdit: (newText: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const typingTimer = useRef<number | null>(null);

  // Sync editing text
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Notify typing status with debounce
    if (onTyping) {
      onTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (scheduledAt?: number) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      onSaveEdit(trimmed);
      setText('');
      return;
    }

    onSendMessage(trimmed, 'text', { scheduledAt });
    soundEffects.playSent();
    setText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowScheduleModal(false);

    if (onTyping) onTyping(false);
  };

  // Voice Note Recording
  const startRecording = async () => {
    try {
      const recorder = new VoiceRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      soundEffects.playClick();

      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      // If hardware microphone not available/blocked in iframe, simulate demo voice note!
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndSendRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.max(1, recordDuration);

    try {
      if (recorderRef.current) {
        const result = await recorderRef.current.stop();
        onSendMessage('', 'voice', {
          mediaUrl: result.audioUrl,
          voiceDuration: result.duration,
        });
      } else {
        // Simulated voice note fallback
        onSendMessage('Simulated high-fidelity audio note', 'voice', {
          voiceDuration: duration,
        });
      }
      soundEffects.playSent();
    } catch {
      onSendMessage('', 'voice', { voiceDuration: duration });
    } finally {
      setIsRecording(false);
      setRecordDuration(0);
      recorderRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
    soundEffects.playClick();
  };

  // File / Image Attachment handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isImage) {
        onSendMessage('', 'image', { mediaUrl: dataUrl });
      } else {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        onSendMessage(file.name, 'file', {
          mediaUrl: dataUrl,
          mediaFileName: file.name,
          mediaFileSize: sizeMb,
        });
      }
      soundEffects.playSent();
      setShowAttachMenu(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md relative z-20">
      {/* Reply Banner */}
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sky-600 dark:text-sky-400">Replying to {replyTo.senderName}:</span>
            <span className="text-slate-600 dark:text-slate-300 truncate italic">"{replyTo.text}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Editing Message:</span>
            <span className="text-slate-600 dark:text-slate-300 truncate">Press Enter to save</span>
          </div>
          <button
            onClick={onCancelEdit}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Input Row */}
      {isRecording ? (
        /* Voice Recording Active Bar */
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 animate-in fade-in duration-200">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Recording Audio...
          </span>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
            {Math.floor(recordDuration / 60)
              .toString()
              .padStart(2, '0')}
            :
            {(recordDuration % 60).toString().padStart(2, '0')}
          </span>

          <div className="flex-1" />

          {/* Cancel Record */}
          <button
            onClick={cancelRecording}
            className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Cancel recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Send Record */}
          <button
            onClick={stopAndSendRecording}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <StopCircle className="w-4 h-4" />
            <span>Send Audio</span>
          </button>
        </div>
      ) : (
        /* Standard Message Bar */
        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Attachment Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Attach media or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Attach Dropdown */}
            {showAttachMenu && (
              <div className="absolute left-0 bottom-12 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-1 text-xs z-30 animate-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  <span>Image / Photo</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Paperclip className="w-4 h-4 text-purple-500" />
                  <span>Document / File</span>
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(true);
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Schedule Message</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />

          {/* Emoji Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Insert emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute left-0 bottom-12 z-40 animate-in slide-in-from-bottom-2 duration-150">
                <EmojiPicker
                  onSelectEmoji={(emoji) => {
                    setText((prev) => prev + emoji);
                    textareaRef.current?.focus();
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-transparent focus-within:border-sky-500/50 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              className="w-full px-3.5 py-2.5 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none max-h-32"
            />
          </div>

          {/* Voice Record / Send Button */}
          {text.trim() || editingMessage ? (
            <button
              onClick={() => handleSend()}
              className="p-2.5 rounded-2xl bg-[#3390EC] hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-transform active:scale-90"
              title="Send Message"
            >
              <Send className="w-4.5 h-4.5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2.5 rounded-2xl text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-90"
              title="Record voice note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Schedule Message Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Schedule Message
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              When should this message be delivered?
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => handleSend(Date.now() + 60000)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                In 1 minute
              </button>
              <button
                onClick={() => handleSend(Date.now() + 300000)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                In 5 minutes
              </button>
              <button
                onClick={() => handleSend(Date.now() + 3600000)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                In 1 hour
              </button>
            </div>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
