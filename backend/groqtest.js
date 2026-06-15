import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

try {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: 'Hello'
      }
    ]
  });

  console.log('✅ Success');
  console.log(response.choices[0].message.content);
} catch (err) {
  console.error('❌ Error');
  console.error(err);
}