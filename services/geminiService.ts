
import { GoogleGenAI, Chat } from "@google/genai";
import { EvolutionNode, Layer } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this project, we assume the key is set in the environment.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

export const explainArchitecture = async (node: EvolutionNode): Promise<string> => {
  const layerDescriptions = node.layers.map((l: Layer) => {
    return `- Type: ${l.type}, Config: ${JSON.stringify(l, (key, value) => key === 'type' ? undefined : value)}`;
  }).join('\n');

  const prompt = `
    Analyze the following neural network architecture and provide a concise, human-readable explanation. 
    Focus on its potential strengths, weaknesses, and ideal use cases. Explain the design choices.

    **Architecture Details:**
    - Model Type: ${node.modelType}
    - Accuracy: ${(node.accuracy * 100).toFixed(2)}%
    - Layers:
    ${layerDescriptions}

    **Hyperparameters:**
    - Optimizer: ${node.hyperparameters.optimizer}
    - Learning Rate: ${node.hyperparameters.learning_rate}

    **Explanation:**
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining architecture:", error);
    return "An error occurred while analyzing the architecture. Please check the console for details.";
  }
};

export const generateDeploymentScript = async (node: EvolutionNode, platform: 'FastAPI' | 'ONNX' | 'TFLite'): Promise<string> => {
  const prompt = `
    Generate a deployment script for a trained ${node.modelType} model for the "${platform}" platform.
    The model has an accuracy of ${(node.accuracy * 100).toFixed(2)}%.
    Provide a complete, copy-pasteable code example.
    
    If FastAPI, create a simple endpoint that accepts appropriate input and returns a prediction.
    If ONNX, show how to export and then run inference with the ONNX runtime.
    If TFLite, show the conversion process from a saved model.

    Assume the model is saved in a file named 'model.h5'.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating deployment script:", error);
    return "Failed to generate deployment script. The model may be too complex or an API error occurred.";
  }
};


let chat: Chat | null = null;

export const getResearchAssistantResponse = async (message: string): Promise<string> => {
    if (!chat) {
        chat = ai.chats.create({
            model,
            config: {
                systemInstruction: `You are a world-class AI research assistant integrated into the Neural Genesis platform. 
                Your purpose is to help users understand complex deep learning concepts, interpret model results, and brainstorm ideas.
                Be concise, accurate, and helpful. Format your answers with markdown.`
            },
        });
    }

    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error with research assistant:", error);
        return "I'm sorry, I encountered an error. Please try again.";
    }
};
