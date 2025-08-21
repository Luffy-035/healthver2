"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Stethoscope } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { createOrGetChat, getChatMessages, sendMessage } from "@/actions/chatActions";

export default function ChatModal({ appointment, isOpen, onClose }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const userRole = user?.publicMetadata?.role;
  const isDoctor = userRole === 'doctor';
  const otherUser = isDoctor ? appointment.patient : appointment.doctor;

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen && appointment) {
      initializeChat();
    }
    
    return () => {
      // Cleanup when modal closes
      if (chatId) {
        pusherClient.unsubscribe(`chat-${chatId}`);
      }
    };
  }, [isOpen, appointment]);

  // Setup Pusher connection when chatId is available
  useEffect(() => {
    if (chatId) {
      const channel = pusherClient.subscribe(`chat-${chatId}`);
      
      channel.bind('new-message', (message) => {
        console.log('Received new message:', message);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        pusherClient.unsubscribe(`chat-${chatId}`);
      };
    }
  }, [chatId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log('Initializing chat for appointment:', appointment._id);
      
      // Get or create chat
      const chat = await createOrGetChat(appointment._id);
      console.log('Got chat:', chat);
      setChatId(chat._id);
      
      // Load existing messages
      const existingMessages = await getChatMessages(chat._id);
      console.log('Loaded messages:', existingMessages);
      setMessages(existingMessages);
      
    } catch (error) {
      console.error("Error initializing chat:", error);
      alert("Failed to load chat: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;

    const senderName = isDoctor 
      ? `Dr. ${appointment.doctor.name}` 
      : appointment.patient.name;

    console.log('Sending message:', {
      chatId,
      message: newMessage.trim(),
      senderId: user.id,
      senderName,
      senderType: userRole
    });

    try {
      await sendMessage(chatId, newMessage.trim(), user.id, senderName, userRole);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    if (chatId) {
      pusherClient.unsubscribe(`chat-${chatId}`);
    }
    setChatId(null);
    setMessages([]);
    setLoading(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Chat with {isDoctor ? otherUser.name : `Dr. ${otherUser.name}`}</span>
          </DialogTitle>
          <DialogDescription>
            Appointment on {new Date(appointment.appointmentDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chat...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId === user?.id;
                  
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          {message.senderType === 'doctor' ? (
                            <Stethoscope className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            {message.senderName}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!newMessage.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
