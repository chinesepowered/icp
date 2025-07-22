import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrainingSample, NetworkState } from '../backend';

// Training Data Queries
export function useTrainingQueries() {
  const { actor, isFetching } = useActor();

  const getAllTrainingSamples = useQuery<Array<[string, TrainingSample]>>({
    queryKey: ['training-samples'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrainingSamples();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const getTrainingDataSize = useQuery<bigint>({
    queryKey: ['training-data-size'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTrainingDataSize();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    getAllTrainingSamples,
    getTrainingDataSize,
  };
}

// Separate hook for samples by label
export function useSamplesByLabel(label: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<TrainingSample[]>({
    queryKey: ['samples-by-label', label.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSamplesByLabel(label);
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Network State Queries
export function useNetworkQueries() {
  const { actor, isFetching } = useActor();

  const getAllNetworkStates = useQuery<Array<[string, NetworkState]>>({
    queryKey: ['network-states'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNetworkStates();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const getNetworkStateSize = useQuery<bigint>({
    queryKey: ['network-state-size'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getNetworkStateSize();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    getAllNetworkStates,
    getNetworkStateSize,
  };
}

// Separate hook for network state by id
export function useNetworkState(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<NetworkState | null>({
    queryKey: ['network-state', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNetworkState(id);
    },
    enabled: !!actor && !isFetching && !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Training Data Mutations
export function useTrainingMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addTrainingSample = useMutation({
    mutationFn: async ({ id, input, label }: { id: string; input: number[]; label: bigint }) => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.addTrainingSample(id, input, label);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-samples'] });
      queryClient.invalidateQueries({ queryKey: ['training-data-size'] });
    },
    onError: (error) => {
      console.error('Failed to add training sample:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const deleteTrainingSample = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.deleteTrainingSample(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-samples'] });
      queryClient.invalidateQueries({ queryKey: ['training-data-size'] });
    },
    onError: (error) => {
      console.error('Failed to delete training sample:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const clearTrainingData = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.clearTrainingData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-samples'] });
      queryClient.invalidateQueries({ queryKey: ['training-data-size'] });
    },
    onError: (error) => {
      console.error('Failed to clear training data:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  return {
    addTrainingSample,
    deleteTrainingSample,
    clearTrainingData,
  };
}

// Network State Mutations
export function useNetworkMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addNetworkState = useMutation({
    mutationFn: async ({ id, weights, biases }: { id: string; weights: number[][]; biases: number[] }) => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.addNetworkState(id, weights, biases);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-states'] });
      queryClient.invalidateQueries({ queryKey: ['network-state-size'] });
    },
    onError: (error) => {
      console.error('Failed to add network state:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const updateNetworkState = useMutation({
    mutationFn: async ({ id, weights, biases }: { id: string; weights: number[][]; biases: number[] }) => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.updateNetworkState(id, weights, biases);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-states'] });
    },
    onError: (error) => {
      console.error('Failed to update network state:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const deleteNetworkState = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.deleteNetworkState(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-states'] });
      queryClient.invalidateQueries({ queryKey: ['network-state-size'] });
    },
    onError: (error) => {
      console.error('Failed to delete network state:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const clearNetworkStates = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Backend connection not available. Please refresh the page.');
      return actor.clearNetworkStates();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-states'] });
      queryClient.invalidateQueries({ queryKey: ['network-state-size'] });
    },
    onError: (error) => {
      console.error('Failed to clear network states:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  return {
    addNetworkState,
    updateNetworkState,
    deleteNetworkState,
    clearNetworkStates,
  };
}
