import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

export const Sidebar: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { 
    conversations, 
    currentConversationId, 
    createEmptyConversation, 
    switchConversation,
    loadConversations
  } = useChatStore();

  useEffect(() => {
    const init = async () => {
      await loadConversations();
      setIsInitialLoading(false);
    };
    init();
  }, []);

  const handleNewChat = () => {
    createEmptyConversation();
  };

  const handleSelectConversation = (conversationId: string) => {
    if (conversationId !== currentConversationId) {
      switchConversation(conversationId);
    }
  };

  return (
    <div className="sidebar-container">
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid #ddd', marginTop: 4 }}>
        <button
          onClick={handleNewChat}
          className="btn btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Cuộc trò chuyện mới</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2" style={{ marginTop: 8 }}>
        {isInitialLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="chat-skeleton h-14 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="h-6 w-6 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.505L3 21l2.495-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <p className="text-xs">Chưa có cuộc trò chuyện</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`conversation-item ${
                  currentConversationId === conv.id ? 'active' : ''
                }`}
              >
                <p className="text-sm font-medium truncate" style={{margin: 4}}>{conv.topic}</p>
                {/* <p className="text-xs opacity-60">{conv.message_count} tin nhắn</p> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};