"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import type { Agent, AgentUpdateInput } from "@vatel/sdk";
import { getAgent, updateAgent, deleteAgent } from "@/lib/actions";
import { AgentForm } from "@/components/agent-form";
import { DeleteAgentDialog } from "@/components/delete-agent-dialog";
import { VoiceSession } from "@/components/voice-session";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Phone, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [callDialogOpen, setCallDialogOpen] = useState(false);

    const loadAgent = useCallback(async () => {
        try {
            const data = await getAgent(id);
            setAgent(data);
        } catch (err) {
            console.error("Failed to load agent:", err);
            toast.error("Failed to load agent");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadAgent();
    }, [loadAgent]);

    const handleUpdate = async (data: AgentUpdateInput) => {
        setIsSaving(true);
        try {
            const updated = await updateAgent(id, data);
            setAgent(updated);
            toast.success("Agent updated successfully");
        } catch (err) {
            console.error("Failed to update agent:", err);
            toast.error("Failed to update agent");
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAgent(id);
            toast.success("Agent deleted successfully");
            router.push("/");
        } catch (err) {
            console.error("Failed to delete agent:", err);
            toast.error("Failed to delete agent");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Agent not found</p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                        Back to Agents
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{agent.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            ID: {agent.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCallDialogOpen(true)}>
                        <Phone className="mr-2 h-4 w-4" />
                        Start Call
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agent Configuration</CardTitle>
                    <CardDescription>
                        Update your agent&apos;s settings and behavior
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AgentForm
                        agent={agent}
                        onSubmit={handleUpdate}
                        onCancel={() => router.push("/")}
                        isLoading={isSaving}
                    />
                </CardContent>
            </Card>

            <DeleteAgentDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                agentName={agent.name}
            />

            {agent.id && (
                <VoiceSession
                    agentId={agent.id}
                    agentName={agent.name || "Agent"}
                    open={callDialogOpen}
                    onOpenChange={setCallDialogOpen}
                />
            )}
        </div>
    );
}
