/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { Client } from '@stomp/stompjs';
import { api } from '../services/api';

type ChatMessageDTO = {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt?: string;
  isRead?: boolean;
};

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  otherUserId: number | null;
  otherUserName: string;
  currentUserId: number | undefined;
};

export function ChatModal({ isOpen, onClose, otherUserId, otherUserName, currentUserId }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !otherUserId || !currentUserId) return;

    api.get(`/api/chat/history/${otherUserId}`)
      .then(response => setMessages(response.data))
      .catch(error => console.error("Erro ao carregar histórico:", error));

    const token = localStorage.getItem('token') || ''; 
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const WS_URL = backendUrl.replace('http', 'ws') + '/ws';

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (message) => {
          if (message.body) {
            const receivedMsg: ChatMessageDTO = JSON.parse(message.body);
            if (receivedMsg.senderId === otherUserId || receivedMsg.receiverId === otherUserId) {
              setMessages(prev => [...prev, receivedMsg]);
            }
          }
        });
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [isOpen, otherUserId, currentUserId]);

  if (!isOpen) return null;

  function handleSendMessage(e: SyntheticEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId || !currentUserId || !stompClient || !stompClient.connected) return;

    const chatMessage: ChatMessageDTO = {
      senderId: currentUserId,
      receiverId: otherUserId,
      content: newMessage,
    };

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage)
    });

    setMessages(prev => [...prev, { ...chatMessage, id: Date.now(), sentAt: new Date().toISOString(), isRead: false }]);
    setNewMessage('');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '100%', padding: 0, display: 'flex', flexDirection: 'column', height: '600px', maxHeight: '90vh' }}>
        
        <div className="modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span> {otherUserName}
          </h3>
          <button type="button" onClick={onClose} className="btn-close">&times;</button>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#ffffff' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 'auto', marginBottom: 'auto' }}>
              Inicie a conversa com {otherUserName}.
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 15px', borderRadius: '15px',
                    backgroundColor: isMine ? '#10b981' : '#f3f4f6', color: isMine ? 'white' : '#1f2937',
                    borderBottomRightRadius: isMine ? '2px' : '15px', borderBottomLeftRadius: isMine ? '15px' : '2px',
                  }}>
                    <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
                    
                    <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'right', color: isMine ? '#d1fae5' : '#9ca3af' }}>
                      {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '15px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Escreva a sua mensagem..." 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #d1d5db', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              style={{
                backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !newMessage.trim() ? 0.5 : 1
              }}
            >
              ➤
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}