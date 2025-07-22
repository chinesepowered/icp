import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTrainingMutations } from '../hooks/useQueries';

const CANVAS_SIZE = 280; // 28x28 grid scaled up 10x
const GRID_SIZE = 28;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<number>(0);
  const [pixelData, setPixelData] = useState<number[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { addTrainingSample } = useTrainingMutations();

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
  }, []);

  const drawPixels = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const intensity = pixelData[y][x];
        if (intensity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }, [pixelData]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw pixels
    drawPixels(ctx);
    
    // Draw grid
    drawGrid(ctx);
  }, [drawPixels, drawGrid]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / CELL_SIZE),
      y: Math.floor((e.clientY - rect.top) / CELL_SIZE)
    };
  };

  const drawPixel = (x: number, y: number) => {
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setPixelData(prev => {
        const newData = prev.map(row => [...row]);
        newData[y][x] = Math.min(1, newData[y][x] + 0.3);
        
        // Add some blur effect to adjacent pixels
        const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        
        neighbors.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            newData[ny][nx] = Math.min(1, newData[ny][nx] + 0.1);
          }
        });
        
        return newData;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    drawPixel(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    drawPixel(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setPixelData(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    setSubmitError(null);
  };

  const submitDrawing = async () => {
    setSubmitError(null);
    
    // Check if canvas has any drawing
    const hasDrawing = pixelData.some(row => row.some(pixel => pixel > 0));
    if (!hasDrawing) {
      setSubmitError('Please draw something before submitting');
      return;
    }

    // Flatten the 2D array to 1D for the backend
    const flatData = pixelData.flat();
    const id = `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await addTrainingSample.mutateAsync({
        id,
        input: flatData,
        label: BigInt(selectedLabel)
      });
      
      // Clear canvas after successful submission
      clearCanvas();
    } catch (error) {
      console.error('Failed to submit training sample:', error);
      setSubmitError('Failed to submit drawing. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="border border-gray-600 rounded cursor-crosshair bg-gray-800"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {submitError && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-3 py-2 rounded text-sm">
          {submitError}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Label:</label>
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={clearCanvas}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={submitDrawing}
            disabled={addTrainingSample.isPending}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded text-sm transition-colors flex items-center"
          >
            {addTrainingSample.isPending ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
