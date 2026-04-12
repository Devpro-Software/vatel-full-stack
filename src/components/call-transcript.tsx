"use client";

import type { TranscriptEntry } from "@vatel/sdk";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Wrench } from "lucide-react";

interface CallTranscriptProps {
    transcript: TranscriptEntry[];
}

export function CallTranscript({ transcript }: CallTranscriptProps) {
    if (!transcript || transcript.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No transcript available</p>
            </div>
        );
    }

    const isAgent = (role?: string) => role === "assistant" || role === "agent";
    const isUser = (role?: string) => role === "user";

    return (
        <div className="space-y-4">
            {transcript.map((entry, index) => {
                if (entry.type === "tool_call" || entry.type === "tool_call_output") {
                    return (
                        <div
                            key={entry.index ?? index}
                            className="flex gap-3 items-start"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-amber-100 text-amber-700">
                                    <Wrench className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-amber-50 border border-amber-200">
                                <p className="text-xs font-medium text-amber-700 mb-1">
                                    {entry.type === "tool_call" ? "Tool Call" : "Tool Output"}
                                    {entry.toolCall?.toolName && `: ${entry.toolCall.toolName}`}
                                </p>
                                {entry.type === "tool_call" && entry.toolCall?.arguments && (
                                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                                        {entry.toolCall.arguments}
                                    </pre>
                                )}
                                {entry.type === "tool_call_output" && entry.toolCallOutput && (
                                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                                        {entry.toolCallOutput}
                                    </pre>
                                )}
                                {entry.createdAt && (
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(entry.createdAt).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                }

                if (entry.type === "interruption") {
                    return (
                        <div
                            key={entry.index ?? index}
                            className="flex justify-center"
                        >
                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                Interruption
                            </span>
                        </div>
                    );
                }

                return (
                    <div
                        key={entry.index ?? index}
                        className={`flex gap-3 ${isUser(entry.role) ? "flex-row-reverse" : ""}`}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback
                                className={
                                    isAgent(entry.role)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary"
                                }
                            >
                                {isAgent(entry.role) ? (
                                    <Bot className="h-4 w-4" />
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                isUser(entry.role)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            }`}
                        >
                            <p className="text-sm">{entry.message}</p>
                            {entry.createdAt && (
                                <p className="text-xs opacity-70 mt-1">
                                    {new Date(entry.createdAt).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
