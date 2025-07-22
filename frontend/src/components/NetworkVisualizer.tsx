import React from 'react';
import { useNetworkQueries } from '../hooks/useQueries';

export function NetworkVisualizer() {
  const { getAllNetworkStates } = useNetworkQueries();

  if (getAllNetworkStates.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (getAllNetworkStates.error) {
    return (
      <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded text-center">
        <p>Failed to load network visualization</p>
        <p className="text-sm mt-2">Please refresh the page or try again</p>
      </div>
    );
  }

  const networkStates = getAllNetworkStates.data || [];
  
  if (networkStates.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No network states available</p>
        <p className="text-sm mt-2">Initialize the network to see visualizations</p>
      </div>
    );
  }

  // Get the latest network state
  const latestState = networkStates[networkStates.length - 1]?.[1];

  if (!latestState) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No network state data available</p>
      </div>
    );
  }

  const renderWeightMatrix = (weights: number[][], title: string) => {
    if (!weights || weights.length === 0) return null;
    
    const maxWeight = Math.max(...weights.flat().map(Math.abs));
    const minWeight = Math.min(...weights.flat());
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-purple-300">{title}</h3>
        <div className="grid gap-px bg-gray-700 p-2 rounded max-h-64 overflow-auto" 
             style={{ gridTemplateColumns: `repeat(${Math.min(weights[0]?.length || 1, 28)}, 1fr)` }}>
          {weights.slice(0, 10).map((row, rowIdx) => 
            row.slice(0, 784).map((weight, colIdx) => {
              const intensity = maxWeight > 0 ? Math.abs(weight) / maxWeight : 0;
              const isPositive = weight >= 0;
              
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: isPositive 
                      ? `rgba(59, 130, 246, ${intensity})` // Blue for positive
                      : `rgba(239, 68, 68, ${intensity})` // Red for negative
                  }}
                  title={`Weight[${rowIdx}][${colIdx}]: ${weight.toFixed(4)}`}
                />
              );
            })
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Min: {minWeight.toFixed(3)}</span>
          <span>Max: {Math.max(...weights.flat()).toFixed(3)}</span>
        </div>
      </div>
    );
  };

  const renderBiases = (biases: number[]) => {
    const maxBias = Math.max(...biases.map(Math.abs));
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-purple-300">Biases</h3>
        <div className="flex flex-wrap gap-1">
          {biases.map((bias, idx) => {
            const intensity = maxBias > 0 ? Math.abs(bias) / maxBias : 0;
            const isPositive = bias >= 0;
            
            return (
              <div
                key={idx}
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono border border-gray-600"
                style={{
                  backgroundColor: isPositive 
                    ? `rgba(59, 130, 246, ${intensity})` 
                    : `rgba(239, 68, 68, ${intensity})`
                }}
                title={`Bias ${idx}: ${bias.toFixed(4)}`}
              >
                {idx}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Range: {Math.min(...biases).toFixed(3)} to {Math.max(...biases).toFixed(3)}
        </div>
      </div>
    );
  };

  const renderNetworkArchitecture = () => {
    return (
      <div className="mb-6 p-3 bg-gray-700 rounded">
        <h3 className="text-sm font-medium mb-2 text-purple-300">Network Architecture</h3>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-xs">
              Input
            </div>
            <span className="text-xs text-gray-400 mt-1">784</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-xs">
              Output
            </div>
            <span className="text-xs text-gray-400 mt-1">10</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4 flex justify-between">
        <span>Network States: {networkStates.length}</span>
        <span className="text-green-400">● Live Updates</span>
      </div>
      
      {renderNetworkArchitecture()}
      
      {renderWeightMatrix(latestState.weights, "Network Weights (10×784)")}
      
      {renderBiases(latestState.biases)}
      
      <div className="mt-4 p-3 bg-gray-700 rounded text-xs">
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Positive weights</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>Negative weights</span>
          </div>
        </div>
        <p className="text-gray-400">
          Weights update in real-time during training. Brighter colors indicate stronger connections.
        </p>
      </div>
    </div>
  );
}
