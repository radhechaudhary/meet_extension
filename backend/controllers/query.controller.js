import { collection } from "../db/rag.js";
import { compiled_agent } from "../ai-workflows/query.work-flow.js";

const filterResult = (results) => {
    const THRESHOLD = 1.3;
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

const query = async (req, res) => {
    const { meeting_id } = req.params;
    const { messages } = req.body;

    if (!meeting_id) {
        return res.status(400).json({ message: "Meeting id is required" });
    }

    if (!messages) {
        return res.status(400).json({ message: "Messages is required" });
    }

    try {
        compiled_agent.invoke({
            meeting_id: "gtth-454-fhh4",
            messages: messages,
        }).then((result) => {
            return res.status(200).json({ success: true, response: result.llm_response });
        })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({ success: false, message: "Internal server error" });
            })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export { query }