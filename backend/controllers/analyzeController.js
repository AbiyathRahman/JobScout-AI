const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: './config.env' });
const dbo = require('../db/conn');

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

const testResponse = async (req, res) => {
  try {
    // Build body according to Claude 3 Messages API
    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 256,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Just reply back with hello world." }
          ]
        }
      ]
    };

    // Send to Bedrock
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body)
    });

    const response = await client.send(command);

    // Decode Bedrock’s response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // For Claude 3, text is inside responseBody.content[].text
    const answer = responseBody.content?.map(block => block.text).join('') || '';

    res.json({ answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "Error: Could not analyze vitals." });
  }
};

module.exports = { testResponse };
