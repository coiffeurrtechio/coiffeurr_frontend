import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Send, X, MessageCircle, Scissors } from 'lucide-react';
import Config from '../configs/config';

interface Message {
  type: 'user' | 'assistant' | 'welcome' | 'error';
  content: string;
  timestamp: Date;
}

interface CoiffyChatbotProps {
  className?: string;
}

const CoiffyChatbot: React.FC<CoiffyChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.log('[Coiffy] Inactivity timeout reached - closing chat');
      handleCloseChat();
    }, INACTIVITY_TIMEOUT);
  };

  // Clear inactivity timer
  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };
  
  // Get user data from Redux
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup inactivity timer on unmount
  useEffect(() => {
    return () => {
      clearInactivityTimer();
      disconnectWebSocket(); // Disconnect WebSocket on unmount
    };
  }, []);

  const connectWebSocket = async () => {
    if (!isAuthenticated || !user?.id) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Please log in to use Coiffy chatbot.',
        timestamp: new Date()
      }]);
      return;
    }

    setIsConnecting(true);
    
    try {
      // Fetch user PII from backend to get phone number
      const userData = localStorage.getItem("authState");
      if (!userData) {
        throw new Error('No user data');
      }

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.access_token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${Config.API_Customers}/users/${user.id}/pii`, {
        credentials: 'include',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const piiData = await response.json();
      const phoneNumber = piiData?.phone;
      const email = piiData?.email;

      if (!phoneNumber && !email) {
        setMessages(prev => [...prev, {
          type: 'error',
          content: 'Please add your phone number or email in your profile to use Coiffy chatbot.',
          timestamp: new Date()
        }]);
        setIsConnecting(false);
        return;
      }

      // Construct WebSocket URL - prefer phone, fallback to email
      const contactMethod = phoneNumber ? 'phone_number' : 'email';
      const contactValue = phoneNumber || email;
      const wsUrl = `${Config.API_AI.replace('http', 'ws')}/whatsapp/ws?user_id=${user.id}&${contactMethod}=${contactValue}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('[Coiffy] WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const messageType = data.type || 'message';
          
          resetInactivityTimer(); // Reset timer on bot response
          
          setMessages(prev => [...prev, {
            type: messageType === 'welcome' ? 'welcome' : messageType === 'error' ? 'error' : 'assistant',
            content: data.response,
            timestamp: new Date()
          }]);
          
          setIsTyping(false);
        } catch (error) {
          console.error('[Coiffy] Error parsing message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('[Coiffy] WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setMessages(prev => [...prev, {
          type: 'error',
          content: 'Connection error. Please try again.',
          timestamp: new Date()
        }]);
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('[Coiffy] WebSocket closed');
      };
    } catch (error) {
      console.error('[Coiffy] Error creating WebSocket:', error);
      setIsConnecting(false);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to connect. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      console.log('[Coiffy] Disconnecting WebSocket...');
      wsRef.current.close();
      wsRef.current = null;
      console.log('[Coiffy] WebSocket disconnected');
    }
    setIsConnected(false);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setMessages([]); // Clear old messages when reopening
    if (!isConnected && !isConnecting) {
      connectWebSocket();
    }
    resetInactivityTimer();
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    disconnectWebSocket();
    clearInactivityTimer();
    setMessages([]); // Clear messages on close
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    resetInactivityTimer(); // Reset timer on user activity
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: userMessage }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenChat}
            className={`fixed bottom-6 right-6 z-50 backdrop-blur-md bg-white/15 border border-white/25 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
            style={{ boxShadow: '0 8px 32px 0 rgba(142, 133, 114, 0.15)' }}
            aria-label="Open Coiffy Chatbot"
          >
            <div className="relative">
              <MessageCircle size={28} className="text-amber-700" />
              <Scissors size={14} className="absolute -bottom-1 -right-1 bg-white/90 text-amber-800 rounded-full p-0.5" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 w-[90vw] max-w-md h-[600px] flex flex-col ${className}`}
            style={{
              bottom: '24px',
              right: '24px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 12px 40px 0 rgba(142, 133, 114, 0.25)'
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/40" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MessageCircle size={24} style={{ color: '#2D2A26' }} />
                  <Scissors size={12} className="absolute -bottom-0.5 -right-0.5 bg-white/80 rounded-full p-0.5" style={{ color: '#2D2A26' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#2D2A26' }}>Coiffy</h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#2D2A26' }}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                    {isConnecting ? 'Connecting...' : isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="p-2 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={20} style={{ color: '#2D2A26' }} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'transparent' }}>
              {messages.length === 0 && !isConnecting && (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageCircle size={48} className="mb-2 opacity-50" style={{ color: '#2D2A26' }} />
                  <p className="text-sm" style={{ color: '#2D2A26' }}>Start a conversation with Coiffy!</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2 backdrop-blur-sm"
                    style={{
                      borderRadius: '12px',
                      ...(msg.type === 'user' ? {
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#2D2A26'
                      } : msg.type === 'error' ? {
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#2D2A26'
                      } : {
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#2D2A26'
                      })
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1" style={{ color: '#2D2A26', opacity: 0.6 }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm" style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#D4AF37' }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#D4AF37' }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#D4AF37' }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/40" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={!isConnected || isConnecting}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(142, 133, 114, 0.4)',
                    borderRadius: '8px',
                    color: '#2D2A26'
                  }}
                  className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 disabled:cursor-not-allowed placeholder:text-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isConnected || isConnecting}
                  className="p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: '#D4AF37',
                    color: '#ffffff'
                  }}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoiffyChatbot;
