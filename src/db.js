import mongoose from "mongoose";

export async function connectToMongo(url, dbName) {
    if (!url) {
        throw new Error("Missing MONGO_URL");
    }

    if (!dbName) {
        throw new Error("Missing MONGO_DB");
    }

    try {
        await mongoose.connect(url, {
            dbName: dbName
        });

        console.log(`✅ Connected to MongoDB: ${dbName}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
}