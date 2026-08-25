import { saveChat,getChatHistoryByUserId } from "../models/model.js";
import ollama from "ollama";
export const chat = async (req, res) => {
    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const userId = req.user.id;

        const response = await ollama.chat({
          model: "llama3.2:latest",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        });

        const aiResponse = response.message.content;

        await saveChat(
            userId,
            message,
            aiResponse
        );

        return res.status(200).json({
            success: true,
            data: {
                userMessage: message,
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

        // JWT middleware se user ID milegi
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