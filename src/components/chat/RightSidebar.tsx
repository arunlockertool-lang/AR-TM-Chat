import React, { useState } from 'react';
import { Chat, User, Message } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  X,
  Bell,
  BellOff,
  Image as ImageIcon,
  FileText,
  Mic,
  Users,
  ShieldAlert,
  UserPlus,
  Trash2,
  Lock,
  Calendar,
  AtSign,
} from 'lucide-react';

interface RightSidebarProps {
  chat: Chat;
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  onClose: () => void;
  onToggleMute: (chatId: string) => void;
  onToggleBlockUser?: (userId: string) => void;
  onAddGroupMember?: (chatId: string, userId: string) => void;
  onRemoveGroupMember?: (chatId: string, userId: string) => void;
  isUserBlocked?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  chat,
  currentUser,
  allUsers,
  messages,
  onClose,
  onToggleMute,
  onToggleBlockUser,
  onAddGroupMember,
  onRemoveGroupMember,
  isUserBlocked = false,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'voice' | 'members'>('media');
  const [showAddMember, setShowAddMember] = useState(false);

  const peerUser =
    chat.type === 'direct'
      ? chat.participants?.find((p) => p.id !== currentUser.id)
      : null;

  // Media items
  const mediaMessages = messages.filter((m) => m.type === 'image' && m.mediaUrl);
  const fileMessages = messages.filter((m) => m.type === 'file');
  const voiceMessages = messages.filter((m) => m.type === 'voice');

  // For group chats, determine who can be added
  const availableUsersToAdd = allUsers.filter(
    (u) => !chat.participantIds.includes(u.id)
  );

  const isAdmin = chat.type === 'group' && chat.adminIds?.includes(currentUser.id);

  return (
    <aside className="w-80 h-full flex flex-col border-l border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden z-20">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {chat.type === 'group' ? 'Group Details' : 'Contact Information'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Overview */}
      <div className="p-6 flex flex-col items-center text-center border-b border-slate-200/80 dark:border-slate-800 overflow-y-auto max-h-72 shrink-0">
        <Avatar
          src={chat.avatarUrl}
          name={chat.name}
          size="xl"
          status={peerUser?.status}
          showStatus={chat.type === 'direct'}
          className="mb-3"
        />

        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{chat.name}</h4>

        {peerUser && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <AtSign className="w-3 h-3 text-sky-500" />
            <span>{peerUser.username}</span>
          </p>
        )}

        {chat.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 px-2 leading-relaxed">
            {chat.description}
          </p>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onToggleMute(chat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              chat.isMuted
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {chat.isMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            <span>{chat.isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {peerUser && onToggleBlockUser && (
            <button
              onClick={() => onToggleBlockUser(peerUser.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isUserBlocked
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isUserBlocked ? 'Blocked' : 'Block'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-slate-200/80 dark:border-slate-800 text-xs px-2 pt-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'media'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Media ({mediaMessages.length})
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'files'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Files ({fileMessages.length})
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'voice'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Audio ({voiceMessages.length})
        </button>

        {chat.type === 'group' && (
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
              activeTab === 'members'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Members ({chat.participantIds.length})
          </button>
        )}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div>
            {mediaMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No photos or videos shared yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((m) => (
                  <div
                    key={m.id}
                    className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={m.mediaUrl}
                      alt="Shared media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div>
            {fileMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No documents shared yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {fileMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                  >
                    <FileText className="w-5 h-5 text-purple-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {m.mediaFileName || m.text}
                      </p>
                      <p className="text-[10px] text-slate-400">{m.mediaFileSize || 'Document'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
          <div>
            {voiceMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No audio notes recorded yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {voiceMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                  >
                    <Mic className="w-5 h-5 text-sky-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Voice Note ({m.voiceDuration || 8}s)
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS TAB (Group Only) */}
        {activeTab === 'members' && chat.type === 'group' && (
          <div className="flex flex-col gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-sky-400/80 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}

            {showAddMember && availableUsersToAdd.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Select Contact to Add:
                </p>
                {availableUsersToAdd.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={user.avatarUrl} name={user.name} size="xs" />
                      <span className="truncate text-xs font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (onAddGroupMember) onAddGroupMember(chat.id, user.id);
                        setShowAddMember(false);
                      }}
                      className="px-2 py-0.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1">
              {chat.participantIds.map((pid) => {
                const u = allUsers.find((user) => user.id === pid);
                if (!u) return null;
                const userIsAdmin = chat.adminIds?.includes(pid);
                const canRemove = isAdmin && pid !== currentUser.id;

                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={u.avatarUrl}
                        name={u.name}
                        size="sm"
                        status={u.status}
                        showStatus
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {u.name}
                          </span>
                          {pid === currentUser.id && (
                            <span className="text-[10px] text-slate-400">(You)</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">@{u.username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {userIsAdmin && (
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      {canRemove && onRemoveGroupMember && (
                        <button
                          onClick={() => onRemoveGroupMember(chat.id, pid)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove from group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Encrypted with AR Protocol</span>
        </span>
        <span className="flex items-center gap-1 font-mono tabular-nums">
          <Calendar className="w-3 h-3" />
          <span>{new Date(chat.createdAt).toLocaleDateString()}</span>
        </span>
      </div>
    </aside>
  );
};
