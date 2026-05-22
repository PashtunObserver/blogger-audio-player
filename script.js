// ===== CONFIGURATION =====
// Add your audio tracks here!
const TRACKS = [
  {
    title: "Sample Track 1",
    artist: "Artist Name",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12"
  },
  {
    title: "Sample Track 2",
    artist: "Another Artist",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05"
  },
  {
    title: "Sample Track 3",
    artist: "Third Artist",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:44"
  }
];

// ===== DOM ELEMENTS =====
const audio = document.getElementById('audioElement');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
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
const player = document.getElementById('audioPlayer');
const vizBars = document.querySelectorAll('.viz-bar');

// ===== STATE =====
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
let currentSpeedIndex = 2;
let vizInterval = null;

// ===== INITIALIZATION =====
function init() {
  renderPlaylist();
  loadTrack(0);
  audio.volume = 0.8;
  playlistCount.textContent = TRACKS.length + ' track' + (TRACKS.length !== 1 ? 's' : '');
}

// ===== RENDER PLAYLIST =====
function renderPlaylist() {
  playlistEl.innerHTML = '';
  TRACKS.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (index === currentTrackIndex ? ' active' : '');
    item.innerHTML = `
      <span class="pl-number">${index + 1}</span>
      <div class="pl-info">
        <div class="pl-title">${track.title}</div>
        <div class="pl-artist">${track.artist}</div>
      </div>
      <span class="pl-duration">${track.duration}</span>
    `;
    item.addEventListener('click', () => {
      loadTrack(index);
      playAudio();
    });
    playlistEl.appendChild(item);
  });
}

// ===== LOAD TRACK =====
function loadTrack(index) {
  currentTrackIndex = index;
  const track = TRACKS[index];
  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackStatus.textContent = 'Ready';
  updatePlaylistActive();

  // Reset progress
  progressBar.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = track.duration;
}

function updatePlaylistActive() {
  const items = playlistEl.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    item.classList.toggle('active', index === currentTrackIndex);
  });
}

// ===== PLAY / PAUSE =====
function playAudio() {
  audio.play().then(() => {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    trackStatus.textContent = 'Now Playing';
    player.classList.add('playing');
    startVisualizer();
  }).catch(e => {
    console.error('Playback error:', e);
    trackStatus.textContent = 'Error';
  });
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
  trackStatus.textContent = 'Paused';
  player.classList.remove('playing');
  stopVisualizer();
}

function togglePlayPause() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

// ===== NAVIGATION =====
function nextTrack() {
  let nextIndex;
  if (isShuffle) {
    nextIndex = Math.floor(Math.random() * TRACKS.length);
  } else {
    nextIndex = (currentTrackIndex + 1) % TRACKS.length;
  }
  loadTrack(nextIndex);
  playAudio();
}

function prevTrack() {
  let prevIndex;
  if (isShuffle) {
    prevIndex = Math.floor(Math.random() * TRACKS.length);
  } else {
    prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
  }
  loadTrack(prevIndex);
  playAudio();
}

// ===== PROGRESS =====
function updateProgress() {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function seek(e) {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const percent = Math.max(0, Math.min(1, clickX / width));
  if (audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

// ===== VOLUME =====
function setVolume() {
  audio.volume = volumeSlider.value / 100;
}

// ===== SPEED =====
function toggleSpeed() {
  currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
  audio.playbackRate = playbackSpeeds[currentSpeedIndex];
  speedBtn.textContent = playbackSpeeds[currentSpeedIndex] + 'x';
}

// ===== SHUFFLE & REPEAT =====
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
}

// ===== VISUALIZER =====
function startVisualizer() {
  stopVisualizer();
  vizInterval = setInterval(() => {
    vizBars.forEach(bar => {
      const height = Math.random() * 20 + 4;
      bar.style.height = height + 'px';
    });
  }, 150);
}

function stopVisualizer() {
  if (vizInterval) {
    clearInterval(vizInterval);
    vizInterval = null;
  }
  vizBars.forEach(bar => {
    bar.style.height = '4px';
  });
}

// ===== EVENT LISTENERS =====
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
progressContainer.addEventListener('click', seek);
volumeSlider.addEventListener('input', setVolume);
speedBtn.addEventListener('click', toggleSpeed);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    togglePlayPause();
  }
  if (e.code === 'ArrowRight' && e.ctrlKey) nextTrack();
  if (e.code === 'ArrowLeft' && e.ctrlKey) prevTrack();
});

// ===== START =====
init();