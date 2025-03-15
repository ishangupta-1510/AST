"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.post("/upload", upload.single("audio"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    const filePath = path_1.default.join(__dirname, req.file.path);
    const transcript = "This is a sample transcription.";
    const summary = "This is a sample summary.";
    res.json({
        message: "File uploaded and processed successfully",
        filePath,
        transcript,
        summary
    });
}));
// Question Answering route (Based on Transcribed Text)
app.post("/ask", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question, transcript } = req.body;
    if (!question || !transcript) {
        res.status(400).json({ message: "Question and transcript are required" });
        return;
    }
    // TODO: Implement an AI-powered question-answering system
    res.json({ answer: "This is a sample answer." });
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
