import { User, Message, Chat, Story, AppSettings } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'archat_current_user',
  USERS: 'archat_users',
  CHATS: 'archat_chats',
  MESSAGES: 'archat_messages',
  STORIES: 'archat_stories',
  SETTINGS: 'archat_settings',
  BLOCKED_IDS: 'archat_blocked_ids',
};

// Seed Images
const AVATAR_ALEX = '/src/assets/images/avatar_alex_tech_1794057722269.jpg';
const AVATAR_SARAH = '/src/assets/images/avatar_sarah_design_1794057723144.jpg';
const AVATAR_DAVID = '/src/assets/images/avatar_david_dev_1794057723943.jpg';
const CHAT_WALLPAPER = '/src/assets/images/chat_wallpaper_neon_1794057723687.jpg';

// Preset Avatars
export const PRESET_AVATARS = [
  AVATAR_ALEX,
  AVATAR_SARAH,
  AVATAR_DAVID,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Default Dark Slate', value: '' },
  { id: 'neon', name: 'Cyber Blue & Violet', value: CHAT_WALLPAPER },
  { id: 'dots', name: 'Subtle Matrix Grid', value: 'radial-gradient(rgba(51, 144, 236, 0.15) 1px, transparent 0)' },
  { id: 'gradient-subtle', name: 'Deep Midnight Glow', value: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.12), transparent 70%)' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_current',
    name: 'Alex Rivera',
    username: 'arivera',
    email: 'alex.rivera@artech.io',
    avatarUrl: AVATAR_ALEX,
    bio: 'Software Architect & Tech Lead at AR Tech. Building the future of communication.',
    status: 'online',
    lastSeen: Date.now(),
    isVerified: true,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'user_sarah',
    name: 'Sarah Lin',
    username: 'sarah_ui',
    email: 'sarah.lin@artech.io',
    avatarUrl: AVATAR_SARAH,
    bio: 'Lead Product Designer 🎨 Obsessed with zero-pill UI, micro-animations & spatial balance.',
    status: 'online',
    lastSeen: Date.now() - 1000 * 60 * 4,
    isVerified: true,
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: 'user_david',
    name: 'David Miller',
    username: 'david_systems',
    email: 'david.miller@artech.io',
    avatarUrl: AVATAR_DAVID,
    bio: 'Principal Distributed Systems Engineer. Rust, WebSockets & Firestore.',
    status: 'away',
    lastSeen: Date.now() - 1000 * 60 * 35,
    isVerified: true,
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'user_elena',
    name: 'Elena Vance',
    username: 'elena_art',
    email: 'elena.vance@creative.net',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Creative Technologist. Shaders, WebGL & Audio visualization.',
    status: 'online',
    lastSeen: Date.now() - 1000 * 60 * 12,
    isVerified: false,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'user_marcus',
    name: 'Marcus Brody',
    username: 'marcus_sec',
    email: 'marcus.brody@infosec.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'AppSec & Zero-Trust Architect. E2EE and Firestore security audit.',
    status: 'offline',
    lastSeen: Date.now() - 1000 * 60 * 180,
    isVerified: true,
    createdAt: Date.now() - 86400000 * 90,
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'electric-blue',
  fontSize: 'medium',
  soundEnabled: true,
  readReceipts: true,
  lastSeenPrivacy: 'everyone',
  chatWallpaper: CHAT_WALLPAPER,
  desktopNotifications: true,
};

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat_sarah',
    type: 'direct',
    name: 'Sarah Lin',
    avatarUrl: AVATAR_SARAH,
    description: 'Lead Product Designer at AR Tech',
    participantIds: ['user_current', 'user_sarah'],
    unreadCount: { user_current: 1 },
    isPinned: true,
    isArchived: false,
    isMuted: false,
    wallpaper: CHAT_WALLPAPER,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'chat_core_team',
    type: 'group',
    name: 'AR Tech Core Guild',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: 'Official channel for ARChat platform architecture, releases, and design sprints.',
    participantIds: ['user_current', 'user_sarah', 'user_david', 'user_elena', 'user_marcus'],
    adminIds: ['user_current', 'user_david'],
    unreadCount: { user_current: 0 },
    pinnedMessageId: 'msg_group_pin',
    isPinned: true,
    isArchived: false,
    isMuted: false,
    createdAt: Date.now() - 86400000 * 14,
    createdBy: 'user_current',
  },
  {
    id: 'chat_david',
    type: 'direct',
    name: 'David Miller',
    avatarUrl: AVATAR_DAVID,
    description: 'Principal Distributed Systems Engineer',
    participantIds: ['user_current', 'user_david'],
    unreadCount: { user_current: 0 },
    isPinned: false,
    isArchived: false,
    isMuted: false,
    createdAt: Date.now() - 86400000 * 8,
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  chat_sarah: [
    {
      id: 'msg_s1',
      chatId: 'chat_sarah',
      senderId: 'user_sarah',
      senderName: 'Sarah Lin',
      senderAvatar: AVATAR_SARAH,
      text: 'Hey Alex! I just finalized the fresh ARChat UI design specifications. What do you think about using subtle glassmorphic panels and Electric Blue for high-intent actions?',
      timestamp: Date.now() - 1000 * 60 * 30,
      status: 'read',
      type: 'text',
      reactions: { '🔥': ['user_current'] },
    },
    {
      id: 'msg_s2',
      chatId: 'chat_sarah',
      senderId: 'user_current',
      senderName: 'Alex Rivera',
      senderAvatar: AVATAR_ALEX,
      text: 'The palette looks incredible Sarah! The contrast against our deep #0B1120 background makes text crystal clear.',
      timestamp: Date.now() - 1000 * 60 * 25,
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_s3',
      chatId: 'chat_sarah',
      senderId: 'user_sarah',
      senderName: 'Sarah Lin',
      senderAvatar: AVATAR_SARAH,
      text: 'Here is a quick voice note explaining the new audio waveform scrubber and interactive story viewer interactions.',
      timestamp: Date.now() - 1000 * 60 * 10,
      status: 'read',
      type: 'voice',
      voiceDuration: 8,
      mediaUrl: '', // simulated synthesized voice note
      reactions: { '👍': ['user_current'] },
    },
    {
      id: 'msg_s4',
      chatId: 'chat_sarah',
      senderId: 'user_sarah',
      senderName: 'Sarah Lin',
      senderAvatar: AVATAR_SARAH,
      text: 'Also sent you the latest mobile viewport specs. Let me know if the message bubble reply layout works well on compact screens! 🚀',
      timestamp: Date.now() - 1000 * 60 * 4,
      status: 'delivered',
      type: 'text',
    },
  ],
  chat_core_team: [
    {
      id: 'msg_group_pin',
      chatId: 'chat_core_team',
      senderId: 'user_current',
      senderName: 'Alex Rivera',
      senderAvatar: AVATAR_ALEX,
      text: '📌 ARChat Sprint Notice: All core messaging, group roles, voice notes, and stories are live. Please test real-time synchronization across browser tabs!',
      timestamp: Date.now() - 1000 * 60 * 180,
      status: 'read',
      type: 'text',
      isPinned: true,
      reactions: { '🚀': ['user_sarah', 'user_david', 'user_elena'] },
    },
    {
      id: 'msg_g1',
      chatId: 'chat_core_team',
      senderId: 'user_david',
      senderName: 'David Miller',
      senderAvatar: AVATAR_DAVID,
      text: 'Firestore security rules audit passed with zero vulnerabilities. The 8 security pillars are fully applied.',
      timestamp: Date.now() - 1000 * 60 * 75,
      status: 'read',
      type: 'text',
      reactions: { '🛡️': ['user_current', 'user_marcus'] },
    },
    {
      id: 'msg_g2',
      chatId: 'chat_core_team',
      senderId: 'user_elena',
      senderName: 'Elena Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      text: 'I tested the Story viewer and the 24-hour auto expiration logic. Smooth transitions and the segmented progress bars feel like Instagram & Telegram combined!',
      timestamp: Date.now() - 1000 * 60 * 40,
      status: 'read',
      type: 'text',
    },
  ],
  chat_david: [
    {
      id: 'msg_d1',
      chatId: 'chat_david',
      senderId: 'user_david',
      senderName: 'David Miller',
      senderAvatar: AVATAR_DAVID,
      text: 'Hey Alex, our WebSocket fallbacks and BroadcastChannel listeners are holding up perfectly under multi-window testing.',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'read',
      type: 'text',
    },
    {
      id: 'msg_d2',
      chatId: 'chat_david',
      senderId: 'user_current',
      senderName: 'Alex Rivera',
      senderAvatar: AVATAR_ALEX,
      text: 'Fantastic work David! Let me know once the database blueprint schema is fully synced with our collections.',
      timestamp: Date.now() - 1000 * 60 * 80,
      status: 'read',
      type: 'text',
    },
  ],
};

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_sarah_1',
    userId: 'user_sarah',
    userName: 'Sarah Lin',
    userAvatar: AVATAR_SARAH,
    type: 'text',
    content: 'Crafting the future of real-time messaging with AR Tech. Design is intelligence made visible! ✨',
    backgroundStyle: 'linear-gradient(135deg, #3390EC 0%, #8B5CF6 100%)',
    createdAt: Date.now() - 1000 * 60 * 120,
    expiresAt: Date.now() + 1000 * 60 * 60 * 22,
    views: ['user_current', 'user_david'],
  },
  {
    id: 'story_david_1',
    userId: 'user_david',
    userName: 'David Miller',
    userAvatar: AVATAR_DAVID,
    type: 'text',
    content: 'Zero-latency WebSocket delivery achieved. 100k events/sec tested on local cluster ⚡️',
    backgroundStyle: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #06B6D4 100%)',
    createdAt: Date.now() - 1000 * 60 * 240,
    expiresAt: Date.now() + 1000 * 60 * 60 * 20,
    views: ['user_current'],
  },
  {
    id: 'story_elena_1',
    userId: 'user_elena',
    userName: 'Elena Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    content: CHAT_WALLPAPER,
    caption: 'Neon circuitry backdrop generated for ARChat 🌌',
    createdAt: Date.now() - 1000 * 60 * 360,
    expiresAt: Date.now() + 1000 * 60 * 60 * 18,
    views: ['user_current', 'user_sarah'],
  },
];

// BroadcastChannel for cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('archat_realtime_sync');
  }
} catch {
  // Fallback
}

export class AppStorage {
  private static listeners: Set<(event: string, payload: unknown) => void> = new Set();

  static init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOCKED_IDS)) {
      localStorage.setItem(STORAGE_KEYS.BLOCKED_IDS, JSON.stringify([]));
    }

    // Connect BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data;
        AppStorage.notify(type, payload, false);
      };
    }
  }

  static subscribe(callback: (event: string, payload: unknown) => void) {
    AppStorage.listeners.add(callback);
    return () => {
      AppStorage.listeners.delete(callback);
    };
  }

  private static notify(event: string, payload: unknown, broadcast = true) {
    AppStorage.listeners.forEach((listener) => listener(event, payload));
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({ type: event, payload });
    }
  }

  // --- Users & Auth ---
  static getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  }

  static setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also update in users list
    const users = AppStorage.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    AppStorage.notify('USER_UPDATED', user);
  }

  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static getUserById(id: string): User | undefined {
    return AppStorage.getUsers().find((u) => u.id === id);
  }

  // --- Settings ---
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static updateSettings(partial: Partial<AppSettings>) {
    const current = AppStorage.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    AppStorage.notify('SETTINGS_UPDATED', updated);
    return updated;
  }

  // --- Chats ---
  static getChats(): Chat[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      const chats: Chat[] = data ? JSON.parse(data) : INITIAL_CHATS;
      const allMessages = AppStorage.getAllMessages();
      const allUsers = AppStorage.getUsers();

      // Hydrate lastMessage and participants
      return chats.map((chat) => {
        const chatMsgs = allMessages[chat.id] || [];
        const lastMsg = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : undefined;
        const participants = chat.participantIds.map((id) => allUsers.find((u) => u.id === id)!).filter(Boolean);
        return {
          ...chat,
          lastMessage: lastMsg,
          participants,
        };
      });
    } catch {
      return INITIAL_CHATS;
    }
  }

  static getChatById(chatId: string): Chat | undefined {
    return AppStorage.getChats().find((c) => c.id === chatId);
  }

  static saveChat(chat: Chat) {
    const chats = AppStorage.getChats();
    const idx = chats.findIndex((c) => c.id === chat.id);
    if (idx >= 0) {
      chats[idx] = { ...chats[idx], ...chat };
    } else {
      chats.unshift(chat);
    }
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    AppStorage.notify('CHAT_UPDATED', chat);
  }

  static deleteChat(chatId: string) {
    const chats = AppStorage.getChats().filter((c) => c.id !== chatId);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    const messages = AppStorage.getAllMessages();
    delete messages[chatId];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    AppStorage.notify('CHAT_DELETED', chatId);
  }

  static togglePinChat(chatId: string) {
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.isPinned = !chat.isPinned;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      AppStorage.notify('CHAT_UPDATED', chat);
    }
  }

  static toggleMuteChat(chatId: string) {
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.isMuted = !chat.isMuted;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      AppStorage.notify('CHAT_UPDATED', chat);
    }
  }

  static toggleArchiveChat(chatId: string) {
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.isArchived = !chat.isArchived;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      AppStorage.notify('CHAT_UPDATED', chat);
    }
  }

  // --- Messages ---
  static getAllMessages(): Record<string, Message[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  static getMessages(chatId: string): Message[] {
    const all = AppStorage.getAllMessages();
    return all[chatId] || [];
  }

  static sendMessage(chatId: string, message: Message) {
    const all = AppStorage.getAllMessages();
    if (!all[chatId]) {
      all[chatId] = [];
    }
    all[chatId].push(message);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));

    // Update unread count for other participants
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.participantIds.forEach((pid) => {
        if (pid !== message.senderId) {
          chat.unreadCount[pid] = (chat.unreadCount[pid] || 0) + 1;
        }
      });
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    }

    AppStorage.notify('MESSAGE_SENT', { chatId, message });

    // Automatic smart simulated reply for 1:1 chats when interacting with AI or peers!
    AppStorage.triggerPeerReply(chatId, message);
  }

  static markChatRead(chatId: string, userId: string) {
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);
    if (chat && chat.unreadCount[userId]) {
      chat.unreadCount[userId] = 0;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      AppStorage.notify('CHAT_READ', { chatId, userId });
    }

    // Mark messages as read
    const all = AppStorage.getAllMessages();
    if (all[chatId]) {
      let changed = false;
      all[chatId].forEach((msg) => {
        if (msg.senderId !== userId && msg.status !== 'read') {
          msg.status = 'read';
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
        AppStorage.notify('MESSAGES_READ', { chatId, userId });
      }
    }
  }

  static editMessage(chatId: string, messageId: string, newText: string) {
    const all = AppStorage.getAllMessages();
    const list = all[chatId] || [];
    const msg = list.find((m) => m.id === messageId);
    if (msg) {
      msg.text = newText;
      msg.isEdited = true;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
      AppStorage.notify('MESSAGE_EDITED', { chatId, messageId, newText });
    }
  }

  static deleteMessage(chatId: string, messageId: string) {
    const all = AppStorage.getAllMessages();
    if (all[chatId]) {
      all[chatId] = all[chatId].filter((m) => m.id !== messageId);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
      AppStorage.notify('MESSAGE_DELETED', { chatId, messageId });
    }
  }

  static togglePinMessage(chatId: string, messageId: string) {
    const all = AppStorage.getAllMessages();
    const list = all[chatId] || [];
    const msg = list.find((m) => m.id === messageId);
    const chats = AppStorage.getChats();
    const chat = chats.find((c) => c.id === chatId);

    if (msg && chat) {
      const willPin = !msg.isPinned;
      list.forEach((m) => {
        if (m.id === messageId) {
          m.isPinned = willPin;
        } else if (willPin) {
          m.isPinned = false; // Only one pinned banner at a time
        }
      });
      chat.pinnedMessageId = willPin ? messageId : undefined;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      AppStorage.notify('PIN_UPDATED', { chatId, messageId, isPinned: willPin });
    }
  }

  static addReaction(chatId: string, messageId: string, emoji: string, userId: string) {
    const all = AppStorage.getAllMessages();
    const list = all[chatId] || [];
    const msg = list.find((m) => m.id === messageId);
    if (msg) {
      if (!msg.reactions) {
        msg.reactions = {};
      }
      const userList = msg.reactions[emoji] || [];
      const hasReacted = userList.includes(userId);

      if (hasReacted) {
        msg.reactions[emoji] = userList.filter((id) => id !== userId);
        if (msg.reactions[emoji].length === 0) {
          delete msg.reactions[emoji];
        }
      } else {
        msg.reactions[emoji] = [...userList, userId];
      }

      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
      AppStorage.notify('REACTION_UPDATED', { chatId, messageId, reactions: msg.reactions });
    }
  }

  // --- Stories ---
  static getStories(): Story[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORIES);
      const stories: Story[] = data ? JSON.parse(data) : INITIAL_STORIES;
      // Filter expired stories (>24h)
      const now = Date.now();
      return stories.filter((s) => s.expiresAt > now);
    } catch {
      return INITIAL_STORIES;
    }
  }

  static addStory(story: Story) {
    const stories = AppStorage.getStories();
    stories.unshift(story);
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    AppStorage.notify('STORY_ADDED', story);
  }

  static viewStory(storyId: string, userId: string) {
    const stories = AppStorage.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (story && !story.views.includes(userId)) {
      story.views.push(userId);
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      AppStorage.notify('STORY_VIEWED', { storyId, userId });
    }
  }

  // --- Blocked Users ---
  static getBlockedIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOCKED_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleBlockUser(userId: string): boolean {
    const blocked = AppStorage.getBlockedIds();
    const isBlocked = blocked.includes(userId);
    const updated = isBlocked ? blocked.filter((id) => id !== userId) : [...blocked, userId];
    localStorage.setItem(STORAGE_KEYS.BLOCKED_IDS, JSON.stringify(updated));
    AppStorage.notify('BLOCK_UPDATED', { userId, isBlocked: !isBlocked });
    return !isBlocked;
  }

  // --- Simulated intelligent peer replies for interactive testing ---
  private static triggerPeerReply(chatId: string, outgoing: Message) {
    const chat = AppStorage.getChatById(chatId);
    if (!chat || chat.type !== 'direct') return;

    const peerId = chat.participantIds.find((id) => id !== outgoing.senderId);
    if (!peerId) return;
    const peer = AppStorage.getUserById(peerId);
    if (!peer) return;

    // Simulate typing after 800ms
    setTimeout(() => {
      AppStorage.notify('TYPING', { chatId, userId: peerId, isTyping: true });

      // Send response after 2200ms
      setTimeout(() => {
        AppStorage.notify('TYPING', { chatId, userId: peerId, isTyping: false });

        let replyContent = `Received loud and clear! "${outgoing.text.slice(0, 30)}..."`;
        if (outgoing.type === 'voice') {
          replyContent = `Listened to your voice message! Sounds great, moving forward with this direction. 👍`;
        } else if (outgoing.type === 'image') {
          replyContent = `Awesome photo/asset! High fidelity resolution looks stunning on the Retina display. 🎨`;
        } else {
          const lower = outgoing.text.toLowerCase();
          if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            replyContent = `Hey ${outgoing.senderName}! Hope your day is going well. Testing out the new ARChat features?`;
          } else if (lower.includes('firebase') || lower.includes('backend') || lower.includes('db')) {
            replyContent = `The Firestore blueprint rules and realtime listeners are ready. Everything syncs smoothly! ⚡️`;
          } else if (lower.includes('call') || lower.includes('meeting')) {
            replyContent = `Sure, feel free to tap the Phone or Video call icon in the header whenever you're ready!`;
          } else if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
            replyContent = `Loving the clean typography and electric blue accents. It feels responsive and fast.`;
          } else {
            const replies = [
              `Got it! Let me review this and get back to you in a few minutes.`,
              `Agreed! The real-time synchronization between tabs works seamlessly.`,
              `Sounds like a plan! Let me update the documentation on our side. 🚀`,
              `Thanks for the update! Looking forward to testing this on tablet as well.`,
            ];
            replyContent = replies[Math.floor(Math.random() * replies.length)];
          }
        }

        const replyMessage: Message = {
          id: 'msg_' + Date.now(),
          chatId,
          senderId: peer.id,
          senderName: peer.name,
          senderAvatar: peer.avatarUrl,
          text: replyContent,
          timestamp: Date.now(),
          status: 'delivered',
          type: 'text',
        };

        const all = AppStorage.getAllMessages();
        if (!all[chatId]) all[chatId] = [];
        all[chatId].push(replyMessage);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));

        // Increment unread count for current user
        const chats = AppStorage.getChats();
        const c = chats.find((ch) => ch.id === chatId);
        if (c) {
          c.unreadCount[outgoing.senderId] = (c.unreadCount[outgoing.senderId] || 0) + 1;
          localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
        }

        AppStorage.notify('MESSAGE_SENT', { chatId, message: replyMessage });
      }, 2200);
    }, 800);
  }
}
