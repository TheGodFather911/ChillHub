import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Bot, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Oh ! Hello MotherFucker. How can I assist you today? (make it quick, I have no time)",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Handle scroll isolation
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Prevent page scroll when scrolling within the container
      if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
        e.preventDefault();
      }
    };

    messagesContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      messagesContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setIsConnected(data.services.ai);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isConnected 
          ? "OH SHIT ! AM HAVING TROUBLES. Sorry (not sorry)"
          : "Nigga I'm not connected to the AI service. Make sure the backend server is running with a valid Gemini API key.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <h2 className={`text-xl font-semibold transition-colors duration-300 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>AI Assistant</h2>
        <div className={`flex items-center space-x-1 text-xs rounded-full px-3 py-1 ${
          isConnected 
            ? 'text-green-600 bg-green-100' 
            : 'text-red-600 bg-red-100'
        }`}>
          <Sparkles className="w-3 h-3" />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Messages container with scroll isolation */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-2xl transition-colors duration-300 scrollbar-thin ${
          isDark 
            ? 'bg-gradient-to-b from-gray-700/50 to-gray-800/50 scrollbar-thumb-gray-600 scrollbar-track-gray-800' 
            : 'bg-gradient-to-b from-gray-50/50 to-white/50 scrollbar-thumb-gray-300 scrollbar-track-gray-100'
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.isUser ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`p-2 rounded-full ${
              message.isUser 
                ? 'bg-gradient-to-r from-rose-400 to-orange-400' 
                : 'bg-gradient-to-r from-blue-400 to-cyan-400'
            }`}>
              {message.isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${message.isUser ? 'text-right' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                message.isUser 
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white' 
                  : isDark 
                    ? 'bg-gray-700 shadow-sm border border-gray-600 text-gray-200'
                    : 'bg-white shadow-sm border border-gray-100 text-gray-800'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              <p className={`text-xs mt-1 px-2 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`shadow-sm border rounded-2xl px-4 py-3 ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`flex items-center space-x-3 rounded-2xl p-3 border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-700/80 border-gray-600/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Ask me anything..." : "Backend not connected..."}
          className={`flex-1 outline-none bg-transparent transition-colors duration-300 ${
            isDark 
              ? 'text-gray-200 placeholder-gray-400' 
              : 'text-gray-800 placeholder-gray-500'
          }`}
          disabled={isLoading || !isConnected}
        />
        
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading || !isConnected}
          className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-300 disabled:to-gray-300 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className={`mt-3 text-xs text-center transition-colors duration-300 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {isConnected 
          ? "💡 Powered by Gemini AI with custom system prompt"
          : "⚠️ Start the backend server to enable AI chat"
        }
      </div>
    </div>
  );
};

export default AIChat;