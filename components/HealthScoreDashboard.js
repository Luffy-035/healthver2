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
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreStatus = (score) => {
        if (score >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" };
        if (score >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
        if (score >= 40) return { text: "Fair", color: "bg-orange-100 text-orange-800" };
        return { text: "Needs Improvement", color: "bg-red-100 text-red-800" };
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-gray-600" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    const currentScore = healthData?.current_score || 0;
    // ADD THESE LINES - Extract individual scores for breakdown
    const questionnaireScore = healthData?.questionnaire_score || 0;
    const aiScore = healthData?.ai_score || 0;
    const combinedScore = healthData?.combined_score || currentScore;

    const scoreStatus = getScoreStatus(currentScore);
    const categoryScores = healthData?.questionnaire?.categories || {};

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Health Score</h1>
                        <p className="text-gray-600 mt-2">Track and improve your overall health</p>
                    </div>
                    <Button onClick={() => setShowQuestionnaire(true)} size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        {healthData?.questionnaire ? "Retake Assessment" : "Take Health Assessment"}
                    </Button>
                </div>

                {/* Main Health Score Card - FIXED DESIGN */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">Your Health Score</CardTitle>
                                <CardDescription>
                                    {healthData?.questionnaire?.last_taken
                                        ? `Last updated: ${new Date(healthData.questionnaire.last_taken).toLocaleDateString()}`
                                        : "Take your first assessment to see your score"
                                    }
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge className={scoreStatus.color}>{scoreStatus.text}</Badge>
                                {/* ADD THIS - AI Badge when AI score is present */}
                                {aiScore > 0 && (
                                    <Badge className="bg-purple-100 text-purple-800">
                                        AI Enhanced
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* Score Circle - FIXED */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center relative overflow-hidden">
                                    {/* Background circle */}
                                    <div className="absolute inset-2 rounded-full bg-gray-100"></div>

                                    {/* Progress arc */}
                                    <svg className="absolute inset-0 w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="8"
                                            strokeDasharray={`${Math.max(0, Math.min(100, currentScore)) * 3.52} 352`} // FIXED: Clamp value
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>

                                    {/* Score text */}
                                    <div className="relative z-10 text-center">
                                        <span className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                                            {currentScore}
                                        </span>
                                        <div className="text-xs text-gray-500">/ 100</div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Details - FIXED */}
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                        <span className="text-lg font-medium">Overall Health</span>
                                        {healthData?.trend && getTrendIcon(healthData.trend)}
                                    </div>
                                    <Progress value={currentScore} className="h-3" />
                                </div>

                                {healthData?.questionnaire && (
                                    <p className="text-sm text-gray-600">
                                        Based on your lifestyle, diet, exercise, and mental health assessment
                                        {aiScore > 0 && " enhanced with AI analysis"}
                                    </p>
                                )}

                                {/* ADD THIS - Score Breakdown */}
                                {(questionnaireScore > 0 || aiScore > 0) && (
                                    <div className="text-sm text-gray-600 space-y-1 mt-4">
                                        <div className="font-medium text-gray-700 mb-2">Score Breakdown:</div>
                                        {questionnaireScore > 0 && (
                                            <div className="flex justify-between">
                                                <span>Questionnaire Score:</span>
                                                <span className="font-medium">{questionnaireScore}</span>
                                            </div>
                                        )}
                                        {aiScore > 0 && (
                                            <div className="flex justify-between">
                                                <span>AI Health Score:</span>
                                                <span className="font-medium text-purple-600">{aiScore}</span>
                                            </div>
                                        )}
                                        {questionnaireScore > 0 && aiScore > 0 && (
                                            <div className="flex justify-between border-t pt-1 mt-2">
                                                <span className="font-medium">Combined Score:</span>
                                                <span className="font-bold text-blue-600">{combinedScore}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                {Object.keys(categoryScores).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <Apple className="h-5 w-5 text-green-600" />
                                    <CardTitle className="text-lg">Diet & Nutrition</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Progress value={categoryScores.diet || 0} className="flex-1 mr-3" />
                                    <span className="font-semibold">{categoryScores.diet || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">Physical Activity</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Progress value={categoryScores.exercise || 0} className="flex-1 mr-3" />
                                    <span className="font-semibold">{categoryScores.exercise || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <Moon className="h-5 w-5 text-purple-600" />
                                    <CardTitle className="text-lg">Sleep & Rest</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Progress value={categoryScores.sleep || 0} className="flex-1 mr-3" />
                                    <span className="font-semibold">{categoryScores.sleep || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                    <Smile className="h-5 w-5 text-yellow-600" />
                                    <CardTitle className="text-lg">Mental Health</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Progress value={categoryScores.mental_health || 0} className="flex-1 mr-3" />
                                    <span className="font-semibold">{categoryScores.mental_health || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* AI Recommendations - FIXED & NO HARDCODING */}
                {healthData?.recommendations && healthData.recommendations.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                <span>AI Health Recommendations</span>
                            </CardTitle>
                            <CardDescription>
                                Personalized suggestions to improve your health score
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {healthData.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-medium text-blue-900">{rec.title}</p>
                                            <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {rec.priority && (
                                                    <Badge
                                                        variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                                                        className="text-xs"
                                                    >
                                                        {rec.priority} priority
                                                    </Badge>
                                                )}
                                                {rec.category && (
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {rec.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : healthData?.questionnaire ? (
                    // Show when questionnaire is taken but no AI recommendations yet
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-600" />
                                <span>AI Recommendations</span>
                            </CardTitle>
                            <CardDescription>
                                AI is analyzing your health data to generate personalized recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    Generating personalized health insights...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* No Data State */}
                {!healthData?.questionnaire && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-500 mb-2">
                                Start Your Health Journey
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Take our comprehensive health assessment to get your personalized health score and AI-powered recommendations.
                            </p>
                            <Button onClick={() => setShowQuestionnaire(true)} size="lg">
                                <Play className="h-4 w-4 mr-2" />
                                Take Health Assessment
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Questionnaire Modal */}
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
