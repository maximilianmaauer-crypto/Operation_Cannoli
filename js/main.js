const tripDate = new Date("2026-06-11T15:00:00+02:00").getTime();
function updateCountdown() {
  const diff = tripDate - Date.now();
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff / 3600000) % 24));
  const minutes = Math.max(0, Math.floor((diff / 60000) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));
  const set = (id, value, length = 2) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value).padStart(length, "0");
  };
  set("days", days, 3);
  set("hours", hours, 2);
  set("minutes", minutes, 2);
  set("seconds", seconds, 2);
}
updateCountdown();
setInterval(updateCountdown, 1000);

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("is-open")));
}

const modal = document.getElementById("insuranceModal");
const bannerCounterKey = "operationCannoliInsuranceOpenCounter_v2";
const bannerSessionKey = "operationCannoliInsuranceSeenThisSession_v2";

// Zum Testen kann ?resetBanner=1 an die URL gehängt werden. Dadurch startet die Zählung neu.
if (new URLSearchParams(window.location.search).has("resetBanner")) {
  localStorage.removeItem(bannerCounterKey);
  sessionStorage.removeItem(bannerSessionKey);
}

function showInsuranceModalIfNeeded() {
  if (!modal) return;

  const previousCount = Number.parseInt(localStorage.getItem(bannerCounterKey) || "0", 10);
  const currentCount = Number.isFinite(previousCount) ? previousCount + 1 : 1;
  localStorage.setItem(bannerCounterKey, String(currentCount));

  const alreadySeenInThisTab = sessionStorage.getItem(bannerSessionKey) === "true";

  // Logik: Beim ersten Laden in einem neuen Tab/Browserfenster erscheint A&H immer.
  // Danach erscheint es nur noch bei jedem 6. Laden der Seite.
  const shouldShowThisTime = !alreadySeenInThisTab || currentCount % 6 === 0;

  if (shouldShowThisTime) {
    sessionStorage.setItem(bannerSessionKey, "true");
    modal.classList.remove("is-hidden");
    document.body.classList.add("modal-open");
  }
}

function closeInsuranceModal() {
  if (!modal) return;

  // Erst die überdrehte Exit-Animation abspielen, danach vollständig ausblenden.
  modal.classList.add("is-exiting");
  document.querySelectorAll("[data-close-insurance]").forEach(btn => {
    btn.disabled = true;
  });

  window.setTimeout(() => {
    modal.classList.add("is-hidden");
    modal.classList.remove("is-exiting");
    document.body.classList.remove("modal-open");
    document.querySelectorAll("[data-close-insurance]").forEach(btn => {
      btn.disabled = false;
    });

    // Nach dem großen A&H-Fenster darf der kleine Kinder-Hinweis später gelegentlich erscheinen.
    window.setTimeout(() => maybeShowKidsInsurancePopup("after-main-modal"), 14000);
  }, 1050);
}

document.querySelectorAll("[data-close-insurance]").forEach(btn => btn.addEventListener("click", closeInsuranceModal));
showInsuranceModalIfNeeded();

const weatherGrid = document.getElementById("weatherGrid");
const weatherNote = document.getElementById("weatherNote");
const weatherCodes = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌦️",61:"🌧️",63:"🌧️",65:"🌧️",71:"❄️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️"};
const weekdays = ["SO","MO","DI","MI","DO","FR","SA"];
function fmtDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return `${String(date.getDate()).padStart(2,"0")}.${String(date.getMonth()+1).padStart(2,"0")}.`;
}
async function loadWeather() {
  if (!weatherGrid) return;
  const url = "https://api.open-meteo.com/v1/forecast?latitude=41.89&longitude=12.89&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome&forecast_days=7";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Wetterdienst nicht erreichbar");
    const data = await response.json();
    const daily = data.daily;
    weatherGrid.innerHTML = daily.time.map((dateString, index) => {
      const date = new Date(dateString + "T12:00:00");
      const icon = weatherCodes[daily.weather_code[index]] || "☀️";
      const high = Math.round(daily.temperature_2m_max[index]);
      const low = Math.round(daily.temperature_2m_min[index]);
      return `<div class="weather-card"><div><div class="weather-day">${weekdays[date.getDay()]}</div><div class="weather-date">${fmtDate(dateString)}</div><div class="weather-icon">${icon}</div><span class="weather-high">${high}°</span><span class="weather-low">${low}°</span></div></div>`;
    }).join("");
    if (weatherNote) weatherNote.textContent = "Live-Prognose für Poli, Lazio.";
  } catch (error) {
    weatherGrid.innerHTML = [
      ["MI","10.06.","🌤️",24,14], ["DO","11.06.","☀️",25,15], ["FR","12.06.","☀️",26,16], ["SA","13.06.","☀️",27,16], ["SO","14.06.","🌤️",25,15], ["MO","15.06.","☀️",24,14], ["DI","16.06.","☀️",24,14]
    ].map(d => `<div class="weather-card"><div><div class="weather-day">${d[0]}</div><div class="weather-date">${d[1]}</div><div class="weather-icon">${d[2]}</div><span class="weather-high">${d[3]}°</span><span class="weather-low">${d[4]}°</span></div></div>`).join("");
    if (weatherNote) weatherNote.textContent = "Fallback-Vorschau, falls Live-Wetter nicht geladen werden kann.";
  }
}
loadWeather();



// Zufälliges A&H-Fenster beim Navigieren: sichtbar genug, aber bewusst nicht nervig.
const kidsPopupCooldownKey = "operationCannoliKidsInsuranceLastShown_v2";
const kidsPopupViewCounterKey = "operationCannoliKidsInsuranceViewCounter_v2";
const kidsPopupDeferredKey = "operationCannoliKidsInsuranceDeferred_v2";
const kidsPopupCooldownMs = 1000 * 55;

const params = new URLSearchParams(window.location.search);

if (params.has("resetKinder")) {
  localStorage.removeItem(kidsPopupCooldownKey);
  localStorage.removeItem(kidsPopupViewCounterKey);
  sessionStorage.removeItem(kidsPopupDeferredKey);
}

if (params.has("forceKinder")) {
  window.setTimeout(() => showKidsInsurancePopup(true), 900);
}

function createKidsInsurancePopup() {
  let popup = document.getElementById("kidsInsurancePopup");
  if (popup) return popup;

  popup = document.createElement("div");
  popup.id = "kidsInsurancePopup";
  popup.className = "kids-insurance-pop";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-live", "polite");
  popup.innerHTML = `
    <div class="kids-insurance-card">
      <button class="kids-insurance-close" type="button" aria-label="Hinweis schließen">×</button>
      <img class="kids-insurance-image" src="images/ah-kinder.jpg" alt="Schutzengel mit Kindern">
      <div class="kids-insurance-body">
        <div class="kids-insurance-kicker">A&amp;H Versicherungen</div>
        <div class="kids-insurance-title">Denken Sie an Ihre Kinder.</div>
        <div class="kids-insurance-subtitle">Heute vorsorgen</div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector(".kids-insurance-close").addEventListener("click", () => hideKidsInsurancePopup());
  popup.addEventListener("click", event => {
    if (event.target === popup) hideKidsInsurancePopup();
  });

  return popup;
}

let kidsPopupTimer = null;
let kidsRetryTimer = null;

function mainInsuranceIsVisible() {
  return Boolean(modal && !modal.classList.contains("is-hidden"));
}

function showKidsInsurancePopup(force = false) {
  if (mainInsuranceIsVisible() && !force) {
    window.clearTimeout(kidsRetryTimer);
    kidsRetryTimer = window.setTimeout(() => showKidsInsurancePopup(false), 12000);
    return false;
  }

  const existing = document.getElementById("kidsInsurancePopup");
  if (existing && existing.classList.contains("is-visible")) return false;

  const now = Date.now();
  const lastShown = Number.parseInt(localStorage.getItem(kidsPopupCooldownKey) || "0", 10);

  if (!force && now - lastShown < kidsPopupCooldownMs) return false;

  const popup = createKidsInsurancePopup();
  localStorage.setItem(kidsPopupCooldownKey, String(now));

  popup.classList.remove("is-leaving");
  popup.classList.add("is-visible");

  window.clearTimeout(kidsPopupTimer);
  kidsPopupTimer = window.setTimeout(() => hideKidsInsurancePopup(), 6200);
  return true;
}

function hideKidsInsurancePopup() {
  const popup = document.getElementById("kidsInsurancePopup");
  if (!popup || popup.classList.contains("is-leaving")) return;

  popup.classList.remove("is-visible");
  popup.classList.add("is-leaving");
  window.clearTimeout(kidsPopupTimer);

  window.setTimeout(() => {
    popup.classList.remove("is-leaving");
  }, 760);
}

function maybeShowKidsInsurancePopup(reason = "page") {
  // Wenn das große A&H-Fenster gerade offen ist, wird der Kinder-Hinweis nicht verloren,
  // sondern nach dem Schließen noch einmal versucht.
  if (mainInsuranceIsVisible()) {
    sessionStorage.setItem(kidsPopupDeferredKey, "true");
    return;
  }

  const previousViews = Number.parseInt(localStorage.getItem(kidsPopupViewCounterKey) || "0", 10);
  const currentViews = Number.isFinite(previousViews) ? previousViews + 1 : 1;
  localStorage.setItem(kidsPopupViewCounterKey, String(currentViews));

  // Nicht mehr rein zufällig: nach mehreren Seitenwechseln kommt der Hinweis verlässlich,
  // ansonsten nur mit geringer Zufallschance. Der Cooldown verhindert Spam.
  const deterministicHit = currentViews >= 3;
  const randomHit = currentViews >= 2 && Math.random() < 0.18;

  if (deterministicHit || randomHit) {
    const shown = showKidsInsurancePopup(false);
    if (shown) localStorage.setItem(kidsPopupViewCounterKey, "0");
  }
}

function tryDeferredKidsPopup() {
  if (sessionStorage.getItem(kidsPopupDeferredKey) === "true" && !mainInsuranceIsVisible()) {
    sessionStorage.removeItem(kidsPopupDeferredKey);
    window.setTimeout(() => maybeShowKidsInsurancePopup("deferred"), 10000);
  }
}

window.setTimeout(() => maybeShowKidsInsurancePopup("page-load"), 5200);
window.setInterval(tryDeferredKidsPopup, 4000);
window.setInterval(() => {
  if (!document.hidden && Math.random() < 0.16) {
    maybeShowKidsInsurancePopup("idle");
  }
}, 65000);

document.addEventListener("click", event => {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href") || "";
  const isInternalJump = href.startsWith("#");
  const isInternalPage = href.endsWith(".html") || href.includes(".html#");

  if (isInternalJump || isInternalPage) {
    window.setTimeout(() => maybeShowKidsInsurancePopup("navigation"), 1200);
  }
});
