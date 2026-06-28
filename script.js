(function () {
  "use strict";

  const config = window.WEDDING_CONFIG || WEDDING_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const openingScreen = $("#openingScreen");
  const openInvitation = $("#openInvitation");
  const music = $("#weddingMusic");
  const musicToggle = $("#musicToggle");
  const musicIcon = $("#musicIcon");
  const backToTop = $("#backToTop");
  const scrollProgress = $("#scrollProgress");
  const petalsLayer = $("#floatingPetals");

  let musicLoaded = false;

  function setText(selector, value) {
    $$(selector).forEach((node) => {
      node.textContent = value;
    });
  }

  function hydrateContent() {
    setText('[data-config="groomName"]', config.groomName);
    setText('[data-config="brideName"]', config.brideName);
    setText('[data-config="coupleShortName"]', config.coupleShortName);
    setText('[data-config="monogram"]', config.monogram);
    setText('[data-config="weddingDateDisplay"]', config.weddingDateDisplay);
    setText('[data-config="invitationTime"]', config.invitationTime);
    setText('[data-config="arrivalTime"]', config.arrivalTime);
    setText('[data-config="venueName"]', config.venueName);
    setText('[data-config="venueAddress"]', config.venueAddress);
    setText('[data-config="groomParent"]', config.parents.groom);
    setText('[data-config="brideParent"]', config.parents.bride);

    $("#heroImage").src = config.images.hero;
    $("#groomImage").src = config.images.groom;
    $("#brideImage").src = config.images.bride;
    $("#groomImage").alt = config.groomName;
    $("#brideImage").alt = config.brideName;
    $("#mapsLink").href = config.googleMapsUrl;

    const rsvpUrl = new URL(`https://wa.me/${config.whatsappNumber}`);
    rsvpUrl.searchParams.set("text", config.whatsappMessage);
    $("#rsvpLink").href = rsvpUrl.toString();

    music.src = config.musicPath;
    buildGallery();
    personalizeGuest();
  }

  function personalizeGuest() {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to");
    const guestSection = $("#guest");

    if (!guest || !guest.trim()) {
      guestSection.hidden = true;
      return;
    }

    $("#guestName").textContent = guest.trim();
    guestSection.hidden = false;
  }

  function buildGallery() {
    const galleryGrid = $("#galleryGrid");
    galleryGrid.innerHTML = "";

    config.images.gallery.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Wedding gallery ${index + 1}`;
      img.loading = "lazy";
      galleryGrid.appendChild(img);
    });
  }

  function startCountdown() {
    const weddingDate = new Date(config.weddingDate).getTime();
    const units = {
      days: $("#days"),
      hours: $("#hours"),
      minutes: $("#minutes"),
      seconds: $("#seconds")
    };

    function updateCountdown() {
      const now = Date.now();
      const distance = Math.max(weddingDate - now, 0);
      const day = 1000 * 60 * 60 * 24;
      const hour = 1000 * 60 * 60;
      const minute = 1000 * 60;

      units.days.textContent = Math.floor(distance / day);
      units.hours.textContent = Math.floor((distance % day) / hour);
      units.minutes.textContent = Math.floor((distance % hour) / minute);
      units.seconds.textContent = Math.floor((distance % minute) / 1000);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
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
      { threshold: 0.18 }
    );

    $$(".fade-in").forEach((element) => observer.observe(element));
  }

  function updateScrollUi() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    scrollProgress.style.width = `${progress}%`;
    backToTop.classList.toggle("show", scrollTop > 520);
  }

  function ensureMusicLoaded() {
    if (musicLoaded) return;
    music.load();
    musicLoaded = true;
  }

  async function playMusic() {
    ensureMusicLoaded();

    try {
      await music.play();
      musicIcon.textContent = "Music On";
      musicToggle.classList.add("playing");
    } catch (error) {
      musicIcon.textContent = "Music Off";
      musicToggle.classList.remove("playing");
    }
  }

  function pauseMusic() {
    music.pause();
    musicIcon.textContent = "Music Off";
    musicToggle.classList.remove("playing");
  }

  function openSite() {
    document.body.classList.remove("locked");
    openingScreen.classList.add("is-open");
    playMusic();
  }

  function createPetal() {
    if (!petalsLayer || document.hidden) return;

    const petal = document.createElement("span");
    const start = Math.random() * 100;
    const duration = 9 + Math.random() * 8;
    const drift = `${Math.random() * 120 - 60}px`;
    const scale = 0.65 + Math.random() * 0.8;

    petal.className = "petal";
    petal.style.left = `${start}vw`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.setProperty("--drift", drift);
    petal.style.transform = `scale(${scale})`;

    petalsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000);
  }

  function bindEvents() {
    openInvitation.addEventListener("click", openSite);

    musicToggle.addEventListener("click", () => {
      if (music.paused) {
        playMusic();
      } else {
        pauseMusic();
      }
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", updateScrollUi, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("locked");
    hydrateContent();
    startCountdown();
    revealOnScroll();
    bindEvents();
    updateScrollUi();
    setInterval(createPetal, 1100);
  });
})();
