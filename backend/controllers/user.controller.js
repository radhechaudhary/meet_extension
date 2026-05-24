import db from "../database/meet.db.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

const register = async (req, res) => {
    try {
        const { name, gmail, password } = req.body;

        if (!name || !gmail || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await db.query("INSERT INTO users (name, gmail, password) VALUES ($1, $2, $3)", [name, gmail, hash]);
        const token = jsonwebtoken.sign({ gmail: gmail, name: user.name }, process.env.SECRET_KEY, { expiresIn: "10d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 864000000
        })

        return res.status(200).json({
            success: true,
            message: "User registered successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,

            message: "user already exists"
        })
    }
}

const login = async (req, res) => {
    try {
        const { gmail, password } = req.body;
        // console.log(req.body, "bhut fark padta hai");

        if (!gmail || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // console.log("searching in db");
        const users = await db.query("SELECT * FROM users WHERE gmail = $1", [gmail]);
        // console.log(users)
        if (users.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "user does not exists"
            })
        }
        // console.log(users.rows[0].password)
        const isPasswordValid = await bcrypt.compare(password, users.rows[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            })
        }

        const token = jsonwebtoken.sign({ gmail: gmail, name: users.rows[0].name }, process.env.SECRET_KEY, { expiresIn: "10d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 864000000
        })
        return res.status(200).json({
            success: true,
            message: "User logged in successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { register, login, logout }