// Questions array based on the Communication Style Scoring Table
const questions = [
  {
    id: 1,
    text: "I prefer to communicate in a straightforward and direct manner.",
    type: "direct",
  },
  {
    id: 2,
    text: "I tend to use indirect communication and hints rather than explicit statements.",
    type: "indirect",
  },
  {
    id: 3,
    text: "I pay close attention to context and non-verbal cues when communicating.",
    type: "indirect",
  },
  {
    id: 4,
    text: "I believe in being explicit and clear in my communication, leaving little room for interpretation.",
    type: "direct",
  },
  {
    id: 5,
    text: "When facing conflict, I address it directly and openly.",
    type: "direct",
  },
  {
    id: 6,
    text: "I prefer to avoid direct confrontation and find indirect ways to resolve conflicts.",
    type: "indirect",
  },
  {
    id: 7,
    text: "I am comfortable with periods of silence in conversation.",
    type: "indirect",
  },
  {
    id: 8,
    text: "I believe silence can be meaningful and communicative.",
    type: "indirect",
  },
  {
    id: 9,
    text: "I focus primarily on tasks and goals rather than building relationships in professional settings.",
    type: "direct",
  },
  {
    id: 10,
    text: "Building relationships is as important as completing tasks in my work.",
    type: "indirect",
  },
  {
    id: 11,
    text: "I feel comfortable standing close to others during conversations.",
    type: "direct",
  },
  {
    id: 12,
    text: "I prefer maintaining a respectful distance and personal space during interactions.",
    type: "indirect",
  },
  {
    id: 13,
    text: "I am comfortable with casual physical touch like handshakes, pats on the back, etc.",
    type: "direct",
  },
  {
    id: 14,
    text: "I prefer minimal physical contact in professional and social interactions.",
    type: "indirect",
  },
  {
    id: 15,
    text: "I value punctuality and expect meetings to start and end on time.",
    type: "direct",
  },
  {
    id: 16,
    text: "I have a flexible approach to time and deadlines.",
    type: "indirect",
  },
];

let currentQuestionIndex = 0;
let answers = new Array(16).fill(null);
let participantName = "";

// DOM Elements
const startBtn = document.getElementById("start-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const introSection = document.querySelector(".intro-section");
const questionsSection = document.getElementById("questions-section");
const resultsSection = document.getElementById("results-section");

const questionText = document.getElementById("question-text");
const currentQuestionSpan = document.getElementById("current-question");
const progressFill = document.getElementById("progress");

// Event Listeners
startBtn.addEventListener("click", startQuiz);
prevBtn.addEventListener("click", previousQuestion);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", resetQuiz);

// Radio button change listener
document.querySelectorAll('input[name="answer"]').forEach((radio) => {
  radio.addEventListener("change", handleAnswerSelection);
});

function startQuiz() {
  const nameInput = document.getElementById("participant-name");
  participantName = nameInput.value.trim();

  if (!participantName) {
    alert("Please enter your name to begin the assessment");
    nameInput.focus();
    return;
  }

  introSection.classList.add("hidden");
  questionsSection.classList.remove("hidden");
  displayQuestion();
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.text;
  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  // Update progress bar
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFill.style.width = progress + "%";

  // Clear previous selection
  document.querySelectorAll('input[name="answer"]').forEach((radio) => {
    radio.checked = false;
  });

  // Restore saved answer if exists
  if (answers[currentQuestionIndex] !== null) {
    const savedAnswer = answers[currentQuestionIndex];
    document.querySelector(
      `input[name="answer"][value="${savedAnswer}"]`
    ).checked = true;
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }

  // Update button states
  prevBtn.disabled = currentQuestionIndex === 0;

  // Change "Next" to "Submit" on last question
  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.textContent = "Submit";
  } else {
    nextBtn.textContent = "Next";
  }
}

function handleAnswerSelection(event) {
  answers[currentQuestionIndex] = Number.parseInt(event.target.value);
  nextBtn.disabled = false;
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    // All questions answered, show results
    calculateAndDisplayResults();
  }
}

function calculateAndDisplayResults() {
  // Calculate Direct/Low-context score (questions 1, 4, 5, 9, 11, 13, 15)
  const directIndices = [0, 3, 4, 8, 10, 12, 14]; // 0-based indices
  const directScore = directIndices.reduce(
    (sum, index) => sum + answers[index],
    0
  );

  // Calculate Indirect/High-context score (questions 2, 3, 6, 7, 8, 10, 12, 14, 16)
  const indirectIndices = [1, 2, 5, 6, 7, 9, 11, 13, 15]; // 0-based indices
  const indirectScore = indirectIndices.reduce(
    (sum, index) => sum + answers[index],
    0
  );

  document.getElementById("participant-greeting").textContent = participantName;

  // Display scores
  document.getElementById("direct-score").textContent = directScore;
  document.getElementById("indirect-score").textContent = indirectScore;

  const totalScore = directScore + indirectScore;
  const directPercentage = ((directScore / totalScore) * 100).toFixed(0);
  const indirectPercentage = ((indirectScore / totalScore) * 100).toFixed(0);
  document.getElementById("direct-percentage").textContent =
    directPercentage + "%";
  document.getElementById("indirect-percentage").textContent =
    indirectPercentage + "%";

  updateDonutChart(directScore, indirectScore);

  updateCharacteristicBars();

  generateRecommendations(directScore, indirectScore);

  generateLanguageGroupFit(directScore, indirectScore);

  // Generate interpretation
  const interpretation = generateInterpretation(directScore, indirectScore);
  document.getElementById("interpretation-text").textContent = interpretation;

  // Show results section
  questionsSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
}

function updateDonutChart(directScore, indirectScore) {
  const total = directScore + indirectScore;
  const directPercent = (directScore / total) * 100;
  const indirectPercent = (indirectScore / total) * 100;

  const circumference = 2 * Math.PI * 80; // radius is 80

  const directArc = document.getElementById("direct-arc");
  const indirectArc = document.getElementById("indirect-arc");

  const directLength = (directPercent / 100) * circumference;
  const indirectLength = (indirectPercent / 100) * circumference;

  directArc.style.strokeDasharray = `${directLength} ${circumference}`;
  directArc.style.strokeDashoffset = "0";

  indirectArc.style.strokeDasharray = `${indirectLength} ${circumference}`;
  indirectArc.style.strokeDashoffset = `-${directLength}`;
}

function updateCharacteristicBars() {
  // Communication Approach (Q1, Q2)
  const commApproachRaw = (answers[0] + (5 - answers[1])) / 10;

  // Relationship Focus (Q9, Q10)
  const relationshipFocusRaw = (answers[9] + (5 - answers[8])) / 10;

  // Conflict Resolution (Q5, Q6)
  const conflictResolutionRaw = (answers[4] + (5 - answers[5])) / 10;

  // Context Sensitivity (Q3, Q4)
  const contextSensitivityRaw = (answers[2] + (5 - answers[3])) / 10;

  // Normalize to sum to 100%
  const totalRaw =
    commApproachRaw +
    relationshipFocusRaw +
    conflictResolutionRaw +
    contextSensitivityRaw;

  const commApproach = (commApproachRaw / totalRaw) * 100;
  const relationshipFocus = (relationshipFocusRaw / totalRaw) * 100;
  const conflictResolution = (conflictResolutionRaw / totalRaw) * 100;
  const contextSensitivity = (contextSensitivityRaw / totalRaw) * 100;

  document.getElementById("comm-approach-value").textContent =
    commApproach.toFixed(0) + "%";
  document.getElementById("comm-approach-bar").style.width = commApproach + "%";

  document.getElementById("relationship-focus-value").textContent =
    relationshipFocus.toFixed(0) + "%";
  document.getElementById("relationship-focus-bar").style.width =
    relationshipFocus + "%";

  document.getElementById("conflict-resolution-value").textContent =
    conflictResolution.toFixed(0) + "%";
  document.getElementById("conflict-resolution-bar").style.width =
    conflictResolution + "%";

  document.getElementById("context-sensitivity-value").textContent =
    contextSensitivity.toFixed(0) + "%";
  document.getElementById("context-sensitivity-bar").style.width =
    contextSensitivity + "%";
}

function generateRecommendations(directScore, indirectScore) {
  const container = document.getElementById("recommendations-container");
  container.innerHTML = "";

  let recommendations = [];

  if (directScore > indirectScore) {
    recommendations = [
      {
        title: "Develop Context Awareness",
        text: "Practice paying attention to non-verbal cues, body language, and what's left unsaid in conversations.",
      },
      {
        title: "Build Relationships First",
        text: "When working with high-context cultures, invest time in building personal relationships before jumping into business matters.",
      },
      {
        title: "Practice Indirect Communication",
        text: "Learn to read between the lines and use more subtle ways of expressing disagreement or concerns.",
      },
      {
        title: "Be Patient with Ambiguity",
        text: "Not all cultures value explicit clarity. Practice being comfortable with indirect responses and implied meanings.",
      },
    ];
  } else {
    recommendations = [
      {
        title: "Be More Explicit",
        text: "When working with low-context cultures, state your thoughts and needs more directly and clearly.",
      },
      {
        title: "Address Conflicts Directly",
        text: "Practice confronting issues head-on rather than avoiding them. Direct cultures appreciate honest dialogue.",
      },
      {
        title: "Focus on Tasks",
        text: "In professional settings with direct communicators, balance relationship-building with task completion.",
      },
      {
        title: "Value Punctuality",
        text: "Low-context cultures typically have strict time expectations. Strive to be on time for meetings and deadlines.",
      },
    ];
  }

  recommendations.forEach((rec) => {
    const item = document.createElement("div");
    item.className = "recommendation-item";
    item.innerHTML = `
      <h4>${rec.title}</h4>
      <p>${rec.text}</p>
    `;
    container.appendChild(item);
  });
}

function generateLanguageGroupFit(directScore, indirectScore) {
  const container = document.getElementById("cultural-bars-container");
  container.innerHTML = "";

  const directPercent = (directScore / 35) * 100;
  const indirectPercent = (indirectScore / 45) * 100;

  // Define language groups with their communication styles and representative countries
  const languageGroups = [
    {
      name: "Indo-European (Germanic)",
      languages: "English, German, Dutch",
      countries: ["🇺🇸", "🇬🇧", "🇩🇪", "🇳🇱"],
      baseScore: directPercent * 0.95,
      type: "direct",
    },
    {
      name: "Indo-European (Romance)",
      languages: "Spanish, French, Italian, Portuguese",
      countries: ["🇪🇸", "🇫🇷", "🇮🇹", "🇵🇹"],
      baseScore: directPercent * 0.6 + indirectPercent * 0.4,
      type: "mixed",
    },
    {
      name: "Indo-European (Slavic)",
      languages: "Russian, Polish, Czech, Serbian",
      countries: ["🇷🇺", "🇵🇱", "🇨🇿", "🇷🇸"],
      baseScore: directPercent * 0.5 + indirectPercent * 0.5,
      type: "mixed",
    },
    {
      name: "Sino-Tibetan",
      languages: "Mandarin, Cantonese, Tibetan",
      countries: ["🇨🇳", "🇭🇰", "🇹🇼"],
      baseScore: indirectPercent * 0.98,
      type: "indirect",
    },
    {
      name: "Japanese",
      languages: "Japanese",
      countries: ["🇯🇵"],
      baseScore: indirectPercent * 1.0,
      type: "indirect",
    },
    {
      name: "Korean",
      languages: "Korean",
      countries: ["🇰🇷"],
      baseScore: indirectPercent * 0.96,
      type: "indirect",
    },
    {
      name: "Afro-Asiatic (Semitic)",
      languages: "Arabic, Hebrew",
      countries: ["🇸🇦", "🇦🇪", "🇪🇬", "🇮🇱"],
      baseScore: indirectPercent * 0.92,
      type: "indirect",
    },
    {
      name: "Turkic",
      languages: "Turkish, Kazakh, Uzbek, Azerbaijani",
      countries: ["🇹🇷", "🇰🇿", "🇺🇿", "🇦🇿"],
      baseScore: indirectPercent * 0.9,
      type: "indirect",
    },
    {
      name: "Dravidian",
      languages: "Tamil, Telugu, Kannada, Malayalam",
      countries: ["🇮🇳"],
      baseScore: indirectPercent * 0.88,
      type: "indirect",
    },
    {
      name: "Austronesian",
      languages: "Indonesian, Malay, Tagalog, Malagasy",
      countries: ["🇮🇩", "🇲🇾", "🇵🇭", "🇲🇬"],
      baseScore: indirectPercent * 0.85,
      type: "indirect",
    },
    {
      name: "Finno-Ugric",
      languages: "Finnish, Hungarian, Estonian",
      countries: ["🇫🇮", "🇭🇺", "🇪🇪"],
      baseScore: directPercent * 0.65 + indirectPercent * 0.35,
      type: "mixed",
    },
    {
      name: "Indo-Iranian (Persian)",
      languages: "Persian (Farsi), Kurdish, Pashto",
      countries: ["🇮🇷", "🇦🇫"],
      baseScore: indirectPercent * 0.87,
      type: "indirect",
    },
    {
      name: "Indo-European (Indic)",
      languages: "Hindi, Bengali, Punjabi, Urdu",
      countries: ["🇮🇳", "🇵🇰", "🇧🇩"],
      baseScore: directPercent * 0.4 + indirectPercent * 0.6,
      type: "mixed",
    },
    {
      name: "Austroasiatic",
      languages: "Vietnamese, Khmer",
      countries: ["🇻🇳", "🇰🇭"],
      baseScore: indirectPercent * 0.89,
      type: "indirect",
    },
    {
      name: "Niger-Congo",
      languages: "Swahili, Yoruba, Zulu",
      countries: ["🇰🇪", "🇹🇿", "🇳🇬", "🇿🇦"],
      baseScore: directPercent * 0.45 + indirectPercent * 0.55,
      type: "mixed",
    },
  ];

  // Sort by compatibility score
  languageGroups.sort((a, b) => b.baseScore - a.baseScore);

  const topGroups = languageGroups.slice(0, 8);
  const totalBaseScore = topGroups.reduce(
    (sum, group) => sum + group.baseScore,
    0
  );

  topGroups.forEach((group) => {
    group.score = (group.baseScore / totalBaseScore) * 100;
  });

  // Determine user's primary communication style
  const userStyle = directPercent > indirectPercent ? "direct" : "indirect";
  const styleDifference = Math.abs(directPercent - indirectPercent);
  const isMixed = styleDifference < 15;

  // Add interpretation header
  const interpretationDiv = document.createElement("div");
  interpretationDiv.className = "language-group-interpretation";

  let styleDescription = "";
  if (isMixed) {
    styleDescription = `You have a <strong>balanced communication style</strong> that adapts well to both direct and indirect cultures. This versatility makes you effective in diverse cultural settings.`;
  } else if (userStyle === "direct") {
    styleDescription = `You prefer a <strong>direct, low-context communication style</strong>, most common in Germanic and Scandinavian language groups. You value clarity, explicit messages, and task-oriented interactions.`;
  } else {
    styleDescription = `You prefer an <strong>indirect, high-context communication style</strong>, most common in Asian, Middle Eastern, and many other language groups. You value context, harmony, and relationship-building.`;
  }

  interpretationDiv.innerHTML = `
    <p class="style-interpretation">${styleDescription}</p>
    <p class="compatibility-note">Below are your top 8 language families ranked by compatibility (totaling 100%):</p>
  `;
  container.appendChild(interpretationDiv);

  // Display top matches with enhanced styling
  topGroups.forEach((group, index) => {
    const isTopMatch = index < 3;
    const item = document.createElement("div");
    item.className = `cultural-bar-item ${isTopMatch ? "top-match" : ""}`;

    const matchLevel =
      group.score >= 15
        ? "Excellent Match"
        : group.score >= 12
        ? "Good Match"
        : group.score >= 10
        ? "Moderate Match"
        : "Lower Match";

    const matchClass =
      group.score >= 15
        ? "match-excellent"
        : group.score >= 12
        ? "match-good"
        : group.score >= 10
        ? "match-moderate"
        : "match-lower";

    item.innerHTML = `
      <div class="cultural-bar-header">
        <div class="group-info">
          <div class="group-flags">${group.countries.join(" ")}</div>
          <h4 class="group-name">${group.name}</h4>
          <p class="group-languages">${group.languages}</p>
        </div>
        <div class="match-info">
          <span class="cultural-bar-score">${group.score.toFixed(1)}%</span>
          <span class="match-badge ${matchClass}">${matchLevel}</span>
        </div>
      </div>
      <div class="cultural-bar-bg">
        <div class="cultural-bar-fill ${group.type}" style="width: ${
      group.score
    }%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function generateInterpretation(directScore, indirectScore) {
  const difference = Math.abs(directScore - indirectScore);

  if (directScore > indirectScore) {
    if (difference > 10) {
      return "You strongly prefer direct, task-oriented communication typical in Anglo-American and Germanic cultures. You value clarity, explicit messages, and addressing issues head-on. This communication style is effective in low-context environments where information is conveyed primarily through words rather than context.";
    } else {
      return "You have a moderate preference for direct, task-oriented communication. While you appreciate clarity and explicit communication, you also show some flexibility in adapting to different communication contexts. This balanced approach can be beneficial in diverse cultural settings.";
    }
  } else if (indirectScore > directScore) {
    if (difference > 10) {
      return "You strongly prefer indirect, relationship-oriented communication typical in Japanese, Arab, and Kazakh cultures. You value context, non-verbal cues, and maintaining harmony in relationships. This communication style is effective in high-context environments where much of the communication happens implicitly.";
    } else {
      return "You have a moderate preference for indirect, relationship-oriented communication. While you value context and relationships, you also show some comfort with direct communication when needed. This adaptable approach can be beneficial in diverse cultural settings.";
    }
  } else {
    return "You have a mixed communication style with nearly equal preferences for both direct and indirect communication. This balanced approach indicates strong adaptability to different cultural contexts. You can effectively navigate both low-context and high-context communication environments, making you well-suited for cross-cultural interactions.";
  }
}

function resetQuiz() {
  currentQuestionIndex = 0;
  answers = new Array(16).fill(null);
  participantName = "";
  document.getElementById("participant-name").value = "";
  resultsSection.classList.add("hidden");
  introSection.classList.remove("hidden");
  progressFill.style.width = "0%";
}
