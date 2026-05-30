import { collection } from "../db/rag.js";
// import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import db from "../database/meet.db.js";
import { meeting_start_time, meeting_end_time } from "../constants.js";
import getLLM from "../ai-workflows/chatModel.js";

const llm = getLLM()


dotenv.config();
var chunkMemory = {}; // [meet_id: [chunks]]
var sequence = {} // [meet_id: sequence_no]
var start_chunk_id = {} // [meet_id: start_chunk_id]

const summarizeChunk = async (chunk, meeting_id, chunk_id) => {
    chunkMemory[meeting_id] = chunkMemory[meeting_id] ? [...chunkMemory[meeting_id], chunk] : [chunk];
    start_chunk_id[meeting_id] = start_chunk_id[meeting_id] ? start_chunk_id[meeting_id] : chunk_id;
    if (chunkMemory[meeting_id].length >= 2) {
        sequence[meeting_id] = sequence[meeting_id] ? sequence[meeting_id] + 1 : 1;
        let summary_text = "";
        for (let i = 0; i < chunkMemory[meeting_id].length; i++) {
            summary_text += chunkMemory[meeting_id][i] + "\n";
        }
        console.log('summary text', summary_text)
        const summary = await llm.invoke(`
            Summarize the following text in under 20 words.
            Return only the summary sentence with no quotes, labels, markdown, or extra text.
            Text:
            ${summary_text}
        `);
        // console.log(summary['content'])
        try {
            // db.query(`INSERT INTO chunk_summaries (meeting_id,sequence_number, start_chunk_id, end_chunk_id, summary) VALUES ($1, $2, $3, $4, $5)`, [meeting_id, sequence[meeting_id], start_chunk_id[meeting_id], chunk_id, summary['content']]);
            console.log("Summary inserted successfully");
        } catch (err) {
            console.log("Error in inserting summary", err)
        }
        chunkMemory[meeting_id] = [];
        start_chunk_id[meeting_id] = undefined;
    }
}

function normalizeChunk(chunk) {

    const cleaned = [];

    for (const curr of chunk) {

        let text = curr.text;

        const fillerRegex = /^(um+|uh+|hmm+|ok+|okay+|huh+)$/i;
        if (text.length < 3 || fillerRegex.test(text)) continue;
        text = text
            .replace(/\s+/g, " ")
            .replace(/\b(\w+)( \1\b)+/gi, "$1")
            .replace(/\n+/g, " ")
            .replace(/\.,/g, ",")
            .trim();

        const last =
            cleaned[cleaned.length - 1];

        // remove progressive caption rewrites
        if (
            last &&
            last.speaker === curr.speaker &&
            text.startsWith(last.text)
        ) {

            last.text = text;
        }
        else {

            cleaned.push({
                ...curr,
                text,
            });
        }
    }

    return cleaned;
}


const uploadChunk = async (req, res) => {
    console.log("Uploading chunk");
    try {
        var { chunk } = req.body;

        const original_meeting_id = req.body.meeting_id;
        const meeting_id = req.body.meeting_id + " " + req.user.gmail;
        // console.log("Chunk:", chunk);
        // console.log("Meeting ID:", meeting_id);
        if (!chunk || !meeting_id) {
            return res.status(200).json({ message: "Chunk and meeting id is required" });
        }

        chunk = normalizeChunk(chunk);
        const documentText = chunk
            .map(c => `${c.speaker}: ${c.text}`)
            .join("\n");
        // Store chunk
        console.log("Document Text:", documentText);
        const chunk_id = "chunk-" + Date.now();
        try {
            await collection.add({
                documents: [documentText],
                metadatas: [{
                    startTime: chunk[0].timestamp,
                    endTime: chunk[chunk.length - 1].timestamp,
                    meeting_id: original_meeting_id,
                    gmail: req.user.gmail
                }],
                ids: [chunk_id]
            });
            if (!meeting_start_time[meeting_id]) {
                meeting_start_time[meeting_id] = chunk[0].timestamp;
            }
            meeting_end_time[meeting_id] = chunk[chunk.length - 1].timestamp;
            summarizeChunk(documentText, meeting_id, chunk_id);
            return res.status(200).json({ message: "Chunk uploaded successfully" });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export { uploadChunk };
