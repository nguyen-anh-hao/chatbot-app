import { create } from 'zustand';

interface Message {
  id: string;
  role: "user" | "assistant";
  type: "text" | "image";
  content: string;
  images?: string[];  // Thêm mảng images URL
  timestamp: string;
}

interface Conversation {
  id: string;
  topic: string;
  message_count: number;
  last_message_at: string;
  messages: Message[];
}

interface ChatStore {
  conversations: Conversation[];
  currentConversationId: string;
  currentConversation: Conversation | null;
  isLoading: boolean;
  queuedImages: File[];
  status: string;
  loadConversations: () => Promise<void>;
  createConversation: (topic?: string) => Promise<Conversation | null>;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  getHistory: (conversationId: string) => Promise<void>;
  setQueuedImages: (images: File[]) => void;
  addQueuedImages: (images: File[]) => void;
  setStatus: (message: string) => void;
  createEmptyConversation: () => void;
  uploadImages: (files: File[]) => Promise<string[]>;
}

const BASE_URL = "https://4a9d-113-161-91-25.ngrok-free.app";

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversationId: '',
  currentConversation: null,
  isLoading: false,
  queuedImages: [],
  status: '',

  setStatus: (message: string) => set({ status: message }),

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${BASE_URL}/api/conversations`, {
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (res.ok) {
        const convs = await res.json();
        
        // Kiểm tra conversation ID từ URL
        const pathParts = window.location.pathname.split('/');
        const urlConversationId = pathParts[pathParts.length - 1];
        
        // Kiểm tra xem ID từ URL có trong danh sách conversations không
        const isValidUrlId = urlConversationId && convs.some((conv: Conversation) => conv.id === urlConversationId);
        
        // Ưu tiên sử dụng ID từ URL nếu hợp lệ, nếu không sử dụng cuộc trò chuyện đầu tiên
        const newCurrentId = isValidUrlId 
          ? urlConversationId 
          : (convs.length > 0 ? convs[0].id : '');
        
        // Tìm currentConversation tương ứng
        const newCurrentConversation = newCurrentId 
          ? convs.find((conv: Conversation) => conv.id === newCurrentId) || null
          : null;
        
        set({ 
          conversations: convs,
          currentConversationId: newCurrentId,
          currentConversation: newCurrentConversation,
          status: ''
        });
        
        // Load messages cho cuộc trò chuyện được chọn nếu có
        if (newCurrentId) {
          get().getHistory(newCurrentId);
        }
      } else {
        // Xử lý lỗi
        set({ 
          conversations: [], 
          currentConversationId: '',
          currentConversation: null,
          status: "❌ Không thể tải danh sách cuộc trò chuyện" 
        });
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      set({ 
        conversations: [], 
        currentConversationId: '',
        currentConversation: null,
        status: "❌ Lỗi khi tải danh sách cuộc trò chuyện" 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createEmptyConversation: () => {
    const tempId = `temp-${Date.now()}`;
    const emptyConversation: Conversation = {
      id: tempId,
      topic: "Cuộc trò chuyện mới",
      message_count: 0,
      last_message_at: new Date().toISOString(),
      messages: []
    };
    
    set({
      currentConversationId: tempId,
      currentConversation: emptyConversation,
      status: "Cuộc trò chuyện mới. Hãy gửi tin nhắn đầu tiên."
    });
    
    // Cập nhật URL
    window.history.pushState({}, '', `/chat/${tempId}`);
  },

  createConversation: async (topic?: string) => {
    // Không còn hiển thị hộp thoại nhập chủ đề
    set({ isLoading: true, status: "Đang tạo cuộc trò chuyện mới..." });

    try {
      const res = await fetch(`${BASE_URL}/api/conversations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ topic: topic || "Cuộc trò chuyện mới" })
      });

      if (res.ok) {
        const conversation = await res.json();
        const newConv: Conversation = {
          ...conversation,
          messages: []
        };
        
        set(state => ({
          conversations: [newConv, ...state.conversations],
          currentConversationId: newConv.id,
          currentConversation: newConv,
          status: ""
        }));
        
        // Cập nhật URL
        window.history.pushState({}, '', `/chat/${newConv.id}`);
        
        return newConv;
      } else {
        set({ status: "❌ Không thể tạo cuộc hội thoại" });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      set({ status: "❌ Lỗi khi tạo cuộc hội thoại" });
    } finally {
      set({ isLoading: false });
    }
    return null;
  },

  switchConversation: (conversationId: string) => {
    set({ 
      currentConversationId: conversationId,
      status: "Đang tải tin nhắn..."
    });
    get().getHistory(conversationId);
    
    // Cập nhật URL
    window.history.pushState({}, '', `/chat/${conversationId}`);
  },

  deleteConversation: async (conversationId: string) => {
    const { conversations, currentConversationId } = get();
    
    try {
      set({ isLoading: true, status: "Đang xóa cuộc trò chuyện..." });
      
      const res = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (res.ok) {
        const updatedConversations = conversations.filter(c => c.id !== conversationId);
        
        let newCurrentId = currentConversationId;
        let newCurrentConv = null;
        
        if (conversationId === currentConversationId) {
          if (updatedConversations.length > 0) {
            newCurrentId = updatedConversations[0].id;
            newCurrentConv = updatedConversations[0];
            // Load messages for the new current conversation
            get().getHistory(newCurrentId);
          } else {
            newCurrentId = '';
          }
        } else {
          newCurrentConv = conversations.find(c => c.id === currentConversationId) || null;
        }
        
        set({
          conversations: updatedConversations,
          currentConversationId: newCurrentId,
          currentConversation: newCurrentConv,
          status: "✅ Đã xóa cuộc trò chuyện"
        });
      } else {
        set({ status: "❌ Không thể xóa cuộc trò chuyện" });
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      set({ status: "❌ Lỗi khi xóa cuộc trò chuyện" });
    } finally {
      set({ isLoading: false });
    }
  },

  getHistory: async (conversationId: string) => {
    try {
      set({ isLoading: true });
      
      const res = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const messages: Message[] = data.map((msg, index) => ({
            id: `${msg.timestamp}-${index}`,
            role: msg.role === "user" ? "user" : "assistant",
            type: "text",
            content: msg.text || "Tin nhắn hình ảnh",
            images: msg.images || [],  // Thêm images từ API
            timestamp: msg.timestamp
          }));
          
          const conversation = get().conversations.find(c => c.id === conversationId);
          if (conversation) {
            const updatedConv = { ...conversation, messages };
            set(state => ({
              conversations: state.conversations.map(c => 
                c.id === conversationId ? updatedConv : c
              ),
              currentConversation: updatedConv,
              status: ""
            }));
          }
        }
      } else {
        set({ status: "❌ Không thể tải tin nhắn" });
      }
    } catch (error) {
      console.error("Error getting history:", error);
      set({ status: "❌ Lỗi khi tải tin nhắn" });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadImages: async (files: File[]) => {
    if (files.length === 0) return [];
    
    try {
      const formData = new FormData();
      for (let file of files) {
        formData.append("files", file);
      }
      
      const res = await fetch(`${BASE_URL}/api/upload-images`, {
        method: "POST",
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.image_urls || [];
      } else {
        set({ status: "❌ Không thể upload hình ảnh" });
        return [];
      }
    } catch (error) {
      console.error("Upload error:", error);
      set({ status: "❌ Lỗi khi upload hình ảnh" });
      return [];
    }
  },

  sendMessage: async (content: string) => {
    const { currentConversationId, queuedImages } = get();
    
    if (!content.trim() && queuedImages.length === 0) {
      set({ status: "❗ Vui lòng nhập nội dung" });
      return;
    }
    
    let conversationId = currentConversationId;
    let isNewConversation = false;
    
    // Kiểm tra xem đây có phải là cuộc trò chuyện tạm thời không
    if (!conversationId || conversationId.startsWith('temp-')) {
      isNewConversation = true;
      // Sẽ tạo conversation mới thông qua API chat
      conversationId = ''; // Để backend tự tạo
    }

    set({ isLoading: true, status: "Đang gửi tin nhắn..." });
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      type: "text",
      content,
      timestamp: new Date().toISOString()
    };

    // Update current conversation with user message
    set(state => {
      const currentConv = state.currentConversation;
      if (currentConv) {
        const updatedConv = {
          ...currentConv,
          messages: [...(currentConv.messages || []), userMessage]
        };
        
        // Nếu không phải cuộc trò chuyện tạm thời, cập nhật cả trong mảng conversations
        if (!isNewConversation) {
          return {
            currentConversation: updatedConv,
            conversations: state.conversations.map(c => 
              c.id === currentConv.id ? updatedConv : c
            )
          };
        }
        
        return {
          currentConversation: updatedConv
        };
      }
      return state;
    });

    try {
      // Thay đổi: Tải hình ảnh lên trước và lấy URL
      let imageUrls: string[] = [];
      if (queuedImages.length > 0) {
        set({ status: "Đang tải hình ảnh lên..." });
        imageUrls = await get().uploadImages(queuedImages);
        
        // Cập nhật message với URLs hình ảnh
        if (imageUrls.length > 0) {
          set(state => {
            const currentConv = state.currentConversation;
            if (currentConv) {
              // Tìm tin nhắn người dùng vừa thêm và thêm images vào
              const updatedMessages = currentConv.messages.map(msg => 
                msg.id === userMessage.id 
                  ? {...msg, images: imageUrls} 
                  : msg
              );
              
              const updatedConv = {
                ...currentConv,
                messages: updatedMessages
              };
              
              if (!isNewConversation) {
                return {
                  currentConversation: updatedConv,
                  conversations: state.conversations.map(c => 
                    c.id === currentConv.id ? updatedConv : c
                  )
                };
              }
              
              return {
                currentConversation: updatedConv
              };
            }
            return state;
          });
        }
      }
      
      // Tiếp tục gửi tin nhắn với URLs hình ảnh
      set({ status: "Đang gửi tin nhắn..." });
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          text: content.trim() || undefined,
          images: imageUrls, // Sử dụng URLs hình ảnh đã tải lên
          conversation_id: conversationId || undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          set({ status: "❌ " + data.error });
        } else {
          // Nếu là cuộc trò chuyện mới, cần cập nhật ID và thông tin
          if (isNewConversation && data.conversation_id) {
            // Tải lại danh sách cuộc trò chuyện để cập nhật cuộc trò chuyện mới
            await get().loadConversations();
            
            // Chuyển đến cuộc trò chuyện mới được tạo
            get().switchConversation(data.conversation_id);
            
            // Cập nhật URL
            window.history.pushState({}, '', `/chat/${data.conversation_id}`);
          } else {
            // Add bot response
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              type: "text",
              content: data.reply,
              // Hỗ trợ hiển thị hình ảnh từ bot nếu có
              images: data.images || [],
              timestamp: new Date().toISOString()
            };

            // Update conversation with bot message
            set(state => {
              const currentConv = state.currentConversation;
              if (currentConv) {
                const updatedConv = {
                  ...currentConv,
                  messages: [...(currentConv.messages || []), botMessage]
                };
                return {
                  conversations: state.conversations.map(c => 
                    c.id === currentConv.id ? updatedConv : c
                  ),
                  currentConversation: updatedConv,
                  status: ""
                };
              }
              return { status: "" };
            });
          }
        }
      } else {
        set({ status: "❌ Không thể gửi tin nhắn" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      set({ status: "❌ Lỗi khi gửi tin nhắn" });
    } finally {
      set({ isLoading: false, queuedImages: [] });
    }
  },

  setQueuedImages: (images: File[]) => {
    set({ queuedImages: images });
  },

  addQueuedImages: (images: File[]) => {
    set(state => ({ queuedImages: [...state.queuedImages, ...images] }));
  },
}));