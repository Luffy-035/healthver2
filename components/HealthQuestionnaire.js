"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, CheckCircle,X } from "lucide-react";

// Comprehensive question bank with adaptive logic
const QUESTION_BANK = {
    // Basic Demographics & Lifestyle
    basics: [
        {
            id: "age_group",
            category: "demographics",
            question: "What is your age group?",
            type: "single",
            options: [
                { value: "18-25", label: "18-25 years", score: 0 },
                { value: "26-35", label: "26-35 years", score: 0 },
                { value: "36-45", label: "36-45 years", score: -5 },
                { value: "46-55", label: "46-55 years", score: -10 },
                { value: "56-65", label: "56-65 years", score: -15 },
                { value: "65+", label: "65+ years", score: -20 }
            ]
        },
        {
            id: "exercise_frequency",
            category: "exercise",
            question: "How often do you exercise per week?",
            type: "single",
            options: [
                { value: "none", label: "Never or rarely", score: 0 },
                { value: "1-2", label: "1-2 times", score: 15 },
                { value: "3-4", label: "3-4 times", score: 25 },
                { value: "5-6", label: "5-6 times", score: 30 },
                { value: "daily", label: "Daily", score: 35 }
            ]
        },
        {
            id: "sleep_hours",
            category: "sleep",
            question: "How many hours do you sleep on average per night?",
            type: "single",
            options: [
                { value: "less-5", label: "Less than 5 hours", score: -10 },
                { value: "5-6", label: "5-6 hours", score: 5 },
                { value: "7-8", label: "7-8 hours", score: 25 },
                { value: "8-9", label: "8-9 hours", score: 20 },
                { value: "more-9", label: "More than 9 hours", score: 10 }
            ]
        }
    ],

    // Diet & Nutrition
    diet: [
        {
            id: "fruit_veggie_intake",
            category: "diet",
            question: "How many servings of fruits and vegetables do you eat daily?",
            type: "single",
            options: [
                { value: "none", label: "None or very few", score: 0 },
                { value: "1-2", label: "1-2 servings", score: 10 },
                { value: "3-4", label: "3-4 servings", score: 20 },
                { value: "5-6", label: "5-6 servings", score: 25 },
                { value: "7+", label: "7+ servings", score: 30 }
            ]
        },
        {
            id: "water_intake",
            category: "diet",
            question: "How much water do you drink per day?",
            type: "single",
            options: [
                { value: "less-2", label: "Less than 2 glasses", score: 0 },
                { value: "2-4", label: "2-4 glasses", score: 10 },
                { value: "5-7", label: "5-7 glasses", score: 20 },
                { value: "8+", label: "8+ glasses", score: 25 }
            ]
        },
        {
            id: "processed_food",
            category: "diet",
            question: "How often do you eat processed or fast food?",
            type: "single",
            options: [
                { value: "daily", label: "Daily", score: -15 },
                { value: "few-times-week", label: "Few times a week", score: -10 },
                { value: "weekly", label: "Once a week", score: -5 },
                { value: "monthly", label: "Few times a month", score: 5 },
                { value: "rarely", label: "Rarely or never", score: 20 }
            ]
        }
    ],

    // Mental Health & Stress
    mental_health: [
        {
            id: "stress_level",
            category: "mental_health",
            question: "How would you rate your average stress level?",
            type: "single",
            options: [
                { value: "very-low", label: "Very low", score: 25 },
                { value: "low", label: "Low", score: 20 },
                { value: "moderate", label: "Moderate", score: 15 },
                { value: "high", label: "High", score: 5 },
                { value: "very-high", label: "Very high", score: -10 }
            ]
        },
        {
            id: "mental_wellness",
            category: "mental_health",
            question: "How often do you feel happy and content?",
            type: "single",
            options: [
                { value: "rarely", label: "Rarely", score: -10 },
                { value: "sometimes", label: "Sometimes", score: 5 },
                { value: "often", label: "Often", score: 15 },
                { value: "very-often", label: "Very often", score: 25 },
                { value: "always", label: "Almost always", score: 30 }
            ]
        }
    ],

    // Lifestyle & Habits
    lifestyle: [
        {
            id: "smoking_status",
            category: "lifestyle",
            question: "Do you smoke or use tobacco products?",
            type: "single",
            options: [
                { value: "never", label: "Never smoked", score: 20 },
                { value: "former", label: "Former smoker (quit over 1 year ago)", score: 10 },
                { value: "recent-quit", label: "Recently quit (less than 1 year)", score: 5 },
                { value: "occasional", label: "Occasional smoker", score: -15 },
                { value: "regular", label: "Regular smoker", score: -25 }
            ]
        },
        {
            id: "alcohol_consumption",
            category: "lifestyle",
            question: "How often do you consume alcohol?",
            type: "single",
            options: [
                { value: "never", label: "Never", score: 15 },
                { value: "rarely", label: "Rarely (special occasions)", score: 10 },
                { value: "weekly", label: "1-2 times per week", score: 5 },
                { value: "several-weekly", label: "3-4 times per week", score: -5 },
                { value: "daily", label: "Daily", score: -15 }
            ]
        }
    ],

    // Follow-up questions (adaptive)
    followup: [
        {
            id: "exercise_type",
            category: "exercise",
            question: "What type of exercise do you primarily do?",
            type: "single",
            condition: (responses) => responses.exercise_frequency && responses.exercise_frequency !== 'none',
            options: [
                { value: "cardio", label: "Cardio (running, cycling, swimming)", score: 5 },
                { value: "strength", label: "Strength training", score: 5 },
                { value: "mixed", label: "Mix of cardio and strength", score: 10 },
                { value: "sports", label: "Sports activities", score: 8 },
                { value: "yoga", label: "Yoga or flexibility", score: 6 }
            ]
        },
        {
            id: "stress_management",
            category: "mental_health",
            question: "Do you practice any stress management techniques?",
            type: "single",
            condition: (responses) => responses.stress_level && ['high', 'very-high'].includes(responses.stress_level),
            options: [
                { value: "none", label: "No specific techniques", score: 0 },
                { value: "meditation", label: "Meditation or mindfulness", score: 15 },
                { value: "exercise", label: "Exercise for stress relief", score: 10 },
                { value: "hobbies", label: "Hobbies or creative activities", score: 8 },
                { value: "social", label: "Talking with friends/family", score: 6 }
            ]
        },
        {
            id: "sleep_quality",
            category: "sleep",
            question: "How would you rate your sleep quality?",
            type: "single",
            condition: (responses) => responses.sleep_hours,
            options: [
                { value: "poor", label: "Poor (frequently wake up, don't feel rested)", score: -10 },
                { value: "fair", label: "Fair (sometimes restless)", score: 5 },
                { value: "good", label: "Good (usually feel rested)", score: 15 },
                { value: "excellent", label: "Excellent (always feel refreshed)", score: 25 }
            ]
        }
    ]
};

export default function HealthQuestionnaire({ isOpen, onClose, onComplete, previousResponses = {} }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(previousResponses);
    const [questionSequence, setQuestionSequence] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generate adaptive question sequence
    useState(() => {
        const generateQuestionSequence = () => {
            let sequence = [
                ...QUESTION_BANK.basics,
                ...QUESTION_BANK.diet,
                ...QUESTION_BANK.mental_health,
                ...QUESTION_BANK.lifestyle
            ];

            // Add conditional follow-up questions
            QUESTION_BANK.followup.forEach(question => {
                if (!question.condition || question.condition(previousResponses)) {
                    sequence.push(question);
                }
            });

            return sequence;
        };

        setQuestionSequence(generateQuestionSequence());
    }, [previousResponses]);

    const currentQuestion = questionSequence[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionSequence.length) * 100;

    const handleAnswer = (value) => {
        const newResponses = {
            ...responses,
            [currentQuestion.id]: value
        };
        setResponses(newResponses);

        // Check if we need to add more follow-up questions
        const newFollowUps = QUESTION_BANK.followup.filter(q =>
            q.condition && q.condition(newResponses) &&
            !questionSequence.find(seq => seq.id === q.id)
        );

        if (newFollowUps.length > 0) {
            setQuestionSequence(prev => [...prev, ...newFollowUps]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questionSequence.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await onComplete(responses);
        } catch (error) {
            console.error("Error completing questionnaire:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentQuestion) {
        return null;
    }

    const isLastQuestion = currentQuestionIndex === questionSequence.length - 1;
    const canProceed = responses[currentQuestion.id] !== undefined;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-full max-h-full h-screen w-screen m-0 p-0 flex flex-col">
                {/* Header with close button */}
                <div className="p-4 border-b flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Health Assessment</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Question {currentQuestionIndex + 1} of {questionSequence.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4 space-y-4">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg leading-relaxed font-medium">
                                    {currentQuestion?.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={responses[currentQuestion?.id] || ""}
                                    onValueChange={handleAnswer}
                                    className="space-y-2"
                                >
                                    {currentQuestion?.options.map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-white hover:shadow-sm transition-all cursor-pointer bg-white/50"
                                            onClick={() => handleAnswer(option.value)}
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={option.value}
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className="flex-1 cursor-pointer font-medium leading-relaxed text-gray-700"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fixed navigation footer */}
                <div className="p-4 border-t bg-white flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="min-w-[100px]"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed || loading}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                "Processing..."
                            ) : isLastQuestion ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}