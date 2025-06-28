import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currentConversation, status } = useChatStore();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {currentConversation?.topic || "ChatBot AI"}
        </h1>
        {status && (
          <p className="text-sm text-gray-600 mt-1">{status}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-3">
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
            <div className="hidden-md md-block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover-text-gray-700 p-1 rounded transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
