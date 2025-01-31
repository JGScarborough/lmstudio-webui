import fetch from 'node-fetch'
import express from 'express'
import { Configuration, OpenAIApi } from 'openai' // For OpenAI integration
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import path from 'path'
import { request } from 'http'

// Load environment variables
dotenv.config();
// Initialize app and server
const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.resolve(path.dirname(''))
const url = 'http://192.168.0.32:1234'; 
const key = 'lm-studio';
// Serve static files from 'public' directory
app.use(express.static('public'));

// Route to serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/generate', async (req, res) => {
    try {
        const { prompt } = req.query;
        const openaiKey = key;
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        console.log("Prompt from front end: ", prompt)
        let request = {
            "model": "qwen2.5-7b-instruct-1m",
            "messages": [
                { 
                    "role": "user", 
                    "content": prompt 
                }
            ],
            "temperature": 0.7,
            "max_tokens": -1,
            "stream": false
          };
        // Make a POST request to OpenAI's API using node-fetch
        const response = await fetch(url+"/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },            
            body: JSON.stringify(request)
        });
        const data = await response.json();
        const result = data.choices[0].message.content;

        res.json({ content: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Set up CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Configuration for OpenAI API (if needed)
const configuration = new Configuration({
    // apiKey: process.env.OPENAI_API_KEY,
    apiKey: 'lm-studio'
});
const lmStudio = new OpenAIApi(configuration);

// Route definitions
app.get('/v1/models', async (req, res) => {
    try {
        // Retrieve available models from OpenAI
        const response = await lmStudio.models.list();
        const models = response.data;
        
        // Return a custom response with model information
        res.json({
            data: {
                models: [
                    // { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
                    // { id: 'gpt-4', name: 'GPT-4' },
                    { id: 'deepseek-r1:14b', name: 'Deepseek R1 14B'},
                    { id: 'qwen2.5-7b-instruct-1m', name: 'Qwen 2.5 7B Instruct 1M'}
                ],
            },
        });
    } catch (error) {
        console.error('Error in /v1/models:', error);
        res.status(500).json({ error: 'Failed to retrieve models' });
    }
});

app.post('/v1/chat/completions', async (req, res) => {
    try {
        const { model, messages } = req.body;

        // Call OpenAI API for chat completions
        const response = await lmStudio.chat.completions.create({
            model: model,
            messages: messages.map(message => ({
                role: message.role,
                content: message.content,
            })),
        });

        res.json(response);
        console.log('API Response:', data.choices[0].message.content);
    } catch (error) {
        console.error('Error in /v1/chat/completions:', error);
        res.status(500).json({ error: 'Failed to generate chat completion' });
    }
});

app.post('/v1/completions', async (req, res) => {
    try {
        const { model, prompt, max_tokens } = req.body;

        // Call OpenAI API for completions
        const response = await lmStudio.completions.create({
            model: model,
            prompt: prompt,
            max_tokens: max_tokens || 1000,
        });

        res.json(response);
    } catch (error) {
        console.error('Error in /v1/completions:', error);
        res.status(500).json({ error: 'Failed to generate completions' });
    }
});

app.post('/v1/embeddings', async (req, res) => {
    try {
        const { model, input } = req.body;

        // Call OpenAI API for embeddings
        const response = await lmStudio.embeddings.create({
            model: model,
            input: input,
        });

        res.json(response);
    } catch (error) {
        console.error('Error in /v1/embeddings:', error);
        res.status(500).json({ error: 'Failed to generate embeddings' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

async function sendRequest(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
    }
}