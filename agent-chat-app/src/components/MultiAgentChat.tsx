import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Message } from '@langchain/langgraph-sdk';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface MultiAgentChatProps {
  onAgentInteraction: (agentId: string, message: string) => void;
  messages: Message[];
}

export function MultiAgentChat({ onAgentInteraction, messages }: MultiAgentChatProps) {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'agent1', name: 'Research Agent', role: 'Researcher', isActive: true },
    { id: 'agent2', name: 'Analysis Agent', role: 'Analyzer', isActive: true },
    { id: 'agent3', name: 'Summary Agent', role: 'Summarizer', isActive: true }
  ]);

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');

  const addAgent = () => {
    if (!newAgentName || !newAgentRole) {
      toast.error('Please provide both name and role for the new agent');
      return;
    }

    const newAgent: Agent = {
      id: `agent${agents.length + 1}`,
      name: newAgentName,
      role: newAgentRole,
      isActive: true
    };

    setAgents([...agents, newAgent]);
    setNewAgentName('');
    setNewAgentRole('');
    toast.success('New agent added successfully!');
  };

  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, isActive: !agent.isActive }
        : agent
    ));
  };

  const initiateAgentInteraction = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !agent.isActive) return;

    // Get the last message from the chat
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // Create a context-aware prompt for the agent based on its role
    let prompt = '';
    switch (agent.role.toLowerCase()) {
      case 'researcher':
        prompt = `As a researcher, analyze the following and provide detailed insights: ${lastMessage.content}`;
        break;
      case 'analyzer':
        prompt = `As an analyzer, evaluate the implications of: ${lastMessage.content}`;
        break;
      case 'summarizer':
        prompt = `As a summarizer, provide a concise summary of: ${lastMessage.content}`;
        break;
      default:
        prompt = `As ${agent.role}, respond to: ${lastMessage.content}`;
    }

    onAgentInteraction(agentId, prompt);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Multi-Agent System</h3>
      
      {/* Active Agents */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Active Agents</h4>
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center justify-between gap-2 p-2 border rounded">
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-gray-500">{agent.role}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={agent.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAgent(agent.id)}
              >
                {agent.isActive ? 'Active' : 'Inactive'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => initiateAgentInteraction(agent.id)}
                disabled={!agent.isActive}
              >
                Engage
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Agent */}
      <div className="flex flex-col gap-2 mt-4">
        <h4 className="text-sm font-medium">Add New Agent</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Agent Name"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
          />
          <Input
            placeholder="Agent Role"
            value={newAgentRole}
            onChange={(e) => setNewAgentRole(e.target.value)}
          />
          <Button onClick={addAgent}>Add</Button>
        </div>
      </div>
    </div>
  );
} 