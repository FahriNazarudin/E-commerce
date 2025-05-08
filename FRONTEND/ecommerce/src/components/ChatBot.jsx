import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BsChatDots, BsX } from "react-icons/bs";

function ChatBot({ baseUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { content: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { content: inputMessage, sender: "user" };
    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Call your backend to interact with Dialogflow
      const response = await axios.post(
        `${baseUrl}/chatbot`,
        {
          message: userMessage.content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // Add bot response to chat
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content:
              response.data.message ||
              "I'm sorry, I couldn't process your request.",
            sender: "bot",
          },
        ]);
      }, 500);
    } catch (error) {
      console.error("Chatbot error:", error);
      setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "bot",
        },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button
        className="chat-button"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#343a40",
          color: "white",
          border: "none",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {isOpen ? <BsX size={30} /> : <BsChatDots size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Chat header */}
          <div
            className="chat-header"
            style={{
              padding: "15px",
              backgroundColor: "#343a40",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>Customer Support</div>
            <button
              onClick={toggleChat}
              className="close-button"
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              <BsX size={24} />
            </button>
          </div>

          {/* Chat messages */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              padding: "15px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
                style={{
                  maxWidth: "80%",
                  padding: "10px 15px",
                  borderRadius: "18px",
                  marginBottom: "10px",
                  alignSelf:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    message.sender === "user" ? "#343a40" : "#f1f1f1",
                  color: message.sender === "user" ? "white" : "black",
                }}
              >
                {message.content}
              </div>
            ))}
            {isTyping && (
              <div
                className="typing-indicator"
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "18px",
                  padding: "10px 15px",
                  marginBottom: "10px",
                }}
              >
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form
            onSubmit={sendMessage}
            className="chat-input"
            style={{
              padding: "15px",
              borderTop: "1px solid #e5e5e5",
              display: "flex",
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "20px",
                border: "1px solid #e5e5e5",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                marginLeft: "10px",
                padding: "0 15px",
                backgroundColor: "#343a40",
                color: "white",
                borderRadius: "20px",
                border: "none",
                cursor: inputMessage.trim() ? "pointer" : "default",
                opacity: inputMessage.trim() ? 1 : 0.7,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 4px;
          background-color: #777;
          border-radius: 50%;
          animation: typing-animation 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing-animation {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

ChatBot.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};

export default ChatBot;
