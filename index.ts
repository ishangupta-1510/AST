import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@deepgram/sdk';
import { readFileSync } from 'fs';
import OpenAI from "openai";
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}.wav`);
    }
});

// const openAiSummary = async (transcript: string) => {
//     try {
//         console.log('transcript', transcript);
//         const response = await axios.post(
//             'https://openrouter.ai/api/v1/chat/completions',
//             {
//                 model: "gpt-4o",
//                 messages: [
//                     {
//                         role: "user",
//                         content: transcript,
//                     },
//                 ],
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );
//         console.log('response');

//         const completion = response.data;
//         console.log(completion.choices[0].message.content);
//         return completion.choices[0].message.content;
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             console.error('Axios error:', error.response?.data || error.message);
//         } else {
//             console.error('Error fetching summary:', error);
//         }
//         throw error;
//     }
// };

const openAiSummary = async (transcript: string) => {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
        model: "gpt/gpt-4o",
        messages: [
            {
                role: "system",
                content: transcript,
            },
        ],
    });

    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
}


const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface DeepgramTranscriptionResult {
    results: {
        channels: {
            alternatives: {
                transcript: string;
            }[];
        }[];
    };
}

const transcribeFile = async (path: string): Promise<DeepgramTranscriptionResult> => {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        readFileSync(path),
        {
            model: "nova-3",
            smart_format: true,
        }
    );
    if (error) throw error;
    if (!error) console.dir(result, { depth: null });
    return result;
};

app.post("/upload", upload.single("audio"), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    const filePath = path.join(__dirname, req.file.path);
    console.log(filePath, 'filePath');

    // const transcript = "This is a sample transcription.";

    // const transcript = (await transcribeFile(filePath)).results.channels[0].alternatives[0].transcript;
    const transcript = "The stale smell of old beer lingers. It takes heat to bring out the odor. A cold dip restores health and zest. A salt pickle tastes fine with ham. Tacos al pastor are my favorite. A zestful food is the hot cross bun.";

    const summary = await openAiSummary(transcript);

    res.json({
        message: "File uploaded and processed successfully",
        filePath,
        transcript,
        summary
    });
});

// Question Answering route (Based on Transcribed Text)
app.post("/ask", async (req: Request, res: Response) => {
    const { question, transcript } = req.body;
    if (!question || !transcript) {
        res.status(400).json({ message: "Question and transcript are required" });
        return;
    }

    // TODO: Implement an AI-powered question-answering system
    res.json({ answer: "This is a sample answer." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});