import Array "mo:base/Array";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import List "mo:base/List";
import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";



persistent actor NeuralNetwork {
    // Types
    type TrainingSample = {
        input : [Float];
        label_ : Nat;
    };

    type NetworkState = {
        weights : [[Float]];
        biases : [Float];
    };

    // Create OrderedMap operations instance
    transient let textMap = OrderedMap.Make<Text>(Text.compare);

    // Storage using OrderedMap
    var trainingData : OrderedMap.Map<Text, TrainingSample> = textMap.empty();
    var networkState : OrderedMap.Map<Text, NetworkState> = textMap.empty();

    // Add training sample
    public func addTrainingSample(id : Text, input : [Float], label_ : Nat) : async () {
        let sample : TrainingSample = {
            input = input;
            label_ = label_;
        };
        trainingData := textMap.put(trainingData, id, sample);
    };

    // Get training sample
    public query func getTrainingSample(id : Text) : async ?TrainingSample {
        textMap.get(trainingData, id);
    };

    // Add network state
    public func addNetworkState(id : Text, weights : [[Float]], biases : [Float]) : async () {
        let state : NetworkState = {
            weights = weights;
            biases = biases;
        };
        networkState := textMap.put(networkState, id, state);
    };

    // Get network state
    public query func getNetworkState(id : Text) : async ?NetworkState {
        textMap.get(networkState, id);
    };

    // Get all training samples
    public query func getAllTrainingSamples() : async [(Text, TrainingSample)] {
        Iter.toArray(textMap.entries(trainingData));
    };

    // Get all network states
    public query func getAllNetworkStates() : async [(Text, NetworkState)] {
        Iter.toArray(textMap.entries(networkState));
    };

    // Delete training sample
    public func deleteTrainingSample(id : Text) : async () {
        trainingData := textMap.delete(trainingData, id);
    };

    // Delete network state
    public func deleteNetworkState(id : Text) : async () {
        networkState := textMap.delete(networkState, id);
    };

    // Clear all training data
    public func clearTrainingData() : async () {
        trainingData := textMap.empty();
    };

    // Clear all network states
    public func clearNetworkStates() : async () {
        networkState := textMap.empty();
    };

    // Get size of training data
    public query func getTrainingDataSize() : async Nat {
        textMap.size(trainingData);
    };

    // Get size of network states
    public query func getNetworkStateSize() : async Nat {
        textMap.size(networkState);
    };

    // Check if training sample exists
    public query func hasTrainingSample(id : Text) : async Bool {
        textMap.contains(trainingData, id);
    };

    // Check if network state exists
    public query func hasNetworkState(id : Text) : async Bool {
        textMap.contains(networkState, id);
    };

    // Update training sample
    public func updateTrainingSample(id : Text, input : [Float], label_ : Nat) : async Bool {
        let sample : TrainingSample = {
            input = input;
            label_ = label_;
        };
        let (newData, oldValue) = textMap.replace(trainingData, id, sample);
        trainingData := newData;
        switch (oldValue) {
            case null { false };
            case (?_) { true };
        };
    };

    // Update network state
    public func updateNetworkState(id : Text, weights : [[Float]], biases : [Float]) : async Bool {
        let state : NetworkState = {
            weights = weights;
            biases = biases;
        };
        let (newState, oldValue) = textMap.replace(networkState, id, state);
        networkState := newState;
        switch (oldValue) {
            case null { false };
            case (?_) { true };
        };
    };

    // Get all training sample IDs
    public query func getTrainingSampleIds() : async [Text] {
        Iter.toArray(textMap.keys(trainingData));
    };

    // Get all network state IDs
    public query func getNetworkStateIds() : async [Text] {
        Iter.toArray(textMap.keys(networkState));
    };

    // Get all training sample labels
    public query func getTrainingSampleLabels() : async [Nat] {
        let samples = Iter.toArray(textMap.vals(trainingData));
        Array.map(samples, func(sample : TrainingSample) : Nat { sample.label_ });
    };

    // Get all network weights
    public query func getAllNetworkWeights() : async [[[Float]]] {
        let states = Iter.toArray(textMap.vals(networkState));
        Array.map(states, func(state : NetworkState) : [[Float]] { state.weights });
    };

    // Get all network biases
    public query func getAllNetworkBiases() : async [[Float]] {
        let states = Iter.toArray(textMap.vals(networkState));
        Array.map(states, func(state : NetworkState) : [Float] { state.biases });
    };

    // Get training samples by label
    public query func getSamplesByLabel(label_ : Nat) : async [TrainingSample] {
        let samples = Iter.toArray(textMap.vals(trainingData));
        Array.filter(samples, func(sample : TrainingSample) : Bool { sample.label_ == label_ });
    };

    // Get network states by weight count
    public query func getStatesByWeightCount(count : Nat) : async [NetworkState] {
        let states = Iter.toArray(textMap.vals(networkState));
        Array.filter(states, func(state : NetworkState) : Bool { state.weights.size() == count });
    };

    // Get training samples as list
    public query func getTrainingSamplesAsList() : async List.List<TrainingSample> {
        let samples = Iter.toArray(textMap.vals(trainingData));
        List.fromArray(samples);
    };

    // Get network states as list
    public query func getNetworkStatesAsList() : async List.List<NetworkState> {
        let states = Iter.toArray(textMap.vals(networkState));
        List.fromArray(states);
    };
};

