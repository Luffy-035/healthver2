"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart,
    Brain,
    Activity,
    Apple,
    Moon,
    Smile,
    TrendingUp,
    TrendingDown,
    Minus,
    Play,
    RefreshCw,
    Lightbulb
} from "lucide-react";
import HealthQuestionnaire from "./HealthQuestionnaire";
import { getHealthData, updateHealthScore } from "@/actions/healthActions";
import AIHealthInsights from "./AIHealthInsights";

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
            alert("Failed to update health score");
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
        if (score >= 80) return { text: "Excellent", color: "bg-emerald-900 text-emerald-300 border border-emerald-700" };
        if (score >= 60) return { text: "Good", color: "bg-yellow-900 text-yellow-300 border border-yellow-700" };
        if (score >= 40) return { text: "Fair", color: "bg-orange-900 text-orange-300 border border-orange-700" };
        return { text: "Needs Improvement", color: "bg-red-900 text-red-300 border border-red-700" };
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-emerald-400" />;
        if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-400" />;
        return <Minus className="h-5 w-5 text-zinc-400" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
                    </div>
                </div>
            </div>
        );
    }

    const currentScore = healthData?.current_score || 0;
    const questionnaireScore = healthData?.questionnaire_score || 0;
    const aiScore = healthData?.ai_score || 0;
    const combinedScore = healthData?.combined_score || currentScore;
    const scoreStatus = getScoreStatus(currentScore);
    const categoryScores = healthData?.questionnaire?.categories || {};

    return (
        // ✅ SPACIOUS: Increased padding and vertical spacing
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Health Score</h1>
                        <p className="text-zinc-400 mt-3 text-lg">Track and improve your overall health</p>
                    </div>
                    <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-8 text-lg">
                        <Play className="h-5 w-5 mr-3" />
                        {healthData?.questionnaire ? "Retake Assessment" : "Take Health Assessment"}
                    </Button>
                </div>

                {/* Main Health Score Card */}
                <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 p-8">
                    <CardHeader className="pb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl text-white mb-2">Your Health Score</CardTitle>
                                <CardDescription className="text-zinc-400 text-base">
                                    {healthData?.questionnaire?.last_taken
                                        ? `Last updated: ${new Date(healthData.questionnaire.last_taken).toLocaleDateString()}`
                                        : "Take your first assessment to see your score"
                                    }
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge className={`${scoreStatus.color} py-2 px-4 text-base`}>{scoreStatus.text}</Badge>
                                {aiScore > 0 && (
                                    <Badge className="bg-purple-900 text-purple-300 border border-purple-700 py-2 px-4 text-base">AI Enhanced</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
                            {/* ✅ SPACIOUS: Increased size of the score circle */}
                            <div className="relative flex-shrink-0">
                                <div className="w-40 h-40 rounded-full border-[12px] border-zinc-800 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-2 rounded-full bg-zinc-900"></div>
                                    <svg className="absolute inset-0 w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                                        <circle
                                            cx="80" cy="80" r="70" fill="none"
                                            stroke="#10b981"
                                            strokeWidth="12"
                                            strokeDasharray={`${Math.max(0, Math.min(100, currentScore)) * 4.4} 440`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="relative z-10 text-center">
                                        <span className={`text-5xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</span>
                                        <div className="text-sm text-zinc-500">/ 100</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-6 text-center md:text-left">
                                <div>
                                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                                        <span className="text-2xl font-medium text-white">Overall Health</span>
                                        {healthData?.trend && getTrendIcon(healthData.trend)}
                                    </div>
                                    <Progress value={currentScore} className="h-4 [&>*]:bg-emerald-500 bg-zinc-800" />
                                </div>
                                {healthData?.questionnaire && (
                                    <p className="text-base text-zinc-400 max-w-lg">
                                        Based on your lifestyle, diet, exercise, and mental health assessment
                                        {aiScore > 0 && " enhanced with AI analysis"}
                                    </p>
                                )}
                                {(questionnaireScore > 0 || aiScore > 0) && (
                                    <div className="text-base text-zinc-400 space-y-2 pt-4">
                                        <div className="font-medium text-zinc-300 mb-3 text-lg">Score Breakdown:</div>
                                        {questionnaireScore > 0 && (
                                            <div className="flex justify-between"><span className="opacity-80">Questionnaire Score:</span><span className="font-medium text-zinc-200">{questionnaireScore}</span></div>
                                        )}
                                        {aiScore > 0 && (
                                            <div className="flex justify-between"><span className="opacity-80">AI Health Score:</span><span className="font-medium text-purple-400">{aiScore}</span></div>
                                        )}
                                        {questionnaireScore > 0 && aiScore > 0 && (
                                            <div className="flex justify-between border-t border-zinc-800 pt-3 mt-3"><span className="font-medium text-white">Combined Score:</span><span className="font-bold text-emerald-400 text-lg">{combinedScore}</span></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                {Object.keys(categoryScores).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800 p-2"><CardHeader className="pb-3"><CardTitle className="text-lg text-white flex items-center space-x-3"><Apple className="h-6 w-6 text-emerald-400" /><span>Diet & Nutrition</span></CardTitle></CardHeader><CardContent className="flex items-center justify-between pt-2"><Progress value={categoryScores.diet || 0} className="flex-1 mr-4 h-3 [&>*]:bg-emerald-500 bg-zinc-800" /><span className="font-semibold text-white text-lg">{categoryScores.diet || 0}</span></CardContent></Card>
                        <Card className="bg-zinc-900 border-zinc-800 p-2"><CardHeader className="pb-3"><CardTitle className="text-lg text-white flex items-center space-x-3"><Activity className="h-6 w-6 text-blue-400" /><span>Physical Activity</span></CardTitle></CardHeader><CardContent className="flex items-center justify-between pt-2"><Progress value={categoryScores.exercise || 0} className="flex-1 mr-4 h-3 [&>*]:bg-blue-500 bg-zinc-800" /><span className="font-semibold text-white text-lg">{categoryScores.exercise || 0}</span></CardContent></Card>
                        <Card className="bg-zinc-900 border-zinc-800 p-2"><CardHeader className="pb-3"><CardTitle className="text-lg text-white flex items-center space-x-3"><Moon className="h-6 w-6 text-purple-400" /><span>Sleep & Rest</span></CardTitle></CardHeader><CardContent className="flex items-center justify-between pt-2"><Progress value={categoryScores.sleep || 0} className="flex-1 mr-4 h-3 [&>*]:bg-purple-500 bg-zinc-800" /><span className="font-semibold text-white text-lg">{categoryScores.sleep || 0}</span></CardContent></Card>
                        <Card className="bg-zinc-900 border-zinc-800 p-2"><CardHeader className="pb-3"><CardTitle className="text-lg text-white flex items-center space-x-3"><Smile className="h-6 w-6 text-yellow-400" /><span>Mental Health</span></CardTitle></CardHeader><CardContent className="flex items-center justify-between pt-2"><Progress value={categoryScores.mental_health || 0} className="flex-1 mr-4 h-3 [&>*]:bg-yellow-500 bg-zinc-800" /><span className="font-semibold text-white text-lg">{categoryScores.mental_health || 0}</span></CardContent></Card>
                    </div>
                )}
                {healthData?.questionnaire && (
                    <AIHealthInsights
                        healthData={healthData}
                        onRefresh={() => loadHealthData()}
                    />
                )}

                {/* AI Recommendations */}
                {healthData?.recommendations && healthData.recommendations.length > 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <CardHeader className="mb-4"><CardTitle className="flex items-center space-x-3 text-white text-xl"><Brain className="h-6 w-6 text-purple-400" /><span>AI Health Recommendations</span></CardTitle><CardDescription className="text-zinc-400 text-base mt-2">Personalized suggestions to improve your health score</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {healthData.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-4 p-5 bg-zinc-800 rounded-lg border border-zinc-700">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium text-blue-300 text-lg">{rec.title}</p>
                                        <p className="text-base text-zinc-400 mt-2">{rec.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : null}

                {/* No Data State */}
                {!healthData?.questionnaire && (
                    <Card className="bg-zinc-900 border-zinc-800 p-8">
                        <CardContent className="text-center py-16">
                            <Heart className="h-20 w-20 text-zinc-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-zinc-400 mb-4">Start Your Health Journey</h3>
                            <p className="text-lg text-zinc-500 mb-8 max-w-lg mx-auto">Take our comprehensive health assessment to get your personalized score and AI-powered recommendations.</p>
                            <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-8 text-lg">
                                <Play className="h-5 w-5 mr-3" />
                                Take Health Assessment
                            </Button>
                        </CardContent>
                    </Card>
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