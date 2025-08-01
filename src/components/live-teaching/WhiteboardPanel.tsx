'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Pen,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  StickyNote,
  Image,
  Undo,
  Redo,
  Trash2,
  Minus,
  Plus,
  MousePointer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/socket-context';

import type { Whiteboard, WhiteboardElement } from '@/lib/types/live-teaching';
import {
  useGetWhiteboardsQuery,
  useCreateWhiteboardMutation,
  useUpdateWhiteboardMutation,
  useCreateWhiteboardElementMutation,
  useUpdateWhiteboardElementMutation,
  useDeleteWhiteboardElementMutation,
} from '@/lib/redux/api/live-teaching-api';

interface WhiteboardPanelProps {
  sessionId: string;
  onClose: () => void;
}

type Tool =
  | 'select'
  | 'pen'
  | 'eraser'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'text'
  | 'sticky_note'
  | 'image';

interface DrawingState {
  tool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  isDrawing: boolean;
  currentElement: Partial<WhiteboardElement> | null;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
}

const COLORS = [
  '#000000',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ffffff',
  '#808080',
  '#800000',
  '#008000',
  '#000080',
  '#808000',
  '#800080',
  '#008080',
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16];

export function WhiteboardPanel({ sessionId, onClose }: WhiteboardPanelProps) {
  const { toast } = useToast();
  const socket = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: whiteboards = [], refetch: refetchWhiteboards } =
    useGetWhiteboardsQuery({
      sessionId,
    });
  const [createWhiteboard] = useCreateWhiteboardMutation();
  const [updateWhiteboard] = useUpdateWhiteboardMutation();
  const [createElement] = useCreateWhiteboardElementMutation();
  const [updateElement] = useUpdateWhiteboardElementMutation();
  const [deleteElement] = useDeleteWhiteboardElementMutation();

  // State
  const [activeWhiteboard, setActiveWhiteboard] = useState<Whiteboard | null>(
    null
  );
  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: 'pen',
    color: '#000000',
    strokeWidth: 2,
    fontSize: 16,
    isDrawing: false,
    currentElement: null,
  });
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
  });
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize whiteboard
  useEffect(() => {
    if (whiteboards.length > 0 && !activeWhiteboard) {
      setActiveWhiteboard(whiteboards[0]);
    }
  }, [whiteboards, activeWhiteboard]);

  // Create new whiteboard
  const handleCreateWhiteboard = useCallback(async () => {
    try {
      const result = await createWhiteboard({
        sessionId,
        title: `Whiteboard ${whiteboards.length + 1}`,
        width: 1920,
        height: 1080,
      }).unwrap();

      setActiveWhiteboard(result);
      refetchWhiteboards();

      toast({
        title: 'Whiteboard Created',
        description: 'New whiteboard has been created.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create whiteboard.',
        variant: 'destructive',
      });
    }
  }, [
    sessionId,
    whiteboards.length,
    createWhiteboard,
    refetchWhiteboards,
    toast,
  ]);

  // Canvas drawing handlers
  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewState.panX) / viewState.zoom;
      const y = (e.clientY - rect.top - viewState.panY) / viewState.zoom;

      return { x, y };
    },
    [viewState]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!activeWhiteboard) return;

      const { x, y } = getCanvasCoordinates(e);

      if (drawingState.tool === 'select') {
        setViewState(prev => ({ ...prev, isPanning: true }));
        return;
      }

      setDrawingState(prev => ({ ...prev, isDrawing: true }));

      const newElement: Partial<WhiteboardElement> = {
        type: drawingState.tool as WhiteboardElement['type'],
        x,
        y,
        data: {},
        style: {
          strokeColor: drawingState.color,
          strokeWidth: drawingState.strokeWidth,
          opacity: 1,
          fontSize: drawingState.fontSize,
        },
      };

      if (drawingState.tool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          newElement.data = { text };
        } else {
          return;
        }
      }

      if (drawingState.tool === 'sticky_note') {
        const text = prompt('Enter note text:');
        if (text) {
          newElement.data = { text };
          newElement.width = 200;
          newElement.height = 150;
        } else {
          return;
        }
      }

      setDrawingState(prev => ({ ...prev, currentElement: newElement }));
    },
    [activeWhiteboard, drawingState, getCanvasCoordinates]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!activeWhiteboard) return;

      const { x, y } = getCanvasCoordinates(e);

      if (viewState.isPanning) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;
        setViewState(prev => ({
          ...prev,
          panX: prev.panX + deltaX,
          panY: prev.panY + deltaY,
        }));
        return;
      }

      if (!drawingState.isDrawing || !drawingState.currentElement) return;

      const updatedElement = { ...drawingState.currentElement };

      switch (drawingState.tool) {
        case 'pen':
        case 'eraser':
          if (!updatedElement!.data!.points) {
            updatedElement!.data!.points = [
              { x: updatedElement!.x!, y: updatedElement!.y! },
            ];
          }
          updatedElement!.data!.points.push({ x, y });
          break;

        case 'line':
        case 'arrow':
          updatedElement!.data!.endX = x;
          updatedElement!.data!.endY = y;
          break;

        case 'rectangle':
        case 'circle':
          updatedElement.width = Math.abs(x - updatedElement.x!);
          updatedElement.height = Math.abs(y - updatedElement.y!);
          if (x < updatedElement.x!) {
            updatedElement.x = x;
          }
          if (y < updatedElement.y!) {
            updatedElement.y = y;
          }
          break;
      }

      setDrawingState(prev => ({ ...prev, currentElement: updatedElement }));
      redrawCanvas();
    },
    [activeWhiteboard, drawingState, viewState.isPanning, getCanvasCoordinates]
  );

  const handleMouseUp = useCallback(async () => {
    if (viewState.isPanning) {
      setViewState(prev => ({ ...prev, isPanning: false }));
      return;
    }

    if (
      !drawingState.isDrawing ||
      !drawingState.currentElement ||
      !activeWhiteboard
    )
      return;

    try {
      await createElement({
        whiteboardId: activeWhiteboard.id,
        element: drawingState.currentElement,
      }).unwrap();

      // Emit socket event for real-time collaboration
      socket?.emit('whiteboard:element_add', {
        whiteboardId: activeWhiteboard.id,
        element: drawingState.currentElement,
      });

      setDrawingState(prev => ({
        ...prev,
        isDrawing: false,
        currentElement: null,
      }));

      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([
        ...activeWhiteboard.elements,
        drawingState.currentElement as WhiteboardElement,
      ]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      refetchWhiteboards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create element.',
        variant: 'destructive',
      });
    }
  }, [
    viewState.isPanning,
    drawingState,
    activeWhiteboard,
    createElement,
    socket,
    history,
    historyIndex,
    refetchWhiteboards,
    toast,
  ]);

  // Canvas rendering
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !activeWhiteboard) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(viewState.zoom, viewState.zoom);
    ctx.translate(
      viewState.panX / viewState.zoom,
      viewState.panY / viewState.zoom
    );

    // Draw background
    ctx.fillStyle = activeWhiteboard.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, activeWhiteboard.width, activeWhiteboard.height);

    // Draw existing elements
    activeWhiteboard.elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current element being drawn
    if (drawingState.currentElement) {
      drawElement(ctx, drawingState.currentElement as WhiteboardElement);
    }

    ctx.restore();
  }, [activeWhiteboard, viewState, drawingState.currentElement]);

  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
      ctx.save();
      ctx.strokeStyle = element.style.strokeColor;
      ctx.lineWidth = element.style.strokeWidth;
      ctx.globalAlpha = element.style.opacity;

      if (element.style.fillColor) {
        ctx.fillStyle = element.style.fillColor;
      }

      switch (element.type) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.data.endX, element.data.endY);
          ctx.stroke();
          break;

        case 'rectangle':
          ctx.strokeRect(element.x, element.y, element.width!, element.height!);
          if (element.style.fillColor) {
            ctx.fillRect(element.x, element.y, element.width!, element.height!);
          }
          break;

        case 'circle':
          const radiusX = element.width! / 2;
          const radiusY = element.height! / 2;
          ctx.beginPath();
          ctx.ellipse(
            element.x + radiusX,
            element.y + radiusY,
            radiusX,
            radiusY,
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          if (element.style.fillColor) {
            ctx.fill();
          }
          break;

        case 'freehand':
          if (element.data.points && element.data.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.data.points[0].x, element.data.points[0].y);
            for (let i = 1; i < element.data.points.length; i++) {
              ctx.lineTo(element.data.points[i].x, element.data.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'arrow':
          // Draw line
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.data.endX, element.data.endY);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(
            element.data.endY - element.y,
            element.data.endX - element.x
          );
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;

          ctx.beginPath();
          ctx.moveTo(element.data.endX, element.data.endY);
          ctx.lineTo(
            element.data.endX - arrowLength * Math.cos(angle - arrowAngle),
            element.data.endY - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(element.data.endX, element.data.endY);
          ctx.lineTo(
            element.data.endX - arrowLength * Math.cos(angle + arrowAngle),
            element.data.endY - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
          break;

        case 'text':
          ctx.font = `${element.style.fontSize}px ${element.style.fontFamily || 'Arial'}`;
          ctx.fillStyle = element.style.strokeColor;
          ctx.fillText(element.data.text, element.x, element.y);
          break;

        case 'sticky_note':
          // Draw note background
          ctx.fillStyle = '#fff9c4';
          ctx.fillRect(element.x, element.y, element.width!, element.height!);
          ctx.strokeRect(element.x, element.y, element.width!, element.height!);

          // Draw text
          ctx.fillStyle = '#000000';
          ctx.font = `${element.style.fontSize || 14}px Arial`;
          const lines = element.data.text.split('\n');
          lines.forEach((line: string, index: number) => {
            ctx.fillText(line, element.x + 10, element.y + 25 + index * 20);
          });
          break;
      }

      ctx.restore();
    },
    []
  );

  // Zoom và pan controls
  const handleZoom = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom + delta)),
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewState({
      zoom: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
    });
  }, []);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Apply history state
      redrawCanvas();
    }
  }, [historyIndex, redrawCanvas]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Apply history state
      redrawCanvas();
    }
  }, [historyIndex, history.length, redrawCanvas]);

  // Clear whiteboard
  const handleClear = useCallback(async () => {
    if (!activeWhiteboard) return;

    try {
      // Delete all elements
      for (const element of activeWhiteboard.elements) {
        await deleteElement(element.id);
      }

      socket?.emit('whiteboard:clear', {
        whiteboardId: activeWhiteboard.id,
      });

      refetchWhiteboards();

      toast({
        title: 'Whiteboard Cleared',
        description: 'All elements have been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear whiteboard.',
        variant: 'destructive',
      });
    }
  }, [activeWhiteboard, deleteElement, socket, refetchWhiteboards, toast]);

  // Socket event listeners for real-time collaboration
  useEffect(() => {
    if (!socket || !activeWhiteboard) return;

    const handleElementAdd = (data: {
      whiteboardId: string;
      element: WhiteboardElement;
    }) => {
      if (data.whiteboardId === activeWhiteboard.id) {
        refetchWhiteboards();
      }
    };

    const handleElementUpdate = (data: {
      whiteboardId: string;
      elementId: string;
      data: Partial<WhiteboardElement>;
    }) => {
      if (data.whiteboardId === activeWhiteboard.id) {
        refetchWhiteboards();
      }
    };

    const handleElementDelete = (data: {
      whiteboardId: string;
      elementId: string;
    }) => {
      if (data.whiteboardId === activeWhiteboard.id) {
        refetchWhiteboards();
      }
    };

    const handleClear = (data: { whiteboardId: string }) => {
      if (data.whiteboardId === activeWhiteboard.id) {
        refetchWhiteboards();
      }
    };

    socket.on('whiteboard:element_add', handleElementAdd);
    socket.on('whiteboard:element_update', handleElementUpdate);
    socket.on('whiteboard:element_delete', handleElementDelete);
    socket.on('whiteboard:clear', handleClear);

    return () => {
      socket.off('whiteboard:element_add', handleElementAdd);
      socket.off('whiteboard:element_update', handleElementUpdate);
      socket.off('whiteboard:element_delete', handleElementDelete);
      socket.off('whiteboard:clear', handleClear);
    };
  }, [socket, activeWhiteboard, refetchWhiteboards]);

  // Redraw canvas when whiteboard or view changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas, activeWhiteboard, viewState]);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Whiteboard</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2">
        <div className="mb-3 grid grid-cols-4 gap-2">
          {/* Selection Tool */}
          <Button
            variant={drawingState.tool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'select' }))
            }
          >
            <MousePointer className="h-4 w-4" />
          </Button>

          {/* Drawing Tools */}
          <Button
            variant={drawingState.tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingState(prev => ({ ...prev, tool: 'pen' }))}
          >
            <Pen className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'eraser' }))
            }
          >
            <Eraser className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingState(prev => ({ ...prev, tool: 'line' }))}
          >
            <Minus className="h-4 w-4" />
          </Button>

          {/* Shape Tools */}
          <Button
            variant={drawingState.tool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'rectangle' }))
            }
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'circle' }))
            }
          >
            <Circle className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'arrow' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'arrow' }))
            }
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingState(prev => ({ ...prev, tool: 'text' }))}
          >
            <Type className="h-4 w-4" />
          </Button>

          {/* Additional Tools */}
          <Button
            variant={
              drawingState.tool === 'sticky_note' ? 'default' : 'outline'
            }
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'sticky_note' }))
            }
          >
            <StickyNote className="h-4 w-4" />
          </Button>

          <Button
            variant={drawingState.tool === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setDrawingState(prev => ({ ...prev, tool: 'image' }))
            }
          >
            <Image className="h-4 w-4" />
          </Button>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Style Controls */}
        <div className="mb-3 flex items-center gap-3">
          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <div
                  className="h-4 w-4 rounded border"
                  style={{ backgroundColor: drawingState.color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={cn(
                      'h-6 w-6 rounded border-2',
                      drawingState.color === color
                        ? 'border-white'
                        : 'border-gray-400'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setDrawingState(prev => ({ ...prev, color }))
                    }
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-400">Size:</Label>
            <Select
              value={drawingState.strokeWidth.toString()}
              onValueChange={value =>
                setDrawingState(prev => ({
                  ...prev,
                  strokeWidth: parseInt(value),
                }))
              }
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STROKE_WIDTHS.map(width => (
                  <SelectItem key={width} value={width.toString()}>
                    {width}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
            <Minus className="h-3 w-3" />
          </Button>

          <span className="min-w-[50px] text-center text-xs text-gray-400">
            {Math.round(viewState.zoom * 100)}%
          </span>

          <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
            <Plus className="h-3 w-3" />
          </Button>

          <Button variant="outline" size="sm" onClick={resetView}>
            Reset
          </Button>

          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Whiteboard Tabs */}
      {whiteboards.length > 1 && (
        <div className="border-b border-gray-700 p-2">
          <div className="flex gap-1 overflow-x-auto">
            {whiteboards.map(whiteboard => (
              <Button
                key={whiteboard.id}
                variant={
                  activeWhiteboard?.id === whiteboard.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setActiveWhiteboard(whiteboard)}
                className="flex-shrink-0"
              >
                {whiteboard.title}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateWhiteboard}
              className="flex-shrink-0"
            >
              <Plus className="mr-1 h-3 w-3" />
              New
            </Button>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="relative flex-1 overflow-hidden" ref={containerRef}>
        {activeWhiteboard ? (
          <canvas
            ref={canvasRef}
            width={activeWhiteboard.width}
            height={activeWhiteboard.height}
            className="absolute left-0 top-0 cursor-crosshair"
            style={{
              transform: `scale(${viewState.zoom}) translate(${viewState.panX}px, ${viewState.panY}px)`,
              transformOrigin: 'top left',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-gray-400">No whiteboard available</p>
              <Button onClick={handleCreateWhiteboard}>
                Create Whiteboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-700 p-2 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Tool: {drawingState.tool} | Zoom: {Math.round(viewState.zoom * 100)}
            %
          </span>
          <span>{activeWhiteboard?.elements.length || 0} elements</span>
        </div>
      </div>
    </div>
  );
}
