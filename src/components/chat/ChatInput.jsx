import React, { useState, useRef } from 'react';
import { SendHorizontal } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    // Auto-grow textarea
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.2)',
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Ask anything about Sharper Sense…"
        style={{
          flex: 1,
          resize: 'none',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          outline: 'none',
          transition: 'border-color 200ms ease',
          scrollbarWidth: 'none',
          minHeight: '42px',
          maxHeight: '120px',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#14b8a6'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />

      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          border: 'none',
          background: value.trim() && !disabled
            ? 'linear-gradient(135deg, #14b8a6, #0f9183)'
            : 'rgba(255,255,255,0.08)',
          color: value.trim() && !disabled ? 'white' : 'rgba(255,255,255,0.3)',
          cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms ease',
          flexShrink: 0,
        }}
      >
        {disabled ? (
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#14b8a6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        ) : (
          <SendHorizontal size={16} />
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
};

export default ChatInput;
