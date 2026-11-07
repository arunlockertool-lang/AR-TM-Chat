import React, { useState } from 'react';
import { Chat, Message } from '../../types';
import { Avatar } from '../common/Avatar';
import { X, Search, Share2, Check } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface ForwardModalProps {
  message: Message;
  chats: Chat[];
  onClose: () => void;
  onForwardToChat: (targetChatId: string, message: Message) => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  message,
  chats,
  onClose,
  onForwardToChat,
}) => {
  const [search, setSearch] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleForward = () => {
    if (!selectedChatId) return;
    onForwardToChat(selectedChatId, message);
    soundEffects.playSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Forward Message</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <p className="text-[10px] text-slate-400 font-semibold mb-0.5">FORWARDING:</p>
          <p className="text-slate-700 dark:text-slate-300 italic line-clamp-2">
            "{message.text || (message.type === 'voice' ? 'Voice Note' : 'Attachment')}"
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination chat..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          {filteredChats.map((c) => {
            const isSelected = selectedChatId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedChatId(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-400/60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={c.avatarUrl} name={c.name} size="sm" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {c.name}
                  </span>
                </div>

                {isSelected && <Check className="w-4 h-4 text-sky-500" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedChatId}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#3390EC] hover:bg-sky-600 disabled:opacity-50 text-white shadow-md shadow-sky-500/20"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};
