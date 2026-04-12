"use client";

import type { Agent } from "@vatel/sdk";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Phone, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AgentCardProps {
    agent: Agent;
    onDelete: (id: string) => void;
    onCall: (id: string) => void;
}

export function AgentCard({ agent, onDelete, onCall }: AgentCardProps) {
    const router = useRouter();

    return (
        <Card className="group relative transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {agent.prompt
                                ? agent.prompt.substring(0, 100) +
                                  (agent.prompt.length > 100 ? "..." : "")
                                : "No prompt configured"}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground">
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => agent.id && router.push(`/agents/${agent.id}`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => agent.id && onDelete(agent.id)}
                                variant="destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    {agent.default_language && (
                        <Badge variant="secondary">{agent.default_language}</Badge>
                    )}
                    {agent.voice_settings?.id && (
                        <Badge variant="outline">Voice configured</Badge>
                    )}
                </div>
                <Button
                    onClick={() => agent.id && onCall(agent.id)}
                    className="w-full"
                    variant="default"
                    disabled={!agent.id}
                >
                    <Phone className="mr-2 h-4 w-4" />
                    Start Call
                </Button>
            </CardContent>
        </Card>
    );
}
