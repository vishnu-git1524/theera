import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({ apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY! })

function msToTime(ms: number) {
    const seconds = ms / 1000
    const minutes = Math.floor(seconds / 60)
    const remaningSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}: ${remaningSeconds.toString().padStart(2, '0')}`

}

export const processMeeting = async (meetingUrl: string) => {
    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true

    })

    const summaries = transcript.chapters?.map(chapter => ({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        summary: chapter.summary,
        gist: chapter.gist,
        headline: chapter.headline,
    })) || []
    if (!transcript.text) throw new Error("No transcript found")

    return {
        summaries
    }
}