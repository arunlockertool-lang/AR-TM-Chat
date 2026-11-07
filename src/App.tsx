import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Chat,
  Message,
  Story,
  AppSettings,
  ChatFolder,
  ToastNotification,
  UserStatus,
} from './types';
import { AppStorage } from './services/storage';
import { soundEffects } from './services/soundEffects';

// Layout & Core Views
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { ChatArea } from './components/chat/ChatArea';
import { RightSidebar } from './components/chat/RightSidebar';

// Modals
import { StoryViewerModal } from './components/modals/StoryViewerModal';
import { CreateStoryModal } from './components/modals/CreateStoryModal';
import { NewChatModal } from './components/modals/NewChatModal';
import { ForwardModal } from './components/modals/ForwardModal';
import { CallModal } from './components/modals/CallModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ContactsView } from './components/contacts/ContactsView';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/Toast';

export default function App() {
  // Initialize storage once
  useEffect(() => {
    AppStorage.init();
  }, []);

  // Application Data States
  const [currentUser, setCurrentUser] = useState<User>(() => AppStorage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => AppStorage.getUsers());
  const [chats, setChats] = useState<Chat[]>(() => AppStorage.getChats());
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(() =>
    AppStorage.getAllMessages()
  );
  const [stories, setStories] = useState<Story[]>(() => AppStorage.getStories());
  const [settings, setSettings] = useState<AppSettings>(() => AppStorage.getSettings());
  const [blockedIds, setBlockedIds] = useState<string[]>(() => AppStorage.getBlockedIds());

  // Navigation & Active Session States
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const list = AppStorage.getChats();
    return list.length > 0 ? list[0].id : null;
  });
  const [activeFolder, setActiveFolder] = useState<ChatFolder>('all');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, { isTyping: boolean; userName: string }>>({});
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modal Visibility States
  const [activeStoryModal, setActiveStoryModal] = useState<Story | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeCall, setActiveCall] = useState<{ chat: Chat; type: 'audio' | 'video' } | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  // Sync Theme with HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync sound manager settings
  useEffect(() => {
    soundEffects.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Toast Dispatcher Helper
  const showToast = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newToast: ToastNotification = {
      id: 'toast_' + Date.now() + Math.random(),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  }, []);

  // Listen for storage mutations & BroadcastChannel events
  useEffect(() => {
    const unsubscribe = AppStorage.subscribe((event, payload) => {
      if (event === 'MESSAGE_SENT') {
        const { chatId, message } = payload as { chatId: string; message: Message };
        setAllMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), message],
        }));
        setChats(AppStorage.getChats());

        // Play received sound and show toast if sent by peer
        if (message.senderId !== currentUser.id) {
          soundEffects.playReceived();
          if (chatId !== activeChatId) {
            showToast(`New message from ${message.senderName}`, message.text || 'Shared an attachment', 'info');
          }
        }
      } else if (event === 'TYPING') {
        const { chatId, userId, isTyping } = payload as { chatId: string; userId: string; isTyping: boolean };
        const peer = allUsers.find((u) => u.id === userId);
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: { isTyping, userName: peer?.name || 'Someone' },
        }));
      } else if (event === 'CHAT_UPDATED' || event === 'CHAT_READ' || event === 'CHAT_DELETED') {
        setChats(AppStorage.getChats());
      } else if (event === 'MESSAGES_READ' || event === 'MESSAGE_EDITED' || event === 'MESSAGE_DELETED' || event === 'PIN_UPDATED' || event === 'REACTION_UPDATED') {
        setAllMessages(AppStorage.getAllMessages());
      } else if (event === 'STORY_ADDED' || event === 'STORY_VIEWED') {
        setStories(AppStorage.getStories());
      } else if (event === 'USER_UPDATED') {
        setAllUsers(AppStorage.getUsers());
        setCurrentUser(AppStorage.getCurrentUser());
      } else if (event === 'SETTINGS_UPDATED') {
        setSettings(AppStorage.getSettings());
      } else if (event === 'BLOCK_UPDATED') {
        setBlockedIds(AppStorage.getBlockedIds());
      }
    });

    return () => unsubscribe();
  }, [currentUser.id, activeChatId, allUsers, showToast]);

  // Mark active chat as read when opened
  useEffect(() => {
    if (activeChatId) {
      AppStorage.markChatRead(activeChatId, currentUser.id);
      setChats(AppStorage.getChats());
    }
  }, [activeChatId, currentUser.id]);

  // Active chat object and messages
  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const activeMessages = activeChatId ? allMessages[activeChatId] || [] : [];
  const activeTyping = activeChatId && typingUsers[activeChatId]?.isTyping ? typingUsers[activeChatId] : { isTyping: false, userName: '' };

  // --- Handlers ---
  const handleSendMessage = (
    text: string,
    type: 'text' | 'image' | 'voice' | 'file' = 'text',
    extra: {
      mediaUrl?: string;
      mediaFileName?: string;
      mediaFileSize?: string;
      voiceDuration?: number;
      scheduledAt?: number;
    } = {}
  ) => {
    if (!activeChatId) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      text,
      timestamp: Date.now(),
      status: 'sent',
      type,
      ...extra,
    };

    AppStorage.sendMessage(activeChatId, newMsg);
  };

  const handleEditMessage = (chatId: string, messageId: string, newText: string) => {
    AppStorage.editMessage(chatId, messageId, newText);
    showToast('Message Updated', 'Your edit has been saved.', 'success');
  };

  const handleDeleteMessage = (chatId: string, messageId: string) => {
    AppStorage.deleteMessage(chatId, messageId);
    showToast('Message Deleted', 'The message was removed from the conversation.', 'info');
  };

  const handleTogglePinMessage = (chatId: string, messageId: string) => {
    AppStorage.togglePinMessage(chatId, messageId);
    showToast('Pinned Message', 'Pinned status updated.', 'info');
  };

  const handleReactMessage = (chatId: string, messageId: string, emoji: string) => {
    AppStorage.addReaction(chatId, messageId, emoji, currentUser.id);
  };

  const handleForwardMessage = (message: Message) => {
    setForwardingMessage(message);
  };

  const handleConfirmForward = (targetChatId: string, message: Message) => {
    const forwardedMsg: Message = {
      ...message,
      id: 'msg_' + Date.now(),
      chatId: targetChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      timestamp: Date.now(),
      status: 'sent',
      replyTo: undefined,
    };
    AppStorage.sendMessage(targetChatId, forwardedMsg);
    setActiveChatId(targetChatId);
    showToast('Message Forwarded', 'Forwarded successfully to conversation.', 'success');
  };

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      soundEffects.playClick();
      showToast('Copied to Clipboard', 'Text copied successfully.', 'success');
    }
  };

  const handleStartDirectChat = (targetUser: User) => {
    // Check if chat already exists
    const existing = chats.find(
      (c) =>
        c.type === 'direct' &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(targetUser.id)
    );

    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newChat: Chat = {
        id: 'chat_' + Date.now(),
        type: 'direct',
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        description: targetUser.bio,
        participantIds: [currentUser.id, targetUser.id],
        unreadCount: {},
        createdAt: Date.now(),
      };
      AppStorage.saveChat(newChat);
      setActiveChatId(newChat.id);
    }
    setShowContacts(false);
  };

  const handleCreateGroupChat = (
    groupName: string,
    description: string,
    avatarUrl: string,
    memberIds: string[]
  ) => {
    const newGroup: Chat = {
      id: 'group_' + Date.now(),
      type: 'group',
      name: groupName,
      avatarUrl,
      description,
      participantIds: memberIds,
      adminIds: [currentUser.id],
      unreadCount: {},
      createdAt: Date.now(),
      createdBy: currentUser.id,
    };
    AppStorage.saveChat(newGroup);
    setActiveChatId(newGroup.id);
    showToast('Group Created', `"${groupName}" channel is ready!`, 'success');
  };

  const handleTogglePinChat = (chatId: string) => {
    AppStorage.togglePinChat(chatId);
  };

  const handleToggleMuteChat = (chatId: string) => {
    AppStorage.toggleMuteChat(chatId);
  };

  const handleToggleArchiveChat = (chatId: string) => {
    AppStorage.toggleArchiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    AppStorage.deleteChat(chatId);
    if (activeChatId === chatId) {
      const remaining = AppStorage.getChats();
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast('Conversation Deleted', 'The chat has been removed.', 'info');
  };

  const handlePublishStory = (story: Story) => {
    AppStorage.addStory(story);
    showToast('Story Published', 'Your 24-hour status story is live!', 'success');
  };

  const handleViewStory = (storyId: string) => {
    AppStorage.viewStory(storyId, currentUser.id);
  };

  const handleReplyToStory = (story: Story, text: string) => {
    const targetChat = chats.find(
      (c) => c.type === 'direct' && c.participantIds.includes(story.userId)
    );

    const replyMsg: Message = {
      id: 'msg_' + Date.now(),
      chatId: targetChat ? targetChat.id : 'chat_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      text: `Replied to story: "${text}"`,
      timestamp: Date.now(),
      status: 'sent',
      type: 'text',
      replyTo: {
        id: story.id,
        text: story.type === 'text' ? story.content : (story.caption || 'Photo Story'),
        senderName: story.userName,
      },
    };

    if (targetChat) {
      AppStorage.sendMessage(targetChat.id, replyMsg);
      setActiveChatId(targetChat.id);
    } else {
      const newChat: Chat = {
        id: replyMsg.chatId,
        type: 'direct',
        name: story.userName,
        avatarUrl: story.userAvatar,
        participantIds: [currentUser.id, story.userId],
        unreadCount: {},
        createdAt: Date.now(),
      };
      AppStorage.saveChat(newChat);
      AppStorage.sendMessage(newChat.id, replyMsg);
      setActiveChatId(newChat.id);
    }
    showToast('Reply Sent', `Sent to ${story.userName}`, 'success');
  };

  const handleToggleBlockUser = (userId: string) => {
    const blockedNow = AppStorage.toggleBlockUser(userId);
    showToast(
      blockedNow ? 'User Blocked' : 'User Unblocked',
      blockedNow ? 'You will no longer receive calls or messages.' : 'User has been unblocked.',
      'info'
    );
  };

  const handleAddGroupMember = (chatId: string, userId: string) => {
    const chat = AppStorage.getChatById(chatId);
    if (chat && !chat.participantIds.includes(userId)) {
      chat.participantIds.push(userId);
      AppStorage.saveChat(chat);
      showToast('Member Added', 'New member joined group channel.', 'success');
    }
  };

  const handleRemoveGroupMember = (chatId: string, userId: string) => {
    const chat = AppStorage.getChatById(chatId);
    if (chat) {
      chat.participantIds = chat.participantIds.filter((id) => id !== userId);
      AppStorage.saveChat(chat);
      showToast('Member Removed', 'Member removed from group channel.', 'info');
    }
  };

  const handleChangeUserStatus = (status: UserStatus) => {
    const updated = { ...currentUser, status, lastSeen: Date.now() };
    AppStorage.setCurrentUser(updated);
  };

  const handleUpdateUser = (partial: Partial<User>) => {
    const updated = { ...currentUser, ...partial };
    AppStorage.setCurrentUser(updated);
    showToast('Profile Saved', 'User profile successfully synchronized.', 'success');
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    AppStorage.updateSettings(partial);
  };

  const handleLoginSuccess = (user: User) => {
    AppStorage.setCurrentUser(user);
    setShowAuthModal(false);
    showToast('Welcome to ARChat', `Signed in as ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setShowSettings(false);
    setShowAuthModal(true);
  };

  const blockedUsersList = allUsers.filter((u) => blockedIds.includes(u.id));

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col font-sans ${settings.theme === 'dark' ? 'dark bg-[#0B1120] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Main 3-Column Chat Application Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: Sidebar (Visible on desktop or when no chat is selected on mobile) */}
        <div className={`h-full ${activeChatId ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
          <LeftSidebar
            currentUser={currentUser}
            chats={chats}
            stories={stories}
            activeChatId={activeChatId}
            activeFolder={activeFolder}
            theme={settings.theme}
            onSelectChat={(id) => {
              setActiveChatId(id);
              if (window.innerWidth < 768) {
                // On mobile, opening a chat focuses on middle area
              }
            }}
            onSelectFolder={setActiveFolder}
            onOpenNewChat={() => setShowNewChat(true)}
            onOpenCreateStory={() => setShowCreateStory(true)}
            onOpenStoryViewer={setActiveStoryModal}
            onOpenSettings={() => setShowSettings(true)}
            onOpenContacts={() => setShowContacts(true)}
            onToggleTheme={() =>
              handleUpdateSettings({
                theme: settings.theme === 'dark' ? 'light' : 'dark',
              })
            }
            onTogglePinChat={handleTogglePinChat}
            onToggleMuteChat={handleToggleMuteChat}
            onToggleArchiveChat={handleToggleArchiveChat}
            onDeleteChat={handleDeleteChat}
            onChangeUserStatus={handleChangeUserStatus}
            onSwitchUser={() => setShowAuthModal(true)}
          />
        </div>

        {/* MIDDLE COLUMN: Chat Area (Visible when activeChat exists) */}
        {activeChat ? (
          <div className={`h-full flex-1 flex flex-col ${!activeChatId ? 'hidden md:flex' : 'flex w-full'}`}>
            <ChatArea
              chat={activeChat}
              currentUser={currentUser}
              allUsers={allUsers}
              messages={activeMessages}
              isTyping={activeTyping.isTyping}
              typingUserName={activeTyping.userName}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onTogglePinMessage={handleTogglePinMessage}
              onReactMessage={handleReactMessage}
              onForwardMessage={handleForwardMessage}
              onCopyText={handleCopyText}
              onBackToChats={() => setActiveChatId(null)}
              onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              onStartCall={(type) => setActiveCall({ chat: activeChat, type })}
              onTogglePinChat={handleTogglePinChat}
              onToggleMuteChat={handleToggleMuteChat}
              onDeleteChat={handleDeleteChat}
              onTypingNotice={() => {}}
            />
          </div>
        ) : (
          /* Empty Chat Area on desktop when no chat is selected */
          <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50 dark:bg-[#0B1120]">
            <div className="max-w-sm flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-sky-500/10 flex items-center justify-center text-[#3390EC] mb-4 shadow-inner">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Choose an existing chat from the left sidebar or start a new conversation to start messaging.
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#3390EC] hover:bg-sky-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Chat Details & Shared Media Panel */}
        {activeChat && isRightSidebarOpen && (
          <div className="hidden lg:flex h-full animate-in slide-in-from-right-4 duration-200">
            <RightSidebar
              chat={activeChat}
              currentUser={currentUser}
              allUsers={allUsers}
              messages={activeMessages}
              onClose={() => setIsRightSidebarOpen(false)}
              onToggleMute={handleToggleMuteChat}
              onToggleBlockUser={handleToggleBlockUser}
              onAddGroupMember={handleAddGroupMember}
              onRemoveGroupMember={handleRemoveGroupMember}
              isUserBlocked={
                activeChat.type === 'direct'
                  ? blockedIds.includes(activeChat.participantIds.find((id) => id !== currentUser.id) || '')
                  : false
              }
            />
          </div>
        )}
      </div>

      {/* --- Modals & Overlays --- */}

      {/* Story Viewer Modal */}
      {activeStoryModal && (
        <StoryViewerModal
          initialStory={activeStoryModal}
          allStories={stories}
          currentUser={currentUser}
          onClose={() => setActiveStoryModal(null)}
          onViewStory={handleViewStory}
          onReplyToStory={handleReplyToStory}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          currentUser={currentUser}
          onClose={() => setShowCreateStory(false)}
          onPublishStory={handlePublishStory}
        />
      )}

      {/* New Chat / Create Group Modal */}
      {showNewChat && (
        <NewChatModal
          currentUser={currentUser}
          allUsers={allUsers}
          existingChats={chats}
          onClose={() => setShowNewChat(false)}
          onStartDirectChat={handleStartDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
        />
      )}

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          chats={chats}
          onClose={() => setForwardingMessage(null)}
          onForwardToChat={handleConfirmForward}
        />
      )}

      {/* Simulated Audio/Video Call Modal */}
      {activeCall && (
        <CallModal
          chat={activeCall.chat}
          callType={activeCall.type}
          onEndCall={() => {
            setActiveCall(null);
            showToast('Call Ended', 'The call was disconnected.', 'info');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          settings={settings}
          blockedUsers={blockedUsersList}
          onClose={() => setShowSettings(false)}
          onUpdateUser={handleUpdateUser}
          onUpdateSettings={handleUpdateSettings}
          onUnblockUser={handleToggleBlockUser}
          onLogout={handleLogout}
        />
      )}

      {/* User Discovery & Contacts Modal */}
      {showContacts && (
        <ContactsView
          currentUser={currentUser}
          allUsers={allUsers}
          blockedIds={blockedIds}
          onStartChat={handleStartDirectChat}
          onToggleBlockUser={handleToggleBlockUser}
          onClose={() => setShowContacts(false)}
        />
      )}

      {/* Auth / Account Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          availableDemoUsers={allUsers}
        />
      )}

      {/* Global Toast Alerts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
