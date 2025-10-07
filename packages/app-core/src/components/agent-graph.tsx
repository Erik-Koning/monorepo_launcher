"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "@common/components/ui/Progress";

export type AgentStatus = "ready" | "processing" | "complete" | "waiting" | "error";

export interface AgentNode {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  status: AgentStatus;
  progress?: number;
  connections?: string[];
  variant?: "primary" | "secondary" | "accent" | "warning" | "success";
  customContent?: ReactNode;
}

export interface NetworkGraphConfig {
  nodes: AgentNode[];
  layout?: "hierarchical" | "custom";
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  ready: "bg-emerald-500",
  processing: "bg-blue-500",
  complete: "bg-green-500",
  waiting: "bg-amber-500",
  error: "bg-red-500",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  complete: "Complete",
  waiting: "Waiting",
  error: "Error",
};

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400",
  secondary: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 border-slate-300",
  accent: "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-400",
  warning: "bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-900 border-amber-300",
  success: "bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-900 border-emerald-300",
};

const CARD_HEIGHT = 180;
const LAYER_HEIGHT = 280; // Increased LAYER_HEIGHT from 220 to 280 to prevent layer overlap
const NODE_WIDTH = 260;

function calculateHierarchicalLayout(nodes: AgentNode[]) {
  const layers: Record<number, AgentNode[]> = {};
  const nodeDepth: Record<string, number> = {};

  const hasIncoming = new Set<string>();
  nodes.forEach((node) => {
    node.connections?.forEach((connId) => hasIncoming.add(connId));
  });

  const assignDepth = (nodeId: string, depth: number, visited = new Set<string>()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    nodeDepth[nodeId] = Math.max(nodeDepth[nodeId] || 0, depth);
    if (!layers[depth]) layers[depth] = [];

    const node = nodes.find((n) => n.id === nodeId);
    if (node && !layers[depth].includes(node)) {
      layers[depth].push(node);
    }
  };

  const rootNodes = nodes.filter((node) => !hasIncoming.has(node.id));
  rootNodes.forEach((node) => assignDepth(node.id, 0));

  nodes.forEach((node) => {
    const depth = nodeDepth[node.id] || 0;
    node.connections?.forEach((targetId) => {
      assignDepth(targetId, depth + 1);
    });
  });

  const positions: Record<string, { x: number; y: number }> = {};
  const containerWidth = 1200;

  Object.entries(layers).forEach(([depth, layerNodes]) => {
    const d = Number.parseInt(depth);
    const totalWidth = layerNodes.length * NODE_WIDTH;
    const startX = (containerWidth - totalWidth) / 2 + NODE_WIDTH / 2;

    layerNodes.forEach((node, index) => {
      positions[node.id] = {
        x: startX + index * NODE_WIDTH,
        y: d * LAYER_HEIGHT + 50,
      };
    });
  });

  return positions;
}

export function AgentNetworkGraph({ nodes }: NetworkGraphConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Group nodes by layer
  const layers: Record<number, AgentNode[]> = {};
  const nodeDepth: Record<string, number> = {};

  const hasIncoming = new Set<string>();
  nodes.forEach((node) => {
    node.connections?.forEach((connId) => hasIncoming.add(connId));
  });

  const assignDepth = (nodeId: string, depth: number, visited = new Set<string>()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    nodeDepth[nodeId] = Math.max(nodeDepth[nodeId] || 0, depth);
    if (!layers[depth]) layers[depth] = [];

    const node = nodes.find((n) => n.id === nodeId);
    if (node && !layers[depth].includes(node)) {
      layers[depth].push(node);
    }
  };

  const rootNodes = nodes.filter((node) => !hasIncoming.has(node.id));
  rootNodes.forEach((node) => assignDepth(node.id, 0));

  nodes.forEach((node) => {
    const depth = nodeDepth[node.id] || 0;
    node.connections?.forEach((targetId) => {
      assignDepth(targetId, depth + 1);
    });
  });

  // Calculate positions after render
  useEffect(() => {
    if (!containerRef.current) return;

    const positions: Record<string, { x: number; y: number }> = {};
    const cards = containerRef.current.querySelectorAll("[data-node-id]");

    cards.forEach((card) => {
      const nodeId = card.getAttribute("data-node-id");
      if (!nodeId) return;

      const rect = card.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      positions[nodeId] = {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    });

    setNodePositions(positions);
  }, [nodes]);

  // Calculate connections
  const connections: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];

  nodes.forEach((node) => {
    if (node.connections && nodePositions[node.id]) {
      node.connections.forEach((targetId) => {
        if (nodePositions[targetId]) {
          connections.push({
            from: {
              x: nodePositions[node.id].x,
              y: nodePositions[node.id].y + 90, // Bottom of card
            },
            to: {
              x: nodePositions[targetId].x,
              y: nodePositions[targetId].y - 90, // Top of card
            },
          });
        }
      });
    }
  });

  const sortedLayers = Object.entries(layers).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div ref={containerRef} className="relative w-full p-8">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {connections.map((conn, index) => {
          const midY = (conn.from.y + conn.to.y) / 2;
          const path = `M ${conn.from.x} ${conn.from.y} C ${conn.from.x} ${midY}, ${conn.to.x} ${midY}, ${conn.to.x} ${conn.to.y}`;

          return (
            <path
              key={index}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-indigo-400/40"
              style={{ opacity: 0.6 }}
            />
          );
        })}
      </svg>

      {/* Flexbox layout for nodes */}
      <div className="flex flex-col gap-16 items-center relative z-10">
        {sortedLayers.map(([depth, layerNodes]) => (
          <div key={depth} className="flex flex-row gap-8 justify-center items-start w-full">
            {layerNodes.map((node) => {
              const variant = node.variant || "secondary";

              return (
                <div key={node.id} data-node-id={node.id} className="flex-shrink-0">
                  <Card className={cn("w-56 p-4 shadow-lg border-2 transition-all hover:shadow-xl hover:scale-105", VARIANT_STYLES[variant])}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {node.icon && <div className="text-2xl flex-shrink-0">{node.icon}</div>}
                        <div className={cn("w-2.5 h-2.5 rounded-full", STATUS_COLORS[node.status])} />
                      </div>
                    </div>

                    <h3 className="font-sans font-bold text-base mb-1 text-balance">{node.title}</h3>
                    {node.subtitle && <p className="text-xs opacity-80 italic mb-2">{node.subtitle}</p>}
                    {node.description && <p className="text-xs opacity-90 mb-3 leading-relaxed">{node.description}</p>}

                    {node.customContent && <div className="mb-3">{node.customContent}</div>}

                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          variant === "primary" || variant === "accent"
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-slate-800/10 text-slate-900 hover:bg-slate-800/20"
                        )}
                      >
                        {STATUS_LABELS[node.status]}
                      </Badge>

                      {node.progress !== undefined && (
                        <div className="space-y-1">
                          <ProgressBar progress={node.progress} className="h-1.5 bg-white/20" />
                          <p className="text-xs opacity-75">{node.progress}% Complete</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
