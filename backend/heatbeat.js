import { meeting_status, current_recordings, meeting_start_time, meeting_end_time, meeting_saved } from "./constants.js";
import db from './database/meet.db.js'
const start = {}
const interval = setInterval(() => {
    const currentTime = Date.now();
    console.log("heartBeat", currentTime)
    const meetings = Object.keys(current_recordings);
    meetings.forEach(async (gmail) => {
        const meeting_id = current_recordings[gmail];
        if (!meeting_end_time[meeting_id] || !meeting_start_time[meeting_id]) {
            if (!start[meeting_id]) {
                start[meeting_id] = currentTime;
            } else if (currentTime - start[meeting_id] > 400000) {
                delete start[meeting_id];
                delete meeting_status[meeting_id];
                delete current_recordings[gmail];
            }
            return;
        }
        if (currentTime - meeting_end_time[meeting_id] > 1000000) {
            if (meeting_end_time[meeting_id] - meeting_start_time[meeting_id] > 200000) {
                if (meeting_saved[meeting_id]) return;
                meeting_saved[meeting_id] = true;
                if (start[meeting_id]) {
                    delete start[meeting_id];
                }
                try {
                    await db.query(`INSERT INTO meetings (meeting_id, gmail, duration, date_time, queries) VALUES ($1,$2,$3,$4,$5)`, [meeting_id, gmail, meeting_end_time[meeting_id] - meeting_start_time[meeting_id], new Date().toLocaleString(), 0]);
                    delete meeting_status[meeting_id];
                    delete current_recordings[gmail];
                    delete meeting_end_time[meeting_id];
                    delete meeting_start_time[meeting_id];
                }
                catch (err) {
                    console.log(err)
                }
            }
        }
    });
}, 300000);
export default interval;