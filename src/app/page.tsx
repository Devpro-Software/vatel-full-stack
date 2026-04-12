"use client";

import { useEffect, useState, useCallback } from "react";
import type { Agent, AgentCreateInput } from "@vatel/sdk";
import { listAgents, createAgent, deleteAgent } from "@/lib/actions";
import { AgentCard } from "@/components/agent-card";
import { CreateAgentDialog } from "@/components/create-agent-dialog";
import { DeleteAgentDialog } from "@/components/delete-agent-dialog";
import { VoiceSession } from "@/components/voice-session";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bot } from "lucide-react";

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
    const [callDialogOpen, setCallDialogOpen] = useState(false);
    const [agentToCall, setAgentToCall] = useState<Agent | null>(null);

    const loadAgents = useCallback(async () => {
        try {
            const data = await listAgents();
            setAgents(data);
        } catch (err) {
            console.error("Failed to load agents:", err);
            toast.error("Failed to load agents");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAgents();
    }, [loadAgents]);

    const handleCreateAgent = async (data: AgentCreateInput) => {
        try {
            await createAgent(data);
            toast.success("Agent created successfully");
            loadAgents();
        } catch (err) {
            console.error("Failed to create agent:", err);
            toast.error("Failed to create agent");
            throw err;
        }
    };

    const handleDeleteClick = (id: string) => {
        const agent = agents.find((a) => a.id === id);
        if (agent) {
            setAgentToDelete(agent);
            setDeleteDialogOpen(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!agentToDelete?.id) return;

        try {
            await deleteAgent(agentToDelete.id);
            toast.success("Agent deleted successfully");
            setDeleteDialogOpen(false);
            setAgentToDelete(null);
            loadAgents();
        } catch (err) {
            console.error("Failed to delete agent:", err);
            toast.error("Failed to delete agent");
        }
    };

    const handleCallClick = (id: string) => {
        const agent = agents.find((a) => a.id === id);
        if (agent) {
            setAgentToCall(agent);
            setCallDialogOpen(true);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">AI Agents</h1>
                    <p className="text-muted-foreground">
                        Create and manage your AI voice agents
                    </p>
                </div>
                <CreateAgentDialog onCreate={handleCreateAgent} />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card p-6">
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-full mb-4" />
                            <Skeleton className="h-4 w-20 mb-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            ) : agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-6 mb-6">
                        <Bot className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No agents yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Create your first AI voice agent to start building your business
                        on our platform.
                    </p>
                    <CreateAgentDialog onCreate={handleCreateAgent} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onDelete={handleDeleteClick}
                            onCall={handleCallClick}
                        />
                    ))}
                </div>
            )}

            <DeleteAgentDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                agentName={agentToDelete?.name}
            />

            {agentToCall?.id && (
                <VoiceSession
                    agentId={agentToCall.id}
                    agentName={agentToCall.name || "Agent"}
                    open={callDialogOpen}
                    onOpenChange={setCallDialogOpen}
                />
            )}
        </div>
    );
}
