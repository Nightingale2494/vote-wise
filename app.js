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
const useLocationBtn = document.getElementById("use-location");
const panels = [...document.querySelectorAll(".step-panel")];
const prevStepBtn = document.getElementById("prev-step");
const nextStepBtn = document.getElementById("next-step");
const stepIndicator = document.getElementById("step-indicator");


function safeSetHTML(el, html) {
  if (el) el.innerHTML = html;
}

function pushBubble(role, text) {
  const b = document.createElement("article");
  b.className = `bubble ${role}`;
  b.textContent = text;
  chatLog.appendChild(b);
}

const timelinePhases = ["Registration", "Campaigning", "Voting Day", "Counting", "Results"];
const checklistItems = ["Check your name on voter list", "Keep EPIC/approved ID ready", "Confirm polling booth route", "Choose voting time slot", "Read candidate information"];
let checklistState = JSON.parse(localStorage.getItem("vw_checklist") || "[]");
let theme = localStorage.getItem("vw_theme") || "light";
let step = 1;
let userContext = { age: null, registrationStatus: "not_registered" };

function setStep(target) {
  step = Math.max(1, Math.min(6, target));
  panels.forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.step) === step));
  stepIndicator.textContent = `Step ${step} of 6`;
  prevStepBtn.disabled = step === 1;
  nextStepBtn.disabled = step === 6;
}

function renderTimeline(currentIndex = 0) {
  timelineRoot.innerHTML = "";
  timelinePhases.forEach((phase, index) => {
    const el = document.createElement("article");
    el.className = `timeline-item ${index === currentIndex ? "current" : ""}`;
    el.innerHTML = `<strong>${phase}</strong>${index === currentIndex ? ' <span class="map-note">• Active</span>' : ""}`;
    timelineRoot.appendChild(el);
  });
}

function computeReadiness() {
  const done = checklistState.filter(Boolean).length;
  const eligible = userContext.age >= 18;
  const registered = userContext.registrationStatus === "registered";
  const score = Math.round((done / checklistItems.length) * 50 + (eligible ? 25 : 0) + (registered ? 25 : 0));
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
  checklistRoot.innerHTML = checklistItems.map((item, idx) => `<label class="check-item"><input type="checkbox" data-i="${idx}" ${checklistState[idx] ? "checked" : ""}/> ${item}</label>`).join("");
  checklistRoot.querySelectorAll("input").forEach((box) => {
    box.addEventListener("change", () => {
      checklistState[Number(box.dataset.i)] = box.checked;
      localStorage.setItem("vw_checklist", JSON.stringify(checklistState));
      refreshDashboard();
    });
  });
}

function buildGuidance(age, registrationStatus) {
  if (age < 18) return { title: "You are not eligible yet", body: ["Prepare documents.", "Learn registration now.", "Track future voter drives."], timelineStep: 0 };
  if (registrationStatus === "not_registered") return { title: "Register first", body: ["Open Voters' Service Portal.", "Submit Form 6.", "Track application ID."], timelineStep: 0 };
  return { title: "Ready to vote", body: ["Verify name on final roll.", "Find booth location.", "Carry approved photo ID."], timelineStep: 2 };
}

function renderGuidance(guidance) {
  guidanceOutput.innerHTML = `<h3>${guidance.title}</h3><ul>${guidance.body.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  renderTimeline(guidance.timelineStep);
}

function respondToChat(message) {
  const q = message.toLowerCase();
  if (q.includes("evm")) return "EVM is the electronic voting machine; VVPAT provides a paper-verification trail.";
  if (q.includes("nota")) return "NOTA means None of the Above; you can still participate even if no candidate fits.";
  if (q.includes("without")) return "If your name is in voter roll, approved alternate IDs may work even without EPIC.";
  return "I can help with registration, booth location, voting documents, and first-time voter preparation.";
}

function renderLocationLinks(location, latLng = "") {
  const withPin = latLng ? `${location} ${latLng}` : location;
  const links = {
    city: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${withPin}, India`)}`,
    election: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${withPin} election office`)}`,
    polling: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${withPin} polling station`)}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${withPin} polling station`)}`,
    eci: "https://voters.eci.gov.in/",
  };
  safeSetHTML(locationOutput, `<p><strong>Booth help for ${location}${latLng ? ` (pin ${latLng})` : ""}</strong></p>
  <ul class="location-links">
    <li><a target="_blank" rel="noopener noreferrer" href="${links.city}">Open pinned area in Google Maps</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href="${links.election}">Nearby election offices</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href="${links.polling}">Nearby polling stations</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href="${links.directions}">Get directions to polling stations</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href="${links.eci}">Official ECI Voter Portal</a></li>
  </ul>
  <p class="map-note">Use the pin-based link first for better local accuracy.</p>`);
}

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  userContext.age = Number(document.getElementById("age").value);
  userContext.registrationStatus = document.getElementById("registration-status").value;
  renderGuidance(buildGuidance(userContext.age, userContext.registrationStatus));
  refreshDashboard();
  setStep(3);
});

locationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const location = document.getElementById("location-input").value.trim();
  if (!location) return safeSetHTML(locationOutput, "<p>Please enter your city or area first.</p>");
  renderLocationLinks(location);
});

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    safeSetHTML(locationOutput, "<p>Geolocation not supported in this browser.</p>");
    return;
  }
  safeSetHTML(locationOutput, "<p>Fetching your current pin...</p>");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(5);
      const lng = pos.coords.longitude.toFixed(5);
      renderLocationLinks("Current location", `${lat}, ${lng}`);
    },
    () => {
      safeSetHTML(locationOutput, "<p>Couldn't get location permission. You can still search by city/area.</p>");
    }
  );
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;
  pushBubble("user", msg);
  pushBubble("assistant", respondToChat(msg));
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

if (!profileForm || !guidanceOutput || !timelineRoot || !locationForm || !locationOutput || !chatForm || !chatInput || !chatLog || !checklistRoot || !readinessPill || !themeToggle || !useLocationBtn || !prevStepBtn || !nextStepBtn || !stepIndicator) {
  throw new Error("VoteWise init failed: required DOM elements are missing.");
}

document.body.dataset.theme = theme;
themeToggle.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
renderChecklist();
renderTimeline();
refreshDashboard();
setStep(1);
