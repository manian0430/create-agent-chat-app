import React from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Message } from '@langchain/langgraph-sdk';
import { toast } from 'sonner';

interface ExportChatProps {
  messages: Message[];
}

export function ExportChat({ messages }: ExportChatProps) {
  const exportToJson = () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        messages: messages.map(msg => ({
          type: msg.type,
          content: msg.content,
          timestamp: new Date().toISOString()
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Chat exported successfully!');
    } catch (error) {
      toast.error('Failed to export chat');
      console.error('Export error:', error);
    }
  };

  const exportToText = () => {
    try {
      const textContent = messages
        .map(msg => `[${msg.type.toUpperCase()}]: ${msg.content}`)
        .join('\n\n');

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-export-${new Date().toISOString()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Chat exported successfully!');
    } catch (error) {
      toast.error('Failed to export chat');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJson}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToText}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export Text
      </Button>
    </div>
  );
} 