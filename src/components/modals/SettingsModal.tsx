import React, { useState, useRef } from 'react';
import { User, AppSettings } from '../../types';
import { Avatar } from '../common/Avatar';
import { WALLPAPER_PRESETS, PRESET_AVATARS } from '../../services/storage';
import { testFirestoreConnection, FirebaseStatus } from '../../services/firebaseConfig';
import {
  X,
  User as UserIcon,
  Palette,
  Bell,
  Shield,
  Database,
  Info,
  Check,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface SettingsModalProps {
  currentUser: User;
  settings: AppSettings;
  blockedUsers: User[];
  onClose: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUnblockUser: (userId: string) => void;
  onLogout: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'privacy' | 'firebase' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  settings,
  blockedUsers,
  onClose,
  onUpdateUser,
  onUpdateSettings,
  onUnblockUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Edit Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Firebase test status state
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus | null>(null);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onUpdateUser({
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    soundEffects.playSent();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    soundEffects.playClick();
    const res = await testFirestoreConnection();
    setFirebaseStatus(res);
    setIsTestingFirebase(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[620px] max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left Tabs Menu */}
        <div className="w-full md:w-56 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex md:flex-col justify-between shrink-0 overflow-x-auto">
          <div className="flex md:flex-col gap-1 w-full">
            <div className="px-3 py-2 hidden md:block">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Settings</h3>
              <p className="text-[10px] text-slate-400">ARChat by AR Tech</p>
            </div>

            {[
              { id: 'profile', label: 'Edit Profile', icon: <UserIcon className="w-4 h-4" /> },
              { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
              { id: 'firebase', label: 'Firebase Backend', icon: <Database className="w-4 h-4" /> },
              { id: 'about', label: 'About ARChat', icon: <Info className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as SettingsTab);
                  soundEffects.playClick();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === item.id
                    ? 'bg-[#3390EC] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-4"
          >
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {activeTab === 'firebase' ? 'Firebase Cloud Configuration' : activeTab}
            </h4>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 text-xs">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-4 max-w-md">
                {/* Avatar changer */}
                <div className="flex items-center gap-4">
                  <Avatar src={avatarUrl} name={name} size="xl" className="ring-2 ring-sky-500/40" />
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Or pick a studio preset below:</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Preset Avatars */}
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarUrl(src)}
                      className={`w-9 h-9 rounded-full overflow-hidden transition-all ${
                        avatarUrl === src ? 'ring-2 ring-sky-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Username handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      maxLength={30}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono border-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    Bio / Status Line
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    placeholder="Tell your team what you're working on..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none focus:ring-1 focus:ring-sky-500 resize-none"
                  />
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-xl bg-[#3390EC] hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                  {savedFeedback && (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4" /> Profile updated!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-5 max-w-md">
                {/* Theme Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                    Interface Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onUpdateSettings({ theme: 'dark' })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                        settings.theme === 'dark'
                          ? 'border-sky-500 bg-sky-50/10 dark:bg-sky-950/30 text-sky-500 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold">Dark Theme</p>
                        <p className="text-[10px] text-slate-400">Deep #0B1120 background</p>
                      </div>
                    </button>

                    <button
                      onClick={() => onUpdateSettings({ theme: 'light' })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                        settings.theme === 'light'
                          ? 'border-sky-500 bg-sky-50 text-sky-600 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold">Light Theme</p>
                        <p className="text-[10px] text-slate-400">Clean #F8FAFC canvas</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Chat Wallpaper presets */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                    Chat Wallpaper
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {WALLPAPER_PRESETS.map((wp) => {
                      const isSelected = settings.chatWallpaper === wp.value;
                      return (
                        <button
                          key={wp.id}
                          onClick={() => onUpdateSettings({ chatWallpaper: wp.value })}
                          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <span>{wp.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                    Message Font Size
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onUpdateSettings({ fontSize: sz })}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-colors ${
                          settings.fontSize === sz
                            ? 'bg-[#3390EC] text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-sky-500" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        In-App Sound Effects
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Synthesizes crisp message chimes and reaction pops
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      onUpdateSettings({ soundEnabled: e.target.checked });
                      soundEffects.setEnabled(e.target.checked);
                      if (e.target.checked) soundEffects.playSent();
                    }}
                    className="w-4 h-4 accent-[#3390EC] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Desktop Push Notifications
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Receive alerts when application is in background
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.desktopNotifications}
                    onChange={(e) => {
                      onUpdateSettings({ desktopNotifications: e.target.checked });
                      if (e.target.checked && 'Notification' in window) {
                        Notification.requestPermission();
                      }
                    }}
                    className="w-4 h-4 accent-[#3390EC] cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => soundEffects.playReceived()}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 self-start"
                >
                  🔊 Play Test Notification Chime
                </button>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Read Receipts (Double Blue Check)
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Let contacts see when you have read their messages
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.readReceipts}
                    onChange={(e) => onUpdateSettings({ readReceipts: e.target.checked })}
                    className="w-4 h-4 accent-[#3390EC] cursor-pointer"
                  />
                </div>

                {/* Blocked Users Section */}
                <div className="mt-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Blocked Users ({blockedUsers.length})
                  </h5>
                  {blockedUsers.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No blocked users.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {blockedUsers.map((bu) => (
                        <div
                          key={bu.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar src={bu.avatarUrl} name={bu.name} size="sm" />
                            <div>
                              <p className="text-xs font-bold">{bu.name}</p>
                              <p className="text-[10px] text-slate-400">@{bu.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onUnblockUser(bu.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FIREBASE TAB */}
            {activeTab === 'firebase' && (
              <div className="flex flex-col gap-4 max-w-lg">
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      <span>Firebase & Firestore Integration</span>
                    </span>
                    <button
                      onClick={handleTestFirebase}
                      disabled={isTestingFirebase}
                      className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingFirebase ? 'animate-spin' : ''}`} />
                      <span>Test Live Connection</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    ARChat uses an intermediate blueprint architecture (<code className="font-mono text-sky-600">firebase-blueprint.json</code>) with 8-pillar ABAC Firestore rules (<code className="font-mono text-sky-600">firestore.rules</code>) alongside ultra-fast multi-tab BroadcastChannel real-time sync.
                  </p>
                </div>

                {firebaseStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      firebaseStatus.isConnected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <p className="font-bold">
                      {firebaseStatus.isConnected ? '✅ Firestore Connected' : 'ℹ️ Realtime Local Engine Active'}
                    </p>
                    <p className="text-[11px] mt-0.5">{firebaseStatus.error || 'All cloud queries synchronized.'}</p>
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/60 flex flex-col gap-2">
                  <h6 className="font-bold text-slate-900 dark:text-slate-100">
                    How to Connect Your Own Firebase Project:
                  </h6>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    <li>Go to <span className="font-mono text-sky-600">console.firebase.google.com</span> and create a project.</li>
                    <li>Enable <strong>Cloud Firestore</strong> and <strong>Firebase Authentication</strong> (Google / Email).</li>
                    <li>Copy your Web App config into <code className="font-mono text-slate-800 dark:text-slate-200">firebase-applet-config.json</code>.</li>
                    <li>Deploy the pre-generated <code className="font-mono text-slate-800 dark:text-slate-200">firestore.rules</code> security policy.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3390EC] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-base font-extrabold text-slate-900 dark:text-white">
                      ARChat
                    </h5>
                    <p className="text-xs text-sky-500 font-semibold">Engineered by AR Tech</p>
                    <p className="text-[10px] text-slate-400 font-mono">Version 2.4.0 (Production Release)</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  ARChat is a high-performance messaging and social communication platform engineered with React, TypeScript, Tailwind CSS, Web Audio API, and Cloud Firestore. Built with zero-pill discipline, smooth real-time cross-tab synchronization, voice messaging, and 24-hour stories.
                </p>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500 space-y-1">
                  <p>• <strong>Lead Engineer:</strong> Alex Rivera (@arivera)</p>
                  <p>• <strong>Design System:</strong> Electric Blue & Dark Slate UI</p>
                  <p>• <strong>Protocol:</strong> Real-time BroadcastChannel & Firestore</p>
                  <p>• <strong>Audio:</strong> Native Web Audio Synthesizer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
