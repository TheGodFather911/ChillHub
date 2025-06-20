import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. I'm here to help you with anything you need. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          ? "I'm sorry, I'm having trouble processing your request right now. Please try again."
          : "I'm not connected to the AI service. Please make sure the backend server is running with a valid Gemini API key.",
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
        <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
        <div className={`flex items-center space-x-1 text-xs rounded-full px-3 py-1 ${
          isConnected 
            ? 'text-green-600 bg-green-100' 
            : 'text-red-600 bg-red-100'
        }`}>
          <Sparkles className="w-3 h-3" />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gradient-to-b from-gray-50/50 to-white/50 rounded-2xl">
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
                  : 'bg-white shadow-sm border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">
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
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3">
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
      <div className="flex items-center space-x-3 bg-white/80 rounded-2xl p-3 border border-gray-200/50">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Ask me anything..." : "Backend not connected..."}
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500"
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

      <div className="mt-3 text-xs text-gray-500 text-center">
        {isConnected 
          ? "💡 Powered by Gemini AI with custom system prompt"
          : "⚠️ Start the backend server to enable AI chat"
        }
      </div>
    </div>
  );
};

export default AIChat;