import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateMeetingSummary = async (transcript) => {
  try {
    const prompt = `Analyze this transcript and provide a clear, structured summary using the following format:

    SUMMARY
    --------------

    KEY POINTS:
    • [List the main points discussed]

    DECISIONS MADE: (if any)
    • [List all decisions reached during the meeting]

    ACTION ITEMS: (if any)
    • [Task] - Assigned to: [Name] (Due: [Date])
    • [Task] - Assigned to: [Name] (Due: [Date])

    FOLLOW-UP TASKS: (if any)
    • [List any follow-up tasks or next steps]

    CONCLUSION:
    • [Summarize the overall conclusion of the transcript]

    ADDITIONAL NOTES:
    • [Any other relevant notes or comments]

    Please use bullet points and maintain clear formatting.
    Make the summary concise but comprehensive.
    If any dates or assignees are mentioned, include them with the relevant tasks.

    Transcript:
    ${transcript}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
