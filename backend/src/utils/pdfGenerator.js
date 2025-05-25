import PDFDocument from "pdfkit";
import fs from "fs";

export const generateSummaryPDF = async (summary, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Add header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Meeting Summary", { align: "center" });
      doc.moveDown(2);

      // Add content
      doc.fontSize(12).font("Helvetica");

      // Split the summary into sections and format them
      const sections = summary.split("\n\n");
      sections.forEach((section) => {
        doc.text(section.trim());
        doc.moveDown();
      });

      doc.end();

      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};
