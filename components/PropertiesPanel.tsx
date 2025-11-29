import React, { useState } from 'react';
import { CanvasElement, ElementType } from '../types';
import { Wand2, Type, Image as ImageIcon, Trash2, Loader2, Download } from 'lucide-react';
import * as GeminiService from '../services/geminiService';

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onChange: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onChange, onDelete }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!element) {
    return (
      <div className="w-80 bg-gray-850 border-l border-gray-750 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Properties</h2>
        <div className="text-gray-500 text-sm italic">
          Select an element on the canvas to edit its properties.
        </div>
      </div>
    );
  }

  const handleGeminiGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      if (element.type === ElementType.TEXT) {
        const text = await GeminiService.generateText(prompt, element.content);
        onChange({ content: text });
      } else if (element.type === ElementType.IMAGE) {
        const imageSrc = await GeminiService.generateImage(prompt);
        onChange({ src: imageSrc });
      }
    } catch (err: any) {
      setError("Failed to generate content. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onChange({ src: event.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 bg-gray-850 border-l border-gray-750 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-750">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {element.type} Properties
            </h2>
            <button 
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30 transition-colors"
                title="Delete Element"
            >
                <Trash2 size={16} />
            </button>
        </div>
        <div className="text-xs text-gray-500">ID: {element.id.slice(0, 8)}</div>
      </div>

      <div className="p-4 space-y-6">
        {/* Layout */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Layout</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onChange({ x: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onChange({ y: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">W</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onChange({ width: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">H</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onChange({ height: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Rotation (deg)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={element.rotation}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              className="w-full h-1 bg-gray-750 rounded-lg appearance-none cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Appearance</label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={element.opacity}
              onChange={(e) => onChange({ opacity: Number(e.target.value) })}
              className="flex-1 h-1 bg-gray-750 rounded-lg appearance-none cursor-pointer"
            />
          </div>
           <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16">Background</label>
            <input
              type="color"
              value={element.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-16">Radius</label>
            <input
              type="number"
              value={element.borderRadius}
              onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
               className="w-16 bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Text Specific */}
        {element.type === ElementType.TEXT && (
          <div className="space-y-3 border-t border-gray-750 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
              <Type size={12} /> Typography
            </label>
            <div className="grid grid-cols-2 gap-2">
                <div>
                     <label className="text-xs text-gray-500">Size</label>
                     <input
                        type="number"
                        value={element.fontSize}
                        onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                        className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Color</label>
                    <div className="flex items-center h-[28px]">
                        <input
                            type="color"
                            value={element.color}
                            onChange={(e) => onChange({ color: e.target.value })}
                             className="w-full h-full rounded cursor-pointer bg-transparent border-none"
                        />
                    </div>
                </div>
            </div>
            <select
                value={element.textAlign}
                onChange={(e) => onChange({ textAlign: e.target.value as any })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
                <option value="left">Left Align</option>
                <option value="center">Center Align</option>
                <option value="right">Right Align</option>
                <option value="justify">Justify</option>
            </select>
          </div>
        )}

        {/* Image Specific */}
        {element.type === ElementType.IMAGE && (
          <div className="space-y-3 border-t border-gray-750 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
              <ImageIcon size={12} /> Source
            </label>
            <div className="flex flex-col gap-2">
                 <label className="block text-sm text-gray-400">Upload Image</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-750 file:text-white hover:file:bg-gray-600 cursor-pointer"
                />
            </div>
             <select
                value={element.objectFit}
                onChange={(e) => onChange({ objectFit: e.target.value as any })}
                className="w-full bg-gray-950 border border-gray-750 rounded px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none mt-2"
            >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
            </select>
          </div>
        )}

        {/* AI Generation Tools */}
        {(element.type === ElementType.TEXT || element.type === ElementType.IMAGE) && (
          <div className="space-y-3 border-t border-gray-750 pt-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase flex items-center gap-1">
                <Wand2 size={12} className="text-purple-400" /> Gemini AI
                </label>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={element.type === ElementType.TEXT ? "Describe the text you need..." : "Describe the image to generate..."}
              className="w-full h-20 bg-gray-950 border border-gray-750 rounded p-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none resize-none placeholder-gray-600"
            />
            
            {error && <div className="text-xs text-red-400">{error}</div>}

            <button
              onClick={handleGeminiGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
             <p className="text-[10px] text-gray-600 leading-tight">
                Uses {element.type === ElementType.TEXT ? 'gemini-2.5-flash' : 'gemini-2.5-flash-image'}.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;