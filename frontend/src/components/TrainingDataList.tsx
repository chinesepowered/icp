import React from 'react';
import { useTrainingQueries } from '../hooks/useQueries';

export function TrainingDataList() {
  const { getAllTrainingSamples } = useTrainingQueries();

  if (getAllTrainingSamples.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (getAllTrainingSamples.error) {
    return (
      <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded text-center">
        <p>Failed to load training data</p>
        <p className="text-sm mt-2">Please refresh the page or try again</p>
      </div>
    );
  }

  const samples = getAllTrainingSamples.data || [];

  if (samples.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No training data yet</p>
        <p className="text-sm mt-2">Draw some digits to get started!</p>
      </div>
    );
  }

  // Group samples by label
  const groupedSamples = samples.reduce((acc, [id, sample]) => {
    const label = Number(sample.label);
    if (!acc[label]) acc[label] = [];
    acc[label].push({ id, sample });
    return acc;
  }, {} as Record<number, Array<{ id: string; sample: any }>>);

  const renderMiniDigit = (input: number[], size = 20) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, size, size);
      
      // Draw pixels
      const gridSize = 28;
      const cellSize = size / gridSize;
      
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const intensity = input[y * gridSize + x];
          if (intensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
      {Object.entries(groupedSamples)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([label, labelSamples]) => (
          <div key={label} className="bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-green-300">Digit {label}</h3>
              <span className="text-xs text-gray-400">
                {labelSamples.length} sample{labelSamples.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-8 gap-1">
              {labelSamples.slice(0, 16).map(({ id, sample }) => (
                <div
                  key={id}
                  className="w-6 h-6 bg-gray-800 rounded border border-gray-600 overflow-hidden"
                  title={`Sample: ${id}`}
                >
                  <img
                    src={renderMiniDigit(sample.input, 24)}
                    alt={`Digit ${label}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {labelSamples.length > 16 && (
                <div className="w-6 h-6 bg-gray-600 rounded border border-gray-500 flex items-center justify-center text-xs text-gray-300">
                  +{labelSamples.length - 16}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
