# GeographyQuizBot
# 🌍 GeoBot – AI Geography Quiz Chatbot

GeoBot is an AI-powered chatbot that provides an interactive way to learn geography through quizzes and conversation. It allows users to answer questions, receive instant feedback, and ask geography-related queries in a chat-based interface.

---

## 🚀 Features

- 🧠 AI-based question generation and answer evaluation  
- 💬 Chat-style interface (like WhatsApp)  
- 📚 Quiz Mode + Question Mode  
- ⚡ Real-time feedback with explanations  
- 🔒 Restricts responses to geography-related topics  
- 🧾 Session-based conversation memory  

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **AI Model:** Groq (LLaMA 3 models)  
- **API Handling:** REST APIs  
- **Environment:** dotenv  

---

## 🧠 How It Works

1. User interacts through chat interface  
2. Message is sent to backend server  
3. Backend forwards request to AI model (Groq API)  
4. AI processes input and generates response  
5. Response is displayed to user in chat format  

---

## 📂 Project Structure
GeoBot/
│
├── public/ # Frontend files
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── server.js # Backend server
├── .env # API keys (not pushed to GitHub)
├── package.json
└── README.md


---

## ⚙️ Installation & Setup

### 1. Clone the repository

git clone https://github.com/YOUR-USERNAME/geobot.git
cd geobot


### 2. Install dependencies
Node.js
express
Groq-sdk module


### 3. Add environment variables
Create a `.env` file:


### 4. Run the server

node server.js


### 5. Open in browser
http://localhost3000


---

## 🧪 Testing

The chatbot can be tested by:
- Providing correct and incorrect answers
- Asking geography-related questions
- Observing system responses and behavior

---

## 🎯 Objective

To develop an AI-based chatbot that makes geography learning interactive through quizzes and conversational interaction.

---

## 🔮 Future Enhancements

- 🎤 Voice interaction (speech-to-text & text-to-speech)  
- 🏆 Leaderboard system for user ranking  
- ☁️ Deployment on cloud platforms  
- 📱 Mobile application support  

---

## ⚠️ Important Notes

- Do not expose your API key publicly  
- Ensure `.env` file is added to `.gitignore`  

---

## 👨‍💻 Author

**Swayam Kumar**  
B.Tech Student | Web Developer  

---

## ⭐ Acknowledgment

This project was developed as part of an academic learning initiative to explore AI-based chatbot systems.
