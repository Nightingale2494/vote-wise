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

const timelinePhases = ["Registration Phase", "Campaigning", "Voting Day", "Counting", "Results"];

function activateStep(index) {
  stepNodes.forEach((step, i) => step.classList.toggle("active", i <= index));
}

function renderTimeline(currentIndex = 0) {
  if (!timelineRoot) return;
  timelineRoot.innerHTML = "";
  timelinePhases.forEach((phase, index) => {
    const card = document.createElement("article");
    card.className = `timeline-item ${index === currentIndex ? "current" : ""}`;
    card.innerHTML = `<strong>${phase}</strong>${index === currentIndex ? " <span> — You are here 📍</span>" : ""}`;
    timelineRoot.appendChild(card);
  });
}

function buildGuidance(age, registrationStatus) {
  if (age < 18) return {title:"You are not eligible yet — prep mode ✅",body:["Learn registration basics.","Keep age/address docs ready.","Track ECI voter-awareness drives."],timelineStep:0,progress:"Prep mode"};
  if (registrationStatus === "not_registered") return {title:"Next mission: Register 📝",body:["Open NVSP or Voter Portal.","Submit Form 6 with documents.","Track your application ID."],timelineStep:0,progress:"Registration"};
  return {title:"You are registered — voting readiness 🗳️",body:["Check name in electoral roll.","Confirm booth location early.","Carry EPIC or valid alternate ID."],timelineStep:2,progress:"Voting readiness"};
}

function renderGuidance(guidance) {
  if (!guidanceOutput) return;
  guidanceOutput.innerHTML = `<h3>${guidance.title}</h3><ul>${guidance.body.map((step) => `<li>${step}</li>`).join("")}</ul>`;
  if (progressPill) progressPill.textContent = guidance.progress;
  renderTimeline(guidance.timelineStep);
}

function pushBubble(role, text) {
  if (!chatLog) return;
  const bubble = document.createElement("article");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function respondToChat(message) {
  const q = message.trim().toLowerCase();
  if (q.includes("evm")) return "EVM is an Electronic Voting Machine used for digital vote casting, usually paired with VVPAT verification.";
  if (q.includes("nota")) return "NOTA means None of the Above — you can reject all candidates while still voting.";
  if (q.includes("without voter id") || q.includes("without id")) return "You can vote with other approved photo IDs if your name is on the voter list.";
  if (q.includes("polling") || q.includes("booth")) return "Use Journey Planner → Polling finder with city + state (+ PIN) for better results and official links.";
  return "Ask me about eligibility, registration, booth finding, EVM, NOTA, or voting-day checklist.";
}

if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const age = Number(document.getElementById("age")?.value || 0);
    const registrationStatus = document.getElementById("registration-status")?.value || "not_registered";
    const guidance = buildGuidance(age, registrationStatus);
    renderGuidance(guidance);
    activateStep(2);
  });
}

if (locationForm) {
  locationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const location = document.getElementById("location-input")?.value.trim() || "";
    const state = document.getElementById("state")?.value.trim() || "";
    const pincode = document.getElementById("pincode-input")?.value.trim() || "";
    const mode = document.getElementById("booth-mode")?.value || "polling_booth";

    if (!location || !locationOutput) return;

    const place = `${location}${state ? `, ${state}` : ""}${pincode ? ` ${pincode}` : ""}, India`;
    const focusTerm = mode === "election_office" ? "election office" : "polling booth";

    const mapLinks = [
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${focusTerm} near ${place}`)}`,
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`BLO office near ${place}`)}`,
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`electoral registration office ${place}`)}`,
    ];
    const searchLinks = [
      `https://www.google.com/search?q=${encodeURIComponent(`CEO ${state || location} polling station list`)}`,
      `https://www.google.com/search?q=${encodeURIComponent(`voters.eci.gov.in polling station ${location} ${state}`)}`,
    ];

    locationOutput.innerHTML = `
      <p><strong>Complex lookup for ${place}</strong></p>
      <ul>
        <li><a href="${mapLinks[0]}" target="_blank" rel="noopener noreferrer">Maps: ${focusTerm} near your place</a></li>
        <li><a href="${mapLinks[1]}" target="_blank" rel="noopener noreferrer">Maps: BLO office near your place</a></li>
        <li><a href="${mapLinks[2]}" target="_blank" rel="noopener noreferrer">Maps: Electoral registration office</a></li>
        <li><a href="${searchLinks[0]}" target="_blank" rel="noopener noreferrer">Search: State CEO polling list</a></li>
        <li><a href="${searchLinks[1]}" target="_blank" rel="noopener noreferrer">Search: ECI polling lookup</a></li>
        <li><a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer">Open ECI Voter Services</a></li>
        <li><a href="https://www.nvsp.in/" target="_blank" rel="noopener noreferrer">Open NVSP</a></li>
      </ul>
      <p class="small">If Google Maps shows no results, use the Search + ECI/NVSP links above. City + State + PIN gives best precision.</p>
    `;
    activateStep(4);
  });
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    pushBubble("user", message);
    pushBubble("assistant", respondToChat(message));
    chatInput.value = "";
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const q = chip.dataset.q;
    if (!q || !chatInput || !chatForm) return;
    chatInput.value = q;
    chatForm.requestSubmit();
  });
});

if (demoFill && profileForm) {
  demoFill.addEventListener("click", () => {
    const age = document.getElementById("age");
    const state = document.getElementById("state");
    const reg = document.getElementById("registration-status");
    if (age) age.value = "19";
    if (state) state.value = "West Bengal";
    if (reg) reg.value = "not_registered";
    profileForm.requestSubmit();
  });
}

renderTimeline();
activateStep(0);
