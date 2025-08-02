'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  BookOpen,
  Target,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

import {
  useGetKnowledgeGraphQuery,
  useUpdateKnowledgeGraphMutation,
} from '@/lib/redux/api/intelligent-tutoring-api';
import { type KnowledgeGraph } from '@/lib/types/intelligent-tutoring';

interface KnowledgeGraphVisualizationProps {
  topic?: string;
  depth?: number;
  interactive?: boolean;
  showControls?: boolean;
  className?: string;
  onNodeSelect?: (nodeId: string) => void;
  onPathFound?: (path: string[]) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'skill' | 'topic' | 'prerequisite' | 'outcome';
  x: number;
  y: number;
  properties: {
    difficulty: number;
    importance: number;
    learningTime: number;
    mastery: number;
  };
  isHighlighted?: boolean;
  isSelected?: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship:
    | 'prerequisite'
    | 'leads_to'
    | 'related_to'
    | 'part_of'
    | 'enables';
  weight: number;
  isHighlighted?: boolean;
}

export function KnowledgeGraphVisualization({
  topic,
  depth = 3,
  interactive = true,
  showControls = true,
  className = '',
  onNodeSelect,
  onPathFound,
}: KnowledgeGraphVisualizationProps) {
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State management
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Visualization settings
  const [visualSettings, setVisualSettings] = useState({
    showLabels: true,
    showRelationships: true,
    nodeSize: 8,
    edgeThickness: 2,
    colorByType: true,
    showMastery: true,
    showDifficulty: false,
    animateLayout: true,
    layout: 'force' as 'force' | 'circular' | 'hierarchical',
  });

  // API hooks
  const {
    data: knowledgeGraph,
    isLoading,
    refetch,
  } = useGetKnowledgeGraphQuery({
    topic,
    depth,
  });

  const [updateKnowledgeGraph] = useUpdateKnowledgeGraphMutation();

  // Process graph data
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    if (knowledgeGraph) {
      processGraphData(knowledgeGraph);
    }
  }, [knowledgeGraph, visualSettings.layout]);

  const processGraphData = (graph: KnowledgeGraph) => {
    const processedNodes: GraphNode[] = graph.nodes.map(
      (node: any, index: any) => ({
        ...node,
        x: Math.random() * 400,
        y: Math.random() * 300,
      })
    );

    const processedEdges: GraphEdge[] = graph.edges;

    // Apply layout algorithm
    if (visualSettings.layout === 'force') {
      applyForceLayout(processedNodes, processedEdges);
    } else if (visualSettings.layout === 'circular') {
      applyCircularLayout(processedNodes);
    } else if (visualSettings.layout === 'hierarchical') {
      applyHierarchicalLayout(processedNodes, processedEdges);
    }

    setNodes(processedNodes);
    setEdges(processedEdges);
  };

  const applyForceLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
    // Simple force-directed layout simulation
    const iterations = 100;
    const repulsion = 1000;
    const attraction = 0.1;

    for (let i = 0; i < iterations; i++) {
      // Repulsion between all nodes
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const dx = nodes[j].x - nodes[k].x;
          const dy = nodes[j].y - nodes[k].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (distance * distance);

          nodes[j].x += (dx / distance) * force;
          nodes[j].y += (dy / distance) * force;
          nodes[k].x -= (dx / distance) * force;
          nodes[k].y -= (dy / distance) * force;
        }
      }

      // Attraction along edges
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = attraction * distance * edge.weight;

          sourceNode.x += (dx / distance) * force;
          sourceNode.y += (dy / distance) * force;
          targetNode.x -= (dx / distance) * force;
          targetNode.y -= (dy / distance) * force;
        }
      });
    }
  };

  const applyCircularLayout = (nodes: GraphNode[]) => {
    const radius = 150;
    const centerX = 200;
    const centerY = 150;

    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  };

  const applyHierarchicalLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
    // Group nodes by type and arrange hierarchically
    const levels: { [key: string]: number } = {
      prerequisite: 0,
      concept: 1,
      skill: 2,
      topic: 3,
      outcome: 4,
    };

    const nodesByLevel: { [key: number]: GraphNode[] } = {};

    nodes.forEach(node => {
      const level = levels[node.type] || 2;
      if (!nodesByLevel[level]) nodesByLevel[level] = [];
      nodesByLevel[level].push(node);
    });

    Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
      levelNodes.forEach((node, index) => {
        node.y = parseInt(level) * 80 + 50;
        node.x = (index + 1) * (400 / (levelNodes.length + 1));
      });
    });
  };

  const getNodeColor = (node: GraphNode) => {
    if (visualSettings.colorByType) {
      const colors = {
        concept: '#3b82f6',
        skill: '#10b981',
        topic: '#8b5cf6',
        prerequisite: '#f59e0b',
        outcome: '#ef4444',
      };
      return colors[node.type] || '#6b7280';
    }

    if (visualSettings.showMastery) {
      const mastery = node.properties.mastery;
      if (mastery >= 0.8) return '#10b981';
      if (mastery >= 0.6) return '#f59e0b';
      if (mastery >= 0.4) return '#ef4444';
      return '#6b7280';
    }

    return '#6b7280';
  };

  const getEdgeColor = (edge: GraphEdge) => {
    const colors = {
      prerequisite: '#ef4444',
      leads_to: '#3b82f6',
      related_to: '#8b5cf6',
      part_of: '#10b981',
      enables: '#f59e0b',
    };
    return colors[edge.relationship] || '#6b7280';
  };

  const handleNodeClick = (nodeId: string) => {
    if (!interactive) return;

    setSelectedNode(nodeId);

    // Highlight connected nodes and edges
    const connectedEdges = edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );

    const connectedNodeIds = new Set([
      ...connectedEdges.map(edge => edge.source),
      ...connectedEdges.map(edge => edge.target),
    ]);

    setNodes(prev =>
      prev.map(node => ({
        ...node,
        isHighlighted: connectedNodeIds.has(node.id),
        isSelected: node.id === nodeId,
      }))
    );

    setEdges(prev =>
      prev.map(edge => ({
        ...edge,
        isHighlighted: connectedEdges.some(
          ce => ce.source === edge.source && ce.target === edge.target
        ),
      }))
    );

    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  const findLearningPath = (startNode: string, endNode: string) => {
    // Simple pathfinding algorithm (BFS)
    const queue = [[startNode]];
    const visited = new Set([startNode]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const currentNode = path[path.length - 1];

      if (currentNode === endNode) {
        setHighlightedPath(path);
        if (onPathFound) {
          onPathFound(path);
        }
        return path;
      }

      const connectedEdges = edges.filter(edge => edge.source === currentNode);

      for (const edge of connectedEdges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push([...path, edge.target]);
        }
      }
    }

    return null;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setNodes(prev => prev.map(node => ({ ...node, isHighlighted: false })));
      return;
    }

    const matchingNodes = nodes.filter(node =>
      node.label.toLowerCase().includes(query.toLowerCase())
    );

    setNodes(prev =>
      prev.map(node => ({
        ...node,
        isHighlighted: matchingNodes.some(mn => mn.id === node.id),
      }))
    );
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const filteredNodes = nodes.filter(node => {
    if (filterType === 'all') return true;
    return node.type === filterType;
  });

  const filteredEdges = edges.filter(edge => {
    const sourceVisible = filteredNodes.some(n => n.id === edge.source);
    const targetVisible = filteredNodes.some(n => n.id === edge.target);
    return sourceVisible && targetVisible;
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Knowledge Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Knowledge Graph
            </CardTitle>
            <CardDescription>
              Interactive visualization of learning concepts and relationships
            </CardDescription>
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Graph Settings</DialogTitle>
                    <DialogDescription>
                      Customize the knowledge graph visualization
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Labels</Label>
                      <Switch
                        checked={visualSettings.showLabels}
                        onCheckedChange={checked =>
                          setVisualSettings(prev => ({
                            ...prev,
                            showLabels: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Relationships</Label>
                      <Switch
                        checked={visualSettings.showRelationships}
                        onCheckedChange={checked =>
                          setVisualSettings(prev => ({
                            ...prev,
                            showRelationships: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Layout Type</Label>
                      <Select
                        value={visualSettings.layout}
                        onValueChange={(value: any) =>
                          setVisualSettings(prev => ({
                            ...prev,
                            layout: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="force">Force-Directed</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="hierarchical">
                            Hierarchical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Node Size: {visualSettings.nodeSize}</Label>
                      <Slider
                        value={[visualSettings.nodeSize]}
                        onValueChange={([value]) =>
                          setVisualSettings(prev => ({
                            ...prev,
                            nodeSize: value,
                          }))
                        }
                        min={4}
                        max={16}
                        step={1}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Color by Type</Label>
                      <Switch
                        checked={visualSettings.colorByType}
                        onCheckedChange={checked =>
                          setVisualSettings(prev => ({
                            ...prev,
                            colorByType: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Mastery</Label>
                      <Switch
                        checked={visualSettings.showMastery}
                        onCheckedChange={checked =>
                          setVisualSettings(prev => ({
                            ...prev,
                            showMastery: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {showControls && (
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="min-w-[200px] flex-1">
              <Input
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="h-8"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="concept">Concepts</SelectItem>
                <SelectItem value="skill">Skills</SelectItem>
                <SelectItem value="topic">Topics</SelectItem>
                <SelectItem value="prerequisite">Prerequisites</SelectItem>
                <SelectItem value="outcome">Outcomes</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom(-0.2)}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="px-2 text-xs">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom(0.2)}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative h-96 cursor-grab overflow-hidden border-t active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 400 300"
            className="select-none"
            style={{
              transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {/* Edges */}
            <g>
              {filteredEdges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const isHighlighted =
                  edge.isHighlighted || highlightedPath.includes(edge.source);

                return (
                  <g key={index}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? '#3b82f6' : getEdgeColor(edge)}
                      strokeWidth={
                        isHighlighted ? 3 : visualSettings.edgeThickness
                      }
                      opacity={isHighlighted ? 1 : 0.6}
                      markerEnd="url(#arrowhead)"
                    />

                    {visualSettings.showRelationships && (
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2}
                        fontSize="8"
                        fill="#6b7280"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {edge.relationship.replace('_', ' ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            {/* Nodes */}
            <g>
              {filteredNodes.map(node => {
                const isHighlighted = node.isHighlighted || node.isSelected;
                const radius =
                  visualSettings.nodeSize + (isHighlighted ? 4 : 0);

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={getNodeColor(node)}
                      stroke={isHighlighted ? '#fff' : 'none'}
                      strokeWidth={isHighlighted ? 2 : 0}
                      opacity={isHighlighted ? 1 : 0.8}
                      className="cursor-pointer transition-opacity hover:opacity-100"
                      onClick={() => handleNodeClick(node.id)}
                    />

                    {/* Mastery indicator */}
                    {visualSettings.showMastery && (
                      <circle
                        cx={node.x + radius - 3}
                        cy={node.y - radius + 3}
                        r="3"
                        fill={`hsl(${node.properties.mastery * 120}, 70%, 50%)`}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                    )}

                    {/* Node labels */}
                    {visualSettings.showLabels && (
                      <text
                        x={node.x}
                        y={node.y + radius + 12}
                        fontSize="10"
                        fill="#374151"
                        textAnchor="middle"
                        className="pointer-events-none font-medium"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute left-4 top-4 rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800">
            <h4 className="mb-2 text-sm font-medium">Node Types</h4>
            <div className="space-y-1">
              {['concept', 'skill', 'topic', 'prerequisite', 'outcome'].map(
                type => (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getNodeColor({ type } as any) }}
                    />
                    <span className="capitalize">{type}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-4 top-4 w-64 rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800"
            >
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: getNodeColor(node) }}
                      />
                      <h4 className="font-medium">{node.label}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {node.type}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Difficulty</Label>
                        <Progress
                          value={node.properties.difficulty * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Importance</Label>
                        <Progress
                          value={node.properties.importance * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Mastery</Label>
                        <Progress
                          value={node.properties.mastery * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Learning Time</Label>
                        <p className="text-sm">
                          {node.properties.learningTime} hours
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Study
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="mr-1 h-3 w-3" />
                        Practice
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {/* Graph Statistics */}
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-lg font-bold">{nodes.length}</div>
              <div className="text-xs text-muted-foreground">Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{edges.length}</div>
              <div className="text-xs text-muted-foreground">Relationships</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(
                  (nodes.reduce((sum, n) => sum + n.properties.mastery, 0) /
                    nodes.length) *
                    100
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground">Avg Mastery</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(
                  nodes.reduce((sum, n) => sum + n.properties.learningTime, 0)
                )}
                h
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
