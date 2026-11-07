import React, { useState, useRef } from 'react';
import { User, Story } from '../../types';
import { X, Image as ImageIcon, Type, Sparkles, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../../services/soundEffects';

interface CreateStoryModalProps {
  currentUser: User;
  onClose: () => void;
  onPublishStory: (story: Story) => void;
}

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #3390EC 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #06B6D4 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  currentUser,
  onClose,
  onPublishStory,
}) => {
  const [storyType, setStoryType] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (storyType === 'text' && !textContent.trim()) return;
    if (storyType === 'image' && !imageUrl) return;

    const newStory: Story = {
      id: 'story_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      type: storyType,
      content: storyType === 'text' ? textContent.trim() : imageUrl,
      backgroundStyle: storyType === 'text' ? selectedGradient : undefined,
      caption: storyType === 'image' && caption.trim() ? caption.trim() : undefined,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000, // 24 hours
      views: [],
    };

    onPublishStory(newStory);
    soundEffects.playSent();

    // Trigger celebratory confetti
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Create 24h Story
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Type Selector Tabs */}
        <div className="px-5 pt-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setStoryType('text')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                storyType === 'text'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text Story</span>
            </button>
            <button
              onClick={() => setStoryType('image')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                storyType === 'image'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Story</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex flex-col gap-4">
          {storyType === 'text' ? (
            <div>
              {/* Story Canvas Preview */}
              <div
                className="w-full h-56 rounded-2xl p-6 flex items-center justify-center text-center shadow-inner relative transition-all"
                style={{ background: selectedGradient }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type your story here..."
                  maxLength={180}
                  className="w-full bg-transparent text-white placeholder-white/60 text-lg font-bold text-center resize-none focus:outline-none drop-shadow-md"
                  rows={3}
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-white/60 font-mono">
                  {textContent.length}/180
                </span>
              </div>

              {/* Gradient selector */}
              <div className="mt-3">
                <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
                  Select Background Color:
                </label>
                <div className="flex items-center gap-2">
                  {GRADIENT_PRESETS.map((grad, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGradient(grad)}
                      style={{ background: grad }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedGradient === grad
                          ? 'ring-2 ring-offset-2 ring-sky-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Image Uploader */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-56 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden transition-colors"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-500 gap-2">
                    <Upload className="w-8 h-8 text-sky-500" />
                    <p className="text-xs font-semibold">Click to upload photo</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFile}
                accept="image/*"
                className="hidden"
              />

              {/* Caption */}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add an optional caption..."
                maxLength={100}
                className="w-full mt-3 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          <p className="text-[11px] text-slate-400 italic">
            🕒 Stories expire automatically after 24 hours. Visible to your contacts.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={
              storyType === 'text' ? !textContent.trim() : !imageUrl
            }
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#3390EC] hover:bg-sky-600 disabled:opacity-50 text-white shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            Share to Story
          </button>
        </div>
      </div>
    </div>
  );
};
