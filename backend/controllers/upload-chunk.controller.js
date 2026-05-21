import { collection } from "../db/rag.js";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
import db from "../database/meet.db.js";

dotenv.config();
var chunkMemory = {}; // [meet_id: [chunks]]
var sequence = {} // [meet_id: sequence_no]
var start_chunk_id = {}

const llm = new ChatOpenRouter({
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0.4,
});

const summarizeChunk = async (chunk, meeting_id, chunk_id) => {

    chunkMemory[meeting_id] = chunkMemory[meeting_id] ? [...chunkMemory[meeting_id], ...chunk] : [chunk];
    start_chunk_id[meeting_id] = start_chunk_id[meeting_id] ? start_chunk_id[meeting_id] : chunk_id;
    if (chunkMemory[meeting_id].length == 1) {
        sequence[meeting_id] = sequence[meeting_id] ? sequence[meeting_id] + 1 : 1;
        let summary_text = "";
        for (let i = 0; i < chunkMemory[meeting_id].length; i++) {
            summary_text += chunkMemory[meeting_id] + "\n";
        }
        console.log(summary_text)
        const summary = await llm.invoke(`Generate This text summary in less than 20 words and give only the summary no other text ${summary_text}`)
        console.log(summary['content'])
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


const uploadChunk = async (req, res) => {
    console.log("Uploading chunk");
    try {
        const { chunk, meeting_id } = req.body;
        if (!chunk || !meeting_id) {
            return res.status(400).json({ message: "Chunk and meeting id is required" });
        }
        const documentText = chunk
            .map(c => `${c.speaker}: ${c.text}`)
            .join("\n");
        // Store chunk
        const chunk_id = "chunk-" + Date.now();
        try {
            await collection.add({
                documents: [documentText],
                metadatas: [{
                    speakers: [...new Set(chunk.map(c => c.speaker))],
                    startTime: chunk[0].timestamp,
                    endTime: chunk[chunk.length - 1].timestamp,
                    meeting_id: meeting_id
                }],
                ids: [chunk_id]
            });
            // summarizeChunk(documentText, meeting_id, chunk_id);
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
