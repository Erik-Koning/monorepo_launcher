"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Textarea } from "@/packages/common/src/components/ui/textarea";

interface ConsultationQuestionsProps {
  questions: string[];
  onResponsesChange?: (responses: Record<number, string>) => void;
}

export function ConsultationQuestions({ questions, onResponsesChange }: ConsultationQuestionsProps) {
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleResponseChange = (index: number, value: string) => {
    const newResponses = { ...responses, [index]: value };
    setResponses(newResponses);
    onResponsesChange?.(newResponses);
  };

  return (
    <div className="">
      <div className="flex items-center gap-2 my-4 ml-4">
        <MessageCircle className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-semibold text-red-600">Suggested Questions for Client Profile:</h2>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block font-medium text-gray-900">
              {index + 1}. {question}
            </label>
            <Textarea
              id="consultation-questions"
              value={responses[index] || ""}
              onChange={(e) => handleResponseChange(index, e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-base focus:border-red-500 foc focus:outline-none focus:ring-2 focus:ring-red-500/20"
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
