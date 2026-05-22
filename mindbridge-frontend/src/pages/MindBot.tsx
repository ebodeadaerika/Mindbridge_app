// MindBridge — MindBot AI Chat

import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { aiApi } from '@/api/client';
import BottomNav from '@/components/BottomNav';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = ["I'm feeling anxious", "Can't sleep", "Exam stress"];

function TypingIndicator() {
  return (
    <div
      style={{
        maxWidth: '70%',
        backgroundColor: '#1E2530',
        borderRadius: '20px 20px 20px 4px',
        borderLeft: '3px solid #00C9A7',
        padding: '12px 16px',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#00C9A7',
            display: 'inline-block',
            animation: `bounceDot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function MindBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    setError(false);
    setLastUserMsg(text.trim());

    // Capture previous turns BEFORE adding the new user message.
    // The backend always appends `message` itself, so `history` must only
    // contain prior turns — sending updatedHistory would duplicate the last message.
    const previousTurns = messages;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await aiApi.chat({
        message: text.trim(),
        history: previousTurns.map((m) => ({ role: m.role, content: m.content })),
      });
      const aiReply: ChatMessage = {
        role: 'assistant',
        content: res.data.reply || "I'm here for you. Can you tell me more?",
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setError(true);
      // Keep the user message in state so the error banner appears in the chat
      // branch rather than reverting to the empty welcome screen.
    } finally {
      setTyping(false);
    }
  };

  const handleRetry = async () => {
    if (!lastUserMsg) return;
    setError(false);
    setTyping(true);

    // The failed user message is already the last item in `messages` — don't re-add it.
    // Pass everything except that last item as history (backend will re-append the message).
    const historyWithoutFailed = messages.slice(0, -1);

    try {
      const res = await aiApi.chat({
        message: lastUserMsg,
        history: historyWithoutFailed.map((m) => ({ role: m.role, content: m.content })),
      });
      const aiReply: ChatMessage = {
        role: 'assistant',
        content: res.data.reply || "I'm here for you. Can you tell me more?",
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setError(true);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 md:px-8 pt-10 md:pt-6 pb-4"
        style={{ borderBottom: '1px solid #30363D' }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,201,167,0.15)',
            border: '2px solid rgba(0,201,167,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,201,167,0.25)',
            animation: 'pulseGlow 2.5s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 22 }}>🤖</span>
        </div>
        <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(0,201,167,0.2); }
            50% { box-shadow: 0 0 24px rgba(0,201,167,0.5); }
          }
        `}</style>
        <div>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5' }}>
            MindBot
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
            Always here for you
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
        {messages.length === 0 ? (
          // Welcome state
          <div className="flex flex-col items-center gap-6 pt-8">
            <div
              style={{
                backgroundColor: '#1E2530',
                borderRadius: '20px 20px 20px 4px',
                borderLeft: '3px solid #00C9A7',
                padding: '16px 18px',
                maxWidth: '85%',
              }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#F0F2F5', lineHeight: 1.7 }}>
                Hi there 👋 I'm MindBot. I'm here to listen and support you. What's on your mind today?
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 50,
                    border: '1px solid rgba(0,201,167,0.3)',
                    backgroundColor: 'rgba(0,201,167,0.06)',
                    color: '#00C9A7',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)' : '#1E2530',
                    color: msg.role === 'user' ? '#fff' : '#F0F2F5',
                    borderLeft: msg.role === 'assistant' ? '3px solid #00C9A7' : 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <TypingIndicator />
              </div>
            )}
            {error && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '78%',
                    backgroundColor: 'rgba(255,179,71,0.12)',
                    border: '1px solid rgba(255,179,71,0.3)',
                    borderRadius: '20px 20px 20px 4px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle style={{ color: '#FFB347', width: 16, height: 16, minWidth: 16 }} />
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FFB347', marginBottom: 4 }}>
                      Having trouble connecting. Please try again.
                    </p>
                    <button
                      onClick={handleRetry}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFB347',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <RefreshCw style={{ width: 12, height: 12 }} />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E', textAlign: 'center', padding: '4px 16px' }}>
        MindBot is not a substitute for professional care.
      </p>

      {/* Input */}
      <div
        style={{
          padding: '8px 16px 12px',
          borderTop: '1px solid #30363D',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Message MindBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 50,
            backgroundColor: '#161B22',
            border: '1px solid #30363D',
            padding: '0 16px',
            color: '#F0F2F5',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            borderRadius: '50%',
            background: input.trim() && !typing ? 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)' : '#30363D',
            border: 'none',
            cursor: input.trim() && !typing ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          <Send style={{ color: '#0D0F14', width: 18, height: 18 }} />
        </button>
      </div>

      {/* Spacer so input row clears the 64px fixed BottomNav */}
      <div style={{ height: 64, flexShrink: 0 }} />

      <BottomNav />
    </div>
  );
}
