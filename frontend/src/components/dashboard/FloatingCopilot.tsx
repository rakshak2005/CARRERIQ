import React, { useState } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const suggestions = [
    "Why is my score low?",
    "How to improve resume?",
    "Best next project?",
    "GitHub suggestions",
    "Career guidance"
  ];

  return (
    <>
      {/* Copilot Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '20px', height: '20px', background: '#ef4444', borderRadius: '50%', border: '3px solid #050816', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>1</span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: '2rem',
              width: '380px',
              height: '550px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 600 }}>AI Career Copilot</h3>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span> Online
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '16px 16px 16px 4px', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Hi! I'm your AI Copilot. I've analyzed your profile. To reach your next milestone of an 80+ Readiness Score, you should focus on adding more TypeScript to your GitHub repositories. How can I help?
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suggestions.map((sug, idx) => (
                  <button key={idx} style={{ alignSelf: 'flex-end', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)' }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Ask anything about your career..." style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                <button style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#3b82f6', border: 'none', width: '28px', height: '28px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
