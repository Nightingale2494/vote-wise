const profileForm = document.getElementById("profile-form");
const guidanceOutput = document.getElementById("guidance-output");
const progressPill = document.getElementById("progress-pill");
const timelineRoot = document.getElementById("timeline");
const locationForm = document.getElementById("location-form");
const locationOutput = document.getElementById("location-output");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
const demoFill = document.getElementById("demo-fill");
const stepNodes = Array.from(document.querySelectorAll(".step"));
const chips = Array.from(document.querySelectorAll(".chip"));

const timelinePhases = [
  "Registration Phase",
  "Campaigning",
  "Voting Day",
  "Counting",
  "Results",
];

let userContext = {
  age: null,
  country: "India",
  state: "",
  registrationStatus: "not_registered",
};

function activateStep(index) {
  stepNodes.forEach((step, i) => step.classList.toggle("active", i <= index));
}

function renderTimeline(currentIndex = 0) {
  timelineRoot.innerHTML = "";
  timelinePhases.forEach((phase, index) => {
    const card = document.createElement("article");
    card.className = `timeline-item ${index === currentIndex ? "current" : ""}`;
    card.setAttribute("role", "listitem");
    card.innerHTML = `<strong>${phase}</strong>${
      index === currentIndex ? " <span> — You are here 📍</span>" : ""
    }`;
    timelineRoot.appendChild(card);
  });
}

function buildGuidance(age, registrationStatus) {
  if (age < 18) {
    return {
      title: "You are not eligible yet — but you can prepare now ✅",
      body: [
        "Learn how voter registration works before your 18th birthday.",
        "Keep documents ready: proof of age, address proof, and photo.",
        "Follow Election Commission updates and local voter awareness drives.",
      ],
      timelineStep: 0,
      progress: "Prep mode",
    };
  }

  if (registrationStatus === "not_registered") {
    return {
      title: "Great, your next move is registration 📝",
      body: [
        "Open NVSP and complete Form 6 for new voter registration.",
        "Upload required documents (age/address/photo) carefully.",
        "Submit, save your reference number, and track application status.",
      ],
      timelineStep: 0,
      progress: "Registration",
    };
  }

  return {
    title: "Awesome — you are registered. Let’s get you voting 🗳️",
    body: [
      "Verify your name in the latest electoral roll.",
      "Check your polling booth location before voting day.",
      "Carry EPIC (voter ID) or another accepted photo ID.",
    ],
    timelineStep: 2,
    progress: "Voting readiness",
  };
}

function renderGuidance(guidance) {
  guidanceOutput.innerHTML = `
    <h3>${guidance.title}</h3>
    <ul>${guidance.body.map((step) => `<li>${step}</li>`).join("")}</ul>
  `;
  progressPill.textContent = guidance.progress;
  renderTimeline(guidance.timelineStep);
}

function respondToChat(message) {
  const q = message.trim().toLowerCase();

  if (q.includes("evm")) {
    return "EVM means Electronic Voting Machine. It is used to cast votes digitally, and VVPAT helps with paper audit verification.";
  }

  if (q.includes("nota")) {
    return "NOTA means 'None of the Above'. It lets you reject all listed candidates while still recording your participation.";
  }

  if (q.includes("without voter id") || q.includes("without epic") || q.includes("without id")) {
    return "Yes, you may vote with other Election Commission-approved photo IDs if your name appears on the voter list.";
  }

  if (q.includes("timeline") || q.includes("phases")) {
    return "Typical flow: registration → campaigning → voting day → counting → results. Your profile helps mark your current stage.";
  }

  if (q.includes("where do i vote") || q.includes("polling")) {
    return "Use Step 4 with city/area + state for better results. I’ll create both Google Maps and official-style search links.";
  }

  return "I can help with eligibility, registration, polling booths, EVM, NOTA, and election-day checklist. Ask me one of these topics.";
}

function pushBubble(role, text) {
  const bubble = document.createElement("article");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const age = Number(document.getElementById("age").value);
  const country = document.getElementById("country").value;
  const state = document.getElementById("state").value.trim();
  const registrationStatus = document.getElementById("registration-status").value;

  userContext = { age, country, state, registrationStatus };
  const guidance = buildGuidance(age, registrationStatus);
  renderGuidance(guidance);
  activateStep(2);

  pushBubble(
    "assistant",
    `Profile saved: age ${age}, ${registrationStatus.replace("_", " ")}${state ? `, ${state}` : ""}.`
  );
});

locationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const location = document.getElementById("location-input").value.trim();
  const state = document.getElementById("state").value.trim();

  if (!location) {
    locationOutput.innerHTML = "<p>Please enter your city or area first.</p>";
    return;
  }

  const place = `${location}${state ? `, ${state}` : ""}, India`;
  const mapQ = encodeURIComponent(`polling booth near ${place}`);
  const officialQ = encodeURIComponent(`CEO ${state || location} voter list polling station`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQ}`;
  const searchUrl = `https://www.google.com/search?q=${officialQ}`;
  const eciUrl = "https://voters.eci.gov.in/";
  const nvspUrl = "https://www.nvsp.in/";

  locationOutput.innerHTML = `
    <p><strong>Polling help for ${place}</strong></p>
    <ul>
      <li><a href="${mapUrl}" target="_blank" rel="noopener noreferrer">Google Maps (booth-nearby query)</a></li>
      <li><a href="${searchUrl}" target="_blank" rel="noopener noreferrer">Google Search fallback (CEO/NVSP booth pages)</a></li>
      <li><a href="${eciUrl}" target="_blank" rel="noopener noreferrer">ECI Voter Services Portal</a></li>
      <li><a href="${nvspUrl}" target="_blank" rel="noopener noreferrer">National Voters' Service Portal (NVSP)</a></li>
    </ul>
    <p class="small">If Maps says it can't find results, open the fallback search or official portal links above to find your constituency booth details.</p>
    <p class="small">Tip: use city + state (example: Kolkata, West Bengal) for best accuracy.</p>
  `;
  activateStep(3);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  pushBubble("user", message);
  const response = respondToChat(message);
  pushBubble("assistant", response);
  chatInput.value = "";
  activateStep(4);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const question = chip.dataset.q;
    if (!question) return;
    chatInput.value = question;
    chatForm.requestSubmit();
  });
});

demoFill.addEventListener("click", () => {
  document.getElementById("age").value = "19";
  document.getElementById("state").value = "West Bengal";
  document.getElementById("registration-status").value = "not_registered";
  profileForm.requestSubmit();
});

renderTimeline();
activateStep(0);
