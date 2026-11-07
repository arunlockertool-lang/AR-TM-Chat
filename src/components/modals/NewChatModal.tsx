import React, { useState } from 'react';
import { User, Chat } from '../../types';
import { Avatar } from '../common/Avatar';
import { X, Search, Users, User as UserIcon, Check, Plus } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface NewChatModalProps {
  currentUser: User;
  allUsers: User[];
  existingChats: Chat[];
  onClose: () => void;
  onStartDirectChat: (targetUser: User) => void;
  onCreateGroupChat: (groupName: string, description: string, avatarUrl: string, memberIds: string[]) => void;
}

const GROUP_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&auto=format&fit=crop&q=80',
];

export const NewChatModal: React.FC<NewChatModalProps> = ({
  currentUser,
  allUsers,
  existingChats,
  onClose,
  onStartDirectChat,
  onCreateGroupChat,
}) => {
  const [tab, setTab] = useState<'direct' | 'group'>('direct');
  const [search, setSearch] = useState('');

  // Group creation state
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(GROUP_AVATAR_PRESETS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Filter out current user from contacts directory
  const directoryUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filteredUsers = directoryUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMemberSelection = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    onCreateGroupChat(groupName.trim(), groupDesc.trim(), groupAvatar, [
      currentUser.id,
      ...selectedMembers,
    ]);
    soundEffects.playSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tab === 'direct' ? 'New Message' : 'Create Group Chat'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setTab('direct')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'direct'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={() => setTab('group')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'group'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>New Group</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DIRECT CHAT */}
        {tab === 'direct' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people by name or @username..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 -mx-2 px-2">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No users found matching "{search}"
                </div>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onStartDirectChat(u);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={u.avatarUrl}
                          name={u.name}
                          size="md"
                          status={u.status}
                          showStatus
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                          {u.bio && (
                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                              {u.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <button className="px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 text-xs font-semibold shrink-0">
                        Chat
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GROUP CHAT */}
        {tab === 'group' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden gap-3">
            {/* Group details */}
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100">
                <img
                  src={groupAvatar}
                  alt="Group Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name *"
                  maxLength={50}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Group Description (optional)"
                  maxLength={120}
                  className="w-full px-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Avatar presets */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">Avatar:</span>
              {GROUP_AVATAR_PRESETS.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setGroupAvatar(src)}
                  className={`w-7 h-7 rounded-lg overflow-hidden transition-all ${
                    groupAvatar === src
                      ? 'ring-2 ring-sky-500 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Select members */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Select Members ({selectedMembers.length} selected):</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 -mx-1 px-1">
                {directoryUsers.map((u) => {
                  const isSelected = selectedMembers.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleMemberSelection(u.id)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-sky-500 border-sky-500 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create group action button */}
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className="w-full py-2.5 rounded-xl bg-[#3390EC] hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              Create Group Channel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
