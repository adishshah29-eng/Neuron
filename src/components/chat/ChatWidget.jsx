import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { getBotResponse, QUICK_PROMPTS } from './chatData';

let messageIdCounter = 0;
const makeId = () => ++messageIdCounter;

const WELCOME_MESSAGE = {
  id: makeId(),
  role: 'bot',
  text: "Hi! I'm the Sharper Sense AI assistant. Ask me anything about our neurostimulation patches, the science behind them, or how to get early access! 🧠",
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const sendMessage = useCallback((text) => {
    setShowQuickPrompts(false);

    // Add user message
    setMessages((prev) => [...prev, { id: makeId(), role: 'user', text }]);
    setIsTyping(true);

    // Simulate network latency (600–1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const botText = getBotResponse(text);
      setMessages((prev) => [...prev, { id: makeId(), role: 'bot', text: botText }]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  // Responsive: track viewport width reactively
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scrolling when chat is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Bubble */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
        }}
      >
        {/* Pulse ring */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#14b8a6',
              pointerEvents: 'none',
            }}
          />
        )}

        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: isOpen
              ? 'rgba(30,41,59,0.95)'
              : 'linear-gradient(135deg, #14b8a6, #0f9183)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(20,184,166,0.35)',
            position: 'relative',
            transition: 'background 300ms ease, box-shadow 300ms ease',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
              transformOrigin: 'bottom right',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.97) 0%, rgba(11,17,33,0.99) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(20,184,166,0.08)',
              overflow: 'hidden',
              // Desktop position
              ...(isMobile
                ? {
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '85svh',
                    maxHeight: '600px',
                    borderRadius: '24px 24px 0 0',
                  }
                : {
                    bottom: '5rem',
                    right: '1.5rem',
                    width: 'min(380px, calc(100vw - 3rem))',
                    height: 'min(520px, calc(100svh - 8rem))',
                    borderRadius: '20px',
                  }),
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(20,184,166,0.04)',
            }}>
              {/* Avatar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #0f9183)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={16} color="white" />
              </div>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                  Sharper Sense AI
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                  }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                    Online · AI Powered
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages messages={messages} isTyping={isTyping} />

            {/* Quick prompts (only on first open, before user sends anything) */}
            <AnimatePresence>
              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: '0 1rem 0.75rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      style={{
                        background: 'rgba(20,184,166,0.08)',
                        border: '1px solid rgba(20,184,166,0.25)',
                        borderRadius: '9999px',
                        padding: '5px 12px',
                        color: '#14b8a6',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(20,184,166,0.18)';
                        e.target.style.borderColor = '#14b8a6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(20,184,166,0.08)';
                        e.target.style.borderColor = 'rgba(20,184,166,0.25)';
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <ChatInput onSend={sendMessage} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
