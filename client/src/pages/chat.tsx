import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Sparkles, User, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Message, Conversation, ChatResponse } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest<ChatResponse>("POST", "/api/chat", {
        message: content,
        conversationId: currentConversationId,
      });
    },
    onSuccess: (data) => {
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const newConversationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<Conversation>("POST", "/api/conversations", {
        title: "New Conversation",
      });
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSend = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const message = input.trim();
    setInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessageMutation.mutateAsync(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  const currentConversation = conversations?.find((c) => c.id === currentConversationId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations Sidebar - Desktop */}
      <div className="hidden md:flex w-64 border-r flex-col">
        <div className="p-4 border-b">
          <Button
            className="w-full"
            onClick={() => newConversationMutation.mutate()}
            disabled={newConversationMutation.isPending}
            data-testid="button-new-conversation"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`w-full text-left p-3 rounded-lg text-sm hover-elevate active-elevate-2 ${
                conv.id === currentConversationId ? "bg-accent" : ""
              }`}
              data-testid={`conversation-${conv.id}`}
            >
              <div className="font-medium truncate">{conv.title}</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {format(new Date(conv.updatedAt), "MMM d, h:mm a")}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {currentConversation?.title || "AstraMind"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Your intelligent assistant
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => newConversationMutation.mutate()}
            data-testid="button-new-conversation-mobile"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl p-6 space-y-6">
            {messagesLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : !messages || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Ask me anything! I can help you plan your day, set goals, learn new topics, or just have a chat.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover-elevate px-4 py-2"
                    onClick={() => setInput("Help me plan my day")}
                    data-testid="suggestion-plan-day"
                  >
                    Help me plan my day
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover-elevate px-4 py-2"
                    onClick={() => setInput("What should I focus on this week?")}
                    data-testid="suggestion-focus"
                  >
                    What should I focus on?
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover-elevate px-4 py-2"
                    onClick={() => setInput("Teach me something interesting")}
                    data-testid="suggestion-learn"
                  >
                    Teach me something
                  </Badge>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    data-testid={`message-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] space-y-2 ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <Card
                        className={`p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground border-primary"
                            : ""
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </Card>
                      <p className="text-xs text-muted-foreground font-mono px-1">
                        {format(new Date(message.createdAt), "h:mm a")}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                    </div>
                    <Card className="p-4 max-w-[80%]">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="resize-none min-h-[56px] max-h-32 rounded-xl text-base"
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending}
                size="icon"
                className="h-14 w-14 shrink-0 rounded-xl"
                data-testid="button-send-message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
