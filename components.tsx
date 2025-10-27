import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EvolutionNode } from './types';

// ==== ICONS ==== //
// Using React.FC for component type with props, defining SVG elements directly.

interface IconProps {
  className?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export const EvolutionIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l-5 5M21 3l-6 6" />
    </svg>
);

export const LibraryIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

export const DeployIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const AssistantIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


// ==== Card Component ==== //

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-gray-900/50 border border-slate-800 rounded-lg shadow-lg backdrop-blur-sm p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);


// ==== Spinner Component ==== //

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-slate-700 border-t-cyan-400`}></div>
  );
};

// ==== MetricsChart Component ==== //

interface MetricsChartProps {
    nodes: EvolutionNode[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ nodes }) => {
    const chartData = nodes.map(node => ({
        name: `G${node.generation}`,
        accuracy: node.accuracy,
        loss: node.loss,
    }));
    
    // Get best accuracy for each generation
    const bestAccuracyPerGen = Array.from(
        nodes.reduce((acc, node) => {
            const existing = acc.get(node.generation);
            if (!existing || node.accuracy > existing.accuracy) {
                acc.set(node.generation, node);
            }
            return acc;
        }, new Map<number, EvolutionNode>()).values()
    // Fix: Add explicit type annotation for 'node' to resolve TypeScript inference issue.
    ).map((node: EvolutionNode) => ({
        generation: node.generation,
        'Best Accuracy': node.accuracy,
        loss: node.loss
    })).sort((a,b) => a.generation - b.generation);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bestAccuracyPerGen} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="generation" stroke="#9ca3af" tickFormatter={(tick) => `G${tick}`} />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        borderColor: '#374151',
                    }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Best Accuracy" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#f472b6" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
};

// ==== CodeBlock Component ==== //

interface CodeBlockProps {
    code: string;
    language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    return (
        <div className="bg-gray-900 rounded-md my-4">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
                <span className="text-sm font-semibold text-gray-400">{language}</span>
                <button 
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Copy
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
                <code className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};
