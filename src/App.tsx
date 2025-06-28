import { useEffect, useRef, useState } from "react";
import "./index.css";

interface Message {
  id: string;
  role: "user" | "bot";
  type: "text" | "image";
  content: string;
}

const dummyBotReplies = [
  "Nice!",
  "Interesting image.",
  "What is that?",
  "Cool picture!",
  "Thanks for sharing!",
  "Love it!",
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [queuedImages, setQueuedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    const imagePromises = queuedImages.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(imagePromises).then((imagesBase64) => {
      // Gửi lên backend
      fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.trim() || undefined,
          images: imagesBase64.length > 0 ? imagesBase64 : undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // Hiển thị tin nhắn user
          const userMessages: Message[] = [];

          queuedImages.forEach((_file, i) => {
            userMessages.push({
              id: Date.now() + "-img-" + i,
              role: "user",
              type: "image",
              content: imagesBase64[i],
            });
          });

          if (input.trim()) {
            userMessages.push({
              id: Date.now() + "-text",
              role: "user",
              type: "text",
              content: input.trim(),
            });
          }

          setMessages((prev) => [...prev, ...userMessages]);

          // Hiển thị phản hồi backend (text)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + "-bot",
              role: "bot",
              type: "text",
              content: data.reply,
            },
          ]);
        })
        .catch((e) => {
          console.error("Error sending message:", e);
        });

      setInput("");
      setQueuedImages([]);
    });
  };
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
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
      setQueuedImages((prev) => [...prev, ...imageFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setQueuedImages((prev) => [...prev, ...files]);
    }
  };

  const simulateBotReply = () => {
    setTimeout(() => {
      const botReply: Message = {
        id: Date.now() + "-bot",
        role: "bot",
        type: "text",
        content:
          dummyBotReplies[Math.floor(Math.random() * dummyBotReplies.length)],
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste as any);
    return () => window.removeEventListener("paste", handlePaste as any);
  }, []);

  return (
    <div className="chat-container">
      <div
        className="chat-window"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role === "user" ? "user-message" : "bot-message"
              }`}
          >
            {msg.type === "text" ? (
              <div>{msg.content}</div>
            ) : (
              <img src={msg.content} alt="uploaded" className="chat-image" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview ảnh chưa gửi */}
      {queuedImages.length > 0 && (
        <div className="preview-images">
          {queuedImages.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt="preview"
              className="chat-image small"
            />
          ))}
        </div>
      )}

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={() => fileInputRef.current?.click()}>📷</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              setQueuedImages((prev) => [
                ...prev,
                ...Array.from(e.target.files ?? []),
              ]);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
