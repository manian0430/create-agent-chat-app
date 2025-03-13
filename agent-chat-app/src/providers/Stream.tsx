import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryParam, StringParam } from "use-query-params";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiKey } from "@/lib/api-key";
import { useThreads } from "./Thread";
import { toast } from "sonner";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { ExportChat } from "@/components/ExportChat";
import { MultiAgentChat } from "@/components/MultiAgentChat";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryParam("threadId", StringParam);
  const { getThreads, setThreads } = useThreads();
  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event, options) => {
      options.mutate((prev) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    },
    onThreadId: (id) => {
      setThreadId(id);
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  const handleAgentInteraction = async (agentId: string, message: string) => {
    try {
      const newMessage: Message = {
        id: agentId,
        type: "human",
        content: message,
      };

      await streamValue.submit(
        { messages: [...streamValue.messages, newMessage] },
        {
          streamMode: ["values"],
          optimisticValues: (prev) => ({
            ...prev,
            messages: [...(prev.messages ?? []), newMessage],
          }),
        }
      );

      toast.success(`${agentId} has processed the message`);
    } catch (error) {
      toast.error(`Failed to process message with ${agentId}`);
      console.error('Agent interaction error:', error);
    }
  };

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code> and
              your API key is correctly set (if connecting to a deployed graph).
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl]);

  return (
    <StreamContext.Provider value={streamValue}>
      <div className="flex flex-col gap-4">
        <MultiAgentChat 
          messages={streamValue.messages} 
          onAgentInteraction={handleAgentInteraction}
        />
        {children}
      </div>
    </StreamContext.Provider>
  );
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [apiUrl, setApiUrl] = useQueryParam("apiUrl", StringParam);
  const [apiKey, _setApiKey] = useState(() => {
    return getApiKey();
  });

  const setApiKey = (key: string) => {
    _setApiKey(key);
  };

  const [assistantId, setAssistantId] = useQueryParam(
    "assistantId",
    StringParam,
  );

  if (!apiUrl || !assistantId) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex flex-col border bg-background shadow-lg rounded-lg max-w-3xl">
          <div className="flex flex-col gap-2 mt-14 p-6 border-b">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start flex-col gap-2">
                <LangGraphLogoSVG className="h-7" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Agent Chat
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground">
              Welcome to Agent Chat! Before you get started, you need to enter
              the URL of the deployment and the assistant / graph ID.
            </p>
          </div>

          <form
            className="p-6 flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const url = formData.get("apiUrl")?.toString();
              const id = formData.get("assistantId")?.toString();
              const key = formData.get("apiKey")?.toString();

              if (!url || !id) return;

              setApiUrl(url);
              setAssistantId(id);
              if (key) setApiKey(key);
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiUrl">Deployment URL</Label>
              <Input
                id="apiUrl"
                name="apiUrl"
                defaultValue={apiUrl ?? ""}
                className="bg-background"
                placeholder="http://localhost:8000"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="assistantId">Assistant / Graph ID</Label>
              <Input
                id="assistantId"
                name="assistantId"
                defaultValue={assistantId ?? ""}
                className="bg-background"
                placeholder="assistant_12345"
              />
            </div>

            <ApiKeyManager 
              onApiKeyChange={setApiKey}
              initialKey={apiKey ?? ""}
            />

            <div className="flex justify-end mt-2">
              <Button type="submit" size="lg">
                Continue
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <StreamSession apiKey={apiKey} apiUrl={apiUrl} assistantId={assistantId}>
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
