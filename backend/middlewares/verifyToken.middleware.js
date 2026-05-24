import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        // console.log("middleware hit", token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { verifyToken }