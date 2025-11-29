export enum ToolType {
  SELECT = 'SELECT',
  RECTANGLE = 'RECTANGLE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export enum ElementType {
  RECTANGLE = 'RECTANGLE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  
  // Style props
  backgroundColor: string;
  opacity: number;
  borderRadius: number;
  
  // Text specific
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Image specific
  src?: string; // base64 or url
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface GenerateContentRequest {
  prompt: string;
  type: 'text' | 'image';
  currentContent?: string;
}

export interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string | null; // 'nw', 'ne', 'sw', 'se' etc
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
}