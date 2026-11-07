import React, { useState } from 'react';
import { User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Radio, X, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface AuthModalProps {
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  availableDemoUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  availableDemoUsers,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      setStatusMsg('Password reset instructions sent to your email.');
      return;
    }

    if (mode === 'signup') {
      if (!name || !username || !email) {
        setStatusMsg('Please complete all required fields.');
        return;
      }
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        bio: 'New ARChat pioneer 🚀',
        status: 'online',
        lastSeen: Date.now(),
        isVerified: false,
        createdAt: Date.now(),
      };
      soundEffects.playSent();
      onLoginSuccess(newUser);
      return;
    }

    // Default or login: find matching or generate user
    const existing = availableDemoUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      soundEffects.playSent();
      onLoginSuccess(existing);
    } else {
      // Create user with given credentials
      const user: User = {
        id: 'user_' + Date.now(),
        name: email.split('@')[0] || 'User',
        username: (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, ''),
        email: email || 'user@artech.io',
        avatarUrl: availableDemoUsers[0].avatarUrl,
        status: 'online',
        lastSeen: Date.now(),
        createdAt: Date.now(),
      };
      soundEffects.playSent();
      onLoginSuccess(user);
    }
  };

  const handleSelectDemoUser = (user: User) => {
    soundEffects.playClick();
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3390EC] via-indigo-600 to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">ARChat</h3>
              <p className="text-[10px] text-slate-400">By AR Tech • Modern Messaging</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1-Click Fast Demo Switcher */}
        <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 border-b border-sky-100 dark:border-sky-900/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">
              Quick Test: 1-Click Demo Profiles
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {availableDemoUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectDemoUser(user)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white dark:bg-slate-800 hover:ring-2 hover:ring-sky-500/60 shadow-xs transition-all shrink-0 text-left"
              >
                <Avatar src={user.avatarUrl} name={user.name} size="xs" />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5 text-xs">
          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px]">
              {statusMsg}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Username (@handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono border-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-sky-500 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-xl bg-[#3390EC] hover:bg-sky-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <span>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Mode toggle */}
          <div className="text-center pt-2 text-[11px] text-slate-500">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sky-500 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sky-500 font-semibold hover:underline"
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
