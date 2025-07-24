"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TopPage from "@/components/page/top";

// Types für verschiedene Fragetypen
type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'scale';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

// Builder-spezifische Fragen
const builderQuestions: Question[] = [
  {
    id: "name",
    type: "text",
    title: "Full Name",
    placeholder: "Your real name",
    required: true
  },
  {
    id: "age",
    type: "text",
    title: "Age",
    placeholder: "Your age",
    required: true
  },
  {
    id: "minecraft_username",
    type: "text",
    title: "Minecraft Username",
    placeholder: "Your current Minecraft IGN",
    required: true
  },
  {
    id: "discord",
    type: "text",
    title: "Discord Username",
    placeholder: "username#1234",
    required: true
  },
  {
    id: "timezone",
    type: "select",
    title: "Timezone",
    required: true,
    options: ["GMT-8 (PST)", "GMT-5 (EST)", "GMT+0 (UTC)", "GMT+1 (CET)", "GMT+2 (EET)", "Other"]
  },
  {
    id: "experience",
    type: "scale",
    title: "Building Experience",
    description: "Rate your overall Minecraft building experience",
    required: true,
    min: 1,
    max: 10
  },
  {
    id: "worldedit_experience",
    type: "select",
    title: "WorldEdit Experience",
    required: true,
    options: ["No experience", "Basic commands", "Intermediate", "Advanced", "Expert"]
  },
  {
    id: "tools",
    type: "multiselect",
    title: "Building Tools Experience",
    description: "Select all tools you have experience with",
    required: false,
    options: ["WorldEdit", "VoxelSniper", "Axiom", "WorldPainter", "MCEdit", "Litematica"]
  },

  {
    id: "portfolio",
    type: "textarea",
    title: "Portfolio Links",
    description: "Share links to your builds (Screenshots, PMC, etc.)",
    placeholder: "https://www.planetminecraft.com/member/yourname/\nhttps://imgur.com/gallery/yourbuilds",
    required: true
  },
  {
    id: "availability",
    type: "textarea",
    title: "Availability",
    description: "When are you typically available to build?",
    placeholder: "Monday-Friday: 6-10 PM CET\nWeekends: Flexible",
    required: true
  },
  {
    id: "motivation",
    type: "textarea",
    title: "Why do you want to join our team?",
    description: "Tell us about your motivation and what you hope to contribute",
    placeholder: "I'm passionate about creating unique gaming experiences...",
    required: true
  },
  {
    id: "biggest_project",
    type: "textarea",
    title: "Describe your biggest building project",
    description: "What was the most challenging or impressive build you've completed?",
    placeholder: "My biggest project was a medieval castle that took 3 months...",
    required: true
  },
  {
    id: "team_experience",
    type: "select",
    title: "Team Building Experience",
    description: "Have you worked with other builders before?",
    required: true,
    options: ["No team experience", "Small projects with friends", "Server building team", "Multiple server teams", "Lead builder experience"]
  }
];

export default function BuilderApplicationPage() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const questionsPerStep = 4;
  const totalSteps = Math.ceil(builderQuestions.length / questionsPerStep);
  
  const getCurrentStepQuestions = () => {
    const start = currentStep * questionsPerStep;
    const end = start + questionsPerStep;
    return builderQuestions.slice(start, end);
  };

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-3 bg-gray-950 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-500"
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full p-3 bg-gray-950 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white resize-vertical placeholder-gray-500"
            required={question.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 bg-gray-950 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
            required={question.required}
          >
            <option value="" className="bg-gray-950">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option} className="bg-gray-950">
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(question.id, [...currentArray, option]);
                    } else {
                      handleInputChange(question.id, currentArray.filter(item => item !== option));
                    }
                  }}
                  className="w-4 h-4 text-green-500 bg-gray-950 border-gray-700 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{question.min} - Beginner</span>
              <span>{question.max} - Expert</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={value || question.min}
              onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, #374151 ${((value || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, #374151 100%)`
              }}
              required={question.required}
            />
            <div className="text-center">
              <span className="text-green-400 font-semibold">{value || question.min}/{question.max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Builder application submitted:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <>
        <TopPage />
        <section className="bg-gray-950 pt-36 min-h-screen">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
                <p className="text-gray-400 mb-8">
                  Thank you for applying to be a Builder at OnThePixel.net! We've received your application 
                  and will review it carefully. You can expect to hear back from us within 3-5 business days.
                </p>
                <div className="space-y-4">
                  <Link href="/apply" className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    View Other Positions
                  </Link>
                  <br />
                  <Link href="/" className="inline-block px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="mb-4">
                <Link href="/apply" className="text-green-400 hover:text-green-300 text-sm">
                  ← Back to Applications
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Builder Application
              </h1>
              <p className="text-gray-400 text-lg">
                Join our creative team and help build amazing worlds and game modes for OnThePixel.net!
              </p>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-gray-400">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Card className="border-gray-800 bg-gray-950">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl">
                  Application Form
                  <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                    {currentStep + 1}/{totalSteps}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {getCurrentStepQuestions().map((question) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-white font-medium text-lg">
                      {question.title}
                      {question.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {question.description && (
                      <p className="text-sm text-gray-400 -mt-1">{question.description}</p>
                    )}
                    {renderQuestion(question)}
                  </div>
                ))}

                <div className="flex justify-between pt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-8 py-3 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    Previous
                  </button>
                  
                  {currentStep === totalSteps - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Submit Application
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Next
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
