import React, { useState, useRef, useEffect } from 'react';
import { Chat, User, Message, ReplyReference } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { Pin, Search, X, MessageSquare, ChevronDown } from 'lucide-react';

interface ChatAreaProps {
  chat: Chat;
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  isTyping: boolean;
  typingUserName?: string;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'voice' | 'file', extra?: {
    mediaUrl?: string;
    mediaFileName?: string;
    mediaFileSize?: string;
    voiceDuration?: number;
    scheduledAt?: number;
  }) => void;
  onEditMessage: (chatId: string, messageId: string, newText: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onTogglePinMessage: (chatId: string, messageId: string) => void;
  onReactMessage: (chatId: string, messageId: string, emoji: string) => void;
  onForwardMessage: (message: Message) => void;
  onCopyText: (text: string) => void;
  onBackToChats?: () => void;
  onToggleRightSidebar: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onTogglePinChat: (chatId: string) => void;
  onToggleMuteChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onTypingNotice: (isTyping: boolean) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  currentUser,
  messages,
  isTyping,
  typingUserName,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTogglePinMessage,
  onReactMessage,
  onForwardMessage,
  onCopyText,
  onBackToChats,
  onToggleRightSidebar,
  onStartCall,
  onTogglePinChat,
  onToggleMuteChat,
  onDeleteChat,
  onTypingNotice,
}) => {
  const [replyTarget, setReplyTarget] = useState<ReplyReference | null>(null);
  const [editingTarget, setEditingTarget] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find pinned message if present
  const pinnedMessage = messages.find((m) => m.id === chat.pinnedMessageId || m.isPinned);

  // Filter messages by search query if search is active
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Format date headers
  const getDateLabel = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-slate-100 dark:bg-[#0B1120]">
      {/* Optional custom wallpaper overlay */}
      {chat.wallpaper && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-40 bg-cover bg-center transition-opacity"
          style={{ backgroundImage: `url(${chat.wallpaper})` }}
        />
      )}

      {/* Header */}
      <ChatHeader
        chat={chat}
        currentUser={currentUser}
        isTyping={isTyping}
        typingUserName={typingUserName}
        onBackToChats={onBackToChats}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onToggleRightSidebar={onToggleRightSidebar}
        onStartCall={onStartCall}
        onTogglePinChat={onTogglePinChat}
        onToggleMuteChat={onToggleMuteChat}
        onDeleteChat={onDeleteChat}
      />

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div
          onClick={() => {
            const el = document.getElementById(`msg-${pinnedMessage.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="h-10 px-4 bg-sky-500/10 dark:bg-sky-500/20 backdrop-blur-sm border-b border-sky-400/20 flex items-center justify-between cursor-pointer select-none z-10 text-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-[#3390EC] shrink-0 rotate-45 fill-current" />
            <span className="font-semibold text-[#3390EC] shrink-0">Pinned Message:</span>
            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
              {pinnedMessage.text || 'Voice/Attachment'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinMessage(chat.id, pinnedMessage.id);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Unpin"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* In-Chat Search Bar */}
      {showSearch && (
        <div className="h-11 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 z-10 animate-in slide-in-from-top-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this conversation..."
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {filteredMessages.length} match{filteredMessages.length !== 1 ? 'es' : ''}
            </span>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message History Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 relative z-10 flex flex-col justify-start"
      >
        {filteredMessages.length === 0 ? (
          <div className="m-auto text-center p-6 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-sky-500/40" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'No messages match your search' : 'Start of conversation'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {searchQuery
                ? 'Try searching with different keywords or clear the filter.'
                : 'Send a message, voice note, photo, or emoji to begin chatting!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const prevMsg = filteredMessages[index - 1];
            const showDateHeader =
              !prevMsg ||
              new Date(msg.timestamp).toDateString() !==
                new Date(prevMsg.timestamp).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex justify-center my-3 select-none">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-slate-200/60 dark:border-slate-700/60 font-mono tabular-nums">
                      {getDateLabel(msg.timestamp)}
                    </span>
                  </div>
                )}

                <div id={`msg-${msg.id}`}>
                  <MessageItem
                    message={msg}
                    isCurrentUser={msg.senderId === currentUser.id}
                    currentUser={currentUser}
                    isGroup={chat.type === 'group'}
                    onReply={(m) => {
                      setReplyTarget({
                        id: m.id,
                        text: m.text || 'Media attachment',
                        senderName: m.senderName,
                        mediaType: m.type,
                      });
                    }}
                    onEdit={(m) => setEditingTarget(m)}
                    onDelete={(id) => onDeleteMessage(chat.id, id)}
                    onForward={onForwardMessage}
                    onPin={(id) => onTogglePinMessage(chat.id, id)}
                    onReact={(id, emoji) => onReactMessage(chat.id, id, emoji)}
                    onCopyText={onCopyText}
                  />
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute right-6 bottom-24 z-30 p-2.5 rounded-full bg-white dark:bg-slate-800 text-[#3390EC] border border-slate-200 dark:border-slate-700 shadow-xl hover:scale-105 active:scale-95 transition-all"
          title="Scroll to latest"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        replyTo={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        editingMessage={editingTarget}
        onCancelEdit={() => setEditingTarget(null)}
        onSaveEdit={(newText) => {
          if (editingTarget) {
            onEditMessage(chat.id, editingTarget.id, newText);
            setEditingTarget(null);
          }
        }}
        onTyping={onTypingNotice}
      />
    </main>
  );
};
