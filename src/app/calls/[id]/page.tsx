"use client";

import { useEffect, useState, useCallback, use } from "react";
import type { Call } from "@vatel/sdk";
import { getCall } from "@/lib/actions";
import { RecordingPlayer } from "@/components/recording-player";
import { CallTranscript } from "@/components/call-transcript";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Clock, Phone, Calendar } from "lucide-react";
import Link from "next/link";

function formatDuration(seconds?: number): string {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} min ${secs} sec`;
}

function formatDate(dateString?: string): string {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
}

export default function CallDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [call, setCall] = useState<Call | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadCall = useCallback(async () => {
        try {
            const data = await getCall(id);
            console.log(data);
            setCall(data);
        } catch (err) {
            console.error("Failed to load call:", err);
            toast.error("Failed to load call details");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCall();
    }, [loadCall]);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!call) {
        return (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Call not found</p>
                    <Link href="/calls" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-4">
                        Back to Calls
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/calls" className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Call Details</h1>
                        <Badge
                            variant={
                                call.status === "ended" ? "default" : "secondary"
                            }
                        >
                            {call.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {call.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">
                                    {formatDuration(call.duration_seconds)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Source</p>
                                <p className="font-medium">{call.source || "web"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Started</p>
                                <p className="font-medium">
                                    {formatDate(call.started_at)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Call Content</CardTitle>
                    <CardDescription>
                        Recording and transcript from this call
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="recording">
                        <TabsList className="mb-4">
                            <TabsTrigger value="recording">Recording</TabsTrigger>
                            <TabsTrigger value="transcript">Transcript</TabsTrigger>
                        </TabsList>
                        <TabsContent value="recording">
                            {call.id ? (
                                <RecordingPlayer key={call.id} callId={call.id} />
                            ) : (
                                <div className="flex items-center justify-center py-8 text-center">
                                    <p className="text-muted-foreground">
                                        No recording available for this call
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="transcript">
                            <div className="max-h-[400px] overflow-y-auto">
                                <CallTranscript transcript={call.transcript?.entries ?? []} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {call.party_number && (
                <>
                    <Separator className="my-6" />
                    <Card>
                        <CardHeader>
                            <CardTitle>Phone Number</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="text-sm text-muted-foreground">Party</p>
                                <p className="font-mono">{call.party_number}</p>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
