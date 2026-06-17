import { useEffect, useRef, useState } from "react";
import axios from "axios";
import OverlayContainer from "./components/overlay/OverlayContainer";
import OverlayChatBox from "./components/overlay/OverlayChatBox";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [showChatBox, setShowChatBox] = useState(false);
    const [messages, setMessages] = useState([]);
    const firstRender = useRef(true);

    const observer = useRef(null);

    useEffect(() => {
        axios.get("http://localhost:4000/user/meet-auth", { withCredentials: true })
            .then((res) => {
                console.log("response from server", res.data);
                setIsLoggedIn(res.data.success);
                if (res.data.status) setIsRecording(true);
            })
    }, [])

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        console.log("isRecording", isRecording);
        const meetingId = window.location.pathname.slice(1);
        // console.log("isRecording", isRecording);
        if (isRecording) {
            console.log("starting meeting");
            const captionsRoot =
                document.querySelector('[aria-label="Captions"]');
            if (!captionsRoot) {
                setIsRecording(false);
                return;
            }
            axios.post("http://localhost:4000/meeting/start-meeting", { meeting_id: meetingId }, { withCredentials: true })
                .then((res) => {
                    if (res.status !== 200) {
                        console.log(res.data.message)
                        setIsRecording(false);
                    }
                })
                .catch((err) => {
                    console.log(err.response.data.message)
                    setIsRecording(false);
                })
            startCaptionObserver();
        }
        else if (!isRecording) {
            console.log("pausing meeting");
            const captionsRoot =
                document.querySelector('[aria-label="Captions"]');
            if (!captionsRoot) {
                return;
            }
            axios.post("http://localhost:4000/meeting/pause-meeting", { meeting_id: meetingId }, { withCredentials: true })
                .then((res) => {
                    if (res.status !== 200) {
                        console.log(res.data.message)
                    }
                })
                .catch((err) => {
                    console.log(err.response.data.message)
                })
            finalizeCurrentCaption();
            observer.current?.disconnect();
            clearTimeout(timeoutRef.current);
        }

    }, [isRecording]);

    const onEnd = () => {
        finalizeCurrentCaption();
        observer.current?.disconnect();
        clearTimeout(timeoutRef.current);
        try {
            const meetingId = window.location.pathname.slice(1);
            console.log("ending meeting");
            axios.post("http://localhost:4000/meeting/end-meeting", { meeting_id: meetingId }, { withCredentials: true })
                .then((res) => {
                    if (res.status !== 200) {
                        console.log(res.data.message)
                        setIsRecording(false);
                    }
                })
                .catch((err) => {
                    console.log(err.response.data.message)
                    setIsRecording(false);
                })
        }
        catch (err) {
            console.log(err);
        }
    }

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


        if (!captionsRoot) {
            setIsRecording(false);
            return;
        }

        // console.log(captionsRoot)

        // observer.current?.disconnect();

        observer.current = new MutationObserver(() => {
            // if (!isRecording) return;

            const captions =
                captionsRoot.getElementsByClassName("bj4p3b");

            // console.log(captions)

            if (!captions.length) {
                if (isRecording) setIsRecording(false);
                return;
            }

            const caption = captions[captions.length - 1];
            console.log(caption)

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
        const totalWords =
            transcript.current.reduce(
                (acc, item) =>
                    acc +
                    item.text.split(/\s+/).length,
                0
            );
        if (totalWords < 80) return;
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
            const res = await axios.post("http://localhost:4000/data/upload-chunk", { chunk: uniqueChunk, meeting_id: meetingId }, { withCredentials: true })
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <OverlayContainer
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                onEnd={onEnd}
                setShowChatBox={setShowChatBox}
                messages={messages}
                setMessages={setMessages}
            />
            {showChatBox && (
                <OverlayChatBox meetingId={window.location.pathname.slice(1)} onClose={() => setShowChatBox(false)} messages={messages} setMessages={setMessages} />
            )}
        </>
    );
}