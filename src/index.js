require("dotenv").config();
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
const app = express();

configDotenv.config({
    path: './.env',
});

// Define or import connectDB as an async function
async function connectDB() {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("Database connected successfully");
    } catch (error) {
        throw error;
    }
}

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });




/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`/`${DB_NAME}`)
        app.on('error', () => {
            console.error("Error connecting to the database");
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}) ()
*/