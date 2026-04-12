"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AgentForm } from "./agent-form";
import type { AgentCreateInput, AgentUpdateInput } from "@vatel/sdk";
import { Plus } from "lucide-react";

interface CreateAgentDialogProps {
    onCreate: (data: AgentCreateInput) => Promise<void>;
}

export function CreateAgentDialog({ onCreate }: CreateAgentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: AgentCreateInput | AgentUpdateInput) => {
        setIsLoading(true);
        try {
            await onCreate(data as AgentCreateInput);
            setOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Agent</DialogTitle>
                </DialogHeader>
                <AgentForm
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
