import { vocab } from "./vocab.js";

let mode = "pl2en";
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const infoEl = document.getElementById("info");
const toggleBtn = document.getElementById("toggleBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const statsEl = document.getElementById("stats");
let scopeCheckboxes;
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedCountEl = document.getElementById("selectedCount");

dropdownBtn.onclick = () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "flex" ? "none" : "flex";
};

document.addEventListener("click", (e) => {
  if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = "none";
  }
});

function updateSelectedCount() {
  const checked = document.querySelectorAll(".scope:checked").length;
  selectedCountEl.textContent = checked;
}


const STATS_KEY = "englishQuizStats";
function loadStats() {
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) { try { return JSON.parse(saved); } catch {} }
  return { correct: 0, wrong: 0 };
}
function saveStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }
let stats = loadStats();
function renderStats() {
  statsEl.textContent = `Correct: ${stats.correct} | Wrong: ${stats.wrong}`;
}
resetBtn.onclick = () => { stats = { correct: 0, wrong: 0 }; saveStats(stats); renderStats(); };

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function getActiveVocab() {
  const activeScopes = Array.from(scopeCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  return vocab.filter(v => activeScopes.includes(v.scope));
}

function newQuestion() {
  infoEl.textContent = "";
  optionsEl.innerHTML = "";

  const pool = getActiveVocab();
  if (pool.length < 4) {
    questionEl.textContent = "Select at least 1 category.";
    return;
  }

  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(pool.filter(v => v !== correct)).slice(0,3);
  const answers = shuffle([correct, ...others]);

  questionEl.textContent = mode === "pl2en"
    ? `How do you say in English: "${correct.pl}"?`
    : `How do you say in Polish: "${correct.en}"?`;

  answers.forEach(v => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = mode === "pl2en" ? v.en : v.pl;
    btn.onclick = () => checkAnswer(btn, v === correct, correct);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(btn, isCorrect, correct) {
  document.querySelectorAll('.option').forEach(b => b.disabled = true);
  if (isCorrect) {
    btn.classList.add('correct');
    infoEl.textContent = "✅ Correct!";
    stats.correct++;
  } else {
    btn.classList.add('wrong');
    const rightText = mode === "pl2en" ? correct.en : correct.pl;
    infoEl.textContent = `❌ Wrong. Correct answer: ${rightText}`;
    stats.wrong++;
  }
  saveStats(stats);
  renderStats();
}


toggleBtn.onclick = () => {
  mode = mode === "pl2en" ? "en2pl" : "pl2en";
  toggleBtn.textContent = mode === "pl2en" ? "Mode: PL → EN" : "Mode: EN → PL";
  newQuestion();
};

nextBtn.onclick = newQuestion;
scopeCheckboxes = document.querySelectorAll('.scope');
scopeCheckboxes.forEach(cb => cb.addEventListener('change', newQuestion));
scopeCheckboxes = document.querySelectorAll('.scope');

scopeCheckboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    updateSelectedCount();
    newQuestion();
  });
});

updateSelectedCount();
renderStats();
newQuestion();
