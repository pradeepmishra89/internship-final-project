import { saveChat, getChatHistoryByUserId } from "../models/model.js";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


// =====================================================
// CHAT CONTROLLER
// =====================================================
export const chat = async (req, res) => {

    try {

        const { message, attachment } = req.body;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------
        if (!message && !attachment) {

            return res.status(400).json({
                success: false,
                message: "Message or attachment is required"
            });
        }


        const userId = req.user.id;

        let aiResponse = "";
        let messageToSave = message || "";


        // =================================================
        // IMAGE ATTACHMENT
        // =================================================
        if (attachment && attachment.type === "image") {

            if (!attachment.data) {

                return res.status(400).json({
                    success: false,
                    message: "Image data is missing"
                });
            }


            const response = await groq.chat.completions.create({

                model: "qwen/qwen3.6-27b",

                messages: [
                    {
                        role: "user",

                        content: [

                            {
                                type: "text",

                                text:
                                    message ||
                                    "Describe this image in detail."
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


            aiResponse =
                response.choices?.[0]?.message?.content ||
                "Unable to analyze the image.";


            messageToSave =
                `[Image: ${attachment.name || "Unknown Image"}] ${message || ""}`;
        }


        // =================================================
        // PDF ATTACHMENT
        // =================================================
        else if (attachment && attachment.type === "pdf") {

            if (!attachment.data) {

                return res.status(400).json({
                    success: false,
                    message: "PDF data is missing"
                });
            }


            // -------------------------------------------------
            // Extract Base64 data
            // -------------------------------------------------
            let base64Data;

            if (attachment.data.includes(",")) {

                base64Data =
                    attachment.data.split(",")[1];

            } else {

                base64Data =
                    attachment.data;
            }


            if (!base64Data) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid PDF data"
                });
            }


            // -------------------------------------------------
            // Convert Base64 → Buffer
            // -------------------------------------------------
            let pdfBuffer;

            try {

                pdfBuffer =
                    Buffer.from(base64Data, "base64");

            } catch (error) {

                return res.status(400).json({
                    success: false,
                    message: "Unable to decode PDF file"
                });
            }


            // -------------------------------------------------
            // Check PDF size
            // -------------------------------------------------
            if (!pdfBuffer || pdfBuffer.length === 0) {

                return res.status(400).json({
                    success: false,
                    message: "PDF file is empty"
                });
            }


            // -------------------------------------------------
            // Parse PDF
            // pdf-parse v2.x
            // -------------------------------------------------
            const parser = new PDFParse({
                data: pdfBuffer
            });


            let result;

            try {

                result = await parser.getText();

            } finally {

                await parser.destroy();
            }


            // -------------------------------------------------
            // Extract text
            // -------------------------------------------------
            const extractedText =
                result?.text?.trim() || "";


            // -------------------------------------------------
            // If PDF contains no selectable text
            // -------------------------------------------------
            if (!extractedText) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No readable text was found in this PDF. The PDF may be scanned/image-based. OCR is required for this type of PDF."
                });
            }


            // -------------------------------------------------
            // Limit text sent to AI
            // -------------------------------------------------
            const pdfText =
                extractedText.slice(0, 12000);


            // -------------------------------------------------
            // Ask AI about PDF
            // -------------------------------------------------
            const userQuestion =
                message ||
                "Summarize this document and explain its important points.";


            const response =
                await groq.chat.completions.create({

                    model: "openai/gpt-oss-20b",

                    messages: [

                        {
                            role: "system",

                            content:
                                `You are an AI document assistant.

You have been given text extracted from a PDF document.

Answer the user's question ONLY using the information available in the document.

If the requested information is not available in the document, clearly say that it is not mentioned in the document.

Do not claim that you cannot read PDFs because the PDF text has already been extracted and provided to you.

Give clear and useful answers.`
                        },

                        {
                            role: "user",

                            content:
                                `PDF DOCUMENT:

${pdfText}

USER QUESTION:

${userQuestion}`
                        }

                    ]
                });


            aiResponse =
                response.choices?.[0]?.message?.content ||
                "Unable to process the PDF.";


            messageToSave =
                `[PDF: ${attachment.name || "Unknown PDF"}] ${message || "Summarize this document."}`;
        }


        // =================================================
        // NORMAL TEXT CHAT
        // =================================================
        else {

            if (!message || !message.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Message is required"
                });
            }


            const response =
                await groq.chat.completions.create({

                    model: "openai/gpt-oss-20b",

                    messages: [

                        {
                            role: "user",

                            content: message
                        }

                    ]
                });


            aiResponse =
                response.choices?.[0]?.message?.content ||
                "Unable to generate response.";
        }


        // =================================================
        // SAVE CHAT
        // =================================================
        await saveChat(
            userId,
            messageToSave,
            aiResponse
        );


        // =================================================
        // SUCCESS RESPONSE
        // =================================================
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

            message:
                error.message ||
                "Something went wrong while processing your request."
        });
    }
};



// =====================================================
// GET CHAT HISTORY
// =====================================================
export const getChatHistory = async (req, res) => {

    try {

        const userId = req.user.id;


        const history =
            await getChatHistoryByUserId(userId);


        return res.status(200).json({

            success: true,

            data: history
        });


    } catch (error) {

        console.error(
            "Chat History Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch chat history."
        });
    }
};

