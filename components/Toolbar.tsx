import React from 'react';
import { MousePointer2, Type, Square, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool }) => {
  const tools = [
    { type: ToolType.SELECT, icon: MousePointer2, label: 'Selection Tool (V)' },
    { type: ToolType.TEXT, icon: Type, label: 'Type Tool (T)' },
    { type: ToolType.RECTANGLE, icon: Square, label: 'Rectangle Tool (R)' },
    { type: ToolType.IMAGE, icon: ImageIcon, label: 'Image Frame (I)' },
  ];

  return (
    <div className="w-12 bg-gray-850 border-r border-gray-750 flex flex-col items-center py-4 z-20">
      <div className="mb-6 text-blue-500">
        <LayoutGrid size={24} />
      </div>
      
      <div className="flex flex-col gap-2 w-full px-1">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onSelectTool(tool.type)}
            title={tool.label}
            className={`
              p-2 rounded flex justify-center items-center transition-all duration-200
              ${activeTool === tool.type 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:bg-gray-750 hover:text-white'}
            `}
          >
            <tool.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;