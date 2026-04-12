import { NextResponse } from "next/server";
import { Client } from "@vatel/sdk";

function createClient() {
    return new Client({
        getToken: () => {
            const token = process.env.VATEL_API_KEY;
            if (!token) throw new Error("VATEL_API_KEY required");
            return token;
        },
        baseUrl: process.env.VATEL_API_URL || undefined,
    });
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createClient();
        const result = await client.downloadCallRecording(id);

        if (result.status === 200 && result.arrayBuffer) {
            return new NextResponse(result.arrayBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "audio/wav",
                    "Content-Disposition": `attachment; filename="call-${id}.wav"`,
                },
            });
        }

        return NextResponse.json(
            { error: result.error || "Recording not available" },
            { status: result.status }
        );
    } catch (error) {
        console.error("Failed to download recording:", error);
        return NextResponse.json(
            { error: "Failed to download recording" },
            { status: 500 }
        );
    }
}
