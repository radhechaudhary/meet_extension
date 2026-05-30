import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq"

dotenv.config()
function getLLM(llmId) {
    const llm = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        maxTokens: undefined,
        maxRetries: 2,
        apiKey: process.env.GROQ_API_KEY,
        // other params...
    })
    return llm;
}

export default getLLM