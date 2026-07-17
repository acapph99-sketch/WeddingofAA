const config = window.WEDDING_CONFIG;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setText(key, value) {
  $$(`[data-text="${key}"]`).forEach((element) => {
    element.textContent = value;
  });
}

function setMeta(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", value);
  }
}

function hydrateStaticContent() {
  document.title = config.meta.siteTitle;
  setMeta('meta[name="description"]', config.meta.description);
  setMeta('meta[property="og:url"]', config.meta.siteUrl);
  setMeta('meta[property="og:title"]', config.meta.siteTitle);
  setMeta('meta[property="og:description"]', config.meta.description);
  setMeta('meta[property="og:image"]', config.meta.previewImage);
  setMeta('meta[property="og:image:secure_url"]', config.meta.previewImage);
  setMeta('meta[name="twitter:title"]', config.meta.siteTitle);
  setMeta('meta[name="twitter:description"]', config.meta.description);
  setMeta('meta[name="twitter:image"]', config.meta.previewImage);

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
    const phone = normalizePhone(contact.phone);
    const card = document.createElement("article");
    card.className = "contact-card";
    card.innerHTML = `
      <h3>${escapeHtml(contact.name)}</h3>
      <p>${escapeHtml(contact.relationship)}</p>
      <a class="contact-phone" href="tel:+${phone}">+${phone}</a>
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

function normalizePhone(value) {
  const digits = String(value).replace(/[^0-9]/g, "");

  if (digits.startsWith("060")) return `60${digits.slice(3)}`;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return digits;
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
