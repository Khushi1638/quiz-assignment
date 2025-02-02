const startBtn = document.querySelector("#start-quiz");
const quizContainer = document.querySelector(".quiz-container");
const quiz = document.querySelector("#quiz");
const questionContainer = document.querySelector("#question-container");
const optionContainer = document.querySelector("#options-container");
const timerDisplay = document.querySelector("#time");
const nextBtn = document.querySelector("#next-question");
const resultContainer = document.querySelector("#result-container");
const correctAnswersDisplay = document.querySelector("#correct-answers");
const wrongAnswersDisplay = document.querySelector("#wrong-answers");
const descriptionContainer = document.querySelector("#description-container");

let currentQuestionIndex = 0;
let quizData = [];
let timer;
let score = 0;
let incorrectAnswers = 0;
let correctAnswers = 0;

// Fetch quiz data from API
async function fetchQuizData() {
  const apiUrl = "https://opentdb.com/api.php?amount=10&category=18&type=multiple";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response is not ok");
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return [];
  }
}

// Check the selected answer
function checkAnswer(selectedAnswer, correctAnswer) {
  clearInterval(timer);

  const optionsBtn = document.querySelectorAll(".option");
  optionsBtn.forEach((option) => {
    option.disabled = true;
    if (option.textContent === correctAnswer) {
      option.classList.add("correct");
    }
  });

  descriptionContainer.innerHTML = ""; // Clear previous descriptions

  if (selectedAnswer.textContent !== correctAnswer) {
    selectedAnswer.classList.add("incorrect");
    descriptionContainer.classList.remove("hidden");
    descriptionContainer.innerHTML = `<p class="description">❌ Incorrect! The correct answer is: <strong>${correctAnswer}</strong></p>`;
    incorrectAnswers++;
  } else {
    correctAnswers++;
    // 🎉 Trigger Confetti 🎉
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }, // Adjust height
    });
    descriptionContainer.classList.remove("hidden");
    descriptionContainer.innerHTML = `<p class="description">✅ Correct!</p>`;
  }
  nextBtn.style.display = "block";
}

// Show the quiz results
function showResults() {
  quiz.classList.remove("visible");
  resultContainer.classList.add("visible");
  resultContainer.classList.remove("hidden");
  correctAnswersDisplay.textContent = correctAnswers;
  wrongAnswersDisplay.textContent = incorrectAnswers;
}

// Restart the quiz
function restartQuiz() {
  correctAnswers = 0;
  incorrectAnswers = 0;
  currentQuestionIndex = 0;
  resultContainer.classList.add("hidden");
  resultContainer.classList.remove("visible");
  quiz.classList.add("visible");
  startQuiz();
}

// Render the quiz questions
function renderQuiz(quizData) {
  if (currentQuestionIndex >= quizData.length) {
    showResults();
    return;
  }
  setTimeout(() => {
    quiz.classList.add("visible");
  }, 4000);
  nextBtn.style.display = "none";

  const currentQuestion = quizData[currentQuestionIndex];
  questionContainer.innerHTML = `<h3>${currentQuestionIndex + 1}. ${currentQuestion.question}</h3>`;

  const options = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ];
  shuffle(options);
  optionContainer.innerHTML = options
    .map((option) => `<button class="option">${option}</button>`)
    .join("");

  const optionsBtn = document.querySelectorAll(".option");
  optionsBtn.forEach((option) => {
    option.addEventListener("click", () => {
      checkAnswer(option, currentQuestion.correct_answer);
    });
  });

  // Change "Next" button to "Submit" on the last question
  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.textContent = "Submit";
    nextBtn.removeEventListener("click", nextQuestion);
    nextBtn.addEventListener("click", showResults);
  } else {
    nextBtn.textContent = "Next";
    nextBtn.removeEventListener("click", showResults);
    nextBtn.addEventListener("click", nextQuestion);
  }
  clearInterval(timer);
  startTimer(30);
}

// Start the countdown timer
function startTimer(duration) {
  let timeLeft = duration;
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft < 10) {
      timerDisplay.style.color = "red";
    } else {
      timerDisplay.style.color = "black";
    }
    if (timeLeft <= 0) {
      clearInterval(timer);
      currentQuestionIndex++;
      renderQuiz(quizData);
    }
  }, 1000);
}

// Shuffle the options for each question
function shuffle(options) {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
}

// Move to the next question
function nextQuestion() {
  currentQuestionIndex++;
  renderQuiz(quizData);
  descriptionContainer.innerHTML = "";
}

// Start the quiz
function startQuiz() {
  // Fetch quiz data and render
  fetchQuizData().then((data) => {
    if (Array.isArray(data) && data.length > 0) {
      quizData = data;
      renderQuiz(quizData);
    } else {
      console.error("No quiz data available!");
    }
  });
}

// Start the countdown timer before quiz starts
const startCount = () => {
  const countdownContain = document.querySelector("#countdown-container");
  const countTextContent = document.querySelector("#countdown");

  let countdownNum = ["3", "2", "1", "Go!"];
  let idx = 0;
  countdownContain.style.display = "flex";
  countdownContain.classList.add("show");
  
  let countdownInterval = setInterval(() => {
    countTextContent.textContent = countdownNum[idx];
    idx++;

    if (idx >= countdownNum.length) {
      setTimeout(() => {
        clearInterval(countdownInterval);
        countdownContain.classList.remove("show");
      }, 1000);
    }
  }, 1000);
};

// Hide the initial quiz container
const removeQuizContain = () => {
  setTimeout(() => {
    quizContainer.classList.add("hidden");
  }, 4000);
};

// Event listeners for starting the quiz and moving to the next question
nextBtn.addEventListener("click", nextQuestion);
startBtn.addEventListener("click", () => {
  startCount();
  startQuiz();
  removeQuizContain();
});
