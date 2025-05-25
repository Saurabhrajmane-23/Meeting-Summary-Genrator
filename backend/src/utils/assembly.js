import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY,
});

export const transcribeAudioFile = async (audioUrl) => {
  try {
    // Create a transcript
    const transcript = await client.transcripts.create({
      audio_url: audioUrl,
      speaker_labels: true,
      auto_chapters: true,
    });

    // Wait for completion
    while (transcript.status !== "completed" && transcript.status !== "error") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const polledTranscript = await client.transcripts.get(transcript.id);
      if (
        polledTranscript.status === "completed" ||
        polledTranscript.status === "error"
      ) {
        return polledTranscript;
      }
    }

    return transcript;
  } catch (error) {
    console.error("AssemblyAI transcription error:", error);
    throw error;
  }
};
