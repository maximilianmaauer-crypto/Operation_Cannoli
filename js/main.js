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
const bannerKey = "operationCannoliInsuranceAccepted_v2";
if (new URLSearchParams(window.location.search).has("resetBanner")) {
  localStorage.removeItem(bannerKey);
}
function showInsuranceModalIfNeeded() {
  if (!modal) return;
  const accepted = localStorage.getItem(bannerKey) === "true";
  if (!accepted) {
    modal.classList.remove("is-hidden");
    document.body.classList.add("modal-open");
  }
}
function closeInsuranceModal() {
  localStorage.setItem(bannerKey, "true");
  modal?.classList.add("is-hidden");
  document.body.classList.remove("modal-open");
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
