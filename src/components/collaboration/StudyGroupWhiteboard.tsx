'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Image,
  StickyNote,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Share2,
  Users,
  Eye,
  Lock,
  Unlock,
  Palette,
  MousePointer,
  Move,
  Download,
  Upload,
  Grid,
  Settings,
  Trash2,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

interface WhiteboardElement {
  id: string;
  type:
    | 'rectangle'
    | 'circle'
    | 'line'
    | 'text'
    | 'image'
    | 'sticky_note'
    | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  isLocked: boolean;
  data: any; // Type-specific data
}

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  cursor: { x: number; y: number };
  color: string;
  tool: string;
}

interface StudyGroupWhiteboardProps {
  groupId: string;
  canEdit: boolean;
}

export function StudyGroupWhiteboard({
  groupId,
  canEdit,
}: StudyGroupWhiteboardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<
    'pen' | 'eraser' | 'select' | 'rectangle' | 'circle' | 'text' | 'sticky'
  >('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedElement, setSelectedElement] =
    useState<WhiteboardElement | null>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Whiteboard settings
  const [whiteboardSettings, setWhiteboardSettings] = useState({
    name: '',
    backgroundColor: '#ffffff',
    canvasWidth: 1920,
    canvasHeight: 1080,
    isLocked: false,
    defaultPermission: 'write' as 'read' | 'write',
  });

  // RTK Query hooks
  const { data: whiteboards, isLoading } =
    collaborativeApi.useGetSharedWhiteboardsQuery({
      studyGroupId: groupId,
    });
  const [currentWhiteboard, setCurrentWhiteboard] = useState<string | null>(
    null
  );
  const { data: whiteboardData } = collaborativeApi.useGetWhiteboardByIdQuery(
    currentWhiteboard || '',
    { skip: !currentWhiteboard }
  );

  const [createWhiteboard] =
    collaborativeApi.useCreateSharedWhiteboardMutation();
  const [updateWhiteboard] =
    collaborativeApi.useUpdateSharedWhiteboardMutation();
  const [createElement] = collaborativeApi.useCreateWhiteboardElementMutation();
  const [updateElement] = collaborativeApi.useUpdateWhiteboardElementMutation();
  const [deleteElement] = collaborativeApi.useDeleteWhiteboardElementMutation();

  // Load whiteboard data
  useEffect(() => {
    if (whiteboardData) {
      setElements(
        (whiteboardData.elements || []).map(el => ({
          ...el,
          data: el.elementData, // Thêm field `data` dựa vào `elementData`
        }))
      );
      setWhiteboardSettings({
        name: whiteboardData.name,
        backgroundColor: whiteboardData.backgroundColor,
        canvasWidth: whiteboardData.canvasWidth,
        canvasHeight: whiteboardData.canvasHeight,
        isLocked: whiteboardData.isLocked,
        defaultPermission: whiteboardData.defaultPermission,
      });
    }
  }, [whiteboardData]);

  // Drawing functions
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canEdit || whiteboardSettings.isLocked) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      setIsDrawing(true);

      if (selectedTool === 'pen') {
        // Start a new stroke
        const newElement: WhiteboardElement = {
          id: `element_${Date.now()}`,
          type: 'line',
          x: x,
          y: y,
          width: 0,
          height: 0,
          rotation: 0,
          zIndex: elements.length,
          color: selectedColor,
          strokeWidth: strokeWidth,
          opacity: 1,
          isLocked: false,
          data: { points: [{ x, y }] },
        };
        setElements(prev => [...prev, newElement]);
      }
    },
    [
      canEdit,
      whiteboardSettings.isLocked,
      selectedTool,
      selectedColor,
      strokeWidth,
      elements.length,
    ]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canEdit) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      if (selectedTool === 'pen') {
        setElements(prev => {
          const newElements = [...prev];
          const lastElement = newElements[newElements.length - 1];
          if (lastElement && lastElement.type === 'line') {
            lastElement.data.points.push({ x, y });
          }
          return newElements;
        });
      }
    },
    [isDrawing, canEdit, selectedTool]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save to history for undo/redo
      saveToHistory();

      // Sync with backend if needed
      if (currentWhiteboard && elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        createElement({
          whiteboardId: currentWhiteboard,
          element: lastElement,
        });
      }
    }
  }, [isDrawing, currentWhiteboard, elements, createElement]);

  // History management
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, elements]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = whiteboardSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw active users cursors
    activeUsers.forEach(user => {
      if (user.id !== user?.id) {
        drawUserCursor(ctx, user);
      }
    });
  }, [elements, whiteboardSettings.backgroundColor, showGrid, activeUsers]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const gridSize = 20 * (zoom / 100);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ) => {
    ctx.save();

    // Apply transformations
    ctx.globalAlpha = element.opacity;
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.strokeWidth;

    if (element.rotation !== 0) {
      ctx.translate(
        element.x + element.width / 2,
        element.y + element.height / 2
      );
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(
        -(element.x + element.width / 2),
        -(element.y + element.height / 2)
      );
    }

    switch (element.type) {
      case 'line':
        if (element.data.points && element.data.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.data.points[0].x, element.data.points[0].y);
          element.data.points.slice(1).forEach((point: any) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'rectangle':
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.min(element.width, element.height) / 2,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${element.data.fontSize || 16}px ${element.data.fontFamily || 'Arial'}`;
        ctx.fillText(element.data.text || '', element.x, element.y);
        break;

      case 'sticky_note':
        // Draw sticky note background
        ctx.fillStyle = element.data.backgroundColor || '#ffeb3b';
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Draw text
        ctx.fillStyle = element.color;
        ctx.font = `${element.data.fontSize || 14}px Arial`;
        const lines = (element.data.text || '').split('\n');
        lines.forEach((line: string, index: number) => {
          ctx.fillText(line, element.x + 8, element.y + 20 + index * 18);
        });
        break;
    }

    // Draw selection indicator
    if (selectedElement?.id === element.id) {
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        element.x - 5,
        element.y - 5,
        element.width + 10,
        element.height + 10
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawUserCursor = (ctx: CanvasRenderingContext2D, user: ActiveUser) => {
    ctx.save();
    ctx.fillStyle = user.color;

    // Draw cursor
    ctx.beginPath();
    ctx.moveTo(user.cursor.x, user.cursor.y);
    ctx.lineTo(user.cursor.x + 12, user.cursor.y + 4);
    ctx.lineTo(user.cursor.x + 4, user.cursor.y + 12);
    ctx.closePath();
    ctx.fill();

    // Draw username
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(user.name, user.cursor.x + 15, user.cursor.y + 15);

    ctx.restore();
  };

  const handleCreateWhiteboard = async () => {
    try {
      const result = await createWhiteboard({
        studyGroupId: groupId,
        name: whiteboardSettings.name || 'Untitled Whiteboard',
        description: '',
        canvasWidth: whiteboardSettings.canvasWidth,
        canvasHeight: whiteboardSettings.canvasHeight,
        backgroundColor: whiteboardSettings.backgroundColor,
        defaultPermission: whiteboardSettings.defaultPermission,
      }).unwrap();

      setCurrentWhiteboard(result.id);
      toast({
        title: 'Whiteboard created',
        description: 'Your shared whiteboard has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create whiteboard.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveWhiteboard = async () => {
    if (!currentWhiteboard) return;

    try {
      await updateWhiteboard({
        whiteboardId: currentWhiteboard,
        canvasData: { elements },
        version: (whiteboardData?.version || 0) + 1,
      }).unwrap();

      toast({
        title: 'Whiteboard saved',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to save whiteboard.',
        variant: 'destructive',
      });
    }
  };

  const clearCanvas = () => {
    setElements([]);
    saveToHistory();
  };

  const exportWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${whiteboardSettings.name || 'whiteboard'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colorPalette = [
    '#000000',
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ffa500',
    '#800080',
  ];

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Whiteboard</h2>
          <p className="text-gray-600">
            Collaborate visually with your study group
          </p>
        </div>

        <div className="flex gap-2">
          {currentWhiteboard ? (
            <>
              <Button variant="outline" onClick={handleSaveWhiteboard}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={exportWhiteboard}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Share2 className="mr-2 h-4 w-4" />
                  Create Whiteboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Whiteboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Whiteboard Name</Label>
                    <Input
                      value={whiteboardSettings.name}
                      onChange={e =>
                        setWhiteboardSettings(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter whiteboard name..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={whiteboardSettings.canvasWidth}
                        onChange={e =>
                          setWhiteboardSettings(prev => ({
                            ...prev,
                            canvasWidth: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={whiteboardSettings.canvasHeight}
                        onChange={e =>
                          setWhiteboardSettings(prev => ({
                            ...prev,
                            canvasHeight: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleCreateWhiteboard}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Whiteboard Selection */}
      {whiteboards && whiteboards.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label>Select Whiteboard:</Label>
              <Select
                value={currentWhiteboard || ''}
                onValueChange={setCurrentWhiteboard}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a whiteboard" />
                </SelectTrigger>
                <SelectContent>
                  {whiteboards.map(wb => (
                    <SelectItem key={wb.id} value={wb.id}>
                      {wb.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {currentWhiteboard ? (
        <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
          {/* Toolbar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tool Selection */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Drawing Tools
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool(tool.id as any)}
                      className="flex h-auto flex-col items-center gap-1 py-2"
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Color Palette */}
              <div>
                <Label className="mb-2 block text-sm font-medium">Colors</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded border-2 ${
                        selectedColor === color
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="mt-2 h-8"
                />
              </div>

              <Separator />

              {/* Stroke Width */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Stroke Width: {strokeWidth}px
                </Label>
                <Slider
                  value={[strokeWidth]}
                  onValueChange={value => setStrokeWidth(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="w-full"
                >
                  <Undo className="mr-2 h-4 w-4" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="w-full"
                >
                  <Redo className="mr-2 h-4 w-4" />
                  Redo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className="w-full"
                >
                  <Grid className="mr-2 h-4 w-4" />
                  {showGrid ? 'Hide' : 'Show'} Grid
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearCanvas}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>

              <Separator />

              {/* Active Users */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Active Users ({activeUsers.length})
                </Label>
                <div className="space-y-2">
                  {activeUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <Card>
            <CardContent className="p-2">
              <div
                className="relative overflow-auto rounded border"
                style={{ height: '600px' }}
              >
                <canvas
                  ref={canvasRef}
                  width={whiteboardSettings.canvasWidth}
                  height={whiteboardSettings.canvasHeight}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(100)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="secondary">{elements.length} elements</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Share2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No whiteboard selected</h3>
            <p className="mb-4 text-gray-600">
              Create a new whiteboard or select an existing one to start
              collaborating.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
