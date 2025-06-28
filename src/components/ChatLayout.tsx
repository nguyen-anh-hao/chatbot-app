import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';

export const ChatLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="chat-container">
      {/* Mobile sidebar toggle */}
      <div className="md-hidden fixed top-4 left-4 z-10">
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-md"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar */}
      <div className={`md-hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-64 h-full transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-700"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md-block w-64">
        <Sidebar />
      </div>
      <div className="chat-area flex-1">
        <Header />
        <ChatInterface />
      </div>
    </div>
  );
};
