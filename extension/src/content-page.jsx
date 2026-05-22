import { useEffect, useRef, useState } from "react";
import axios from "axios";
import OverlayContainer from "./components/overlay/OverlayContainer";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useRef(false);

    const observer = useRef(null);

    useEffect(() => {

        axios.get("http://localhost:4000/user/auth", { withCredentials: true }).then((res) => {
            setIsLoggedIn(res.data.success);
        })
    }, [])

    useEffect(() => {

        // console.log("isRecording", isRecording);
        if (isRecording) {
            startCaptionObserver();
        }
        else {
            finalizeCurrentCaption();
            observer.current?.disconnect();
            clearTimeout(timeoutRef.current);
        }

    }, [isRecording]);

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

    const startCaptionObserver = () => {

        const captionsRoot =
            document.querySelector('[aria-label="Captions"]');


        if (!captionsRoot) return;

        console.log(captionsRoot)

        // observer.current?.disconnect();

        observer.current = new MutationObserver(() => {
            // if (!isRecording) return;

            const captions =
                captionsRoot.getElementsByClassName("bj4p3b");

            console.log(captions)

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

                console.log(speaker, text);

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

        observer.current.observe(captionsRoot, {
            childList: true,
            subtree: true,
            characterData: true,
        });

    };

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

    async function generateChunk() {

        // chunk after every 4 utterances
        if (transcript.current.length < 20) return;
        // console.log(transcript.current);

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

        // console.log(uniqueChunk);
        try {
            const meetingId = window.location.pathname.slice(1);
            const res = await axios.post("http://localhost:3000/data/upload-chunk", { chunk: uniqueChunk, meeting_id: meetingId })
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <OverlayContainer
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
        />
        // <div className="bg-red-500 absolute top-0 left-0 w-full h-full z-50">
        //     hello worldjkk;l'
        // </div>
    );
}