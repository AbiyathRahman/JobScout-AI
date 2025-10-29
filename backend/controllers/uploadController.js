const dbo = require('../db/conn');
const pdf = require('pdf-parse');
const multer = require('multer');

const cleanText = (text) => {
  return text
    .replace(/\r?\n|\r/g, " ")     // remove line breaks
    .replace(/\s+/g, " ")          // collapse multiple spaces
    .trim();                       // remove leading/trailing spaces
};
const uploadResume = async (req, res) => {
    if(!req.file){
            return res.status(400).json({error: "No file uploaded"});
        }
        const fileBuffer = new Uint8Array(req.file.buffer);
        try{
            let db_connect = dbo.getDb();
            const data =  new pdf.PDFParse(fileBuffer);
            const result = await data.getText();
            const cleanedText = cleanText(result.text);
            await db_connect.collection('users').updateOne(
              { username: req.session.user.username },
              { $set: { resumeText: cleanedText } }
            );
            res.json({message: 'File uploaded successfully and parsed', parsedText: cleanedText});
        }catch(err){
            console.error(err);
            return res.status(500).json({error: "Error processing the uploaded file"});
        }
};
module.exports = { uploadResume };