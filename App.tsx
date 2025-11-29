import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Since I cannot import uuid directly in this environment often, I will use a simple utility function instead.
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import CanvasElementView from './components/CanvasElementView';
import { ToolType, ElementType, CanvasElement, DragState } from './types';
import * as GeminiService from './services/geminiService';

// Simple ID generator to avoid external dep for this example
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SELECT);
  const [zoom, setZoom] = useState(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find(el => el.id === selectedId) || null;

  // --- Helpers ---
  const getMousePos = (e: React.PointerEvent | PointerEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  // --- Event Handlers ---

  const handlePointerDown = (e: React.PointerEvent) => {
    const pos = getMousePos(e);
    const target = e.target as HTMLElement;
    const elementId = target.closest('[data-id]')?.getAttribute('data-id');
    const resizeHandle = target.getAttribute('data-handle');

    // 1. Creation Mode (if a drawing tool is active and we didn't click an existing element/handle)
    if (activeTool !== ToolType.SELECT && !elementId && !resizeHandle) {
      const newId = generateId();
      let newType = ElementType.RECTANGLE;
      let defaultContent = '';
      let defaultBg = '#3f3f46'; // gray-700
      let defaultColor = '#ffffff';

      if (activeTool === ToolType.TEXT) {
        newType = ElementType.TEXT;
        defaultBg = 'transparent';
        defaultContent = 'Double click to edit';
        defaultColor = '#000000'; // Default black text for visibility
      } else if (activeTool === ToolType.IMAGE) {
        newType = ElementType.IMAGE;
        defaultBg = '#27272a'; // gray-800
      }

      const newElement: CanvasElement = {
        id: newId,
        type: newType,
        x: pos.x,
        y: pos.y,
        width: 1, // Start small, drag to resize
        height: 1,
        rotation: 0,
        zIndex: elements.length + 1,
        backgroundColor: defaultBg,
        opacity: 1,
        borderRadius: 0,
        content: defaultContent,
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400',
        color: activeTool === ToolType.TEXT ? '#ffffff' : defaultColor,
        textAlign: 'left',
        objectFit: 'cover'
      };

      setElements([...elements, newElement]);
      setSelectedId(newId);
      
      // Initialize drag state for immediate resizing upon creation
      setDragState({
        isDragging: false,
        isResizing: true,
        resizeHandle: 'se', // Simulate dragging bottom-right
        startX: pos.x,
        startY: pos.y,
        initialX: pos.x,
        initialY: pos.y,
        initialWidth: 0,
        initialHeight: 0
      });
      return;
    }

    // 2. Selection Mode logic
    if (elementId) {
      setSelectedId(elementId);
      const el = elements.find(e => e.id === elementId);
      if (!el) return;

      // Check if clicking a resize handle
      if (resizeHandle) {
        setDragState({
          isDragging: false,
          isResizing: true,
          resizeHandle,
          startX: pos.x,
          startY: pos.y,
          initialX: el.x,
          initialY: el.y,
          initialWidth: el.width,
          initialHeight: el.height
        });
      } else {
        // Dragging the element itself
        setDragState({
          isDragging: true,
          isResizing: false,
          resizeHandle: null,
          startX: pos.x,
          startY: pos.y,
          initialX: el.x,
          initialY: el.y,
          initialWidth: el.width,
          initialHeight: el.height
        });
      }
    } else {
      // Clicked on empty canvas -> deselect
      setSelectedId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !selectedId) return;

    const pos = getMousePos(e);
    const deltaX = pos.x - dragState.startX;
    const deltaY = pos.y - dragState.startY;

    setElements(prev => prev.map(el => {
      if (el.id !== selectedId) return el;

      if (dragState.isDragging) {
        return {
          ...el,
          x: dragState.initialX + deltaX,
          y: dragState.initialY + deltaY
        };
      }

      if (dragState.isResizing && dragState.resizeHandle) {
        let newX = el.x;
        let newY = el.y;
        let newW = el.width;
        let newH = el.height;

        // Simple handle logic (supports standard resizing)
        switch (dragState.resizeHandle) {
          case 'se':
            newW = dragState.initialWidth + deltaX;
            newH = dragState.initialHeight + deltaY;
            break;
          case 'sw':
            newX = dragState.initialX + deltaX;
            newW = dragState.initialWidth - deltaX;
            newH = dragState.initialHeight + deltaY;
            break;
          case 'ne':
            newY = dragState.initialY + deltaY;
            newW = dragState.initialWidth + deltaX;
            newH = dragState.initialHeight - deltaY;
            break;
          case 'nw':
            newX = dragState.initialX + deltaX;
            newY = dragState.initialY + deltaY;
            newW = dragState.initialWidth - deltaX;
            newH = dragState.initialHeight - deltaY;
            break;
        }

        // Prevent negative dimensions
        if (newW < 10) newW = 10;
        if (newH < 10) newH = 10;

        return {
            ...el,
            x: newX,
            y: newY,
            width: newW,
            height: newH
        };
      }
      return el;
    }));
  };

  const handlePointerUp = () => {
    if (dragState) {
        // If we just finished creating a shape with negligible size, give it a default size
        if (selectedId && activeTool !== ToolType.SELECT && (dragState.isResizing)) {
             setElements(prev => prev.map(el => {
                if (el.id !== selectedId) return el;
                if (el.width < 5 || el.height < 5) {
                    return { ...el, width: 100, height: 100 };
                }
                return el;
            }));
            // Switch back to select tool after creation
            setActiveTool(ToolType.SELECT);
        }
        setDragState(null);
    }
  };

  const handleUpdateElement = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const handleDeleteElement = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteElement();
      }
      if (e.key.toLowerCase() === 'v') setActiveTool(ToolType.SELECT);
      if (e.key.toLowerCase() === 'r') setActiveTool(ToolType.RECTANGLE);
      if (e.key.toLowerCase() === 't') setActiveTool(ToolType.TEXT);
      if (e.key.toLowerCase() === 'i') setActiveTool(ToolType.IMAGE);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <div className="flex h-full w-full bg-gray-900 text-white overflow-hidden">
      
      {/* Sidebar Toolbar */}
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col min-w-0">
        
        {/* Top Info Bar */}
        <div className="h-10 bg-gray-850 border-b border-gray-750 flex items-center px-4 justify-between">
            <span className="text-xs font-medium text-gray-400">DesignMate - Untitled-1</span>
            <div className="flex gap-2">
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Zoom: {Math.round(zoom * 100)}%</span>
            </div>
        </div>

        {/* Canvas Scroll Wrapper */}
        <div className="flex-1 bg-gray-900 overflow-hidden relative touch-none cursor-crosshair">
          {/* The actual canvas board */}
          <div 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
             {/* Render Grid/Background effect if needed */}
             <div className="absolute inset-0 pointer-events-none opacity-5" 
                  style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>

             {elements.map(el => (
               <CanvasElementView 
                 key={el.id} 
                 element={el} 
                 isSelected={selectedId === el.id} 
                 zoom={zoom}
               />
             ))}
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      <PropertiesPanel 
        element={selectedElement} 
        onChange={handleUpdateElement}
        onDelete={handleDeleteElement}
      />

    </div>
  );
};

export default App;