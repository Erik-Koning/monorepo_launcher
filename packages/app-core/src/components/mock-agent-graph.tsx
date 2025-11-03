"use client";

import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { AgentNetworkGraph, type AgentNode } from "./agent-graph";
import { Brain, User, HelpCircle, TrendingUp, FileText } from "lucide-react";

const initialNodes: AgentNode[] = [
  {
    id: "Main",
    title: "Main Graph",
    subtitle: "Test",
    description: "Test",
    icon: <Brain className="w-8 h-8" />,
    status: "ready",
    progress: 0,
    variant: "primary",
    connections: ["Sub1", "Sub2", "Sub3"],
  },
];

const MockAgentGraphVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface MockAgentGraphProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof MockAgentGraphVariants> {
  className?: string;
  initialState?: AgentNode[];
}

export const MockAgentGraph = forwardRef<HTMLDivElement, MockAgentGraphProps>(({ className, variant, size, initialState, ...props }, ref) => {
  const [nodes, setNodes] = useState<AgentNode[]>(initialState || initialNodes);

  useEffect(() => {
    const sequence = [
      { id: "orchestrator", duration: 3000 },
      { id: "client-profile", duration: 4000 },
      { id: "question-provider", duration: 3500 },
      { id: "investment-selection", duration: 4500 },
      { id: "justification", duration: 5000 },
    ];

    let currentIndex = 0;
    let progressInterval: NodeJS.Timeout;
    let sequenceTimeout: NodeJS.Timeout;

    const processNextAgent = () => {
      if (currentIndex >= sequence.length) {
        return;
      }

      const current = sequence[currentIndex];

      setNodes((prev) => prev.map((node) => (node.id === current.id ? { ...node, status: "processing" as const, progress: 0 } : node)));

      let progress = 0;
      progressInterval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
          setNodes((prev) => prev.map((node) => (node.id === current.id ? { ...node, progress } : node)));
        }
      }, current.duration / 50);

      sequenceTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        setNodes((prev) => prev.map((node) => (node.id === current.id ? { ...node, status: "complete" as const, progress: 100 } : node)));

        currentIndex++;
        if (currentIndex < sequence.length) {
          setNodes((prev) => prev.map((node) => (node.id === sequence[currentIndex].id ? { ...node, status: "ready" as const } : node)));
          setTimeout(processNextAgent, 500);
        }
      }, current.duration);
    };

    const startTimeout = setTimeout(() => {
      processNextAgent();
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(sequenceTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div {...props} className={cn("w-full", MockAgentGraphVariants({ variant, size }), className)} ref={ref}>
      <AgentNetworkGraph nodes={nodes} layout="hierarchical" />
    </div>
  );
});

MockAgentGraph.displayName = "MockAgentGraph";
