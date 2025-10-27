
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEvolutionSimulation } from './hooks/useEvolutionSimulation';
import { EvolutionNode, ModelType, Layer, Hyperparameters, ChatMessage } from './types';
import * as geminiService from './services/geminiService';
import { Card, Spinner, MetricsChart, CodeBlock } from './components';

// ==== DASHBOARD PAGE ==== //
export const DashboardPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to Neural Genesis</h1>
            <p className="text-slate-400 mb-8">The AI that designs, explains, and deploys other AIs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:border-cyan-400/50 transition-colors">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-2">Start a New Evolution</h2>
                    <p className="text-slate-400">Begin a new experiment to automatically design and optimize a neural network for your dataset.</p>
                </Card>
                <Card className="hover:border-purple-400/50 transition-colors">
                    <h2 className="text-xl font-semibold text-purple-300 mb-2">Browse Model Library</h2>
                    <p className="text-slate-400">Explore and reuse previously evolved architectures that have proven successful.</p>
                </Card>
                <Card className="hover:border-pink-400/50 transition-colors">
                    <h2 className="text-xl font-semibold text-pink-300 mb-2">Consult Research Assistant</h2>
                    <p className="text-slate-400">Ask our integrated AI for insights, explanations, and ideas related to your work.</p>
                </Card>
            </div>
            
            <div className="mt-10">
                 <h2 className="text-2xl font-bold text-white mb-4">Platform Status</h2>
                 <Card>
                    <p className="text-slate-300">All systems operational. Ready to evolve.</p>
                 </Card>
            </div>
        </div>
    );
};


// ==== EVOLUTION VIEW PAGE ==== //

const ModelDetailPanel: React.FC<{ node: EvolutionNode }> = ({ node }) => {
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getExplanation = useCallback(async () => {
        setIsLoading(true);
        const result = await geminiService.explainArchitecture(node);
        setExplanation(result);
        setIsLoading(false);
    }, [node]);
    
    useEffect(() => {
        setExplanation('');
        setIsLoading(false);
    }, [node]);

    return (
        <Card className="flex-shrink-0 w-full lg:w-[450px] lg:max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">Model Details</h2>
            <div className="space-y-4 text-sm">
                <p><strong className="text-slate-300">ID:</strong> <span className="font-mono text-slate-400">{node.id}</span></p>
                <p><strong className="text-slate-300">Generation:</strong> {node.generation}</p>
                <p><strong className="text-slate-300">Accuracy:</strong> <span className="font-bold text-green-400">{(node.accuracy * 100).toFixed(2)}%</span></p>
                <p><strong className="text-slate-300">Loss:</strong> <span className="font-bold text-red-400">{node.loss.toFixed(4)}</span></p>
                <p><strong className="text-slate-300">Energy Score:</strong> {node.energyScore.toFixed(2)}</p>
                <p><strong className="text-slate-300">Model Type:</strong> {node.modelType}</p>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-300 mt-4 mb-2">Architecture</h3>
                    <div className="bg-gray-950 p-3 rounded-md max-h-40 overflow-y-auto">
                        <ul className="list-disc list-inside text-slate-400">
                            {node.layers.map((l, i) => <li key={i}>{l.type} ({Object.entries(l).filter(([k]) => k !== 'type').map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})</li>)}
                        </ul>
                    </div>
                </div>
                <button onClick={getExplanation} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors mt-4">
                    {isLoading ? 'Analyzing...' : 'Get AI Explanation'}
                </button>
                {isLoading && <div className="flex justify-center mt-4"><Spinner /></div>}
                {explanation && (
                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">AI Analysis</h3>
                        <p className="text-slate-400 whitespace-pre-wrap text-sm">{explanation}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export const EvolutionViewPage: React.FC = () => {
    const [isRunning, setIsRunning] = useState(true);
    const { nodes, resetSimulation } = useEvolutionSimulation(isRunning);
    const [selectedNode, setSelectedNode] = useState<EvolutionNode | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (nodes.length > 0) {
            setSelectedNode(nodes[nodes.length - 1]);
        }
    }, [nodes]);
    
    useEffect(() => {
        if(scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [nodes.length]);

    const bestNode = nodes.reduce((best, current) => current.accuracy > best.accuracy ? current : best, nodes[0]);

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col">
            <div className="flex-shrink-0 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white">Evolutionary Run</h1>
                    <p className="text-slate-400">Observing model architectures evolve in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsRunning(!isRunning)} className={`font-bold py-2 px-4 rounded ${isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'}`}>
                        {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={resetSimulation} className="bg-red-600 hover:bg-red-500 font-bold py-2 px-4 rounded">
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden">
                <div className="flex-grow flex flex-col gap-6 overflow-hidden">
                    <Card className="flex-shrink-0">
                        <h2 className="text-xl font-semibold text-purple-300 mb-2">Run Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                           <div><div className="text-sm text-slate-400">Generations</div><div className="text-2xl font-bold">{Math.max(...nodes.map(n => n.generation))}</div></div>
                           <div><div className="text-sm text-slate-400">Models</div><div className="text-2xl font-bold">{nodes.length}</div></div>
                           <div><div className="text-sm text-slate-400">Best Accuracy</div><div className="text-2xl font-bold text-green-400">{(bestNode?.accuracy * 100).toFixed(2)}%</div></div>
                           <div><div className="text-sm text-slate-400">Best Model ID</div><div className="text-xl font-mono text-slate-300 truncate">{bestNode?.id}</div></div>
                        </div>
                    </Card>

                    <Card className="flex-grow overflow-hidden flex flex-col">
                         <h2 className="text-xl font-semibold text-purple-300 mb-4">Performance Over Time</h2>
                        <div className="flex-grow min-h-0">
                           <MetricsChart nodes={nodes} />
                        </div>
                    </Card>
                </div>

                {selectedNode && <ModelDetailPanel node={selectedNode} />}
            </div>
        </div>
    );
};


// ==== MODEL LIBRARY PAGE ==== //
export const ModelLibraryPage: React.FC = () => {
    // In a real app, this data would be fetched or persisted.
    // Here we use a static snapshot for demonstration.
    const [models] = useState<EvolutionNode[]>(() => {
        const sampleModels: EvolutionNode[] = [];
        for (let i = 0; i < 12; i++) {
            sampleModels.push({
                id: `lib-node-${i}`,
                generation: Math.floor(Math.random() * 20),
                parentId: null,
                accuracy: 0.85 + Math.random() * 0.14,
                loss: 0.15 - Math.random() * 0.1,
                energyScore: Math.random() * 70 + 30,
                modelType: ['CNN', 'Transformer', 'RNN'][i % 3] as ModelType,
                layers: [{ type: 'Dense', neurons: 64, activation: 'relu' }],
                hyperparameters: { learning_rate: 0.001, optimizer: 'Adam', epochs: 20, batch_size: 64, dropout: 0.25 },
                timestamp: Date.now() - Math.random() * 100000000,
            });
        }
        return sampleModels.sort((a, b) => b.accuracy - a.accuracy);
    });

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Model Blueprint Library</h1>
            <p className="text-slate-400 mb-8">A repository of high-performing, evolved architectures.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {models.map(model => (
                    <Card key={model.id} className="flex flex-col justify-between hover:scale-105 hover:border-purple-400/50 transition-transform duration-300">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-purple-300">{model.modelType} Architecture</h3>
                                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">{model.id}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">Generation {model.generation}</p>
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-slate-300">Accuracy:</strong> <span className="font-bold text-green-400">{(model.accuracy * 100).toFixed(2)}%</span></p>
                                <p><strong className="text-slate-300">Energy Score:</strong> {model.energyScore.toFixed(2)}</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                            Deploy
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// ==== DEPLOYMENT HUB PAGE ==== //
export const DeploymentHubPage: React.FC = () => {
    // Using a sample model for demonstration
    const [model] = useState<EvolutionNode>({
        id: `best-model-123`, generation: 34, parentId: 'gen33-node42',
        accuracy: 0.9812, loss: 0.043, energyScore: 88, modelType: 'CNN',
        layers: [{ type: 'Conv2D', filters: 64 }, {type: 'Dense', neurons: 10}],
        hyperparameters: { learning_rate: 0.0005, optimizer: 'Adam', epochs: 50, batch_size: 128, dropout: 0.1 },
        timestamp: Date.now()
    });
    
    const [platform, setPlatform] = useState<'FastAPI' | 'ONNX' | 'TFLite'>('FastAPI');
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await geminiService.generateDeploymentScript(model, platform);
        setScript(result.replace(/```(python|bash)?\n/g, '').replace(/```/g, '').trim());
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Deployment Hub</h1>
            <p className="text-slate-400 mb-8">Export your trained models as APIs or portable formats.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <h2 className="text-2xl font-semibold mb-4 text-pink-300">Selected Model</h2>
                        <p><strong className="text-slate-300">ID:</strong> <span className="font-mono">{model.id}</span></p>
                        <p><strong className="text-slate-300">Type:</strong> {model.modelType}</p>
                        <p><strong className="text-slate-300">Accuracy:</strong> <span className="font-bold text-green-400">{(model.accuracy * 100).toFixed(2)}%</span></p>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">Export Options</h3>
                            <div className="flex space-x-2">
                                {(['FastAPI', 'ONNX', 'TFLite'] as const).map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => setPlatform(p)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${platform === p ? 'bg-pink-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-6 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors">
                            {isLoading ? 'Generating Script...' : `Generate ${platform} Script`}
                        </button>
                    </Card>
                </div>
                <div>
                    <Card className="h-full">
                        <h2 className="text-2xl font-semibold mb-4 text-pink-300">Generated Script</h2>
                        {isLoading && <div className="flex justify-center items-center h-64"><Spinner /></div>}
                        {!isLoading && script && <CodeBlock code={script} language="python" />}
                        {!isLoading && !script && <p className="text-slate-400">Your deployment script will appear here.</p>}
                    </Card>
                </div>
            </div>
        </div>
    );
};

// ==== RESEARCH ASSISTANT PAGE ==== //
export const ResearchAssistantPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        const responseText = await geminiService.getResearchAssistantResponse(input);
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h1 className="text-4xl font-bold text-white mb-2">AI Research Assistant</h1>
                <p className="text-slate-400 mb-4">Your personal guide to the world of deep learning.</p>
            </div>
            
            <Card className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-800' : 'bg-slate-700'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-700 p-3 rounded-lg flex items-center space-x-2">
                               <Spinner size="sm" />
                               <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex-shrink-0 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about architectures, concepts, or results..."
                        className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        Send
                    </button>
                </div>
            </Card>
        </div>
    );
};
