import { meeting_status, current_recordings, meeting_start_time, meeting_end_time } from "../constants.js";
import db from "../database/meet.db.js";

const startMeeting = (req, res) => {
    var { meeting_id } = req.body;
    if (current_recordings[req.user.gmail]) {
        return res.status(400).json({
            success: false,
            message: "Recording already active"
        });
    }
    meeting_id = meeting_id + " " + req.user.gmail;
    meeting_status[meeting_id] = "active";
    current_recordings[req.user.gmail] = meeting_id;
    return res.status(200).json({
        success: true,
        message: "Meeting started"
    })
}

const endMeeting = async (req, res) => {
    var { meeting_id } = req.body;
    meeting_id = meeting_id + " " + req.user.gmail;
    delete meeting_status[meeting_id];
    delete current_recordings[req.user.gmail];
    try {
        await db.query(`INSERT INTO meetings (meeting_id, gmail, duration, date_time, queries) VALUES ($1,$2,$3,$4,$5)`, [meeting_id, req.user.gmail, meeting_end_time[meeting_id] - meeting_start_time[meeting_id], new Date().toLocaleString(), 0]);
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
    meeting_id = meeting_id + " " + req.user.gmail;
    meeting_status[meeting_id] = "paused";
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