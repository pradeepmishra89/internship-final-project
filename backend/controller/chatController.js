import { saveChat, getChatHistoryByUserId } from "../models/model.js";
import Groq from "groq-sdk";
import pdf from "pdf-parse";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        if (attachment && attachment.type === "image") {

            // Image ke liye Groq ka vision model
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
            messageToSave = `[Image: ${attachment.name}] ${message || ""}`;

        } else if (attachment && attachment.type === "pdf") {

            // PDF se text extract karo
            const base64Data = attachment.data.split(",")[1];
            const pdfBuffer = Buffer.from(base64Data, "base64");
            const pdfData = await pdf(pdfBuffer);
            const pdfText = pdfData.text.slice(0, 8000);

            const response = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "user",
                        content: `Document content:\n\n${pdfText}\n\nUser question: ${message || "Summarize this document."}`
                    }
                ]
            });

            aiResponse = response.choices[0].message.content;
            messageToSave = `[PDF: ${attachment.name}] ${message || ""}`;

        } else {

            // Normal text-only chat
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

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getChatHistory = async (req, res) => {
    try {

        const userId = req.user.id;

        const history = await getChatHistoryByUserId(userId);

        return res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};