import { saveChat, getChatHistoryByUserId } from "../models/model.js";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const chat = async (req, res) => {
    try {

        const { message, attachment } = req.body;

        if (!message && !attachment) {
            return res.status(400).json({
                success: false,
                message: "Message or attachment is required"
            });
        }

        const userId = req.user.id;
        let aiResponse;
        let messageToSave = message || "";

        // =========================
        // IMAGE ATTACHMENT
        // =========================
        if (attachment && attachment.type === "image") {

            const response = await groq.chat.completions.create({
                model: "qwen/qwen3.6-27b",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: message || "Describe this image."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: attachment.data
                                }
                            }
                        ]
                    }
                ]
            });

            aiResponse = response.choices[0].message.content;

            messageToSave =
                `[Image: ${attachment.name}] ${message || ""}`;

        }

        // =========================
        // PDF ATTACHMENT
        // =========================
        else if (attachment && attachment.type === "pdf") {

            const base64Data = attachment.data.split(",")[1];

            if (!base64Data) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid PDF attachment"
                });
            }

            const pdfBuffer = Buffer.from(base64Data, "base64");

            // pdf-parse v2.x API
            const parser = new PDFParse({
                data: pdfBuffer
            });

            const result = await parser.getText();

            const pdfText = result.text.slice(0, 8000);

            await parser.destroy();

            const response = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "user",
                        content:
                            `Document content:\n\n${pdfText}\n\nUser question: ${message || "Summarize this document."}`
                    }
                ]
            });

            aiResponse = response.choices[0].message.content;

            messageToSave =
                `[PDF: ${attachment.name}] ${message || ""}`;
        }

        // =========================
        // NORMAL TEXT CHAT
        // =========================
        else {

            const response = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

            aiResponse = response.choices[0].message.content;
        }

        // =========================
        // SAVE CHAT
        // =========================
        await saveChat(
            userId,
            messageToSave,
            aiResponse
        );

        return res.status(200).json({
            success: true,
            data: {
                userMessage: messageToSave,
                aiResponse: aiResponse
            }
        });

    } catch (error) {

        console.error("Chat Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// GET CHAT HISTORY
// =========================
export const getChatHistory = async (req, res) => {
    try {

        const userId = req.user.id;

        const history = await getChatHistoryByUserId(userId);

        return res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {

        console.error("Chat History Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

