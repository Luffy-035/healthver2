"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, TrendingUp, RefreshCw } from "lucide-react";

export default function AIHealthInsights({ healthData, onRefresh }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (healthData?.current_score && healthData?.questionnaire) {
      generateInsights();
    }
  }, [healthData]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-health-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          health_score: healthData.current_score,
          questionnaire_data: healthData.questionnaire
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!healthData?.questionnaire) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle>AI Health Insights</CardTitle>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <CardDescription>
          Personalized recommendations to improve your health score
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Analyzing your health data...</span>
          </div>
        ) : insights ? (
          <div className="space-y-4">
            {/* Overall Assessment */}
            {insights.overall_assessment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Overall Assessment
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {insights.overall_assessment}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Action Recommendations
                </h3>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        {rec.priority && (
                          <Badge 
                            variant={
                              rec.priority === 'High' ? 'destructive' : 
                              rec.priority === 'Medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {rec.priority} Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {rec.description}
                      </p>
                      {rec.expected_impact && (
                        <p className="text-xs text-green-600 mt-1">
                          Expected impact: {rec.expected_impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Areas for Improvement */}
            {insights.focus_areas && insights.focus_areas.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.focus_areas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Click the refresh button to generate AI insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
