"use client";

import { useEffect, useRef, useState } from "react";
import { WebRTCSession } from "@vatel/sdk";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateSessionToken } from "@/lib/actions";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";

interface VoiceSessionProps {
    agentId: string;
    agentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface Message {
    id: string;
    role: "agent" | "user";
    text: string;
    timestamp: Date;
}

export function VoiceSession({
    agentId,
    agentName,
    open,
    onOpenChange,
}: VoiceSessionProps) {
    const [state, setState] = useState<ConnectionState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const sessionRef = useRef<WebRTCSession | null>(null);
    const connectingRef = useRef(false);
    const audioContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const destroySession = () => {
        if (sessionRef.current) {
            sessionRef.current.disconnect();
            sessionRef.current = null;
        }
        connectingRef.current = false;
    };

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const startSession = async () => {
            if (connectingRef.current || sessionRef.current) return;

            connectingRef.current = true;
            setState("connecting");
            setError(null);
            setMessages([]);

            try {
                const tokenResponse = await generateSessionToken(agentId);

                if (cancelled) return;

                const session = new WebRTCSession({
                    remoteAudioContainer: audioContainerRef.current || undefined,
                });

                session.on("input_audio_transcript", (data) => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            role: "user",
                            text: data.data?.transcript || "",
                            timestamp: new Date(),
                        },
                    ]);
                });

                session.on("response_text", (data) => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            role: "agent",
                            text: data.data?.text || "",
                            timestamp: new Date(),
                        },
                    ]);
                });

                session.on("disconnected", () => {
                    setState("disconnected");
                    connectingRef.current = false;
                });

                await session.connect({
                    token: tokenResponse.token,
                    url: tokenResponse.url,
                    room: tokenResponse.room,
                });

                if (cancelled) {
                    session.disconnect();
                    return;
                }

                await session.start();
                await session.setMicrophoneEnabled(true);

                sessionRef.current = session;
                setState("connected");
            } catch (err) {
                if (cancelled) return;
                console.error("Failed to connect:", err);
                setError(err instanceof Error ? err.message : "Connection failed");
                setState("error");
                connectingRef.current = false;
            }
        };

        startSession();

        return () => {
            cancelled = true;
            destroySession();
        };
    }, [open, agentId]);

    const disconnect = () => {
        destroySession();
        setState("idle");
    };

    const toggleMic = async () => {
        if (sessionRef.current) {
            const newState = !micEnabled;
            await sessionRef.current.setMicrophoneEnabled(newState);
            setMicEnabled(newState);
        }
    };

    const handleClose = () => {
        disconnect();
        setMessages([]);
        setError(null);
        onOpenChange(false);
    };

    const reconnect = async () => {
        if (connectingRef.current) return;

        destroySession();
        connectingRef.current = true;
        setState("connecting");
        setError(null);
        setMessages([]);

        try {
            const tokenResponse = await generateSessionToken(agentId);

            const session = new WebRTCSession({
                remoteAudioContainer: audioContainerRef.current || undefined,
            });

            session.on("input_audio_transcript", (data) => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: "user",
                        text: data.data?.transcript || "",
                        timestamp: new Date(),
                    },
                ]);
            });

            session.on("response_text", (data) => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: "agent",
                        text: data.data?.text || "",
                        timestamp: new Date(),
                    },
                ]);
            });

            session.on("disconnected", () => {
                setState("disconnected");
                connectingRef.current = false;
            });

            await session.connect({
                token: tokenResponse.token,
                url: tokenResponse.url,
                room: tokenResponse.room,
            });

            await session.start();
            await session.setMicrophoneEnabled(true);

            sessionRef.current = session;
            setState("connected");
        } catch (err) {
            console.error("Failed to connect:", err);
            setError(err instanceof Error ? err.message : "Connection failed");
            setState("error");
            connectingRef.current = false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5" />
                        Call with {agentName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <Badge
                        variant={
                            state === "connected"
                                ? "default"
                                : state === "connecting"
                                ? "secondary"
                                : state === "error"
                                ? "destructive"
                                : "outline"
                        }
                    >
                        {state === "idle" && "Ready"}
                        {state === "connecting" && "Connecting..."}
                        {state === "connected" && "Connected"}
                        {state === "disconnected" && "Disconnected"}
                        {state === "error" && "Error"}
                    </Badge>
                    {error && (
                        <span className="text-sm text-destructive">{error}</span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-muted/30 space-y-3">
                    {messages.length === 0 && state === "connected" && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Start speaking to interact with the agent...
                        </p>
                    )}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background border"
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div ref={audioContainerRef} className="hidden" />

                <div className="flex justify-center gap-4 pt-4">
                    <Button
                        variant={micEnabled ? "default" : "destructive"}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={toggleMic}
                        disabled={state !== "connected"}
                    >
                        {micEnabled ? (
                            <Mic className="h-6 w-6" />
                        ) : (
                            <MicOff className="h-6 w-6" />
                        )}
                    </Button>
                    {state === "connected" || state === "connecting" ? (
                        <Button
                            variant="destructive"
                            size="lg"
                            className="rounded-full h-14 w-14"
                            onClick={handleClose}
                        >
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="lg"
                            className="rounded-full h-14 w-14"
                            onClick={reconnect}
                        >
                            <Phone className="h-6 w-6" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
