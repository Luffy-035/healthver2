"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart, Brain, Activity, Apple, Moon, Smile,
    TrendingUp, TrendingDown, Minus, Play, RefreshCw
} from "lucide-react";
import HealthQuestionnaire from "./HealthQuestionnaire";
import { getHealthData, updateHealthScore } from "@/actions/healthActions";
import AIHealthInsights from "./AIHealthInsights";

// ✨ This component remains the same, as it's already well-structured.
const GlowingScoreVisual = ({ score }) => {
    const getColor = (score) => {
        if (score >= 80) return { hex: "#34d399", animate: "animate-pulse-emerald" };
        if (score >= 60) return { hex: "#fbbf24", animate: "animate-pulse-yellow" };
        return { hex: "#f87171", animate: "animate-pulse-red" };
    };

    const { hex, animate } = getColor(score);
    const circumference = 2 * Math.PI * 84;

    return (
        <>
            <style jsx global>{`
                @keyframes pulse-emerald { 50% { filter: drop-shadow(0 0 25px #34d399); } }
                @keyframes pulse-yellow { 50% { filter: drop-shadow(0 0 25px #fbbf24); } }
                @keyframes pulse-red { 50% { filter: drop-shadow(0 0 25px #f87171); } }
                .animate-pulse-emerald { animation: pulse-emerald 3s infinite ease-in-out; }
                .animate-pulse-yellow { animation: pulse-yellow 3s infinite ease-in-out; }
                .animate-pulse-red { animation: pulse-red 3s infinite ease-in-out; }
            `}</style>
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                    <circle cx="96" cy="96" r="84" fill="none" stroke="#27272a" strokeWidth="12" />
                    <circle
                        cx="96" cy="96" r="84" fill="none"
                        stroke={hex}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (score / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="w-full h-full flex items-center justify-center">
                    <Brain
                        className={`w-28 h-28 text-white transition-all duration-1000 ${animate}`}
                        style={{ filter: `drop-shadow(0 0 15px ${hex})` }}
                    />
                </div>
            </div>
        </>
    );
};

export default function HealthScoreDashboard({ patient }) {
    const [healthData, setHealthData] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealthData();
    }, []);

    const loadHealthData = async () => {
        try {
            const data = await getHealthData();
            setHealthData(data);
        } catch (error) {
            console.error("Error loading health data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionnaireComplete = async (responses) => {
        try {
            setLoading(true);
            const updatedData = await updateHealthScore(responses);
            setHealthData(updatedData);
            setShowQuestionnaire(false);
        } catch (error) {
            console.error("Error updating health score:", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getScoreStatus = (score) => {
        if (score >= 80) return { text: "Excellent", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
        if (score >= 60) return { text: "Good", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
        return { text: "Needs Improvement", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-emerald-400" />;
        if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-400" />;
        return <Minus className="h-5 w-5 text-zinc-400" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <RefreshCw className="h-10 w-10 animate-spin text-zinc-500" />
            </div>
        );
    }

    const currentScore = healthData?.current_score || 0;
    const questionnaireScore = healthData?.questionnaire_score || 0;
    const aiScore = healthData?.ai_score || 0;
    const scoreStatus = getScoreStatus(currentScore);
    const categoryScores = healthData?.questionnaire?.categories || {};

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
            {/* ✨ NEW: Global background decorative gradient */}
            <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[80rem] h-[80rem] bg-gradient-radial from-neutral-900/80 via-black to-black rounded-full" aria-hidden="true" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Health Dashboard</h1>
                        <p className="text-zinc-400 mt-2 text-base md:text-lg">Your personalized wellness overview.</p>
                    </div>
                    <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white h-12 px-6 text-base">
                        <Play className="h-5 w-5 mr-2" />
                        {healthData?.questionnaire ? "Retake Assessment" : "Take Assessment"}
                    </Button>
                </div>

                {/* Main Health Score Card */}
                {/* 🎨 REFINED: Applied glassmorphism style to this card */}
                {healthData?.questionnaire ? (
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                            <div className="md:col-span-2 flex justify-center items-center">
                                <GlowingScoreVisual score={currentScore} />
                            </div>
                            <div className="md:col-span-3 space-y-6">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-6xl md:text-7xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}
                                            <span className="text-4xl text-zinc-500">/100</span>
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            <Badge className={`${scoreStatus.color} py-1 px-3 text-sm`}>{scoreStatus.text}</Badge>
                                            {healthData?.trend && getTrendIcon(healthData.trend)}
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 mt-2">Your overall health score based on recent data.</p>
                                </div>
                                <Progress value={currentScore} className="h-3 [&>*]:bg-zinc-200 bg-white/10" />
                                {(questionnaireScore > 0 || aiScore > 0) && (
                                    <div className="space-y-3 pt-2">
                                        <h3 className="font-semibold text-zinc-300">Score Breakdown</h3>
                                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                            {questionnaireScore > 0 && (
                                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-md">
                                                    <span className="text-zinc-400">Assessment:</span>
                                                    <span className="font-bold text-white">{questionnaireScore}</span>
                                                </div>
                                            )}
                                            {aiScore > 0 && (
                                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-md">
                                                    <span className="text-purple-400">AI Analysis:</span>
                                                    <span className="font-bold text-white">{aiScore}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                     // 🎨 REFINED: Applied glassmorphism style to the "No Data" state
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
                        <CardContent className="text-center p-12 md:p-16">
                            <Heart className="h-16 w-16 text-zinc-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-white mb-4">Start Your Health Journey</h3>
                            <p className="text-lg text-zinc-400 mb-8 max-w-lg mx-auto">Take our comprehensive health assessment to get your personalized score and AI-powered recommendations.</p>
                            <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-8 text-lg">
                                <Play className="h-5 w-5 mr-3" />
                                Take Health Assessment
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Category Breakdown */}
                {Object.keys(categoryScores).length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white text-center md:text-left">Category Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries({
                                diet: { title: 'Diet & Nutrition', Icon: Apple },
                                exercise: { title: 'Physical Activity', Icon: Activity },
                                sleep: { title: 'Sleep & Rest', Icon: Moon },
                                mental_health: { title: 'Mental Wellness', Icon: Smile },
                            }).map(([key, { title, Icon }]) => (
                                <Card key={key} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
                                    <CardContent className="p-6 flex flex-col justify-between gap-4 h-full">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                                                    <Icon className="h-6 w-6 text-zinc-300" />
                                                </div>
                                                <CardTitle className="text-base font-medium text-white">{title}</CardTitle>
                                            </div>
                                            <span className="text-2xl font-bold text-white">{categoryScores[key] || 0}</span>
                                        </div>
                                        <Progress value={categoryScores[key] || 0} className="h-2 [&>*]:bg-zinc-200 bg-white/10" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* AI Health Insights */}
                {healthData?.questionnaire && (
                    <AIHealthInsights healthData={healthData} onRefresh={loadHealthData} />
                )}
            </div>

            {showQuestionnaire && (
                <HealthQuestionnaire
                    isOpen={showQuestionnaire}
                    onClose={() => setShowQuestionnaire(false)}
                    onComplete={handleQuestionnaireComplete}
                    previousResponses={healthData?.questionnaire?.responses}
                />
            )}
        </div>
    );
}