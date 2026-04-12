"use client";

import type { Call } from "@vatel/sdk";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import Link from "next/link";

interface CallHistoryTableProps {
    calls: Call[];
    isLoading?: boolean;
}

function formatDuration(seconds?: number): string {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

function formatDate(dateString?: string): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getStatusVariant(
    status?: string
): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "ended":
            return "default";
        case "in_progress":
        case "connected":
        case "started":
            return "secondary";
        case "auth_failed":
            return "destructive";
        default:
            return "outline";
    }
}

export function CallHistoryTable({ calls, isLoading }: CallHistoryTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading calls...</p>
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Phone className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No calls yet</p>
                <p className="text-sm text-muted-foreground">
                    Calls will appear here once you start making them.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calls.map((call, index) => (
                        <TableRow key={call.id || index}>
                            <TableCell>
                                {call.outbound ? (
                                    <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {call.agent_id?.slice(0, 8) || "-"}...
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(call.status)}>
                                    {call.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                            <TableCell>
                                <span className="text-muted-foreground">
                                    {call.source || "web"}
                                </span>
                            </TableCell>
                            <TableCell>{formatDate(call.started_at)}</TableCell>
                            <TableCell>
                                <Link
                                    href={`/calls/${call.id}`}
                                    className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
