import React, { useState } from 'react';
import { Chat, User } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Phone,
  Video,
  Search,
  PanelRight,
  MoreVertical,
  Pin,
  BellOff,
  Bell,
  Trash2,
  ArrowLeft,
  Users,
} from 'lucide-react';

interface ChatHeaderProps {
  chat: Chat;
  currentUser: User;
  isTyping: boolean;
  typingUserName?: string;
  onBackToChats?: () => void;
  onToggleSearch: () => void;
  onToggleRightSidebar: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onTogglePinChat: (chatId: string) => void;
  onToggleMuteChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  currentUser,
  isTyping,
  typingUserName,
  onBackToChats,
  onToggleSearch,
  onToggleRightSidebar,
  onStartCall,
  onTogglePinChat,
  onToggleMuteChat,
  onDeleteChat,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Determine peer user for 1:1 chat
  const peerUser =
    chat.type === 'direct'
      ? chat.participants?.find((p) => p.id !== currentUser.id)
      : null;

  const getSubtext = () => {
    if (isTyping) {
      return (
        <span className="text-[#3390EC] font-medium animate-pulse flex items-center gap-1">
          <span>{typingUserName || 'Someone'} is typing...</span>
        </span>
      );
    }
    if (chat.type === 'group') {
      const count = chat.participantIds.length;
      return (
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Users className="w-3 h-3" />
          <span>{count} members</span>
        </span>
      );
    }
    if (peerUser) {
      if (peerUser.status === 'online') {
        return <span className="text-emerald-500 font-medium">online</span>;
      }
      if (peerUser.status === 'away') {
        return <span className="text-amber-500">away</span>;
      }
      return <span className="text-slate-400">last seen recently</span>;
    }
    return <span className="text-slate-400">offline</span>;
  };

  return (
    <header className="h-16 px-3 sm:px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20">
      {/* Left zone: Back button (mobile) + Avatar + Name & Subtitle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onBackToChats && (
          <button
            onClick={onBackToChats}
            className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar
          src={chat.avatarUrl}
          name={chat.name}
          size="md"
          status={peerUser?.status}
          showStatus={chat.type === 'direct'}
          onClick={onToggleRightSidebar}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        />

        <div
          onClick={onToggleRightSidebar}
          className="min-w-0 cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {chat.name}
            </h2>
            {chat.isMuted && <BellOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {chat.isPinned && <Pin className="w-3.5 h-3.5 text-sky-500 fill-current shrink-0 rotate-45" />}
          </div>
          <p className="text-xs truncate">{getSubtext()}</p>
        </div>
      </div>

      {/* Right zone: Action Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={() => onStartCall('audio')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Start Audio Call"
        >
          <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={() => onStartCall('video')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Start Video Call"
        >
          <Video className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={onToggleSearch}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search in chat"
        >
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={onToggleRightSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
          title="Chat details & media"
        >
          <PanelRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* More dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  onTogglePinChat(chat.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <Pin className="w-4 h-4 text-sky-500" />
                <span>{chat.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}</span>
              </button>

              <button
                onClick={() => {
                  onToggleMuteChat(chat.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                {chat.isMuted ? <Bell className="w-4 h-4 text-amber-500" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                <span>{chat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
              </button>

              <button
                onClick={() => {
                  onToggleRightSidebar();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left sm:hidden"
              >
                <PanelRight className="w-4 h-4" />
                <span>View Contact Info</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  onDeleteChat(chat.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
