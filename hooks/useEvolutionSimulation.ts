
import { useState, useEffect, useCallback, useRef } from 'react';
import { EvolutionNode, ModelType, Layer, Hyperparameters } from '../types';

const MODEL_TYPES: ModelType[] = ['CNN', 'RNN', 'Transformer', 'MLP'];

const createInitialNode = (): EvolutionNode => ({
  id: 'gen0-node0',
  generation: 0,
  parentId: null,
  accuracy: 0.6 + Math.random() * 0.1,
  loss: 0.8 - Math.random() * 0.1,
  energyScore: Math.random() * 50 + 50,
  modelType: 'CNN',
  layers: [
    { type: 'Conv2D', filters: 32, kernel_size: [3, 3], activation: 'relu' },
    { type: 'MaxPooling2D' },
    { type: 'Flatten' },
    { type: 'Dense', neurons: 10, activation: 'softmax' },
  ],
  hyperparameters: { learning_rate: 0.001, optimizer: 'Adam', epochs: 10, batch_size: 32, dropout: 0.2 },
  timestamp: Date.now(),
});

const mutateNode = (parent: EvolutionNode): EvolutionNode => {
  const generation = parent.generation + 1;
  const id = `gen${generation}-node${Math.floor(Math.random() * 1000)}`;

  // Mutate accuracy and loss
  const accuracyChange = (Math.random() - 0.4) * 0.1; // Tend towards improvement
  const accuracy = Math.min(0.99, Math.max(0.1, parent.accuracy + accuracyChange));
  const loss = Math.max(0.01, parent.loss - accuracyChange * 0.8);

  // Mutate layers
  const newLayers: Layer[] = JSON.parse(JSON.stringify(parent.layers));
  if (Math.random() > 0.7) { // Add a layer
      const newLayer: Layer = { type: 'Dense', neurons: [16, 32, 64][Math.floor(Math.random()*3)], activation: 'relu' };
      newLayers.splice(newLayers.length - 1, 0, newLayer);
  }
  
  // Mutate hyperparameters
  const newHyperparams: Hyperparameters = { ...parent.hyperparameters };
  if(Math.random() > 0.5) {
    newHyperparams.learning_rate *= (Math.random() * 0.4 + 0.8); // Mutate by -20% to +20%
  }


  return {
    id,
    generation,
    parentId: parent.id,
    accuracy,
    loss,
    energyScore: Math.random() * 80 + 20,
    modelType: parent.modelType,
    layers: newLayers,
    hyperparameters: newHyperparams,
    timestamp: Date.now(),
  };
};

export const useEvolutionSimulation = (isRunning: boolean) => {
  const [nodes, setNodes] = useState<EvolutionNode[]>([createInitialNode()]);
  const intervalRef = useRef<number | null>(null);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    stopSimulation();
    intervalRef.current = window.setInterval(() => {
      setNodes(prevNodes => {
        const bestParents = [...prevNodes]
          .sort((a, b) => b.accuracy - a.accuracy)
          .slice(0, Math.max(1, Math.floor(prevNodes.length * 0.3)));
        
        const parent = bestParents[Math.floor(Math.random() * bestParents.length)];
        const newNode = mutateNode(parent);
        
        // Prune old nodes to keep list manageable
        const updatedNodes = [...prevNodes, newNode];
        if (updatedNodes.length > 50) {
            return updatedNodes.slice(updatedNodes.length - 50);
        }
        return updatedNodes;
      });
    }, 2000);
  }, [stopSimulation]);

  useEffect(() => {
    if (isRunning) {
      startSimulation();
    } else {
      stopSimulation();
    }
    return stopSimulation;
  }, [isRunning, startSimulation, stopSimulation]);
  
  const resetSimulation = useCallback(() => {
    stopSimulation();
    setNodes([createInitialNode()]);
  }, [stopSimulation]);


  return { nodes, resetSimulation };
};
