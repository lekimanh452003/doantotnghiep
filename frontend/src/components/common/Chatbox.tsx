import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // cuộn xuống dưới khi tin nhắn thay đổiđổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { 
      id: `msg-${Date.now()}`, 
      sender: 'user', 
      text: input, 
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender: "user", message: input }),
        mode: "cors",
      });

      const data = await response.json();
      if (data.length > 0) {
        const botResponse: Message = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: data[0].text,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Hiển thị các kích thước khác nhau dựa trên trạng thái
  const containerClasses = `
    fixed right-4 bottom-4 z-50 transition-all duration-300 ease-in-out
    ${isMinimized 
      ? 'w-16 h-16 rounded-full overflow-hidden' 
      : 'w-96 h-[500px] rounded-xl overflow-hidden'
    }
    ${isOpen 
      ? 'shadow-2xl border border-gray-200' 
      : 'shadow-lg'
    }
    bg-white
  `;

  return (
    <div 
      className={containerClasses}
      style={{ 
        // đđảm bảo hộp trò chuyện vẫn hiển thị khi cuộn
        position: 'fixed',
        right: '1rem',
        bottom: '1rem'
      }}
    >
      {/* nút bấm cho tiêu đềđề  */}
      {isMinimized ? (
  <button
    onClick={() => {
      setIsMinimized(false);
      setIsOpen(true);
    }}
    className="w-full h-full flex items-center justify-center bg-blue-500"
  >
    <img 
      src="https://cdn-icons-png.freepik.com/512/8943/8943377.png"
      alt="Chat Icon"
      className="w-10 h-10 object-contain"
    />
  </button>
) : (
  <div 
    onClick={() => setIsOpen(!isOpen)}
    className="bg-blue-500 text-white p-2 flex items-center justify-between cursor-pointer h-12"
  >
    <span>AI Assistant</span>
    <div className="flex items-center space-x-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsMinimized(true);
          setIsOpen(false);
        }}
        className="hover:bg-blue-600 p-1 rounded"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
        }}
        className="hover:bg-blue-600 p-1 rounded"
      >
        ×
      </button>
    </div>
  </div>
)}

        

      {/* hiển thị khi ko thu nhỏ và mở */}
      {!isMinimized && isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 h-[calc(100%-8rem)]">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h20" />
                    <path d="M12 16v4" />
                  </svg>
                )}
                <div 
                  className={`
                    max-w-[70%] p-2 rounded-lg 
                    ${msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                    }
                  `}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* phần nhập tin nhắn */}
          <div className="p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" x2="11" y1="2" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbox;