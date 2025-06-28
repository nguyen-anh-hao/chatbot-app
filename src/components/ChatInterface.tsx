import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentConversation, 
    isLoading, 
    sendMessage, 
    queuedImages,
    setQueuedImages,
    addQueuedImages
  } = useChatStore();

  const BASE_URL = "https://4a9d-113-161-91-25.ngrok-free.app";
  
  // State để theo dõi hình ảnh đang xem full-size
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && queuedImages.length === 0) return;
    await sendMessage(input);
    setInput("");
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      addQueuedImages(imageFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      addQueuedImages(files);
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste as any);
    return () => window.removeEventListener("paste", handlePaste as any);
  }, []);

  // Mở hình ảnh full-size
  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };

  // Đóng hình ảnh full-size
  const handleCloseEnlargedImage = () => {
    setEnlargedImage(null);
  };

  // Thêm giới hạn file
  const handleAddImages = (files: File[]) => {
    // Kiểm tra kích thước file (tối đa 5MB)
    const validFiles = Array.from(files).filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      
      if (!isValidSize) {
        alert(`File "${file.name}" vượt quá 5MB`);
      }
      if (!isValidType) {
        alert(`File "${file.name}" không phải định dạng hình ảnh được hỗ trợ`);
      }
      
      return isValidSize && isValidType;
    });
    
    // Giới hạn tối đa 5 hình ảnh
    const totalFiles = queuedImages.length + validFiles.length;
    if (totalFiles > 5) {
      alert('Bạn chỉ có thể gửi tối đa 5 hình ảnh');
      const remainingSlots = Math.max(0, 5 - queuedImages.length);
      addQueuedImages(validFiles.slice(0, remainingSlots));
    } else {
      addQueuedImages(validFiles);
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white w-full"
           onDragOver={(e) => e.preventDefault()}
           onDrop={handleDrop}>
        {!currentConversation?.messages?.length ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-gradient-to-r-blue-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.505L3 21l2.495-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chào mừng đến với ChatBot AI</h2>
              <p className="text-gray-600 mb-8">Tôi có thể giúp bạn trả lời câu hỏi, phân tích hình ảnh và nhiều việc khác.</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto px-4">
            {currentConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`group relative ${
                  msg.role === 'user' ? 'message-user' : 'message-bot'
                }`}
              >
                <div className="flex gap-4 p-6">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.505L3 21l2.495-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {msg.type === "text" ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    ) : (
                      <img src={msg.content} alt="uploaded" className="max-w-md rounded-lg" />
                    )}
                    
                    {/* Hiển thị hình ảnh nếu có */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="message-images mt-2 flex flex-wrap gap-2">
                        {msg.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image.startsWith('http') ? image : `${BASE_URL}${image}`}
                            alt={`Hình ${index + 1}`}
                            className="max-w-xs max-h-40 rounded-lg border border-gray-200 cursor-pointer"
                            onClick={() => handleImageClick(image.startsWith('http') ? image : `${BASE_URL}${image}`)}
                          />
                        ))}
                      </div>
                    )}
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover-opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover-text-gray-700 hover-bg-gray-100 rounded transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Đã sao chép
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Sao chép
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {msg.timestamp && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-bot">
                <div className="flex gap-4 p-6 max-w-4xl mx-auto">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.505L3 21l2.495-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hiển thị hình ảnh full-size khi click */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleCloseEnlargedImage}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-900 hover:bg-gray-200"
              onClick={handleCloseEnlargedImage}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={enlargedImage} 
              alt="Enlarged" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Image Preview */}
      {queuedImages.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">
              Hình ảnh đã chọn ({queuedImages.length}/5):
            </span>
            <button 
              onClick={() => setQueuedImages([])}
              className="text-xs text-red-500 hover-text-red-700"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {queuedImages.map((file, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setQueuedImages(queuedImages.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover-bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="input-group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 resize-none bg-transparent px-4 py-3 text-gray-900 focus-outline-none max-h-32"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                minHeight: '44px',
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            
            <div className="flex items-center gap-1 m-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover-text-gray-700 hover-bg-gray-100 rounded-lg transition-colors"
                disabled={queuedImages.length >= 5 || isLoading}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && queuedImages.length === 0) || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover-bg-blue-700 disabled-opacity-50 disabled-cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Chọn tối đa 5 hình ảnh (jpg, png, gif, webp - mỗi file tối đa 5MB)
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        ref={fileInputRef}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleAddImages(Array.from(e.target.files));
            // Reset input để có thể chọn lại cùng file nếu muốn
            e.target.value = '';
          }
        }}
      />
    </>
  );
};