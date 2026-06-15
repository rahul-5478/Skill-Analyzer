import fs from 'fs';
import path from 'path';

export async function parseResumeFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      const buffer = fs.readFileSync(filePath);
      
      // ✅ Fix — pdf-parse ka safe import
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // Plain text fallback
    return fs.readFileSync(filePath, 'utf8');

  } catch (err) {
    console.error('🔴 parseResumeFile error:', err.message);
    throw err;
  }
}