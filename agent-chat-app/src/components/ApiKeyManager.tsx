import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface ApiKeyManagerProps {
  onApiKeyChange: (key: string) => void;
  initialKey?: string;
}

export function ApiKeyManager({ onApiKeyChange, initialKey }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState(initialKey || '');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Validate API key format
    const validateApiKey = (key: string) => {
      return key.startsWith('lsv2_pt_') && key.length > 10;
    };

    setIsValid(validateApiKey(apiKey));
  }, [apiKey]);

  const handleSave = () => {
    if (isValid) {
      onApiKeyChange(apiKey);
      localStorage.setItem('lg:chat:apiKey', apiKey);
      toast.success('API Key saved successfully!');
    } else {
      toast.error('Invalid API Key format');
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('lg:chat:apiKey');
    onApiKeyChange('');
    toast.info('API Key cleared');
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">API Key Management</h3>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter LangSmith API Key (lsv2_pt_...)"
          className={`flex-1 ${isValid ? 'border-green-500' : apiKey ? 'border-red-500' : ''}`}
        />
        <Button onClick={handleSave} disabled={!isValid}>
          Save
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        {apiKey ? (
          isValid ? (
            '✅ Valid API key format'
          ) : (
            '❌ Invalid API key format - should start with lsv2_pt_'
          )
        ) : (
          'Enter your LangSmith API key to get started'
        )}
      </p>
    </div>
  );
} 