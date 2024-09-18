import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaChevronDown, FaMinus } from "react-icons/fa";
import { NotificationPopup } from "../index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Chat.css";

function Chat({ userType }) {
  const { t } = useTranslation("global");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const chatSocketRef = useRef(null);
  const messagesSocketRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  // useEffect hook sets up a WebSocket connection for real-time message updates
  useEffect(() => {
    if (userType.id) {
      messagesSocketRef.current = new WebSocket(
        `ws://localhost:8000/ws/messages/${userType.id}`
      );

      messagesSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.unread_count !== undefined) {
          setUnreadCount(data.unread_count);
        }
      };

      return () => {
        if (messagesSocketRef.current) {
          messagesSocketRef.current.close();
        }
      };
    }
  }, [userType.id]);

  // toggleChat function opens and closes the chat window and resets the unread count when opened
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // selectUser function starts a conversation with a selected user and loads the message history
  const selectUser = async (user) => {
    setSelectedUser(user);
    const conversation = await startConversation(user);
    if (conversation) {
      loadMessages(conversation.id);
      setConversationId(conversation.id);

      try {
        await axios.post(
          `http://localhost:8000/conversations/${conversation.id}/mark_as_read`,
          null,
          { params: { user_id: userType.id } }
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }

      if (chatSocketRef.current) {
        chatSocketRef.current.close();
      }

      chatSocketRef.current = new WebSocket(
        `ws://localhost:8000/ws/chat/${conversation.id}`
      );

      chatSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };
    }
    setShowUserDropdown(false);
    setShowChatHistory(false);
  };

   // startConversation function initiates a new conversation between the current user and the selected user
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

  // loadMessages function fetches the message history for a given conversation
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

  // sendMessage function sends a new message to the selected user and updates the chat window
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
      if (chatSocketRef.current) {
        chatSocketRef.current.send(JSON.stringify(messageData));
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Failed to send message.", "error");
    }
  };

  // handleKeyPress function listens for the "Enter" key to send messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

   // truncateMessage function shortens long messages for better display in the chat history
  const truncateMessage = (message) => {
    if (!message) return "";
    const words = message.split(" ");
    if (words[0].length > 6) {
      return words[0].slice(0, 6) + "...";
    }
    return words[0];
  };

   // fetchChatHistory function retrieves the chat history for the current user
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/history/${userType.id}`
      );
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      showNotification("Failed to fetch Chat History", "error");
    }
  };

  // fetchUsers function fetches the list of users to chat with based on the user role
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/users?role=${userType.role}&current_user_id=${userType.id}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to fetch Users", "error");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      fetchUsers();
    }
  }, [isOpen]);

  // renderUserList function dynamically displays the list of users to chat with based on their role
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
      {unreadCount > 0 && (
        <span className="unread-badge">
           {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
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
        <NotificationPopup
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
}

export default Chat;
