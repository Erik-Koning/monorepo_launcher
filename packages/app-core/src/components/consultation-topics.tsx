"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Umbrella, Briefcase, BarChart3, GraduationCap, FileText, Clipboard, Lightbulb } from "lucide-react";

interface Topic {
  label: string;
  text: string;
  icon?: string;
}

interface ConsultationTopicsProps {
  topics: Topic[];
  maxLength?: number;
  onGenerate?: (text: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  chart: TrendingUp,
  umbrella: Umbrella,
  briefcase: Briefcase,
  barchart: BarChart3,
  graduation: GraduationCap,
  file: FileText,
};

export function ConsultationTopics({ topics, maxLength = 2000, onGenerate }: ConsultationTopicsProps) {
  const [text, setText] = useState("");

  const handleTopicClick = (topicText: string) => {
    const newText = text ? `${text}\n\n${topicText}` : topicText;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  const handleClear = () => {
    setText("");
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(text);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return TrendingUp;
    return iconMap[iconName] || TrendingUp;
  };

  return (
    <div className="w-full space-y-6">
      {/* Topics Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clipboard className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-600">Consultation Goal:</h2>
        </div>

        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topics.map((topic, index) => {
            const Icon = getIcon(topic.icon);
            return (
              <Button
                key={index}
                variant="blank"
                innerClassName="flex h-fit justify-start gap-2 rounded-md border border-red-200 px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                onClick={() => handleTopicClick(topic.text)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-md font-medium">{topic.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Textarea Section */}
      <div className="rounded-lg border bg-card p-6">
        <Textarea
          id="consultation-topics"
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setText(e.target.value);
            }
          }}
          placeholder="Select a topic above or type your consultation notes here..."
          className="min-h-[240px] resize-none text-base"
          maxLength={maxLength}
          aiActions={[]}
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {text.length}/{maxLength}
          </span>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClear} className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent">
              Clear
            </Button>
            <Button onClick={handleGenerate} className="bg-red-600 text-white hover:bg-red-700" disabled={!text.trim()}>
              Generate Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="rounded-lg border border-l-4 border-l-red-600 bg-red-50/50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-600">Professional Advisory Guidelines:</h3>
        </div>

        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-red-600">•</span>
            <span>Frame discussions around client objectives and investment timeline</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-600">•</span>
            <span>Reference risk assessment questionnaire results and suitability</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-600">•</span>
            <span>Include RRSP/TFSA contribution room and tax optimization strategies</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-600">•</span>
            <span>Address estate planning considerations and beneficiary designations</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-600">•</span>
            <span>Document regulatory compliance and know-your-client requirements</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
