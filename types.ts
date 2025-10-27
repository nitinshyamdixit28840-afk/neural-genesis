
export enum Page {
  Dashboard = 'Dashboard',
  EvolutionView = 'Evolution View',
  ModelLibrary = 'Model Library',
  DeploymentHub = 'Deployment Hub',
  ResearchAssistant = 'Research Assistant',
}

export type ModelType = 'CNN' | 'RNN' | 'Transformer' | 'MLP';

export interface Layer {
  type: string;
  neurons?: number;
  activation?: string;
  filters?: number;
  kernel_size?: [number, number];
  heads?: number;
}

export interface Hyperparameters {
  learning_rate: number;
  optimizer: 'Adam' | 'SGD' | 'RMSprop';
  epochs: number;
  batch_size: number;
  dropout: number;
}

export interface EvolutionNode {
  id: string;
  generation: number;
  parentId: string | null;
  accuracy: number;
  loss: number;
  energyScore: number;
  modelType: ModelType;
  layers: Layer[];
  hyperparameters: Hyperparameters;
  timestamp: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
