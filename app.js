const profileForm = document.getElementById("profile-form");
const guidanceOutput = document.getElementById("guidance-output");
const progressPill = document.getElementById("progress-pill");
const timelineRoot = document.getElementById("timeline");
const locationForm = document.getElementById("location-form");
const locationOutput = document.getElementById("location-output");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");

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
  registrationStatus: "not_registered",
};

function renderTimeline(currentIndex = 0) {
  timelineRoot.innerHTML = "";
  timelinePhases.forEach((phase, index) => {
    const card = document.createElement("article");
    card.className = `timeline-item ${index === currentIndex ? "current" : ""}`;
    card.setAttribute("role", "listitem");
    card.innerHTML = `<strong>${phase}</strong>${
      index === currentIndex ? ' <span class="map-note">— You are here 📍</span>' : ""
    }`;
    timelineRoot.appendChild(card);
  });
}

function buildGuidance(age, registrationStatus) {
  if (age < 18) {
    return {
      title: "You are not eligible yet — but you can prepare now ✅",
      body: [
        "Learn how registration works before your 18th birthday.",
        "Collect basics: proof of age, address proof, and a passport-size photo.",
        "Follow Election Commission of India updates and upcoming voter drives.",
      ],
      timelineStep: 0,
      progress: "Prep mode",
    };
  }

  if (registrationStatus === "not_registered") {
    return {
      title: "Great, your next move is registration 📝",
      body: [
        "Step 1: Open National Voters' Service Portal (NVSP) and choose Form 6.",
        "Step 2: Upload required documents (age, address, photo).",
        "Step 3: Submit and track your application reference ID.",
      ],
      timelineStep: 0,
      progress: "Registration",
    };
  }

  return {
    title: "Awesome — you are registered. Let’s get you voting 🗳️",
    body: [
      "Confirm your name on the final electoral roll.",
      "Locate your polling booth in advance.",
      "Carry EPIC (voter ID) or any approved alternate photo ID on voting day.",
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
    return "EVM means Electronic Voting Machine. It lets voters cast ballots digitally at polling booths, and it is paired with VVPAT for paper audit verification.";
  }

  if (q.includes("nota")) {
    return "NOTA means 'None of the Above'. You can use it when none of the listed candidates match your preference, while still participating in the election.";
  }

  if (q.includes("without voter id") || q.includes("without epic") || q.includes("without id")) {
    return "If you do not have your voter ID (EPIC), you may still vote using other Election Commission-approved photo IDs if your name is on the voter list.";
  }

  if (q.includes("timeline") || q.includes("phases")) {
    return "Election timeline usually moves as: registration → campaigning → voting day → counting → results. I can show where you are based on your profile.";
  }

  if (q.includes("where do i vote") || q.includes("polling")) {
    return "Share your city/area in the location section above. I now provide multiple map links + an official ECI lookup fallback if Google Maps misses your query.";
  }

  return "Got it. I can explain voting terms, eligibility, registration, timeline, or polling booth guidance in simple steps. Try asking one of those!";
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
  const registrationStatus = document.getElementById("registration-status").value;

  userContext = { age, country, registrationStatus };
  const guidance = buildGuidance(age, registrationStatus);
  renderGuidance(guidance);

  pushBubble(
    "assistant",
    `Saved profile: age ${age}, ${registrationStatus.replace("_", " ")} in ${country}. Ask me your next question.`
  );
});

locationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const location = document.getElementById("location-input").value.trim();

  if (!location) {
    locationOutput.innerHTML = "<p>Please enter your city or area first.</p>";
    return;
  }

  const locationOnly = encodeURIComponent(`${location}, India`);
  const electionContext = encodeURIComponent(`${location} election office India`);
  const pollingContext = encodeURIComponent(`${location} polling station`);

  const mapsLocationUrl = `https://www.google.com/maps/search/?api=1&query=${locationOnly}`;
  const mapsElectionUrl = `https://www.google.com/maps/search/?api=1&query=${electionContext}`;
  const mapsPollingUrl = `https://www.google.com/maps/search/?api=1&query=${pollingContext}`;
  const googleWebSearch = `https://www.google.com/search?q=${encodeURIComponent(`${location} polling booth locator`)}`;
  const eciVoterPortal = "https://voters.eci.gov.in/";

  locationOutput.innerHTML = `
    <p><strong>Better search strategy for ${location}:</strong></p>
    <ul class="location-links">
      <li><a href="${mapsLocationUrl}" target="_blank" rel="noopener noreferrer">1) Open ${location} on Maps first</a></li>
      <li><a href="${mapsElectionUrl}" target="_blank" rel="noopener noreferrer">2) Then search “election office” nearby</a></li>
      <li><a href="${mapsPollingUrl}" target="_blank" rel="noopener noreferrer">3) Try “polling station” nearby</a></li>
      <li><a href="${googleWebSearch}" target="_blank" rel="noopener noreferrer">4) Fallback: Google web search for booth locator</a></li>
      <li><a href="${eciVoterPortal}" target="_blank" rel="noopener noreferrer">5) Official fallback: ECI Voter Portal booth details</a></li>
    </ul>
    <p class="map-note">Tip: If Maps says “can't find”, keep only city name (e.g., “Kolkata”) and run step 2 or 3.</p>
  `;
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  pushBubble("user", message);
  const response = respondToChat(message, userContext);
  pushBubble("assistant", response);

  chatInput.value = "";
});

renderTimeline();
