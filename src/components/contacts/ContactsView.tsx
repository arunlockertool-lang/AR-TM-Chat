import React, { useState } from 'react';
import { User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Search, MessageSquare, ShieldAlert, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';

interface ContactsViewProps {
  currentUser: User;
  allUsers: User[];
  blockedIds: string[];
  onStartChat: (user: User) => void;
  onToggleBlockUser: (userId: string) => void;
  onClose: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  currentUser,
  allUsers,
  blockedIds,
  onStartChat,
  onToggleBlockUser,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online'>('all');

  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filtered = otherUsers.filter((u) => {
    const matches =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (filter === 'online') return u.status === 'online';
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-[620px] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                User Directory & Contacts
              </h3>
              <p className="text-[10px] text-slate-400">{otherUsers.length} people in network</p>
            </div>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'online'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Online
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, handle, or expertise..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No contacts match "{search}"
            </div>
          ) : (
            filtered.map((u) => {
              const isBlocked = blockedIds.includes(u.id);

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </span>
                        {u.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">@{u.username}</p>
                      {u.bio && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] mt-0.5">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onStartChat(u)}
                      className="px-3 py-1.5 rounded-xl bg-[#3390EC] hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => onToggleBlockUser(u.id)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isBlocked
                          ? 'border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title={isBlocked ? 'Unblock user' : 'Block user'}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
