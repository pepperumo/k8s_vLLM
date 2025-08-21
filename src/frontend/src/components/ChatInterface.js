import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await axios.post(`${backendUrl}/chat`, {
        message: inputValue,
        history: messages
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.response?.data?.error || 'Failed to get response from AI');
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with Mistral AI</h2>
        <button onClick={clearHistory} className="clear-btn">
          Clear History
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to ChatGPT Platform!</h3>
            <p>Ask me anything and I'll help you using Mistral AI.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {message.role === 'assistant' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 800px;
          height: 80vh;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .chat-header h2 {
          margin: 0;
          color: #343541;
          font-size: 1.2rem;
        }

        .clear-btn {
          padding: 0.5rem 1rem;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .clear-btn:hover {
          background-color: #5a6268;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .welcome-message {
          text-align: center;
          color: #6c757d;
          margin: 2rem 0;
        }

        .welcome-message h3 {
          margin: 0 0 0.5rem 0;
          color: #343541;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background-color: #007bff;
        }

        .message.assistant .message-avatar {
          background-color: #28a745;
        }

        .message-content {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          line-height: 1.4;
        }

        .message.user .message-content {
          background-color: #007bff;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.assistant .message-content {
          background-color: #f8f9fa;
          color: #343541;
          border-bottom-left-radius: 4px;
        }

        .message-content p {
          margin: 0;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .error-message {
          padding: 0.75rem;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          margin: 0.5rem 0;
        }

        .error-message p {
          margin: 0;
        }

        .input-form {
          padding: 1rem;
          background-color: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 20px;
          font-size: 1rem;
          outline: none;
          background-color: white;
        }

        .message-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .message-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: background-color 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .send-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .chat-container {
            height: 100vh;
            border-radius: 0;
          }
          
          .message-content {
            max-width: 85%;
          }
          
          .chat-header {
            padding: 0.75rem;
          }
          
          .chat-header h2 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;