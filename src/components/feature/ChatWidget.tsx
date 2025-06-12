"use client";

import React, { useState, useEffect, useRef } from "react";
import { defineChain, type Chain } from "thirdweb";
import { MessageCircle, X, Send } from "lucide-react";
import { useActiveAccount, useChainMetadata } from "thirdweb/react";
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface BubbleChatWidgetProps {
  chain: Chain;
  tokenAddress: string;
  tokenSymbol: string;
}

export default function BubbleChatWidget({
  chain,
  tokenAddress,
  tokenSymbol,
}: BubbleChatWidgetProps) {
  const account = useActiveAccount();
  const { data: chainMetadata, isLoading: isChainLoading } =
    useChainMetadata(chain);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<Message>({
    id: "welcome",
    text: "Loading...",
    isUser: false,
    timestamp: new Date(),
  });

  // Update welcome message when chain metadata is loaded
  useEffect(() => {
    if (!isChainLoading && chainMetadata) {
      setWelcomeMessage({
        id: "welcome",
        text: `Hi! I'm here to help you with questions about ${tokenAddress} ${tokenSymbol} on ${chainMetadata.name}. What would you like to know?`,
        isUser: false,
        timestamp: new Date(),
      });
    }
  }, [chainMetadata, isChainLoading, tokenAddress, tokenSymbol]);

  const [messages, setMessages] = useState<Message[]>([]);

  // Set initial messages after welcome message is ready
  useEffect(() => {
    setMessages([welcomeMessage]);
  }, [welcomeMessage]);

  // Auto scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message text using react-markdown
  const formatMessageText = (text: string) => {
    return (
      <ReactMarkdown 
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Override link rendering to open in new tab
          a: ({node, ...props}) => (
            <a 
              {...props} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline"
            />
          ),
          // Style bold text
          strong: ({node, ...props}) => (
            <strong {...props} className="font-bold" />
          ),
          // Add spacing for paragraphs
          p: ({node, ...props}) => (
            <p {...props} className="mb-2 last:mb-0" />
          )
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          chainId: chain.id,
          sessionId,
          chainName: chainMetadata?.name || "",
          tokenAddress,
          walletAddress: account?.address || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Update session ID if provided
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-14 h-14 md:w-20 md:h-20 bg-black hover:bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50 border border-gray-800"
        >
          <MessageCircle size={24} className="md:hidden" />
          <MessageCircle size={32} className="hidden md:block" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full md:w-[520px] h-full md:h-[700px] bg-black md:rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-800">
          {/* Header */}
          <div className="bg-black text-white p-4 md:p-7 md:rounded-t-2xl flex items-center justify-between border-b border-gray-800">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                {tokenSymbol} AI Assistant
              </h3>
              <div className="text-sm">
                Powered by{" "}
                <a
                  href="https://thirdweb.com/nebula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(321,90%,51%)] hover:text-[hsl(321,90%,51%)] transition-colors inline-block"
                >
                  Nebula AI
                </a>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-2 md:p-2.5 hover:bg-gray-800 rounded-lg"
            >
              <X size={24} className="md:hidden" />
              <X size={28} className="hidden md:block" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5 bg-black scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                } items-end space-x-2`}
              >
                <div
                  className={`relative group max-w-[90%] md:max-w-[85%] p-4 md:p-5 ${
                    msg.isUser
                      ? "bg-white text-black rounded-[20px] md:rounded-[24px] rounded-br-sm"
                      : "bg-gray-900 text-white rounded-[20px] md:rounded-[24px] rounded-bl-sm border border-gray-800"
                  }`}
                >
                  <div className="text-[15px] md:text-[16px] leading-relaxed whitespace-pre-wrap break-words font-normal">
                    {formatMessageText(msg.text)}
                  </div>
                  <span
                    className={`absolute bottom-1 md:bottom-1.5 right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] md:text-[11px] ${
                      msg.isUser ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end">
                <div className="bg-gray-900 text-white px-4 md:px-5 py-3 md:py-4 rounded-[20px] md:rounded-[24px] rounded-bl-sm border border-gray-800">
                  <div className="flex space-x-1.5">
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {/* Invisible div for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 border-t border-gray-800 bg-black md:rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask anything about ${tokenSymbol}...`}
                className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-gray-900 text-white border border-gray-800 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-[15px] md:text-[16px] placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="px-4 md:px-5 py-3 md:py-4 bg-white text-black rounded-lg md:rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} className="md:hidden" />
                <Send size={24} className="hidden md:block" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
