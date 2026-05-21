import { useEffect, useRef } from "react";
import axios from "axios";

export default function App() {

    // finalized transcript entries
    const transcript = useRef([]);

    // current live caption
    const liveCaption = useRef({
        speaker: "",
        text: "",
    });

    // timeout for stabilization
    const timeoutRef = useRef(null);

    // previous emitted chunk
    const prevChunk = useRef([]);

    useEffect(() => {

        const captionsRoot =
            document.querySelector('[aria-label="Captions"]');

        if (!captionsRoot) return;

        const observer = new MutationObserver(() => {

            const captions =
                captionsRoot.getElementsByClassName("UVSzeb");

            if (!captions.length) return;

            const caption = captions[captions.length - 1];

            try {

                const speaker =
                    caption
                        .getElementsByTagName("div")[0]
                        .getElementsByTagName("div")[0]
                        .getElementsByTagName("span")[0]
                        .innerText
                        .trim();

                const text =
                    caption
                        .getElementsByTagName("div")[2]
                        .innerText
                        .trim();

                if (!speaker || !text) return;

                // if speaker changed -> finalize previous caption
                if (
                    liveCaption.current.speaker &&
                    liveCaption.current.speaker !== speaker
                ) {
                    finalizeCurrentCaption();
                }

                // overwrite live caption
                liveCaption.current = {
                    speaker,
                    text,
                };

                // wait until caption stabilizes
                clearTimeout(timeoutRef.current);

                timeoutRef.current = setTimeout(() => {
                    finalizeCurrentCaption();
                }, 2000);

            } catch (err) {
                console.log(err);
            }

        });

        observer.observe(captionsRoot, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => {
            observer.disconnect();
            clearTimeout(timeoutRef.current);
        };

    }, []);

    function finalizeCurrentCaption() {

        const current = liveCaption.current;

        if (!current.text) return;

        // avoid duplicates
        const last =
            transcript.current[transcript.current.length - 1];

        if (
            last &&
            last.speaker === current.speaker &&
            last.text === current.text
        ) {
            return;
        }

        transcript.current.push({
            speaker: current.speaker,
            text: current.text,
            timestamp: Date.now(),
        });

        // console.log("FINALIZED:", current);

        // clear live caption
        liveCaption.current = {
            speaker: "",
            text: "",
        };

        generateChunk();
    }

    function generateChunk() {

        // chunk after every 4 utterances
        if (transcript.current.length < 4) return;

        // overlap = last 1 utterance from previous chunk
        const overlap =
            prevChunk.current.length
                ? prevChunk.current.slice(-1)
                : [];

        // current chunk
        const currentPart =
            transcript.current.slice(-4);

        //clear transcript after taking chunk
        transcript.current = [];

        // merged chunk
        const chunk = [
            ...overlap,
            ...currentPart,
        ];

        // remove duplicate overlap
        const uniqueChunk = [];

        const seen = new Set();

        for (const item of chunk) {

            const key =
                item.speaker + "::" + item.text;

            if (!seen.has(key)) {
                seen.add(key);
                uniqueChunk.push(item);
            }
        }

        prevChunk.current = currentPart;

        console.log("CHUNK:");

        console.log(uniqueChunk);

        axios.post("http://localhost:3000/data/upload-chunk", { chunk: uniqueChunk })
    }

    return (
        <div>
            Google Meet Caption Listener
        </div>
    );
}