const PORT = 8000
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(cors())
const API_KEY = process.env.API_KEY

app.post('/completions', async (req, res) => {
    const options = {
        method : "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model : "gpt-4o-mini",
            messages: [{role: "user", content: req.body.message}],
            max_tokens: 500,
        })

    }
    try{
        const response = await fetch('https://api.openai.com/v1/chat/completions', options)
        const data = await response.json()
        console.log(data.choices[0].message);
        res.send(data)
        
        
    }catch(err){
        console.log((err));
        
    }
})
app.listen(PORT, () => console.log('Server is running on' + PORT))