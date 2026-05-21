import { ChromaClient } from "chromadb";

const client = new ChromaClient();

const collection = await client.getOrCreateCollection({
    name: "meet-chunks",
});

export { collection };