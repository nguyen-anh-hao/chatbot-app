import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';

export const ChatLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          backgroundColor: '#fff',
          borderRight: '1px solid #ddd',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Header />
        <ChatInterface />
      </div>
    </div>
  );
};
