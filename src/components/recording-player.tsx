"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import type WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
    CircleAlert,
    Download,
    Loader2,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from "lucide-react";

interface RecordingPlayerProps {
    callId: string;
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RecordingPlayer({ callId }: RecordingPlayerProps) {
    const wsRef = useRef<WaveSurfer | null>(null);
    const [ready, setReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recordingUrl = `/api/calls/${callId}/recording`;

    const waveStyle = useMemo(
        () => ({
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            barHeight: 0.88,
            waveColor: "oklch(0.78 0 0)",
            progressColor: "oklch(0.32 0 0)",
            cursorColor: "oklch(0.18 0 0)",
            cursorWidth: 2,
            height: 80,
            dragToSeek: true,
            normalize: true,
        }),
        []
    );

    const handleReady = useCallback((ws: WaveSurfer, dur: number) => {
        wsRef.current = ws;
        setDuration(dur);
        setCurrentTime(0);
        setVolume(ws.getVolume());
        setMuted(ws.getMuted());
        setReady(true);
    }, []);

    const handlePlayPause = () => {
        void wsRef.current?.playPause();
    };

    const handleSeek = (value: number[]) => {
        const ws = wsRef.current;
        if (!ws || !duration) return;
        ws.setTime(value[0]);
        setCurrentTime(value[0]);
    };

    const handleVolume = (value: number[]) => {
        const ws = wsRef.current;
        if (!ws) return;
        const v = value[0];
        ws.setVolume(v);
        if (v > 0 && ws.getMuted()) ws.setMuted(false);
        setVolume(v);
        setMuted(ws.getMuted());
    };

    const toggleMute = () => {
        const ws = wsRef.current;
        if (!ws) return;
        const next = !ws.getMuted();
        ws.setMuted(next);
        setMuted(next);
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = recordingUrl;
        link.download = `call-${callId}.wav`;
        link.click();
    };

    if (error) {
        return (
            <div
                className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3.5 text-destructive"
                role="alert"
            >
                <CircleAlert className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
                <p className="text-sm leading-snug">{error}</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm",
                "ring-1 ring-foreground/[0.04]"
            )}
        >
            <div className="relative min-h-[80px] w-full">
                {!ready && (
                    <div className="absolute inset-0 z-[1] flex items-center justify-center rounded-lg bg-muted/60">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
                    </div>
                )}
                <WavesurferPlayer
                    key={callId}
                    url={recordingUrl}
                    {...waveStyle}
                    onReady={handleReady}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onFinish={() => setIsPlaying(false)}
                    onTimeupdate={(_ws, t) => setCurrentTime(t)}
                    onError={() => setError("Recording not available")}
                />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="size-10 shrink-0 rounded-full"
                        disabled={!ready}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        onClick={handlePlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="size-4 fill-current" />
                        ) : (
                            <Play className="size-4 translate-x-px fill-current" />
                        )}
                    </Button>
                    <span className="min-w-[5.5rem] tabular-nums text-sm text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <Slider
                    value={[currentTime]}
                    max={duration || 1}
                    step={0.05}
                    disabled={!ready || !duration}
                    onValueChange={handleSeek}
                    className="flex-1"
                />

                <div className="flex shrink-0 items-center gap-2 sm:max-w-[200px]">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-muted-foreground"
                        disabled={!ready}
                        aria-label={muted ? "Unmute" : "Mute"}
                        onClick={toggleMute}
                    >
                        {muted ? (
                            <VolumeX className="size-4" />
                        ) : (
                            <Volume2 className="size-4" />
                        )}
                    </Button>
                    <Slider
                        value={[muted ? 0 : volume]}
                        max={1}
                        step={0.02}
                        disabled={!ready}
                        onValueChange={handleVolume}
                        className="w-24 flex-1 sm:w-28"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0"
                        disabled={!ready}
                        aria-label="Download recording"
                        onClick={handleDownload}
                    >
                        <Download className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
