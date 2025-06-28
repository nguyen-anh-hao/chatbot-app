import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { Login } from './components/Login';
import { ChatLayout } from './components/ChatLayout';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { loadConversations, switchConversation, createEmptyConversation } = useChatStore();

  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Tải danh sách cuộc trò chuyện khi đã xác thực
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations().then(() => {
        // Kiểm tra URL hiện tại
        const path = window.location.pathname;
        const pathParts = path.split('/');
        const conversationId = pathParts[pathParts.length - 1];

        if (path.includes('/chat/')) {
          if (conversationId === 'new') {
            // Tạo cuộc trò chuyện mới trống
            createEmptyConversation();
          } else {
            // Chuyển đến cuộc trò chuyện từ ID trong URL
            switchConversation(conversationId);
          }
        } else if (isAuthenticated) {
          // Mặc định chuyển đến /chat
          window.history.pushState({}, '', '/chat');
        }
      });
    }
  }, [isAuthenticated, loadConversations, switchConversation, createEmptyConversation]);

  // Render Login hoặc ChatLayout tùy thuộc vào trạng thái xác thực
  return isAuthenticated ? <ChatLayout /> : <Login />;
}

export default App;
