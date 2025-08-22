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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

const HEALTH_QUESTIONS = [
  {
    id: "exercise_frequency",
    question: "How often do you exercise per week?",
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
    question: "How many hours do you sleep on average per night?",
    options: [
      { value: "less-5", label: "Less than 5 hours", score: -10 },
      { value: "5-6", label: "5-6 hours", score: 5 },
      { value: "7-8", label: "7-8 hours", score: 25 },
      { value: "8-9", label: "8-9 hours", score: 20 },
      { value: "more-9", label: "More than 9 hours", score: 10 }
    ]
  },
  {
    id: "diet_quality",
    question: "How would you rate your overall diet quality?",
    options: [
      { value: "poor", label: "Poor (mostly processed foods)", score: -10 },
      { value: "fair", label: "Fair (mixed diet)", score: 5 },
      { value: "good", label: "Good (balanced with some healthy foods)", score: 15 },
      { value: "excellent", label: "Excellent (mostly whole foods)", score: 25 }
    ]
  },
  {
    id: "stress_level",
    question: "How would you rate your average stress level?",
    options: [
      { value: "very-low", label: "Very low", score: 25 },
      { value: "low", label: "Low", score: 20 },
      { value: "moderate", label: "Moderate", score: 15 },
      { value: "high", label: "High", score: 5 },
      { value: "very-high", label: "Very high", score: -10 }
    ]
  },
  {
    id: "water_intake",
    question: "How much water do you drink per day?",
    options: [
      { value: "less-2", label: "Less than 2 glasses", score: 0 },
      { value: "2-4", label: "2-4 glasses", score: 10 },
      { value: "5-7", label: "5-7 glasses", score: 20 },
      { value: "8+", label: "8+ glasses", score: 25 }
    ]
  },
  {
    id: "smoking_status",
    question: "Do you smoke or use tobacco products?",
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
    question: "How often do you consume alcohol?",
    options: [
      { value: "never", label: "Never", score: 15 },
      { value: "rarely", label: "Rarely (special occasions)", score: 10 },
      { value: "weekly", label: "1-2 times per week", score: 5 },
      { value: "several-weekly", label: "3-4 times per week", score: -5 },
      { value: "daily", label: "Daily", score: -15 }
    ]
  },
  {
    id: "mental_wellness",
    question: "How often do you feel happy and content?",
    options: [
      { value: "rarely", label: "Rarely", score: -10 },
      { value: "sometimes", label: "Sometimes", score: 5 },
      { value: "often", label: "Often", score: 15 },
      { value: "very-often", label: "Very often", score: 25 },
      { value: "always", label: "Almost always", score: 30 }
    ]
  },
  {
    id: "social_connections",
    question: "How satisfied are you with your social connections?",
    options: [
      { value: "very-unsatisfied", label: "Very unsatisfied", score: -10 },
      { value: "unsatisfied", label: "Unsatisfied", score: 0 },
      { value: "neutral", label: "Neutral", score: 10 },
      { value: "satisfied", label: "Satisfied", score: 20 },
      { value: "very-satisfied", label: "Very satisfied", score: 25 }
    ]
  },
  {
    id: "work_life_balance",
    question: "How would you rate your work-life balance?",
    options: [
      { value: "very-poor", label: "Very poor", score: -15 },
      { value: "poor", label: "Poor", score: -5 },
      { value: "fair", label: "Fair", score: 5 },
      { value: "good", label: "Good", score: 15 },
      { value: "excellent", label: "Excellent", score: 25 }
    ]
  }
];

export default function HealthQuestionnaire({ isOpen, onClose, onComplete, previousResponses = {} }) {
  const [responses, setResponses] = useState(previousResponses);
  const [loading, setLoading] = useState(false);

  const handleAnswerChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = HEALTH_QUESTIONS.filter(q => !responses[q.id]);
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions. Missing: ${unansweredQuestions.length} questions.`);
      return;
    }

    setLoading(true);
    try {
      await onComplete(responses);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      alert("Failed to submit questionnaire: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = (Object.keys(responses).length / HEALTH_QUESTIONS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b flex-shrink-0">
          <DialogTitle className="text-xl">Health Assessment</DialogTitle>
          <DialogDescription>
            Please answer all {HEALTH_QUESTIONS.length} questions to get your personalized health score
          </DialogDescription>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{Object.keys(responses).length} of {HEALTH_QUESTIONS.length} answered</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {HEALTH_QUESTIONS.map((question, index) => (
              <Card key={question.id} className={`relative ${responses[question.id] ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {responses[question.id] ? <CheckCircle className="h-4 w-4 text-green-600" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {question.question}
                      </h3>
                      <RadioGroup
                        value={responses[question.id] || ""}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="space-y-2"
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem 
                              value={option.value} 
                              id={`${question.id}-${option.value}`}
                            />
                            <Label 
                              htmlFor={`${question.id}-${option.value}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || Object.keys(responses).length < HEALTH_QUESTIONS.length}
              className="min-w-[150px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get My Health Score
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
