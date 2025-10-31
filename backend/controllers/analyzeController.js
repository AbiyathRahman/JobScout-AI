const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: './config.env' });
const dbo = require('../db/conn');
const util = require('util');

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

const analyzeResume = async (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    throw new Error('Missing resume text or job description.');
  }

  try {
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert ATS (Applicant Tracking System) and technical recruiter. 
Always respond in valid JSON format.

Compare the following RESUME and JOB DESCRIPTION. Analyze the degree of match between them. 
Then respond in STRICT JSON format with ONLY these fields:

{
  "jobTitle": "<string>",
  "matchPercentage": <number 0-100>,
  "missingKeywords": ["keyword1","keyword2"],
  "suggestions": ["suggestion 1","suggestion 2"]
}

Be concise and precise. Do NOT include extra text outside the JSON.

RESUME:
--------------
${resumeText}
--------------

JOB DESCRIPTION:
--------------
${jobDescription}
--------------`
            }
          ]
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.debug('Bedrock response body:', util.inspect(responseBody, { depth: 3 }));

    // Extract the model output
    const answer =
      responseBody.content?.map(c => c.text || '').join('') ||
      responseBody.completion ||
      responseBody.outputText ||
      JSON.stringify(responseBody);
    
    let parsedAnswer;
    try{
      parsedAnswer = JSON.parse(answer);

    }catch(parseErr){
      console.warn("Invalid JSON returned from model, returning raw answer.");
      parsedAnswer = { raw: answer };
    } 

    return parsedAnswer;

  } catch (error) {
    console.error('Bedrock error:', util.inspect(error, { depth: 3 }));
    throw new Error('Error: Could not analyze resume.');
  }
};

module.exports = { analyzeResume };

