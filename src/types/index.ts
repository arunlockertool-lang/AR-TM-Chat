export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  status: UserStatus;
  lastSeen: number;
  isVerified?: boolean;
  createdAt: number;
}

export type MessageType = 'text' | 'image' | 'voice' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ReplyReference {
  id: string;
  text: string;
  senderName: string;
  mediaType?: MessageType;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  type: MessageType;
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileSize?: string;
  voiceDuration?: number; // in seconds
  replyTo?: ReplyReference;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isEdited?: boolean;
  isPinned?: boolean;
  scheduledAt?: number;
}

export type ChatType = 'direct' | 'group';

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl: string;
  description?: string;
  participantIds: string[];
  participants?: User[];
  lastMessage?: Message;
  unreadCount: Record<string, number>; // userId -> count
  pinnedMessageId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  wallpaper?: string;
  draft?: string;
  createdAt: number;
  createdBy?: string;
  adminIds?: string[];
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'text';
  content: string; // Image URL or text content
  backgroundStyle?: string; // For text stories
  caption?: string;
  createdAt: number;
  expiresAt: number;
  views: string[]; // userIds
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export type ChatFolder = 'all' | 'direct' | 'groups' | 'unread' | 'archived';

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string; // 'electric-blue' | 'purple' | 'cyan' | 'emerald'
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  readReceipts: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  chatWallpaper: string;
  desktopNotifications: boolean;
}
