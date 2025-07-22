import React from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { TrainingControls } from './components/TrainingControls';
import { MetricsDisplay } from './components/MetricsDisplay';
import { TrainingDataList } from './components/TrainingDataList';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Neural Network Training Visualizer
          </h1>
          <p className="text-gray-400 text-lg">
            Draw digits and watch the network learn in real-time
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Drawing and Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Draw a Digit</h2>
              <DrawingCanvas />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Training Controls</h2>
              <TrainingControls />
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Metrics</h2>
              <MetricsDisplay />
            </div>
          </div>

          {/* Middle Column - Network Visualization */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Network Visualization</h2>
            <NetworkVisualizer />
          </div>

          {/* Right Column - Training Data */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Training Data</h2>
            <TrainingDataList />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p>
            © 2025. Built with{' '}
            <span className="text-red-500">❤</span>{' '}
            using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
