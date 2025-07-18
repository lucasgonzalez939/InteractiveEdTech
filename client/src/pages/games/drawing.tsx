import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Eraser, Save, Palette, Circle, Square, Brush } from 'lucide-react';

type DrawingTool = 'brush' | 'circle' | 'rectangle' | 'eraser';

export default function Drawing() {
  const { updateScore } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#EF4444');
  const [currentTool, setCurrentTool] = useState<DrawingTool>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const colors = [
    { color: '#EF4444', name: 'Rojo' },
    { color: '#3B82F6', name: 'Azul' },
    { color: '#10B981', name: 'Verde' },
    { color: '#F59E0B', name: 'Amarillo' },
    { color: '#8B5CF6', name: 'Morado' },
    { color: '#EC4899', name: 'Rosa' },
    { color: '#F97316', name: 'Naranja' },
    { color: '#000000', name: 'Negro' },
  ];

  const tools = [
    { id: 'brush', name: 'Pincel', icon: <Brush className="w-4 h-4" /> },
    { id: 'circle', name: 'Círculo', icon: <Circle className="w-4 h-4" /> },
    { id: 'rectangle', name: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
    { id: 'eraser', name: 'Borrador', icon: <Eraser className="w-4 h-4" /> },
  ];

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    
    if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    } else if (currentTool === 'rectangle') {
      ctx.beginPath();
      ctx.rect(
        startPos.x,
        startPos.y,
        pos.x - startPos.x,
        pos.y - startPos.y
      );
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
    
    setIsDrawing(false);
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `dibujo_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    updateScore(20);
  };

  const getToolButtonClass = (toolId: string) => {
    const baseClass = "w-full px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2";
    return currentTool === toolId 
      ? `${baseClass} bg-coral text-white ring-4 ring-coral/30`
      : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <GameLayout
      gameTitle="Dibujo Libre"
      gameType="drawing"
      className="bg-gradient-to-br from-warning to-yellow"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-fredoka text-dark mb-6 text-center">
              Dibujo Libre
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Drawing Tools */}
              <div className="lg:col-span-1">
                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-dark mb-4">Colores</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <button
                        key={color.color}
                        className={`w-12 h-12 rounded-lg cursor-pointer hover:scale-110 transition-all duration-300 border-4 ${
                          currentColor === color.color 
                            ? 'border-gray-800 scale-110' 
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => setCurrentColor(color.color)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-dark mb-4">Herramientas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-dark">Tamaño:</span>
                      <Slider
                        value={[brushSize]}
                        onValueChange={(value) => setBrushSize(value[0])}
                        max={50}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <Badge variant="outline">{brushSize}</Badge>
                    </div>
                    
                    {tools.map(tool => (
                      <button
                        key={tool.id}
                        className={getToolButtonClass(tool.id)}
                        onClick={() => setCurrentTool(tool.id as DrawingTool)}
                      >
                        {tool.icon}
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={clearCanvas}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                  
                  <Button
                    onClick={saveDrawing}
                    className="w-full bg-success hover:bg-success/80 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="lg:col-span-3">
                <div className="bg-gray-100 rounded-xl p-4">
                  <canvas
                    ref={canvasRef}
                    className="bg-white rounded-lg shadow-inner cursor-crosshair w-full"
                    width={700}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-dark font-bold mb-2">
                ¡Crea dibujos increíbles con colores y herramientas!
              </p>
              <p className="text-sm text-gray-600">
                Selecciona un color y una herramienta, luego dibuja en el lienzo blanco.
                Puedes guardar tu obra de arte cuando termines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
