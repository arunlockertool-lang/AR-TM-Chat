import React, { useState } from 'react';
import { Chat, User, Story, ChatFolder, UserStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Search,
  Plus,
  MessageCircle,
  Users,
  Compass,
  Settings,
  Sun,
  Moon,
  Pin,
  BellOff,
  Archive,
  Trash2,
  MoreVertical,
  CheckCheck,
  Check,
  Mic,
  Image as ImageIcon,
  LogOut,
  Radio,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface LeftSidebarProps {
  currentUser: User;
  chats: Chat[];
  stories: Story[];
  activeChatId: string | null;
  activeFolder: ChatFolder;
  theme: 'dark' | 'light';
  onSelectChat: (chatId: string) => void;
  onSelectFolder: (folder: ChatFolder) => void;
  onOpenNewChat: () => void;
  onOpenCreateStory: () => void;
  onOpenStoryViewer: (story: Story) => void;
  onOpenSettings: () => void;
  onOpenContacts: () => void;
  onToggleTheme: () => void;
  onTogglePinChat: (chatId: string) => void;
  onToggleMuteChat: (chatId: string) => void;
  onToggleArchiveChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onChangeUserStatus: (status: UserStatus) => void;
  onSwitchUser: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentUser,
  chats,
  stories,
  activeChatId,
  activeFolder,
  theme,
  onSelectChat,
  onSelectFolder,
  onOpenNewChat,
  onOpenCreateStory,
  onOpenStoryViewer,
  onOpenSettings,
  onOpenContacts,
  onToggleTheme,
  onTogglePinChat,
  onToggleMuteChat,
  onToggleArchiveChat,
  onDeleteChat,
  onChangeUserStatus,
  onSwitchUser,
}) => {
  const [search, setSearch] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [chatContextMenuId, setChatContextMenuId] = useState<string | null>(null);

  // Group stories by user (latest story per user)
  const storiesByUser: Record<string, Story[]> = {};
  stories.forEach((s) => {
    if (!storiesByUser[s.userId]) storiesByUser[s.userId] = [];
    storiesByUser[s.userId].push(s);
  });

  // Filter chats by search and folder
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.lastMessage?.text.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFolder === 'archived') return chat.isArchived;
    if (chat.isArchived) return false; // Hide archived from standard views

    if (activeFolder === 'direct') return chat.type === 'direct';
    if (activeFolder === 'groups') return chat.type === 'group';
    if (activeFolder === 'unread') return (chat.unreadCount[currentUser.id] || 0) > 0;

    return true; // 'all'
  });

  // Sort: pinned first, then by last message timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessage?.timestamp || a.createdAt;
    const timeB = b.lastMessage?.timestamp || b.createdAt;
    return timeB - timeA;
  });

  // Calculate unread badge count
  const unreadTotal = chats.reduce(
    (acc, c) => acc + (c.unreadCount[currentUser.id] || 0),
    0
  );

  const formatMessageTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'online':
        return 'text-emerald-500';
      case 'away':
        return 'text-amber-500';
      case 'busy':
        return 'text-rose-500';
      case 'offline':
        return 'text-slate-400';
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 select-none z-20">
      {/* Brand Header & User Status Bar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3390EC] via-indigo-600 to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                ARChat
              </span>
              <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.2 rounded font-mono">
                v2.4
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">AR Tech Platform</p>
          </div>
        </div>

        {/* User profile with status dropdown & New Chat button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Start new conversation or group"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Current User Avatar with Status Menu */}
          <div className="relative">
            <Avatar
              src={currentUser.avatarUrl}
              name={currentUser.name}
              size="sm"
              status={currentUser.status}
              showStatus
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="cursor-pointer hover:ring-2 hover:ring-sky-500/50 transition-all"
            />

            {showStatusMenu && (
              <div className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">@{currentUser.username}</p>
                </div>

                <div className="px-2 py-1">
                  <p className="text-[10px] font-semibold text-slate-400 px-2 mb-1">Set Status</p>
                  {(['online', 'away', 'busy', 'offline'] as UserStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onChangeUserStatus(st);
                        setShowStatusMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusBadgeColor(st)}`} />
                        <span>{st}</span>
                      </span>
                      {currentUser.status === st && (
                        <Check className="w-3.5 h-3.5 text-sky-500" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    onOpenSettings();
                    setShowStatusMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    onSwitchUser();
                    setShowStatusMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>Switch Demo User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats, contacts, messages..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:outline-none focus:border-sky-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Stories Reel */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {/* Add story button */}
          <div
            onClick={onOpenCreateStory}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-sky-400 dark:border-sky-500/80 flex items-center justify-center bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Your Story</span>
          </div>

          {/* User stories */}
          {Object.entries(storiesByUser).map(([uid, userStoryList]) => {
            const firstStory = userStoryList[0];
            const hasUnviewed = userStoryList.some((s) => !s.views.includes(currentUser.id));

            return (
              <div
                key={uid}
                onClick={() => onOpenStoryViewer(firstStory)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                    hasUnviewed
                      ? 'bg-gradient-to-tr from-[#3390EC] via-purple-500 to-pink-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className="p-0.5 rounded-full bg-white dark:bg-slate-900">
                    <Avatar
                      src={firstStory.userAvatar}
                      name={firstStory.userName}
                      size="md"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[54px] text-center">
                  {firstStory.userName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Folder Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All' },
          { id: 'direct', label: 'Direct' },
          { id: 'groups', label: 'Groups' },
          { id: 'unread', label: 'Unread', badge: unreadTotal },
          { id: 'archived', label: 'Archived' },
        ].map((f) => {
          const isActive = activeFolder === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                onSelectFolder(f.id as ChatFolder);
                soundEffects.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-[#3390EC] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{f.label}</span>
              {f.badge && f.badge > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#3390EC] text-white">
                  {f.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {sortedChats.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 px-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations found in this category.</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const unread = chat.unreadCount[currentUser.id] || 0;
            const lastMsg = chat.lastMessage;
            const peer =
              chat.type === 'direct'
                ? chat.participants?.find((p) => p.id !== currentUser.id)
                : null;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  soundEffects.playClick();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setChatContextMenuId(chatContextMenuId === chat.id ? null : chat.id);
                }}
                className={`relative group flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-sky-50/80 dark:bg-sky-950/40 border-l-4 border-l-[#3390EC]'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent'
                }`}
              >
                <Avatar
                  src={chat.avatarUrl}
                  name={chat.name}
                  size="md"
                  status={peer?.status}
                  showStatus={chat.type === 'direct'}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {chat.name}
                      </h4>
                      {chat.isMuted && (
                        <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                        {formatMessageTime(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      {lastMsg ? (
                        <>
                          {lastMsg.senderId === currentUser.id && (
                            <span className="inline-flex items-center shrink-0">
                              {lastMsg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                              ) : lastMsg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </span>
                          )}
                          {lastMsg.type === 'voice' ? (
                            <span className="flex items-center gap-1 text-sky-500 font-medium">
                              <Mic className="w-3 h-3" /> Voice note
                            </span>
                          ) : lastMsg.type === 'image' ? (
                            <span className="flex items-center gap-1 text-purple-500 font-medium">
                              <ImageIcon className="w-3 h-3" /> Photo
                            </span>
                          ) : (
                            <span className="truncate">{lastMsg.text}</span>
                          )}
                        </>
                      ) : (
                        <span className="italic text-slate-400">No messages yet</span>
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-sky-500 fill-current rotate-45" />
                      )}
                      {unread > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#3390EC] text-white text-[11px] font-bold font-mono flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Context Menu Dropdown */}
                {chatContextMenuId === chat.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-4 top-10 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs z-30"
                  >
                    <button
                      onClick={() => {
                        onTogglePinChat(chat.id);
                        setChatContextMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{chat.isPinned ? 'Unpin' : 'Pin to top'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleMuteChat(chat.id);
                        setChatContextMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <BellOff className="w-3.5 h-3.5" />
                      <span>{chat.isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleArchiveChat(chat.id);
                        setChatContextMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{chat.isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onDeleteChat(chat.id);
                        setChatContextMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete conversation</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Action Dock */}
      <div className="h-14 px-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => onSelectFolder('all')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeFolder === 'all'
              ? 'text-[#3390EC]'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Chats"
        >
          <MessageCircle className="w-4.5 h-4.5" />
          <span>Chats</span>
        </button>

        <button
          onClick={onOpenContacts}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="Contacts & Directory"
        >
          <Compass className="w-4.5 h-4.5" />
          <span>Discover</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-700" />
          )}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
