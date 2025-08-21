"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageCircle,
    Send,
    Bot,
    User,
    AlertTriangle,
    CheckCircle,
    Stethoscope,
    Phone,
    Calendar
} from "lucide-react";
import BookAppointmentModal from "@/components/BookAppointmentModal";

export default function ChatbotPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Use the exact same headers as your working Postman code
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                "prompt": input
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            console.log("Making request to proxy:", "/api/chat-proxy");

            // Use the proxy instead of direct call
            const response = await fetch("/api/chat", requestOptions);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            const aiMessage = {
                text: data.response,
                isUser: false,
                timestamp: new Date(),
                analysis: data.analysis || null,
                specialists: data.specialists || [],
                isSerious: data.is_serious || false,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);

            const errorMsg = {
                text: `Sorry, I'm having trouble connecting to the AI service. ${error.message}`,
                isUser: false,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };


    const handleBookAppointment = (doctor) => {
        // Convert the specialist data format to match your doctor schema
        const doctorData = {
            _id: doctor.doctor_id,
            name: doctor.name,
            specialization: doctor.specialization,
            category: doctor.category,
            consultationFee: 500, // Default fee, you might want to get this from your database
            experience: doctor.experience,
            phone: doctor.phone,
            availability: [
                // Default availability - you might want to fetch real availability
                { day: "Monday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Tuesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Wednesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Thursday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Friday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
            ],
        };

        setSelectedDoctor(doctorData);
        setIsBookingModalOpen(true);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">AI Health Assistant</h1>
                    </div>
                    <p className="text-gray-600">
                        Describe your symptoms or ask health-related questions. Get instant analysis and specialist recommendations.
                    </p>
                </div>

                {/* Chat Container */}
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-blue-600" />
                            <span>Chat with AI Health Assistant</span>
                        </CardTitle>
                        <CardDescription>
                            Ask about symptoms, conditions, or general health questions
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0">
                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">
                                        Start a conversation
                                    </h3>
                                    <p className="text-gray-400">
                                        Ask me about symptoms, health concerns, or general medical questions
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-4 py-3 ${message.isUser
                                                    ? "bg-blue-600 text-white"
                                                    : message.isError
                                                        ? "bg-red-50 text-red-800 border border-red-200"
                                                        : "bg-gray-100 text-gray-900"
                                                    }`}
                                            >
                                                {/* Message Header */}
                                                <div className="flex items-center space-x-2 mb-2">
                                                    {message.isUser ? (
                                                        <User className="h-4 w-4" />
                                                    ) : (
                                                        <Bot className="h-4 w-4" />
                                                    )}
                                                    <span className="text-xs opacity-75">
                                                        {formatTime(message.timestamp)}
                                                    </span>
                                                </div>

                                                {/* Message Text */}
                                                <p className="leading-relaxed">{message.text}</p>

                                                

                                                {/* Specialists Section */}
                                                {message.specialists && message.specialists.length > 0 && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <Stethoscope className="h-4 w-4" />
                                                            <span className="font-semibold text-sm">Recommended Specialists</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {message.specialists.map((specialist, specIndex) => (
                                                                <div
                                                                    key={specIndex}
                                                                    className="bg-white bg-opacity-20 rounded-lg p-3"
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-semibold">{specialist.name}</h4>
                                                                            <p className="text-sm opacity-90 mb-1">
                                                                                {specialist.specialization}
                                                                            </p>
                                                                            <div className="flex items-center space-x-3 text-xs opacity-75">
                                                                                <span>{specialist.experience} years experience</span>
                                                                                {specialist.phone && (
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <Phone className="h-3 w-3" />
                                                                                        <span>{specialist.phone}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={message.isUser ? "secondary" : "outline"}
                                                                            onClick={() => handleBookAppointment(specialist)}
                                                                            className="ml-3"
                                                                        >
                                                                            <Calendar className="h-3 w-3 mr-1" />
                                                                            Book
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading Message */}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                                                <div className="flex items-center space-x-2">
                                                    <Bot className="h-4 w-4" />
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.1s' }}
                                                        ></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.2s' }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600">Analyzing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t p-6">
                            <form onSubmit={handleSubmit} className="flex space-x-4">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Describe your symptoms or ask a health question..."
                                    disabled={loading}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={loading || !input.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Try asking: "I have chest pain and shortness of breath" or "What should I do for a headache?"
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booking Modal */}
            {selectedDoctor && (
                <BookAppointmentModal
                    doctor={selectedDoctor}
                    isOpen={isBookingModalOpen}
                    onClose={() => {
                        setIsBookingModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                />
            )}
        </div>
    );
}
