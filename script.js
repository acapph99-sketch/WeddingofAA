const config = window.WEDDING_CONFIG;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let firebaseApi = null;

const state = {
  db: null,
  rsvpCollection: null,
  statsRef: null,
  lastWishDoc: null,
  isSubmitting: false,
  lastSubmitAt: 0
};

function setText(key, value) {
  $$(`[data-text="${key}"]`).forEach((element) => {
    element.textContent = value;
  });
}

function hydrateStaticContent() {
  document.title = config.meta.siteTitle;
  document.querySelector('meta[name="description"]').content = config.meta.description;

  setText("monogram", config.couple.monogram);
  setText("coupleName", config.couple.displayName);
  setText("brideName", config.couple.bride);
  setText("groomName", config.couple.groom);
  setText("eventDay", config.event.day);
  setText("eventDate", config.event.dateDisplay);
  setText("invitationTime", config.event.invitationTime);
  setText("arrivalLabel", config.event.arrivalLabel);
  setText("arrivalTime", config.event.arrivalTime);
  setText("venueName", config.event.venueName);
  setText("venueAddress", config.event.venueAddress);
  setText("guestLabel", config.invitation.guestLabel);
  setText("bismillah", config.invitation.bismillah);
  setText("parentsIntro", config.parents.intro);
  setText("fatherName", config.parents.father);
  setText("motherName", config.parents.mother);
  setText("parentsInvitation", config.parents.invitation);
  setText("invitationNote", config.invitation.note);

  $("#heroImage").src = config.images.hero;
  $("#brideImage").src = config.images.bride;
  $("#groomImage").src = config.images.groom;
  $("#weddingMusic").src = config.music.path;
  $("#mapEmbed").src = config.maps.embedUrl;
  $("#mapsLink").href = config.maps.openUrl;

  renderGuestName();
  renderContacts();
  renderTimeline();
}

function renderGuestName() {
  const guestName = new URLSearchParams(window.location.search).get("to");
  const section = $("#guest");

  if (!guestName || !guestName.trim()) {
    section.hidden = true;
    return;
  }

  $("#guestName").textContent = guestName.trim();
  section.hidden = false;
}

function renderContacts() {
  const grid = $("#contactGrid");
  grid.innerHTML = "";

  config.contacts.forEach((contact) => {
    const phone = contact.phone.replace(/[^0-9]/g, "");
    const card = document.createElement("article");
    card.className = "contact-card";
    card.innerHTML = `
      <h3>${escapeHtml(contact.name)}</h3>
      <p>${escapeHtml(contact.relationship)}</p>
      <div class="contact-actions">
        <a class="btn btn-secondary" href="https://wa.me/${phone}" target="_blank" rel="noreferrer">WhatsApp</a>
        <a class="btn btn-secondary" href="tel:+${phone}">Call</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderTimeline() {
  const list = $("#timelineList");
  list.innerHTML = "";

  config.timeline.forEach((item) => {
    const node = document.createElement("li");
    node.className = "timeline-item";
    node.innerHTML = `<time>${escapeHtml(item.time)}</time><span>${escapeHtml(item.title)}</span>`;
    list.appendChild(node);
  });
}

function startCountdown() {
  const weddingDate = new Date(config.event.dateTime).getTime();
  const units = {
    days: $("#days"),
    hours: $("#hours"),
    minutes: $("#minutes"),
    seconds: $("#seconds")
  };

  function update() {
    const distance = Math.max(weddingDate - Date.now(), 0);
    const day = 86400000;
    const hour = 3600000;
    const minute = 60000;

    units.days.textContent = Math.floor(distance / day);
    units.hours.textContent = Math.floor((distance % day) / hour);
    units.minutes.textContent = Math.floor((distance % hour) / minute);
    units.seconds.textContent = Math.floor((distance % minute) / 1000);
  }

  update();
  window.setInterval(update, 1000);
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  $$(".reveal, .timeline-item").forEach((element) => observer.observe(element));
}

function setupMusic() {
  const music = $("#weddingMusic");
  const toggle = $("#musicToggle");
  let loaded = false;

  async function play() {
    if (!loaded) {
      music.load();
      loaded = true;
    }

    try {
      await music.play();
      toggle.textContent = "Music On";
    } catch {
      toggle.textContent = "Music Off";
    }
  }

  function pause() {
    music.pause();
    toggle.textContent = "Music Off";
  }

  $("#openInvitation").addEventListener("click", () => {
    document.body.classList.remove("locked");
    $("#openingScreen").classList.add("is-open");
    play();
  });

  toggle.addEventListener("click", () => {
    if (music.paused) play();
    else pause();
  });
}

function setupScrollUi() {
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    backToTop.classList.toggle("show", window.scrollY > 520);
  }

  window.addEventListener("scroll", update, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}

function setupPetals() {
  const layer = $("#floatingPetals");

  window.setInterval(() => {
    if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const petal = document.createElement("span");
    const duration = 10 + Math.random() * 8;
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.setProperty("--drift", `${Math.random() * 110 - 55}px`);
    layer.appendChild(petal);
    window.setTimeout(() => petal.remove(), duration * 1000);
  }, 1300);
}

async function setupFirebase() {
  if (!isFirebaseConfigured()) {
    setFormStatus("Firebase is not configured yet. Add your Firebase keys in config.js.", "error");
    $("#submitRsvp").disabled = true;
    return;
  }

  const [{ initializeApp }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);

  firebaseApi = firestore;
  const app = initializeApp(config.firebase);
  state.db = firebaseApi.getFirestore(app);
  state.rsvpCollection = firebaseApi.collection(state.db, config.firebase.collectionName);
  state.statsRef = firebaseApi.doc(state.db, `${config.firebase.collectionName}_stats`, "summary");

  subscribeStats();
  loadWishes();
}

function isFirebaseConfigured() {
  return ["apiKey", "authDomain", "projectId", "appId"].every((key) => {
    const value = config.firebase[key];
    return value && !String(value).startsWith("YOUR_");
  });
}

function subscribeStats() {
  firebaseApi.onSnapshot(state.statsRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.data() : {};
    $("#totalResponses").textContent = data.responses || 0;
    $("#guestsAttending").textContent = data.guestsAttending || 0;
    $("#guestsNotAttending").textContent = data.guestsNotAttending || 0;
  });
}

function setupRsvpForm() {
  $("#rsvpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.db || state.isSubmitting) return;
    if (Date.now() - state.lastSubmitAt < 8000) {
      setFormStatus("Please wait a moment before submitting again.", "error");
      return;
    }

    const payload = readFormPayload(event.currentTarget);
    if (!payload) return;

    await submitRsvp(payload, event.currentTarget);
  });
}

function readFormPayload(form) {
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const attendance = String(formData.get("attendance") || "");
  const guestCount = Number(formData.get("guestCount") || 0);
  const message = String(formData.get("message") || "").trim();

  if (!name || !attendance) {
    setFormStatus("Please fill in your name and attendance.", "error");
    return null;
  }

  if (attendance === "attending" && guestCount < 1) {
    setFormStatus("Please enter at least 1 guest for attending RSVP.", "error");
    return null;
  }

  return {
    name,
    attendance,
    guestCount: attendance === "attending" ? Math.min(guestCount, 10) : 0,
    message,
    createdAt: firebaseApi.serverTimestamp()
  };
}

async function submitRsvp(payload, form) {
  const button = $("#submitRsvp");
  state.isSubmitting = true;
  button.disabled = true;
  button.classList.add("is-loading");
  setFormStatus("Submitting your RSVP...", "");

  try {
    await firebaseApi.addDoc(state.rsvpCollection, payload);
    await updateStats(payload);
    state.lastSubmitAt = Date.now();
    form.reset();
    $("#guestCount").value = "1";
    setFormStatus("Thank you. Your RSVP has been received.", "success");
    await refreshWishes();
  } catch (error) {
    setFormStatus("Unable to submit right now. Please try again shortly.", "error");
  } finally {
    state.isSubmitting = false;
    button.disabled = false;
    button.classList.remove("is-loading");
  }
}

async function updateStats(payload) {
  await firebaseApi.runTransaction(state.db, async (transaction) => {
    const snapshot = await transaction.get(state.statsRef);
    const current = snapshot.exists()
      ? snapshot.data()
      : { responses: 0, guestsAttending: 0, guestsNotAttending: 0 };

    const next = {
      responses: Number(current.responses || 0) + 1,
      guestsAttending:
        Number(current.guestsAttending || 0) + (payload.attendance === "attending" ? payload.guestCount : 0),
      guestsNotAttending:
        Number(current.guestsNotAttending || 0) + (payload.attendance === "not_attending" ? 1 : 0),
      updatedAt: firebaseApi.serverTimestamp()
    };

    transaction.set(state.statsRef, next);
  });
}

async function loadWishes(afterDoc = null) {
  if (!state.db) return;

  const pieces = [state.rsvpCollection, firebaseApi.orderBy("createdAt", "desc"), firebaseApi.limit(20)];
  if (afterDoc) pieces.push(firebaseApi.startAfter(afterDoc));

  const snapshot = await firebaseApi.getDocs(firebaseApi.query(...pieces));
  state.lastWishDoc = snapshot.docs[snapshot.docs.length - 1] || state.lastWishDoc;
  renderWishes(snapshot.docs, Boolean(afterDoc));
  $("#loadMoreWishes").hidden = snapshot.docs.length < 20;
}

async function refreshWishes() {
  state.lastWishDoc = null;
  $("#wishesGrid").innerHTML = "";
  await loadWishes();
}

function renderWishes(docs, append) {
  const grid = $("#wishesGrid");
  if (!append) grid.innerHTML = "";

  docs
    .map((item) => item.data())
    .filter((item) => item.message)
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "wish-card";
      card.innerHTML = `
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.message)}</p>
        <small>${item.attendance === "attending" ? "Attending" : "Not Attending"}</small>
      `;
      grid.appendChild(card);
    });

  if (!grid.children.length) {
    grid.innerHTML = '<article class="wish-card"><h3>No wishes yet</h3><p>Be the first to leave a message for the couple.</p></article>';
  }
}

function setFormStatus(message, type) {
  const status = $("#formStatus");
  status.textContent = message;
  status.className = `form-status ${type || ""}`.trim();
}

function setupLoadMore() {
  $("#loadMoreWishes").addEventListener("click", () => loadWishes(state.lastWishDoc));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

hydrateStaticContent();
startCountdown();
revealOnScroll();
setupMusic();
setupScrollUi();
setupPetals();
setupRsvpForm();
setupLoadMore();
setupFirebase();


