"use client";

import { useEffect, useState, useCallback } from "react";
import type { Call } from "@vatel/sdk";
import type { PaginatedCallsResponse, ListCallsQuery, CallStatus } from "@vatel/sdk";
import { listCalls } from "@/lib/actions";
import { CallHistoryTable } from "@/components/call-history-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function CallsPage() {
    const [calls, setCalls] = useState<Call[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const loadCalls = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: ListCallsQuery = {
                page,
                page_size: 10,
            };
            if (search) params.search = search;
            if (statusFilter && statusFilter !== "all") params.status = statusFilter as CallStatus;

            const data: PaginatedCallsResponse = await listCalls(params);
            setCalls(data.calls || []);
            setTotalPages(data.pagination?.total_pages || 1);
        } catch (err) {
            console.error("Failed to load calls:", err);
            toast.error("Failed to load calls");
        } finally {
            setIsLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        loadCalls();
    }, [loadCalls]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadCalls();
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Call History</h1>
                <p className="text-muted-foreground">
                    View and manage your call recordings
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search calls..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="started">Started</SelectItem>
                        <SelectItem value="connected">Connected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <CallHistoryTable calls={calls} isLoading={isLoading} />

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
