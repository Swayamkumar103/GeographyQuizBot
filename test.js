const axios = require("axios");

const API_URL = "http://localhost:3000/api/chat";
const SESSION_ID = "test-session";

// Test dataset
const testCases = [
  { question: "Capital of India", userAnswer: "New Delhi", correct: true },
  { question: "Longest river", userAnswer: "Amazon", correct: false },
  { question: "Largest ocean", userAnswer: "Pacific", correct: true },
  { question: "Capital of USA", userAnswer: "Washington", correct: true },
  { question: "Sahara in Asia?", userAnswer: "Yes", correct: false }
];

let TP = 0, TN = 0, FP = 0, FN = 0;

async function runTest() {
  for (let test of testCases) {
    try {
      const res = await axios.post(API_URL, {
        message: test.userAnswer,
        sessionId: SESSION_ID
      });

      const reply = res.data.reply.toLowerCase();

      const botSaysCorrect = reply.includes("correct");

      // Evaluate result
      if (test.correct && botSaysCorrect) TP++;
      else if (!test.correct && !botSaysCorrect) TN++;
      else if (!test.correct && botSaysCorrect) FP++;
      else if (test.correct && !botSaysCorrect) FN++;

      console.log(`Q: ${test.question}`);
      console.log(`User: ${test.userAnswer}`);
      console.log(`Bot: ${res.data.reply}`);
      console.log("----");

    } catch (err) {
      console.error("Error:", err.message);
    }
  }

  // Metrics
  const accuracy = (TP + TN) / (TP + TN + FP + FN);
  const precision = TP / (TP + FP);
  const recall = TP / (TP + FN);
  const f1 = 2 * (precision * recall) / (precision + recall);

  console.log("\n=== RESULTS ===");
  console.log("TP:", TP);
  console.log("TN:", TN);
  console.log("FP:", FP);
  console.log("FN:", FN);
  console.log("Accuracy:", accuracy.toFixed(2));
  console.log("F1 Score:", f1.toFixed(2));
}

runTest();