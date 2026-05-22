// ===== PLAYER ROOT =====
const player = document.getElementById('audioPlayer');
const audio = document.getElementById('audioElement');

// ===== TRACKS =====
let TRACKS = [];

try {
  TRACKS = JSON.parse(player.getAttribute('data-tracks')) || [];
} catch (e) {
  console.error("Invalid data-tracks JSON", e);
}

// ===== ELEMENTS =====
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');

const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const trackStatus = document.getElementById('trackStatus');

const volumeSlider = document.getElementById('volumeSlider');
const speedBtn = document.getElementById('speedBtn');

const playlistEl = document.getElementById('playlist');
const playlistCount = document.getElementById('playlistCount');

const vizBars = document.querySelectorAll('.viz-bar');

// ===== STATE =====
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIndex = 2;

let vizInterval = null;

// ===== INIT =====
function init() {
  if (!TRACKS.length) return;

  renderPlaylist();
  loadTrack(0);

  audio.volume = 0.8;
  playlistCount.textContent = TRACKS.length + " songs";
}

// ===== PLAYLIST =====
function renderPlaylist() {
  playlistEl.innerHTML = "";

  TRACKS.forEach((t, i) => {
    const item = document.createElement("div");
    item.className = "playlist-item";

    item.innerHTML = `
      <span class="pl-number">${i + 1}</span>
      <div class="pl-info">
        <div class="pl-title">${t.title}</div>
        <div class="pl-artist">${t.artist}</div>
      </div>
      <span class="pl-duration">${t.duration || ""}</span>
    `;

    item.onclick = () => {
      loadTrack(i);
      playAudio();
    };

    playlistEl.appendChild(item);
  });

  updateActive();
}

// ===== LOAD TRACK =====
function loadTrack(i) {
  currentTrackIndex = i;

  const t = TRACKS[i];
  audio.src = t.src;

  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;
  trackStatus.textContent = "Ready";

  progressBar.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = t.duration || "0:00";

  updateActive();
}

// ===== ACTIVE UI =====
function updateActive() {
  document.querySelectorAll(".playlist-item").forEach((el, i) => {
    el.classList.toggle("active", i === currentTrackIndex);
  });
}

// ===== PLAY / PAUSE =====
function playAudio() {
  audio.play().then(() => {
    isPlaying = true;
    trackStatus.textContent = "Playing";
    playPauseBtn.textContent = "⏸";
    player.classList.add("playing");
    startViz();
  });
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  trackStatus.textContent = "Paused";
  playPauseBtn.textContent = "▶";
  player.classList.remove("playing");
  stopViz();
}

function togglePlay() {
  isPlaying ? pauseAudio() : playAudio();
}

// ===== NAV =====
function nextTrack() {
  let i = isShuffle
    ? Math.floor(Math.random() * TRACKS.length)
    : (currentTrackIndex + 1) % TRACKS.length;

  loadTrack(i);
  playAudio();
}

function prevTrack() {
  let i = isShuffle
    ? Math.floor(Math.random() * TRACKS.length)
    : (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;

  loadTrack(i);
  playAudio();
}

// ===== PROGRESS =====
function updateProgress() {
  if (!audio.duration) return;

  const p = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = p + "%";

  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
}

function format(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

progressContainer.onclick = (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  audio.currentTime = x * audio.duration;
};

// ===== VOLUME =====
volumeSlider.oninput = () => {
  audio.volume = volumeSlider.value / 100;
};

// ===== SPEED =====
speedBtn.onclick = () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  audio.playbackRate = speeds[speedIndex];
  speedBtn.textContent = speeds[speedIndex] + "x";
};

// ===== SHUFFLE / REPEAT =====
shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active");
};

repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active");
};

// ===== VIZ =====
function startViz() {
  stopViz();
  vizInterval = setInterval(() => {
    vizBars.forEach(b => {
      b.style.height = Math.random() * 20 + 5 + "px";
    });
  }, 120);
}

function stopViz() {
  clearInterval(vizInterval);
  vizBars.forEach(b => (b.style.height = "4px"));
}

// ===== EVENTS =====
playPauseBtn.onclick = togglePlay;
nextBtn.onclick = nextTrack;
prevBtn.onclick = prevTrack;

audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});

// ===== START =====
init();
