const profileForm = document.getElementById("profile-form");
const guidanceOutput = document.getElementById("guidance-output");
const timelineRoot = document.getElementById("timeline");
const locationForm = document.getElementById("location-form");
const locationOutput = document.getElementById("location-output");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
const checklistRoot = document.getElementById("checklist");
const readinessPill = document.getElementById("readiness-pill");
const themeToggle = document.getElementById("theme-toggle");

const timelinePhases = ["Registration", "Campaigning", "Voting Day", "Counting", "Results"];
const checklistItems = ["Check voter list", "Keep ID proof ready", "Confirm polling booth", "Plan voting time", "Track election updates"];
let checklistState = JSON.parse(localStorage.getItem("vw_checklist") || "[]");
let theme = localStorage.getItem("vw_theme") || "light";
let userContext = { age: null, country: "India", registrationStatus: "not_registered" };

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

function computeReadiness() {
  const done = checklistState.filter(Boolean).length;
  const eligible = userContext.age >= 18;
  const registered = userContext.registrationStatus === "registered";
  let score = Math.round((done / checklistItems.length) * 50 + (eligible ? 25 : 0) + (registered ? 25 : 0));
  score = Math.max(0, Math.min(100, score));
  return { score, done, eligible, registered };
}

function refreshDashboard() {
  const { score, done, eligible, registered } = computeReadiness();
  readinessPill.textContent = `Readiness: ${score}%`;
  document.getElementById("stat-eligibility").textContent = eligible ? "Eligible ✅" : "Not yet eligible";
  document.getElementById("stat-registration").textContent = registered ? "Registered ✅" : "Not registered";
  document.getElementById("stat-prep").textContent = `${done}/${checklistItems.length} tasks`;
}

function renderChecklist() {
  checklistRoot.innerHTML = checklistItems
    .map(
      (item, idx) => `<label class="check-item"><input type="checkbox" data-i="${idx}" ${checklistState[idx] ? "checked" : ""}/> ${item}</label>`
    )
    .join("");

  checklistRoot.querySelectorAll("input").forEach((box) => {
    box.addEventListener("change", () => {
      checklistState[Number(box.dataset.i)] = box.checked;
      localStorage.setItem("vw_checklist", JSON.stringify(checklistState));
      refreshDashboard();
    });
  });
}

function buildGuidance(age, registrationStatus) {
  if (age < 18) return { title: "You are not eligible yet — prepare now ✅", body: ["Learn registration basics.", "Collect age/address proof.", "Follow ECI voter drives."], timelineStep: 0, progress: "Prep mode" };
  if (registrationStatus === "not_registered") return { title: "Next move: registration 📝", body: ["Open NVSP / Voter Portal.", "Use Form 6 and upload docs.", "Track reference ID status."], timelineStep: 0, progress: "Registration" };
  return { title: "Registered — now optimize your vote plan 🗳️", body: ["Verify your name in final roll.", "Find polling booth now.", "Carry EPIC/approved photo ID."], timelineStep: 2, progress: "Voting readiness" };
}

function renderGuidance(guidance) {
  guidanceOutput.innerHTML = `<h3>${guidance.title}</h3><ul>${guidance.body.map((step) => `<li>${step}</li>`).join("")}</ul>`;
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
}

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  userContext = {
    age: Number(document.getElementById("age").value),
    country: document.getElementById("country").value,
    registrationStatus: document.getElementById("registration-status").value,
  };
  renderGuidance(buildGuidance(userContext.age, userContext.registrationStatus));
  refreshDashboard();
  pushBubble("assistant", `Profile saved. Readiness recalculated for age ${userContext.age}.`);
});

locationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const location = document.getElementById("location-input").value.trim();
  if (!location) return (locationOutput.innerHTML = "<p>Please enter your city or area first.</p>");

  const links = {
    city: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, India`)}`,
    election: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location} election office`)}`,
    polling: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location} polling station`)}`,
    web: `https://www.google.com/search?q=${encodeURIComponent(`${location} polling booth locator`)}`,
    eci: "https://voters.eci.gov.in/",
  };

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationOutput.innerHTML = "<p>Geolocation not supported in this browser.</p>";
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
  pushBubble("assistant", respondToChat(message));
  chatInput.value = "";
  chatLog.scrollTop = chatLog.scrollHeight;
});

themeToggle.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
  localStorage.setItem("vw_theme", theme);
});
prevStepBtn.addEventListener("click", () => setStep(step - 1));
nextStepBtn.addEventListener("click", () => setStep(step + 1));

document.body.dataset.theme = theme;
themeToggle.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
renderChecklist();
renderTimeline();
refreshDashboard();
