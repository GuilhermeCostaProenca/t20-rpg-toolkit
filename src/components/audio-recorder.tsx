"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";

import { useAppFeedback } from "@/components/app-feedback-provider";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
}

export function AudioRecorder({ onTranscriptionComplete, className }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { notifyError } = useAppFeedback();

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleTranscribe(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or error", error);
      notifyError("Erro ao acessar microfone.", "Permita o acesso ao microfone e tente novamente.", true);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function handleTranscribe(audioBlob: Blob) {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro na transcricao");

      const data = await res.json();
      if (data.text) {
        onTranscriptionComplete(data.text);
      }
    } catch (error) {
      console.error(error);
      notifyError("Falha ao transcrever audio.", "Tente novamente em alguns segundos.", true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={className}>
      {!isRecording && !processing && (
        <Button variant="outline" size="icon" onClick={startRecording} title="Gravar voz">
          <Mic className="h-4 w-4" />
        </Button>
      )}

      {isRecording && (
        <Button variant="destructive" size="icon" onClick={stopRecording} className="animate-pulse">
          <Square className="h-4 w-4" />
        </Button>
      )}

      {processing && (
        <Button variant="ghost" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </Button>
      )}
    </div>
  );
}
