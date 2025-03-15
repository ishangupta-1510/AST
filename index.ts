import express, { Request, Response } from 'express';
import multer from 'multer'
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.single("audio"), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    
    const filePath = path.join(__dirname, req.file.path);
    console.log(filePath, 'filePath')

    const transcript = "This is a sample transcription.";

    const summary = "This is a sample summary.";
    
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