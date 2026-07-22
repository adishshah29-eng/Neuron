import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

// Typing indicator: 3 bouncing dots
const TypingIndicator = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px 16px 16px 4px',
    width: 'fit-content',
    border: '1px solid rgba(255,255,255,0.07)',
  }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#14b8a6',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// Individual message bubble with typewriter effect for bot messages
const MessageBubble = ({ message }) => {
  const isBot = message.role === 'bot';
  const [displayed, setDisplayed] = useState(isBot ? '' : message.text);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  useEffect(() => {
    if (!isBot) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(message.text.slice(0, i));
      if (i >= message.text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [message.text, isBot]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isBot ? 'flex-start' : 'flex-end',
        gap: '6px',
      }}
    >
      {isBot && (
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', paddingLeft: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Sharper Sense AI
        </span>
      )}

      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isBot
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(135deg, #14b8a6, #0f9183)',
        border: isBot ? '1px solid rgba(255,255,255,0.07)' : 'none',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        textAlign: 'left',
      }}>
        {displayed}
        {isBot && displayed.length < message.text.length && (
          <span style={{ opacity: 0.5 }}>▌</span>
        )}
      </div>

      {/* Feedback row — only for fully rendered bot messages */}
      {isBot && displayed === message.text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '6px', paddingLeft: '4px' }}
        >
          <button
            aria-label="Helpful"
            onClick={() => setFeedback('up')}
            style={{
              background: feedback === 'up' ? 'rgba(20,184,166,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '3px 7px',
              cursor: 'pointer',
              color: feedback === 'up' ? '#14b8a6' : 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 200ms ease',
            }}
          >
            <ThumbsUp size={12} />
          </button>
          <button
            aria-label="Not helpful"
            onClick={() => setFeedback('down')}
            style={{
              background: feedback === 'down' ? 'rgba(239,68,68,0.15)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '3px 7px',
              cursor: 'pointer',
              color: feedback === 'down' ? '#ef4444' : 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 200ms ease',
            }}
          >
            <ThumbsDown size={12} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

const ChatMessages = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      data-lenis-prevent="true"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        scrollbarWidth: 'none',
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
