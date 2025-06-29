import React from 'react';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const { login } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br-blue">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.505L3 21l2.495-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Chatbot AI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập để bắt đầu trò chuyện
          </p>
        </div>
        
        <button
          onClick={login}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
};