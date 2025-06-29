import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import '../styles.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currentConversation } = useChatStore();
  // const { status } = useChatStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{currentConversation?.topic || 'Cuộc trò chuyện mới'}</h1>
        {/* {status ? <p className="header-status">{status}</p> : <p className="header-status">Ạhihi</p>} */}
      </div>

      {user && (
        <div className="avatar-menu" ref={dropdownRef}>
          <button
            className="avatar-button"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="User menu"
          >
            <img src={user.picture} alt={user.name} className="avatar-image" />
          </button>

          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-name">{user.name}</p>
                <p className="dropdown-email">{user.email}</p>
              </div>
              <button className="logout-button" onClick={logout}>
                <svg className="logout-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
