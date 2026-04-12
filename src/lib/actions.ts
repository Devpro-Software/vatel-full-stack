"use server";

import {
    Client,
    TRANSPORT_WEBRTC,
    type Agent,
    type AgentCreateInput,
    type AgentUpdateInput,
    type Call,
    type VoiceCatalogEntry,
    type PaginatedCallsResponse,
    type SessionTokenResponse,
    type LLMStringsResponse,
    type VoicesListResponse,
} from "@vatel/sdk";

function getToken() {
    const token = process.env.VATEL_API_KEY;
    if (!token) {
        throw new Error("VATEL_API_KEY environment variable is required");
    }
    return token;
}

function createClient() {
    return new Client({
        getToken,
        baseUrl: process.env.VATEL_API_URL || undefined,
    });
}

export async function listAgents(): Promise<Agent[]> {
    const client = createClient();
    const result = await client.listAgents();
    const data = result.data as Agent[] | { agents: Agent[] } | undefined;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ("agents" in data) return data.agents;
    return [];
}

export async function getAgent(id: string): Promise<Agent | null> {
    const client = createClient();
    const result = await client.getAgent(id);
    return result.data ?? null;
}

export async function createAgent(input: AgentCreateInput): Promise<Agent | null> {
    const client = createClient();
    const result = await client.createAgent(input);
    const agent = result.data ?? null;
    if (!agent?.id) {
        return agent;
    }

    const versionsResult = await client.listAgentGraphVersions(agent.id);
    const versions = versionsResult.data ?? [];
    const versionId = versions[0]?.id;
    if (versionId) {
        await client.publishAgentGraphVersion(agent.id, versionId);
    }

    return agent;
}

export async function updateAgent(id: string, input: AgentUpdateInput): Promise<Agent | null> {
    const client = createClient();
    const result = await client.patchAgent(id, input);
    return result.data ?? null;
}

export async function deleteAgent(id: string): Promise<void> {
    const client = createClient();
    await client.deleteAgent(id);
}

import type { ListCallsQuery } from "@vatel/sdk";

export async function listCalls(params: ListCallsQuery = {}): Promise<PaginatedCallsResponse> {
    const client = createClient();
    const result = await client.listCalls(params);
    return result.data ?? { calls: [], pagination: { page: 1, page_size: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } };
}

export async function getCall(id: string): Promise<Call | null> {
    const client = createClient();
    const result = await client.getCall(id);
    return result.data ?? null;
}

export async function generateSessionToken(
    agentId: string,
    options?: { prompt?: string; first_message?: string }
): Promise<SessionTokenResponse> {
    const client = createClient();
    const result = await client.generateSessionToken(agentId, {
        transport: TRANSPORT_WEBRTC,
        ...options,
    });
    return result.data ?? { token: "" };
}

export async function listVoices(): Promise<VoiceCatalogEntry[]> {
    const client = createClient();
    const result = await client.listVoices();
    const data = result.data as VoicesListResponse | undefined;
    return data?.voices ?? [];
}

export async function listLLMs(): Promise<string[]> {
    const client = createClient();
    const result = await client.listLLMs();
    const data = result.data as LLMStringsResponse | undefined;
    return data?.llms ?? [];
}
