import {
    saveChat,
    getChatHistoryByUserId
} from "../models/model.js";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import { pdf } from "pdf-to-img";


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


// =====================================================
// CONSTANTS
// =====================================================

const TEXT_MODEL = "openai/gpt-oss-20b";

// const TEXT_MODEL = "llama3.2:latest";
const VISION_MODEL = "qwen/qwen3.6-27b";

const MAX_HISTORY_MESSAGES = 10;

const MAX_PDF_TEXT = 20000;

const MAX_PDF_PAGES_FOR_VISION = 5;


// =====================================================
// CLEAN BASE64 DATA URL
// =====================================================

const getBase64Data = (data) => {

    if (!data) {
        return null;
    }

    if (data.includes(",")) {
        return data.split(",")[1];
    }

    return data;
};


// =====================================================
// CREATE DATA URL
// =====================================================

const createImageDataUrl = (buffer, mimeType = "image/png") => {

    const base64 = buffer.toString("base64");

    return `data:${mimeType};base64,${base64}`;
};


// =====================================================
// GET CHAT HISTORY
// =====================================================

const getRecentHistory = async (userId) => {

    try {

        const history =
            await getChatHistoryByUserId(userId);

        if (!Array.isArray(history)) {
            return [];
        }

        // Last 10 messages
        const recentHistory =
            history.slice(-MAX_HISTORY_MESSAGES);

        return recentHistory.flatMap((item) => {

            const messages = [];

            if (item.userMessage) {

                messages.push({
                    role: "user",
                    content: item.userMessage
                });

            }

            if (item.aiResponse) {

                messages.push({
                    role: "assistant",
                    content: item.aiResponse
                });

            }

            return messages;
        });

    } catch (error) {

        console.error(
            "History Context Error:",
            error
        );

        return [];
    }
};


// =====================================================
// NORMAL TEXT AI
// =====================================================

const askTextAI = async (
    message,
    history = [],
    documentContext = ""
) => {

    const messages = [

        {
            role: "system",

            content: `
You are a helpful AI assistant.

You can answer questions using:
1. Previous conversation
2. Uploaded PDF documents
3. Uploaded images
4. User's current message

IMPORTANT RULES:

- Remember the context provided in the conversation.
- If the user uploaded a document or image earlier and asks a follow-up question, use that context.
- Do not say you forgot the previous message if the context is provided.
- If document context is provided, use it to answer accurately.
- Do not invent information that is not available.
- Give clear and useful answers.
`
        },

        ...history,

        ...(documentContext
            ? [
                {
                    role: "system",
                    content: `
CURRENT DOCUMENT CONTEXT:

${documentContext}
`
                }
            ]
            : []),

        {
            role: "user",
            content: message
        }

    ];


    const response =
        await groq.chat.completions.create({

            model: TEXT_MODEL,

            messages,

            temperature: 0.2
        });


    return (
        response.choices?.[0]?.message?.content ||
        "Unable to generate response."
    );
};


// =====================================================
// IMAGE AI
// =====================================================

const analyzeImage = async (
    imageData,
    userMessage,
    history = []
) => {

    const question =
        userMessage ||
        "Analyze this image carefully. Read any visible text and explain the important information.";

    const historyText =
        history
            .map((item) => {

                return `${item.role}: ${item.content}`;

            })
            .join("\n");


    const prompt = `

You are analyzing an image for the user.

Read the image carefully.

If the image contains text:
- Extract and read the visible text.
- Preserve important names, numbers, dates and technical information.
- Explain the content clearly.

If the image contains a document, screenshot, code, table, error message or resume:
- Understand the complete visible content.
- Answer based on what is actually visible.

PREVIOUS CONVERSATION:

${historyText || "No previous conversation."}

CURRENT USER QUESTION:

${question}

Do not say that you cannot see the image.
`;


    const response =
        await groq.chat.completions.create({

            model: VISION_MODEL,

            messages: [

                {
                    role: "user",

                    content: [

                        {
                            type: "text",
                            text: prompt
                        },

                        {
                            type: "image_url",

                            image_url: {
                                url: imageData
                            }
                        }

                    ]
                }

            ],

            temperature: 0.2
        });


    return (
        response.choices?.[0]?.message?.content ||
        "Unable to analyze the image."
    );
};


// =====================================================
// PDF TEXT EXTRACTION
// =====================================================

const extractPDFText = async (pdfBuffer) => {

    const parser =
        new PDFParse({
            data: pdfBuffer
        });

    try {

        const result =
            await parser.getText();

        return (
            result?.text?.trim() ||
            ""
        );

    } finally {

        await parser.destroy();
    }
};


// =====================================================
// SCANNED PDF → IMAGES
// =====================================================

const convertPDFToImages = async (pdfDataUrl) => {

    const document =
        await pdf(pdfDataUrl, {
            scale: 2,
            format: "png"
        });

    const images = [];

    try {

        let pageNumber = 0;

        for await (const image of document) {

            pageNumber++;

            images.push({
                page: pageNumber,
                buffer: image
            });

            if (
                pageNumber >=
                MAX_PDF_PAGES_FOR_VISION
            ) {
                break;
            }
        }

    } finally {

        document.destroy();
    }

    return images;
};


// =====================================================
// ANALYZE SCANNED PDF USING VISION
// =====================================================

const analyzeScannedPDF = async (
    pdfDataUrl,
    userMessage,
    history = []
) => {

    const pages =
        await convertPDFToImages(pdfDataUrl);


    if (!pages.length) {

        throw new Error(
            "Unable to convert PDF pages into images."
        );
    }


    const content = [];


    content.push({
        type: "text",

        text: `
You are analyzing a scanned PDF document.

Read the text from the PDF pages carefully.

This PDF may contain:
- Text
- Tables
- Resume
- Code
- Screenshots
- Forms
- Scanned documents

Extract the important information accurately.

Previous conversation:

${
    history
        .map(
            item =>
                `${item.role}: ${item.content}`
        )
        .join("\n")
    || "No previous conversation."
}

User question:

${
    userMessage ||
    "Read and summarize this PDF."
}

Answer only from the PDF content and visible information.
`
    });


    for (const page of pages) {

        const imageDataUrl =
            createImageDataUrl(
                page.buffer,
                "image/png"
            );


        content.push({

            type: "text",

            text:
                `\nPDF PAGE ${page.page}:`
        });


        content.push({

            type: "image_url",

            image_url: {
                url: imageDataUrl
            }

        });

    }


    const response =
        await groq.chat.completions.create({

            model: VISION_MODEL,

            messages: [

                {
                    role: "user",
                    content
                }

            ],

            temperature: 0.2
        });


    return (
        response.choices?.[0]?.message?.content ||
        "Unable to analyze scanned PDF."
    );
};


// =====================================================
// CHAT CONTROLLER
// =====================================================

export const chat = async (req, res) => {

    try {

        const {
            message,
            attachment
        } = req.body;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            (!message || !message.trim()) &&
            !attachment
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message or attachment is required"

            });
        }


        const userId =
            req.user.id;


        let aiResponse = "";

        let messageToSave =
            message || "";


        // =================================================
        // GET PREVIOUS CHAT HISTORY
        // =================================================

        const history =
            await getRecentHistory(userId);


        // =================================================
        // IMAGE ATTACHMENT
        // =================================================

        if (
            attachment &&
            attachment.type === "image"
        ) {

            if (!attachment.data) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image data is missing"

                });
            }


            // Validate image size
            const base64 =
                getBase64Data(
                    attachment.data
                );


            if (!base64) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid image data"

                });
            }


            // Make sure data URL exists
            let imageData =
                attachment.data;


            if (
                !imageData.startsWith(
                    "data:image/"
                )
            ) {

                const mimeType =
                    attachment.mimeType ||
                    "image/jpeg";


                imageData =
                    `data:${mimeType};base64,${base64}`;

            }


            // -------------------------------------------------
            // AI VISION
            // -------------------------------------------------

            aiResponse =
                await analyzeImage(

                    imageData,

                    message,

                    history

                );


            messageToSave =
                `[Image: ${
                    attachment.name ||
                    "Unknown Image"
                }] ${
                    message || "Analyze this image."
                }`;
        }


        // =================================================
        // PDF ATTACHMENT
        // =================================================

        else if (
            attachment &&
            attachment.type === "pdf"
        ) {

            if (!attachment.data) {

                return res.status(400).json({

                    success: false,

                    message:
                        "PDF data is missing"

                });
            }


            // -------------------------------------------------
            // BASE64
            // -------------------------------------------------

            const base64Data =
                getBase64Data(
                    attachment.data
                );


            if (!base64Data) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid PDF data"

                });
            }


            // -------------------------------------------------
            // BASE64 → BUFFER
            // -------------------------------------------------

            let pdfBuffer;

            try {

                pdfBuffer =
                    Buffer.from(
                        base64Data,
                        "base64"
                    );

            } catch (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Unable to decode PDF file"

                });
            }


            if (
                !pdfBuffer ||
                pdfBuffer.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "PDF file is empty"

                });
            }


            // -------------------------------------------------
            // DATA URL FOR SCANNED PDF
            // -------------------------------------------------

            const pdfDataUrl =
                `data:application/pdf;base64,${base64Data}`;


            // -------------------------------------------------
            // TRY NORMAL PDF TEXT EXTRACTION
            // -------------------------------------------------

            let extractedText = "";


            try {

                extractedText =
                    await extractPDFText(
                        pdfBuffer
                    );

            } catch (error) {

                console.error(
                    "PDF text extraction failed:",
                    error.message
                );

            }


            // =================================================
            // TEXT PDF
            // =================================================

            if (
                extractedText &&
                extractedText.trim()
            ) {

                const pdfText =
                    extractedText
                        .slice(
                            0,
                            MAX_PDF_TEXT
                        );


                const userQuestion =
                    message ||
                    "Summarize this document and explain its important points.";


                const documentContext = `

UPLOADED PDF DOCUMENT:

${pdfText}

END OF PDF DOCUMENT.
`;


                aiResponse =
                    await askTextAI(

                        userQuestion,

                        history,

                        documentContext

                    );

            }


            // =================================================
            // SCANNED PDF
            // =================================================

            else {

                console.log(
                    "No selectable PDF text found. Using vision fallback..."
                );


                aiResponse =
                    await analyzeScannedPDF(

                        pdfDataUrl,

                        message,

                        history

                    );

            }


            messageToSave =
                `[PDF: ${
                    attachment.name ||
                    "Unknown PDF"
                }] ${
                    message ||
                    "Analyze this PDF."
                }`;
        }


        // =================================================
        // NORMAL TEXT CHAT
        // =================================================

        else {

            if (
                !message ||
                !message.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message is required"

                });
            }


            // -------------------------------------------------
            // AI WITH CHAT HISTORY
            // -------------------------------------------------

            aiResponse =
                await askTextAI(

                    message,

                    history

                );

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

                userMessage:
                    messageToSave,

                aiResponse:
                    aiResponse

            }

        });


    } catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Something went wrong while processing your request."

            });

        }

    }

};


// =====================================================
// GET CHAT HISTORY
// =====================================================

export const getChatHistory = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id;


        const history =
            await getChatHistoryByUserId(
                userId
            );


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