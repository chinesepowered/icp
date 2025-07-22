import React, { useState } from 'react';
import { useNetworkMutations, useTrainingQueries, useNetworkQueries, useTrainingMutations } from '../hooks/useQueries';
import { ConfirmationDialog } from './ConfirmationDialog';

export function TrainingControls() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showResetNetworkDialog, setShowResetNetworkDialog] = useState(false);
  
  const { addNetworkState, updateNetworkState, clearNetworkStates } = useNetworkMutations();
  const { clearTrainingData } = useTrainingMutations();
  const { getAllTrainingSamples } = useTrainingQueries();
  const { getAllNetworkStates } = useNetworkQueries();

  // Initialize a simple neural network with random weights
  const initializeNetwork = async () => {
    setIsInitializing(true);
    
    try {
      // Create a simple single-layer network: 784 inputs (28x28) -> 10 outputs
      const inputSize = 784; // 28x28 pixels
      const outputSize = 10; // digits 0-9
      
      // Initialize weights with small random values (outputSize × inputSize)
      const weights: number[][] = [];
      for (let i = 0; i < outputSize; i++) {
        const row: number[] = [];
        for (let j = 0; j < inputSize; j++) {
          row.push((Math.random() - 0.5) * 0.1); // Small random weights
        }
        weights.push(row);
      }
      
      // Initialize biases (one for each output)
      const biases: number[] = [];
      for (let i = 0; i < outputSize; i++) {
        biases.push((Math.random() - 0.5) * 0.1);
      }
      
      const id = `network_${Date.now()}`;
      await addNetworkState.mutateAsync({ id, weights, biases });
      
    } catch (error) {
      console.error('Failed to initialize network:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Simple perceptron training step
  const trainStep = async () => {
    setIsTraining(true);
    
    try {
      const samples = getAllTrainingSamples.data || [];
      const networkStates = getAllNetworkStates.data || [];
      
      if (samples.length === 0) {
        console.log('No training samples available');
        return;
      }
      
      if (networkStates.length === 0) {
        console.log('No network initialized');
        return;
      }
      
      // Get the latest network state
      const latestNetworkEntry = networkStates[networkStates.length - 1];
      const [networkId, currentState] = latestNetworkEntry;
      
      // Clone current weights and biases
      const newWeights = currentState.weights.map(row => [...row]);
      const newBiases = [...currentState.biases];
      
      const learningRate = 0.01;
      
      // Train on a random sample
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      const [, sample] = randomSample;
      const input = sample.input;
      const targetLabel = Number(sample.label);
      
      // Forward pass
      const outputs: number[] = [];
      for (let i = 0; i < newWeights.length; i++) {
        let sum = newBiases[i];
        for (let j = 0; j < input.length; j++) {
          sum += newWeights[i][j] * input[j];
        }
        outputs[i] = sum; // Linear output for simplicity
      }
      
      // Create target vector (one-hot encoding)
      const target = Array(10).fill(0);
      target[targetLabel] = 1;
      
      // Calculate errors and update weights (simple perceptron rule)
      for (let i = 0; i < newWeights.length; i++) {
        const error = target[i] - outputs[i];
        
        // Update bias
        newBiases[i] += learningRate * error;
        
        // Update weights
        for (let j = 0; j < input.length; j++) {
          newWeights[i][j] += learningRate * error * input[j];
        }
      }
      
      // Update the network state
      await updateNetworkState.mutateAsync({
        id: networkId,
        weights: newWeights,
        biases: newBiases
      });
      
    } catch (error) {
      console.error('Failed to perform training step:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleClearTrainingData = async () => {
    try {
      await clearTrainingData.mutateAsync();
      setShowClearDataDialog(false);
    } catch (error) {
      console.error('Failed to clear training data:', error);
    }
  };

  const handleResetNetwork = async () => {
    try {
      await clearNetworkStates.mutateAsync();
      setShowResetNetworkDialog(false);
    } catch (error) {
      console.error('Failed to reset network:', error);
    }
  };

  const canTrain = (getAllTrainingSamples.data?.length || 0) > 0 && 
                   (getAllNetworkStates.data?.length || 0) > 0;

  const hasTrainingData = (getAllTrainingSamples.data?.length || 0) > 0;
  const hasNetworkState = (getAllNetworkStates.data?.length || 0) > 0;

  return (
    <div className="space-y-4">
      <button
        onClick={initializeNetwork}
        disabled={isInitializing || addNetworkState.isPending}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center"
      >
        {isInitializing || addNetworkState.isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Initializing...
          </>
        ) : (
          'Initialize Network'
        )}
      </button>
      
      <button
        onClick={trainStep}
        disabled={isTraining || updateNetworkState.isPending || !canTrain}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center"
      >
        {isTraining || updateNetworkState.isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Training...
          </>
        ) : (
          'Train Step'
        )}
      </button>

      <div className="border-t border-gray-600 pt-4 space-y-2">
        <button
          onClick={() => setShowClearDataDialog(true)}
          disabled={!hasTrainingData || clearTrainingData.isPending}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center"
        >
          {clearTrainingData.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Clearing Data...
            </>
          ) : (
            'Clear All Training Data'
          )}
        </button>

        <button
          onClick={() => setShowResetNetworkDialog(true)}
          disabled={!hasNetworkState || clearNetworkStates.isPending}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center"
        >
          {clearNetworkStates.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resetting Network...
            </>
          ) : (
            'Reset Neural Network'
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Initialize: Create a new neural network with random weights</p>
        <p>• Train Step: Update weights using perceptron learning rule</p>
        <p>• Current: Single-layer perceptron (784 → 10)</p>
        <p>• Learning Rate: 0.01</p>
        {!canTrain && (
          <p className="text-yellow-400">• Need training data and initialized network to train</p>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showClearDataDialog}
        onClose={() => setShowClearDataDialog(false)}
        onConfirm={handleClearTrainingData}
        title="Clear All Training Data"
        message="Are you sure you want to delete all training samples? This action cannot be undone."
        confirmText="Clear Data"
        confirmButtonClass="bg-red-600 hover:bg-red-500"
        isLoading={clearTrainingData.isPending}
      />

      <ConfirmationDialog
        isOpen={showResetNetworkDialog}
        onClose={() => setShowResetNetworkDialog(false)}
        onConfirm={handleResetNetwork}
        title="Reset Neural Network"
        message="Are you sure you want to reset the neural network? This will remove all network states and training progress."
        confirmText="Reset Network"
        confirmButtonClass="bg-orange-600 hover:bg-orange-500"
        isLoading={clearNetworkStates.isPending}
      />
    </div>
  );
}
