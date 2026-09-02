import PDFDocument from "pdfkit";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generatePDF = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        // AI se content generate
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content:
                        "Generate well-structured and professional content for a PDF document."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const content =
            response.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({
                success: false,
                message: "AI content generation failed"
            });
        }

        // PDF create
        const doc = new PDFDocument();

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="generated-document.pdf"'
        );

        doc.pipe(res);

        doc.fontSize(20)
            .text("AI Generated Document", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(12)
            .text(content, {
                align: "left"
            });

        doc.end();

    } catch (error) {
        console.error("PDF Generation Error:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to generate PDF"
        });
    }
};