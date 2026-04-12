"use client";

import { useEffect, useState } from "react";
import type {
    Agent,
    AgentCreateInput,
    AgentUpdateInput,
    VoiceCatalogEntry,
} from "@vatel/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { listVoices, listLLMs } from "@/lib/actions";

interface AgentFormProps {
    agent?: Agent;
    onSubmit: (data: AgentCreateInput | AgentUpdateInput) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AgentForm({
    agent,
    onSubmit,
    onCancel,
    isLoading,
}: AgentFormProps) {
    const [name, setName] = useState(agent?.name || "");
    const [prompt, setPrompt] = useState(agent?.prompt || "");
    const [firstMessage, setFirstMessage] = useState(agent?.first_message || "");
    const [language, setLanguage] = useState(agent?.default_language || "en");
    const [voiceId, setVoiceId] = useState(agent?.voice_settings?.id || "");
    const [llm, setLlm] = useState(agent?.llm || "");
    const [voices, setVoices] = useState<VoiceCatalogEntry[]>([]);
    const [llms, setLLMs] = useState<string[]>([]);

    useEffect(() => {
        listVoices()
            .then(setVoices)
            .catch((err) => console.error("Failed to load voices:", err));
        listLLMs()
            .then(setLLMs)
            .catch((err) => console.error("Failed to load LLMs:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedVoice = voices.find((v) => v.id === voiceId);
        const voiceSettings =
            voiceId && selectedVoice
                ? { id: voiceId, provider: selectedVoice.provider }
                : undefined;

        const payload: AgentCreateInput | AgentUpdateInput = {
            name,
            prompt: prompt || undefined,
            first_message: firstMessage || undefined,
            default_language: language || undefined,
            llm: llm || undefined,
        };

        if (agent) {
            if (voiceSettings && voiceId !== agent.voice_settings?.id) {
                payload.voice_settings = voiceSettings;
            }
        } else if (voiceSettings) {
            payload.voice_settings = voiceSettings;
        }

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My AI Agent"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    rows={6}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="firstMessage">First Message</Label>
                <Textarea
                    id="firstMessage"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="Hello! How can I help you today?"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v || "en")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="voice">Voice</Label>
                    <Select value={voiceId} onValueChange={(v) => setVoiceId(v || "")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {voices.map((voice) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                    {voice.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="llm">LLM Model</Label>
                    <Select value={llm} onValueChange={(v) => setLlm(v || "")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {llms.map((llmId) => (
                                <SelectItem key={llmId} value={llmId}>
                                    {llmId}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !name}>
                    {isLoading ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
                </Button>
            </div>
        </form>
    );
}
