// ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import '../styles.css'; // Ensure you have the correct path to your styles
import { config } from '../config';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState("");
  // const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    currentConversation,
    isLoading,
    isThinking,
    sendMessage,
    queuedImages,
    setQueuedImages,
    addQueuedImages,
  } = useChatStore();

  const BASE_URL = config.BASE_URL;
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && queuedImages.length === 0) return;
    
    const messageContent = input;
    setInput(""); // Clear input immediately
    
    await sendMessage(messageContent);
  };

  // const copyToClipboard = async (text: string, messageId: string) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     setCopiedId(messageId);
  //     setTimeout(() => setCopiedId(null), 2000);
  //   } catch (err) {
  //     console.error('Failed to copy text: ', err);
  //   }
  // };

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
    if (imageFiles.length > 0) addQueuedImages(imageFiles);
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

  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };

  const handleCloseEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const handleAddImages = (files: File[]) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      if (!isValidSize) alert(`File "${file.name}" vượt quá 5MB`);
      if (!isValidType) alert(`File "${file.name}" không hỗ trợ định dạng này`);
      return isValidSize && isValidType;
    });
    const totalFiles = queuedImages.length + validFiles.length;
    if (totalFiles > 5) {
      alert('Tối đa 5 hình ảnh');
      const remainingSlots = Math.max(0, 5 - queuedImages.length);
      addQueuedImages(validFiles.slice(0, remainingSlots));
    } else {
      addQueuedImages(validFiles);
    }
  };

  return (
    <div className="chat-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="chat-messages">
        {/* Hiển thị thông điệp hoặc chào mừng */}
        {!currentConversation?.messages?.length ? (
          <div className="chat-empty">
            <h2>Chào mừng đến với Chatbot AI</h2>
            <p>Tôi có thể giúp bạn trả lời câu hỏi, phân tích hình ảnh và nhiều việc khác.</p>
          </div>
        ) : (
          <div className="chat-message-list">
            {
            currentConversation.messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="chat-message-content">
                  {msg.type === "text" ? <p>{msg.content}</p> : <img src={msg.content} alt="uploaded" />}

                  {msg.images && (
                    <div className="chat-images">
                      {msg.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image.startsWith('http') ? image : `${BASE_URL}${image}`}
                          onClick={() => handleImageClick(image.startsWith('http') ? image : `${BASE_URL}${image}`)}
                          alt=""
                        />
                      ))}
                    </div>
                  )}

                  {/* {msg.role === 'assistant' && (
                    <button onClick={() => copyToClipboard(msg.content, msg.id)}>
                      {copiedId === msg.id ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  )} */}

                  {/* {msg.timestamp && (
                    <div className="chat-timestamp">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  )} */}
                </div>
              </div>
            ))
            }

            {/* Show thinking animation when bot is thinking */}
            {isThinking && (
              <div className="chat-message assistant">
                <div className="chat-message-content">
                  <div className="thinking-animation">
                    <div className="thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="thinking-text"/>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Image preview */}
      {queuedImages.length > 0 && (
        <div className="chat-image-preview">
          <div className="preview-header">
            <span>Hình ảnh đã chọn ({queuedImages.length}/5):</span>
            <button onClick={() => setQueuedImages([])}>Xóa tất cả</button>
          </div>
          <div className="preview-list">
            {queuedImages.map((file, idx) => (
              <div key={idx} className="preview-item">
                <img src={URL.createObjectURL(file)} alt="preview" />
                <button onClick={() => setQueuedImages(queuedImages.filter((_, i) => i !== idx))}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn của bạn..."
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="chat-input-buttons">
          <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.5 10.8333V15.5C16.5 16.0523 16.0523 16.5 15.5 16.5H4.5C3.94772 16.5 3.5 16.0523 3.5 15.5V10.8333" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 13.5V3.5M10 3.5L6.5 7M10 3.5L13.5 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={handleSendMessage} disabled={(!input.trim() && queuedImages.length === 0) || isLoading}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 17L17 10L3 3V8.5L13 10L3 11.5V17Z" fill="#fff"/>
            </svg>
          </button>
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
              e.target.value = '';
            }
          }}
        />
      </div>

      {enlargedImage && (
        <div className="image-overlay" onClick={handleCloseEnlargedImage}>
          <div className="image-modal">
            <button onClick={handleCloseEnlargedImage}>×</button>
            <img src={enlargedImage} alt="Enlarged" />
          </div>
        </div>
      )}
    </div>
  );
};
