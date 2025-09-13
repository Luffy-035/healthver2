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
import {
  createOrGetChat,
  getChatMessages,
  sendMessage,
} from "@/actions/chatActions";

export default function ChatModal({ appointment, isOpen, onClose }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const userRole = user?.publicMetadata?.role;
  const isDoctor = userRole === "doctor";
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

      channel.bind("new-message", (message) => {
        console.log("Received new message:", message);
        setMessages((prev) => [...prev, message]);
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
      console.log("Initializing chat for appointment:", appointment._id);

      // Get or create chat
      const chat = await createOrGetChat(appointment._id);
      console.log("Got chat:", chat);
      setChatId(chat._id);

      // Load existing messages
      const existingMessages = await getChatMessages(chat._id);
      console.log("Loaded messages:", existingMessages);
      setMessages(existingMessages);
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatId || sending) return;

    setSending(true);
    const senderName = isDoctor
      ? `${appointment.doctor?.name || "Doctor"}`
      : appointment.patient?.name || "Patient";

    console.log("Sending message:", {
      chatId,
      message: newMessage.trim(),
      senderId: user.id,
      senderName,
      senderType: userRole,
    });

    try {
      await sendMessage(
        chatId,
        newMessage.trim(),
        user.id,
        senderName,
        userRole
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClose = () => {
    if (chatId) {
      pusherClient.unsubscribe(`chat-${chatId}`);
    }
    setChatId(null);
    setMessages([]);
    setLoading(true);
    setSending(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 bg-zinc-900 border-zinc-700">
        <DialogHeader className="flex-shrink-0 p-4 border-b border-zinc-700">
          <DialogTitle className="flex items-center space-x-2 text-white">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            <span>
              Chat with{" "}
              {isDoctor
                ? otherUser?.name || "Patient"
                : otherUser?.name || "Doctor"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Appointment on{" "}
            {new Date(appointment.appointmentDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area - Made scrollable with proper height constraints */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-zinc-400">Loading chat...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                    <div className="space-y-2">
                      <MessageCircle className="h-12 w-12 text-zinc-500 mx-auto" />
                      <p className="text-zinc-400">No messages yet</p>
                      <p className="text-sm text-zinc-500">
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.senderId === user?.id;

                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? "bg-emerald-600 text-white"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              {message.senderType === "doctor" ? (
                                <Stethoscope className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span className="text-xs font-medium">
                                {message.senderName}
                              </span>
                              <span className="text-xs text-zinc-400">
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
              </div>
            </ScrollArea>
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-zinc-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-400 focus:ring-emerald-400"
                disabled={loading || sending}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!newMessage.trim() || loading || sending}
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
