import React from 'react';
import { CanvasElement, ElementType } from '../types';

interface CanvasElementViewProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
}

const CanvasElementView: React.FC<CanvasElementViewProps> = ({ element, isSelected, zoom }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
    opacity: element.opacity,
    boxSizing: 'border-box',
    cursor: 'move',
  };

  const renderContent = () => {
    switch (element.type) {
      case ElementType.RECTANGLE:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.backgroundColor,
              borderRadius: `${element.borderRadius}px`,
            }}
          />
        );
      
      case ElementType.TEXT:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              color: element.color,
              fontSize: `${element.fontSize}px`,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              textAlign: element.textAlign,
              backgroundColor: element.backgroundColor, // Often transparent
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
              padding: '4px',
            }}
          >
            {element.content || 'Double click to edit text'}
          </div>
        );

      case ElementType.IMAGE:
        return (
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: element.src ? 'transparent' : '#2d2d35',
              borderRadius: `${element.borderRadius}px`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {element.src ? (
              <img 
                src={element.src} 
                alt="Canvas content" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.objectFit || 'cover',
                  pointerEvents: 'none', // Allow clicks to pass to container
                }} 
              />
            ) : (
              <div className="text-gray-500 text-xs text-center p-2">
                Image Frame
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="group"
      style={baseStyle}
      data-id={element.id}
    >
      {renderContent()}
      
      {/* Selection Border & Handles */}
      {isSelected && (
        <div className="absolute inset-0 border border-blue-500 pointer-events-none">
          {/* Resize Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 pointer-events-auto cursor-nwse-resize" data-handle="nw" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 pointer-events-auto cursor-nesw-resize" data-handle="ne" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 pointer-events-auto cursor-nesw-resize" data-handle="sw" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 pointer-events-auto cursor-nwse-resize" data-handle="se" />
        </div>
      )}
      
      {/* Hover outline for unselected */}
      {!isSelected && (
        <div className="absolute inset-0 border border-transparent group-hover:border-blue-300/50 pointer-events-none transition-colors" />
      )}
    </div>
  );
};

export default CanvasElementView;