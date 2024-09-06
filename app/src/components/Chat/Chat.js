import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaChevronDown, FaMinus } from "react-icons/fa";
import { NotificationPopup } from "../index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Chat.css";

function Chat({ userType }) {
  const { t } = useTranslation("global");
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [users, setUsers] = useState({
    admins: [],
    owners: [],
    couriers: [],
    customers: [],
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const socketRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      fetchUsers();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/history/${userType.id}`
      );
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      showNotification('Failed to fetch Chat History', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/users?role=${userType.role}&current_user_id=${userType.id}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification('Failed to fetch Users', 'error');
    }
  };
  

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    const conversation = await startConversation(user);
    if (conversation) {
      loadMessages(conversation.id);
      setConversationId(conversation.id);
      if (socketRef.current) {
        socketRef.current.close();
      }
      socketRef.current = new WebSocket(
        `ws://localhost:8000/ws/chat/${conversation.id}`
      );

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
          console.error("Failed to parse WebSocket message as JSON:", error);
        }
      };
    }
    setShowUserDropdown(false);
    setShowChatHistory(false);
  };

  const startConversation = async (user) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/conversations/start/${userType.id}/${user.id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/conversations/${conversationId}/messages/`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const response = await axios.post(
        `http://localhost:8000/conversations/${conversationId}/messages/`,
        null,
        {
          params: {
            sender_id: userType.id,
            receiver_id: selectedUser.id,
            message: newMessage,
          },
        }
      );

      const messageData = response.data;

      if (socketRef.current) {
        socketRef.current.send(JSON.stringify(messageData));
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification('Failed to send message.', 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const truncateMessage = (message) => {
    if (!message) return "";
    const words = message.split(" ");
    if (words[0].length > 6) {
      return words[0].slice(0, 6) + "...";
    }
    return words[0];
  };

  const renderUserList = () => {
    const roles = ["admins", "owners", "couriers", "customers"];
    const roleTitles = {
      admins: t("Chat.admins"),
      owners: t("Chat.owners"),
      couriers: t("Chat.couriers"),
      customers: t("Chat.customers"),
    };
  
    return roles.map(
      (role) =>
        users[role] &&
        users[role].length > 0 && (
          <div key={role}>
            <div className="user-role-title">{roleTitles[role]}</div>
            {users[role]
              .filter((user) => user.id !== userType.id)
              .map((user, index) => (
                <div
                  key={index}
                  className="user-item"
                  onClick={() => selectUser(user)}
                >
                  {user.username}
                </div>
              ))}
          </div>
        )
    );
  };  

  return (
    <div className="chat-container">
      <FaComments onClick={toggleChat} className="chat-icon" />
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <h3>
              {selectedUser ? selectedUser.username : t("Chat.chatTitle")}
            </h3>
            <FaMinus onClick={toggleChat} className="close-icon" />
          </div>
          <div className="chat-dropdowns">
            <div className="chat-dropdown">
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className="chat-dropdown-button"
              >
                {t("Chat.chatHistory")} <FaChevronDown />
              </button>
              {showChatHistory && (
                <div className="chat-dropdown-content">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <div
                        key={index}
                        className="user-item"
                        onClick={() => selectUser(chat.user)}
                      >
                        <div className="user-info">
                          <span className="username">{chat.user.username}</span>
                          <span className="last-message">
                            {truncateMessage(chat.last_message)}
                          </span>
                        </div>
                        <div className="message-time">
                          {new Date(
                            chat.last_message_time
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-history">{t("Chat.noChatHistory")}</div>
                  )}
                </div>
              )}
            </div>
            <div className="chat-dropdown">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="chat-dropdown-button"
              >
                {userType.role === "administrator"
                  ? t("Chat.users")
                  : userType.role === "owner"
                  ? t("Chat.admins")
                  : t("Chat.owners")}{" "}
                <FaChevronDown />
              </button>
              {showUserDropdown && (
                <div className="chat-dropdown-content">{renderUserList()}</div>
              )}
            </div>
          </div>
          {selectedUser && (
            <div className="chat-window">
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender_id === userType.id ? "sent" : "received"
                    }`}
                  >
                    {message.message}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("Chat.typeMessage")}
                />
                <button onClick={sendMessage}>{t("Chat.send")}</button>
              </div>
            </div>
          )}
        </div>
      )}
      {notification.message && (
          <NotificationPopup message={notification.message} type={notification.type} />
        )}
    </div>
  );
}

export default Chat;
