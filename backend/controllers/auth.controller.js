import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken"
import { current_recordings, sessions } from "../constants.js";

dotenv.config();

const auth = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    // console.log(current_recordings[decoded.gmail]);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    return res.status(200).json({
        success: true,
        message: "Authorized",
        name: decoded.name,
        gmail: decoded.gmail,
        status: current_recordings[decoded.gmail] ? false : true
    })
}

const sessionAuth = async (req, res) => {
    const session_id = req.cookies.session_id;
    const gmail = req.cookies.gmail;
    console.log(session_id, "session_id");
    console.log(gmail, "gmail");
    if (!session_id || !gmail) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    if (!sessions[gmail] || sessions[gmail] != session_id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    return res.status(200).json({
        success: true,
        message: "Authorized",
        gmail: gmail,
        status: current_recordings[gmail] ? false : true
    })
}

export { auth, sessionAuth }