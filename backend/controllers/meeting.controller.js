import { meeting_status, current_recordings, meeting_start_time, meeting_end_time, meeting_saved, meeting_name } from "../constants.js";
import db from "../database/meet.db.js";

const startMeeting = (req, res) => {
    var { meeting_id } = req.body;
    meeting_id = meeting_id + " " + req.user.gmail;
    if (meeting_saved[meeting_id]) {
        return res.status(400).json({
            success: false,
            message: "Meeting is already saved"
        })
    }
    if (current_recordings[req.user.gmail]) {
        meeting_status[meeting_id] = "active";
        console.log("meeting resumed");
        return res.status(200).json({
            success: true,
            message: "Meeting resumed"
        })
    }
    meeting_status[meeting_id] = "active";
    current_recordings[req.user.gmail] = meeting_id;
    console.log("meeting started");
    return res.status(200).json({
        success: true,
        message: "Meeting started"
    })
}

const endMeeting = async (req, res) => {
    var { meeting_id } = req.body;
    meeting_id = meeting_id + " " + req.user.gmail;
    if (!meeting_status[meeting_id]) {
        return res.status(400).json({
            success: false,
            message: "No active meeting"
        })
    }
    if (!meeting_end_time[meeting_id] || !meeting_start_time[meeting_id]) {
        delete meeting_status[meeting_id];
        delete current_recordings[req.user.gmail];
        return res.status(400).json({
            success: false,
            message: "Not recorded till now"
        })
    }
    console.log("meeting ended")
    meeting_saved[meeting_id] = true;
    try {
        await db.query(`INSERT INTO meetings (meeting_id, gmail, name,   duration, date_time, queries) VALUES ($1,$2,$3,$4,$5,$6)`, [meeting_id.split(" ")[0], req.user.gmail, meeting_name[meeting_id] || meeting_id.split(" ")[0], meeting_end_time[meeting_id] - meeting_start_time[meeting_id], new Date().toLocaleString(), 0]);
        await db.query(`UPDATE users SET meetings = meetings + 1 WHERE gmail = $1`, [req.user.gmail]);
        delete meeting_status[meeting_id];
        delete current_recordings[req.user.gmail];
        delete meeting_end_time[meeting_id];
        delete meeting_start_time[meeting_id];
        delete meeting_name[meeting_id];
    }
    catch (err) {
        console.log(err)
    }
    return res.status(200).json({
        success: true,
        message: "Meeting ended"
    })
}

const pauseMeeting = (req, res) => {
    var { meeting_id } = req.body;
    if (!meeting_id) {
        return res.status(400).json({
            success: false,
            message: "Meeting ID is required"
        })
    }
    if (!current_recordings[req.user.gmail]) {
        return res.status(400).json({
            success: false,
            message: "No active meeting"
        })
    }
    meeting_id = meeting_id + " " + req.user.gmail;
    if (!meeting_status[meeting_id] && meeting_status[meeting_id] === "paused") {
        return res.status(400).json({
            success: false,
            message: "Meeting is already paused"
        })
    }

    meeting_status[meeting_id] = "paused";
    console.log("meeting paused")
    return res.status(200).json({
        success: true,
        message: "Meeting paused"
    })
}

const resumeMeeting = (req, res) => {
    var { meeting_id } = req.body;
    meeting_id = meeting_id + " " + req.user.gmail;
    meeting_status[meeting_id] = "active";
    return res.status(200).json({
        success: true,
        message: "Meeting resumed"
    })
}

export { startMeeting, endMeeting, pauseMeeting, resumeMeeting }