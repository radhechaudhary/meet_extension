import db from "../database/meet.db.js";
import { meeting_status, current_recordings, meeting_start_time, meeting_end_time, meeting_name, meeting_saved } from "../constants.js";

const fetchDashBoardInfo = async (req, res) => {
    try {
        const { gmail } = req.user;
        // console.log("request_recieved", req.user)
        const meetingInfo = await db.query("SELECT meeting_id, name, date_time, duration FROM meetings WHERE gmail = $1  ", [gmail]);
        // console.log(meetingInfo.rows)
        const userInfo = await db.query("SELECT name, meetings, queries FROM users WHERE gmail = $1", [gmail]);
        let availableMeetings = 0;
        let total_queries = userInfo.rows[0].queries || 0;
        let total_meetings = userInfo.rows[0].meetings || 0;
        if (meetingInfo.rows.length > 0) {
            availableMeetings = meetingInfo.rows.length;

        }
        var currentMeeting = null;
        if (current_recordings[gmail]) {
            let meetingId = current_recordings[gmail];
            currentMeeting = { status: meeting_status[meetingId], name: meeting_name[meetingId] || meetingId.split(" ")[0], meeting_id: meetingId.split(" ")[0], duration: meeting_end_time[meetingId] - meeting_start_time[meetingId] }
        }
        return res.status(200).json({
            success: true,
            message: "Dashboard info fetched successfully",
            data: { total_meetings: total_meetings, queryMade: total_queries, availableMeetings: availableMeetings, meetings: meetingInfo.rows, currentMeeting }
        })
    } catch (error) {
        console.log("error_recieved", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const editCurrentMeetingName = (req, res) => {
    var { meeting_id, name } = req.body;
    meeting_id = meeting_id + " " + req.user.gmail;
    if (!meeting_status[meeting_id]) {
        return res.status(400).json({
            success: false,
            message: "No active meeting"
        })
    }
    meeting_name[meeting_id] = name;
    return res.status(200).json({
        success: true,
        message: "Meeting name edited successfully"
    })
}

const editMeetingName = async (req, res) => {
    var { meeting_id, name } = req.body;
    console.log("---------------------", meeting_id, name);

    // if (!meeting_saved[meeting_id]) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "No active meeting"
    //     })
    // }
    try {
        await db.query(`UPDATE meetings SET name = $1 WHERE meeting_id = $2 and gmail = $3`, [name, meeting_id.split(" ")[0], req.user.gmail]);
        // delete meeting_saved[meeting_id];
        // delete meeting_name[meeting_id];
    }
    catch (err) {
        console.log(err)
    }
    return res.status(200).json({
        success: true,
        message: "Meeting name edited successfully"
    })
}

export { fetchDashBoardInfo, editCurrentMeetingName, editMeetingName }