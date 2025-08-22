"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageCircle,
    Send,
    Bot,
    User,
    Stethoscope,
    Phone,
    Calendar,
    ArrowLeft
} from "lucide-react";
import BookAppointmentModal from "@/components/BookAppointmentModal";

export default function ChatbotPage() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({ "prompt": input });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch("/api/chat", requestOptions);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
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
        const doctorData = {
            _id: doctor.doctor_id,
            name: doctor.name,
            specialization: doctor.specialization,
            category: doctor.category,
            consultationFee: 500, // Default fee
            experience: doctor.experience,
            phone: doctor.phone,
            availability: [ // Default availability
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

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleScrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    };

    return (
        // Enhanced full-screen chat interface with AMOLED black theme
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
            <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-emerald-300 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse opacity-35"></div>
            
            {/* Top Header with Navigation */}
            <div className="relative z-10 flex items-center justify-between p-4 backdrop-blur-xl bg-gray-950/50 border-b border-gray-800/60">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.push('/patient')}
                        className="p-2 rounded-lg bg-gray-900/80 hover:bg-gray-800/90 text-gray-300 hover:text-white transition-all duration-200"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-500/15 border border-emerald-400/20 rounded-lg">
                            <Bot className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">AI Health Assistant</h1>
                            <p className="text-xs text-gray-400">Online • Ready to help</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Chat Container */}
            <div className="relative z-10 flex-1 flex flex-col backdrop-blur-xl bg-gray-950/30 max-h-full overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
                    {/* Messages Area with better styling */}
                    <div 
                        ref={scrollAreaRef} 
                        className="flex-1 p-6 overflow-y-scroll"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                        }}
                    >
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center py-12 max-w-md">
                                    <div className="p-6 bg-emerald-500/10 rounded-full w-fit mx-auto mb-6 border border-emerald-500/15">
                                        <Bot className="h-16 w-16 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        Welcome to AI Health Assistant
                                    </h3>
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        I'm here to help you understand your health concerns. Describe your symptoms or ask any medical questions.
                                    </p>
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/60">
                                            <span className="text-emerald-400">💡 Example: </span>
                                            <span className="text-gray-300">"I have a persistent headache and feel dizzy"</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-4xl mx-auto w-full">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.isUser ? "justify-end" : "justify-start"} group`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-lg ${
                                                message.isUser
                                                    ? "bg-emerald-500/90 text-white border border-emerald-400/40 backdrop-blur-sm"
                                                    : message.isError
                                                    ? "bg-red-900/40 text-red-300 border border-red-500/40 backdrop-blur-sm"
                                                    : "bg-gray-900/80 text-gray-100 backdrop-blur-sm border border-gray-800/60"
                                            } transition-all duration-200 group-hover:shadow-xl ${
                                                message.isUser 
                                                    ? "group-hover:shadow-emerald-500/20" 
                                                    : "group-hover:shadow-gray-500/10"
                                            }`}
                                        >
                                            {/* Enhanced Message Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1 rounded-full ${
                                                        message.isUser 
                                                            ? "bg-white/20" 
                                                            : "bg-emerald-500/20"
                                                    }`}>
                                                        {message.isUser ? 
                                                            <User className="h-3 w-3" /> : 
                                                            <Bot className="h-3 w-3 text-emerald-400" />
                                                        }
                                                    </div>
                                                    <span className="text-xs font-medium opacity-80">
                                                        {message.isUser ? "You" : "AI Assistant"}
                                                    </span>
                                                </div>
                                                <span className="text-xs opacity-60">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                            </div>

                                            {/* Enhanced Message Text */}
                                            <div className="leading-relaxed whitespace-pre-wrap text-sm">
                                                {message.text}
                                            </div>
                                            
                                            {/* Enhanced Specialists Section */}
                                            {message.specialists && message.specialists.length > 0 && (
                                                <div className="mt-6 p-4 bg-gray-950/80 rounded-xl border border-gray-800/60">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <div className="p-1 bg-emerald-500/15 rounded border border-emerald-400/20">
                                                            <Stethoscope className="h-4 w-4 text-emerald-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm text-white">Recommended Specialists</span>
                                                    </div>
                                                    <div className="grid gap-3">
                                                        {message.specialists.map((specialist, specIndex) => (
                                                            <div key={specIndex} className="bg-gray-900/70 rounded-lg p-4 border border-gray-800/60 hover:bg-gray-800/80 transition-colors">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-white">{specialist.name}</h4>
                                                                        <p className="text-sm text-emerald-400 mb-2">{specialist.specialization}</p>
                                                                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                                            <span className="flex items-center space-x-1">
                                                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                                                                <span>{specialist.experience} years exp</span>
                                                                            </span>
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
                                                                        onClick={() => handleBookAppointment(specialist)}
                                                                        className="ml-3 bg-emerald-500/90 hover:bg-emerald-400/90 text-white border border-emerald-400/40 shadow-lg hover:shadow-emerald-500/20 transition-all"
                                                                    >
                                                                        <Calendar className="h-3 w-3 mr-1" /> 
                                                                        Book Now
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

                                {/* Enhanced Loading Message */}
                                {loading && (
                                    <div className="flex justify-start group">
                                        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 rounded-2xl px-6 py-4 max-w-[85%] shadow-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-1 bg-emerald-500/15 rounded-full border border-emerald-400/20">
                                                    <Bot className="h-3 w-3 text-emerald-400" />
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-300">AI is analyzing your symptoms...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Scroll to Bottom Button */}
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleScrollToBottom}
                            className="absolute right-6 bottom-32 z-20 bg-emerald-500/90 hover:bg-emerald-400/90 text-white rounded-full shadow-2xl p-3 transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm hover:scale-105"
                            aria-label="Scroll to bottom"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Enhanced Input Area */}
                    <div className="p-6 bg-gray-950/50 backdrop-blur-xl border-t border-gray-800/60">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleSubmit} className="flex space-x-4">
                                <div className="flex-1 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Describe your symptoms or ask a health question..."
                                        disabled={loading}
                                        className="w-full bg-gray-900/70 border-gray-800/60 text-gray-100 placeholder:text-gray-500 focus-visible:ring-emerald-400 focus-visible:border-emerald-400/60 h-14 text-base px-6 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={loading || !input.trim()} 
                                    className="h-14 w-14 bg-emerald-500/90 hover:bg-emerald-400/90 rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/40"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-gray-500">
                                    💡 Try: "I have chest pain and shortness of breath" or "What are the symptoms of diabetes?"
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span>AI Assistant Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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