import db from "../database/meet.db.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { sessions } from '../constants.js'
import crypto from "crypto";
dotenv.config()

const register = async (req, res) => {
    try {
        const { name, gmail, password } = req.body;

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and contain an uppercase letter, number, and special character"
            });
        }

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
    console.log(req.headers.origin, "originn");
    const origin = req.headers.origin;

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
        if (origin.includes("https://meet.google.com")) {
            const session_id = crypto.randomUUID();
            console.log("Meet Login");
            sessions[gmail] = session_id;
            console.log(sessions);
            res.cookie("session_id", session_id, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            res.cookie("gmail", gmail, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            return res.status(200).json({
                success: true,
                message: "Session created successfully",
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