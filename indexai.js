import express from 'express';
import { fileURLToPath } from 'url'; // Node.js module to convert URLs to paths
import path from 'path';
import OpenAIApi from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 8000;

app.use(express.static('public'));

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.get('/', function (req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const options = {
        root: path.join(path.dirname(__filename))
    };

    const fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.post('/chat', async (req, res) => {
    const userInput = req.body.userInput;

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: userInput }],
        model: "gpt-3.5-turbo",
    });

    const response = chatCompletion.choices[0].message.content;
    console.log(`AI: ${response}`);
    console.log('------------------------------------------------');

    res.json({ response });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
