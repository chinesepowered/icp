import React, { useMemo } from 'react';
import { useTrainingQueries, useNetworkQueries } from '../hooks/useQueries';

export function MetricsDisplay() {
  const { getTrainingDataSize, getAllTrainingSamples } = useTrainingQueries();
  const { getNetworkStateSize, getAllNetworkStates } = useNetworkQueries();

  const trainingDataSize = getTrainingDataSize.data || BigInt(0);
  const networkStateSize = getNetworkStateSize.data || BigInt(0);
  const samples = getAllTrainingSamples.data || [];
  const networkStates = getAllNetworkStates.data || [];

  // Calculate basic accuracy metrics
  const accuracy = useMemo(() => {
    if (samples.length === 0 || networkStates.length === 0) return 'N/A';
    
    const latestState = networkStates[networkStates.length - 1]?.[1];
    if (!latestState) return 'N/A';
    
    let correct = 0;
    const total = Math.min(samples.length, 100); // Test on up to 100 samples for performance
    
    for (let i = 0; i < total; i++) {
      const [, sample] = samples[i];
      const input = sample.input;
      const targetLabel = Number(sample.label);
      
      // Forward pass
      const outputs: number[] = [];
      for (let j = 0; j < latestState.weights.length; j++) {
        let sum = latestState.biases[j];
        for (let k = 0; k < input.length; k++) {
          sum += latestState.weights[j][k] * input[k];
        }
        outputs[j] = sum;
      }
      
      // Find predicted class (highest output)
      const predictedLabel = outputs.indexOf(Math.max(...outputs));
      if (predictedLabel === targetLabel) {
        correct++;
      }
    }
    
    return `${((correct / total) * 100).toFixed(1)}%`;
  }, [samples, networkStates]);

  // Calculate average loss
  const averageLoss = useMemo(() => {
    if (samples.length === 0 || networkStates.length === 0) return 'N/A';
    
    const latestState = networkStates[networkStates.length - 1]?.[1];
    if (!latestState) return 'N/A';
    
    let totalLoss = 0;
    const total = Math.min(samples.length, 50); // Calculate on subset for performance
    
    for (let i = 0; i < total; i++) {
      const [, sample] = samples[i];
      const input = sample.input;
      const targetLabel = Number(sample.label);
      
      // Forward pass
      const outputs: number[] = [];
      for (let j = 0; j < latestState.weights.length; j++) {
        let sum = latestState.biases[j];
        for (let k = 0; k < input.length; k++) {
          sum += latestState.weights[j][k] * input[k];
        }
        outputs[j] = sum;
      }
      
      // Calculate mean squared error
      const target = Array(10).fill(0);
      target[targetLabel] = 1;
      
      let sampleLoss = 0;
      for (let j = 0; j < outputs.length; j++) {
        const error = target[j] - outputs[j];
        sampleLoss += error * error;
      }
      totalLoss += sampleLoss / outputs.length;
    }
    
    return (totalLoss / total).toFixed(3);
  }, [samples, networkStates]);

  const metrics = [
    {
      label: 'Training Samples',
      value: trainingDataSize.toString(),
      color: 'text-blue-400',
      icon: '📊',
      isLoading: getTrainingDataSize.isLoading
    },
    {
      label: 'Training Steps',
      value: Math.max(0, Number(networkStateSize) - 1).toString(),
      color: 'text-purple-400',
      icon: '🧠',
      isLoading: getNetworkStateSize.isLoading
    },
    {
      label: 'Accuracy',
      value: accuracy,
      color: 'text-green-400',
      icon: '🎯',
      isLoading: getAllTrainingSamples.isLoading || getAllNetworkStates.isLoading
    },
    {
      label: 'Avg Loss',
      value: averageLoss,
      color: 'text-red-400',
      icon: '📉',
      isLoading: getAllTrainingSamples.isLoading || getAllNetworkStates.isLoading
    }
  ];

  const hasError = getTrainingDataSize.error || getNetworkStateSize.error || 
                   getAllTrainingSamples.error || getAllNetworkStates.error;

  if (hasError) {
    return (
      <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded">
        <p className="text-sm">Failed to load metrics</p>
        <p className="text-xs mt-1">Please refresh the page or try again</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{metric.icon}</span>
            <span className="text-sm font-medium">{metric.label}</span>
          </div>
          <div className="flex items-center">
            {metric.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            ) : (
              <span className={`font-mono text-sm ${metric.color}`}>
                {metric.value}
              </span>
            )}
          </div>
        </div>
      ))}
      
      <div className="text-xs text-gray-400 p-2 bg-gray-700 rounded">
        <p>• Accuracy: Percentage of correct predictions on training data</p>
        <p>• Loss: Mean squared error between predictions and targets</p>
        <p>• Metrics update automatically after each training step</p>
      </div>
    </div>
  );
}
