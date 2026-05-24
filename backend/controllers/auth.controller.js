import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken"
import { current_recordings } from "../constants.js";

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
        status: current_recordings[decoded.gmail] ? false : true
    })
}

export { auth }