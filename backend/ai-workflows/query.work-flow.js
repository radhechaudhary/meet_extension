import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { StateGraph, START, END, } from "@langchain/langgraph";
import { z } from "zod/v4";
import { collection } from "../db/rag.js";
import { ChatGroq } from "@langchain/groq"
import db from "../database/meet.db.js";

dotenv.config();

const filterResult = (results) => {
    const THRESHOLD = 1.5;
    if (!results.ids[0].length) {
        console.log("No results found")
        return [];
    }
    let filteredResults = [];
    for (let i = 0; i < results.ids[0].length; i++) {

        const distance = results.distances[0][i];

        if (distance <= THRESHOLD) {

            filteredResults.push({
                id: results.ids[0][i],
                document: results.documents[0][i],
                metadata: results.metadatas[0][i],
                distance,
            });
        }
    }

    return filteredResults;
}

const MessagesState = {

    messages: z.array(z.any()),

    meeting_ids: z.array(z.string()),

    query_type: z.string(),

    relevant_chunks: z.array(z.string()),

    context: z.string(),

    llm_response: z.string(),

    gmail: z.string(),
};

// const llm = new ChatOpenRouter({
//     model: "poolside/laguna-m.1:free",
//     apiKey: process.env.OPENROUTER_API_KEY,
//     temperature: 0.4,
// });

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY,
    // other params...
})

const extract_query_type = async (state) => {
    console.log(state.messages)
    try {
        const result = await llm.invoke([
            {
                role: "system",
                content: `Classify the query into one of:

                        1. SPECIFIC
                        - asks about exact discussion details
                        - asks what someone said
                        - asks about a topic/person

                        2. GENERAL
                        - asks for overall summary
                        - asks for action items
                        - asks for high level insights

                        Return only:
                        SPECIFIC
                        or
                        GENERAL`
            },
            {
                role: "user",
                content: state.messages[state.messages.length - 1].content,
            },
        ])
        // console.log(result['content'])
        state.query_type = result['content']
        console.log("query type", state.query_type)
        return state;
    }
    catch (err) {
        console.log("Error in extract_query_type", err);
        return state;
    }
}

const query_type_router = (state) => {
    if (state.query_type === "SPECIFIC") {
        return "specific";
    } else {
        return "general";
    }
}

const sepcific_query = async (state) => {
    const meeting_ids = state.meeting_ids;
    console.log("meeting id", meeting_ids)
    const query = [state.messages[state.messages.length - 1].content];
    const results = await collection.query({
        queryTexts: [query],
        nResults: 10,
        include: ["metadatas", "documents", "distances"],
        where: {
            $and: [
                {
                    meeting_id: {
                        $in: meeting_ids
                    }
                },
                {
                    gmail: state.gmail
                }
            ]
        }
    });

    const filteredResult = filterResult(results);
    // console.log("filteredResult", filteredResult)
    state.relevant_chunks = filteredResult;

    let context = ""
    for (const chunk of state.relevant_chunks) {
        context += chunk.document + "\n";
    }
    state.context = context;
    return state;
}

const general_query = async (state) => {
    const meeting_id = state.meeting_id;
    // const result = await db.query("select * from chunk_summaries where meeting_id = $1", [meeting_id]);
    let context = "hello mohit"
    // let context = ""
    // for (const row of result.rows) {
    //     context += `sequence ${row.sequence} : summary: ${row.summary}`
    // }
    state.context = context;
    return state;
}

const llm_call = async (state) => {
    const result = await llm.invoke([
        {
            role: "system",
            content: `You are an AI assistant that answers questions about a meeting.

                        Here is some context from the meeting:

                        ${state.context}

                        Now answer this question:
                    `,
        },
        ...state.messages
    ])
    state.llm_response = result['content']
    return state;
}


const agent = new StateGraph({ channels: MessagesState })
    .addNode("extract_query_type", extract_query_type)
    .addNode("specific_query", sepcific_query)
    .addNode("general_query", general_query)
    .addNode("llm_call", llm_call)
    .addEdge(START, "extract_query_type")
    .addConditionalEdges("extract_query_type", query_type_router, { specific: "specific_query", general: "general_query" })
    .addEdge("specific_query", "llm_call")
    .addEdge("general_query", "llm_call")
    .addEdge("llm_call", END)


const compiled_agent = agent.compile();

// compiled_agent.invoke({
//     meeting_id: "gtth-454-fhh4",
//     message: "What is summary of meeting?",
// }).then((result) => {
//     console.log(result)
// })



export { compiled_agent };



