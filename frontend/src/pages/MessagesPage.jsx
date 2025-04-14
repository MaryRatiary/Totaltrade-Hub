import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MessagesPage.css';
import Navbar from '../components/Navbar';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return {
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5131/api/message/conversations', getAuthHeaders());
      setConversations(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5131/api/message/messages/${otherUserId}`,
        getAuthHeaders()
      );
      setMessages(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      const response = await axios.post(
        'http://localhost:5131/api/message/send',
        {
          receiverId: selectedConversation.id,
          content: message
        },
        getAuthHeaders()
      );

      setMessages([...messages, response.data]);
      setMessage('');
      fetchConversations(); // Mettre à jour la liste des conversations pour afficher le dernier message
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  if (loading && !conversations.length) {
    return (
      <>
        <Navbar />
        <div className="messages-page">
          <div className="loading">Chargement...</div>
        </div>
      </>
    );
  }

  if (error && !conversations.length) {
    return (
      <>
        <Navbar />
        <div className="messages-page">
          <div className="error">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="conversations-list">
          <h2>Conversations</h2>
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <img
                src={conv.profilePicture || '/default-avatar.png'}
                alt={`${conv.firstName} ${conv.lastName}`}
                className="conversation-avatar"
              />
              <div className="conversation-info">
                <h3>{conv.firstName} {conv.lastName}</h3>
                <p className="last-message">
                  {conv.lastMessage || 'Démarrer une conversation'}
                  {conv.unreadCount > 0 && <span className="unread-count">{conv.unreadCount}</span>}
                </p>
                <span className="message-time">
                  {new Date(conv.lastMessageTime).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <img
                  src={selectedConversation.profilePicture || '/default-avatar.png'}
                  alt={`${selectedConversation.firstName} ${selectedConversation.lastName}`}
                  className="chat-avatar"
                />
                <h3>{selectedConversation.firstName} {selectedConversation.lastName}</h3>
              </div>
              
              <div className="messages-container">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === JSON.parse(localStorage.getItem('currentUser'))?.id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="message-input"
                />
                <button type="submit" className="send-button">
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;