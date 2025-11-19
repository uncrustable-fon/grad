function showGraduateLogin() {
  document.getElementById("graduateLogin").style.display = "block";
  document.getElementById("familyLogin").style.display = "none";
}

function loginGraduate() {
  const user = document.getElementById("graduateUser").value;
  const pass = document.getElementById("graduatePass").value;
  if (user === "Fon" && pass === "19122025") {
    closeLoginScreen();
  } else {
    document.getElementById("graduateError").textContent = "Invalid credentials!";
  }
}

function showFamilyLogin() {
  document.getElementById("familyLogin").style.display = "block";
  document.getElementById("graduateLogin").style.display = "none";
}

function closeLoginScreen() {
  const loginScreen = document.getElementById("loginScreen");
  const loadingScreen = document.getElementById("loadingScreen");
  const progressBar = document.getElementById("progressBar");
  const sound = document.getElementById("startupSound");

  if (sound) {
    sound.currentTime = 0; 
    sound.play();
  }

  // Fade out login
  loginScreen.classList.add("fade-out");
  setTimeout(() => {
    loginScreen.style.display = "none";
    loadingScreen.style.display = "flex";

    // Animate progress bar over 5s
    let width = 0;
    const interval = setInterval(() => {
      width += 2; // adjust speed
      progressBar.style.width = width + "%";

      if (width >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.style.display = "none";
          document.getElementById("mainContent").style.display = "block";
        }, 300); 
      }
    }, 100); // runs every 100ms
  }, 700); 
}

function toggleStartMenu() {
  const menu = document.getElementById('startMenu');
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}
function loadDropboxPhotos() {
  const photoGrid = document.getElementById('photoGrid');
  const dropboxLinks = [
    //alright alright I KNOW THIS IS A BIT OF A HACKY WAY TO DO IT BUT DROPBOX DOESNT HAVE AN EASY API FOR THIS SO JUST DEAL WITH IT :P
    //also if you are reading this comment, why are you so interested in my photos...? you weirdo
    "https://dl.dropbox.com/scl/fi/dawkasne12wpp19wpivwr/Screenshot-2024-10-07-151659.png?rlkey=wbhpff6dagr6xr0ffy2bblanm&st=fylhle30&",
    "https://dl.dropbox.com/scl/fi/5zduu3cczdmobjv9num9j/Screenshot-2024-10-07-145512.png?rlkey=rteye33nr08n7ps8mgq7fkeww&st=vb27p3mn&",
    // Add more Dropbox direct links here
  ];

  dropboxLinks.forEach(link => {
    const img = document.createElement('img');
    img.src = link;
    img.onclick = () => openModal(link);
    photoGrid.appendChild(img);
  });
  // ensure navigation is wired after images appended
  setTimeout(setupPhotoGridNavigation, 200);
}

// Load photos from a GitHub repository folder using the GitHub Contents API (recursive)
async function loadGithubPhotos(githubUrl) {
  const photoGrid = document.getElementById('photoGrid');
  // parse common GitHub URL forms: /owner/repo[/tree/branch/path]
  const m = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.*))?)?/i);
  if (!m) {
    throw new Error('Invalid GitHub URL. Expected https://github.com/<owner>/<repo> or /tree/<branch>/<path>');
  }
  const owner = m[1];
  const repo = m[2];
  const branch = m[3];
  const startPath = m[4] || '';

  const images = [];

  async function fetchFolder(path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${branch ? `?ref=${branch}` : ''}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`GitHub API request failed (${res.status}) for path ${path}`);
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      if (item.type === 'file' && /\.(jpe?g|png|gif|webp|svg)$/i.test(item.name)) {
        images.push(item.download_url);
      } else if (item.type === 'dir') {
        // recurse into directory
        await fetchFolder(item.path);
      }
    }
  }

  await fetchFolder(startPath);

  if (images.length === 0) {
    console.warn('No image files found at the provided GitHub path.');
  }

  images.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.onclick = () => openModal(url);
    photoGrid.appendChild(img);
  });

  // small delay so images exist in DOM before wiring navigation
  await new Promise(res => setTimeout(res, 120));
}

document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...
  // If you want to load photos from a GitHub repo, set `GITHUB_PHOTOS_URL` below.
  // Example: "https://github.com/<owner>/<repo>/tree/<branch>/<path>" or just "https://github.com/<owner>/<repo>"
  const GITHUB_PHOTOS_URL = "https://github.com/uncrustable-fon/photo-gallery"; // <-- your repo URL

  if (GITHUB_PHOTOS_URL && GITHUB_PHOTOS_URL.trim() !== "") {
    loadGithubPhotos(GITHUB_PHOTOS_URL).then(() => setupPhotoGridNavigation()).catch(err => {
      console.error('Failed to load GitHub photos, falling back to Dropbox links.', err);
      loadDropboxPhotos();
    });
  } else {
    loadDropboxPhotos();
  }
  // Initialize music playlist UI and behavior
  initPlaylist();
});
function uploadPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.onclick = () => openModal(img.src);
      document.getElementById('photoGrid').appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

function openModal(src) {
  document.getElementById('modalImage').src = src;
  document.getElementById('photoModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('photoModal').style.display = 'none';
}

function makeDraggable(windowEl, headerEl) {
  let offsetX = 0, offsetY = 0, isDown = false;

  headerEl.addEventListener('mousedown', function(e) {
    isDown = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
  });

  document.addEventListener('mouseup', function() {
    isDown = false;
  });

  document.addEventListener('mousemove', function(e) {
    if (isDown) {
      windowEl.style.left = (e.clientX - offsetX) + 'px';
      windowEl.style.top = (e.clientY - offsetY) + 'px';
    }
  });
}

function toggleDarkMode() {
  const body = document.body;
  const button = document.querySelector(".dark-toggle");
  
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    button.textContent = "Light Mode";
  } else {
    button.textContent = "Dark Mode";
  }
}
// Activate dragging for all windows
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".window").forEach(win => {
    const header = win.querySelector(".window-header");
    if (header) {
      makeDraggable(win, header);
    }
  });

  document.querySelectorAll(".music-player").forEach(win => {
    const header = win.querySelector(".music-header");
    if (header) {
      makeDraggable(win, header);
    }
  });
});

// --- CSV-based Family Login ---
let credentials = [];

// Fetch and parse CSV
async function loadCredentials() {
 //ALRIGHT YOU CAUGHT ME THIS IS WHERE I STORED THE LOGIN CREDENTIALS FOR THE FAMILY LOGIN PLEASE DONT HACK ME :P
  const response = await fetch("https://dl.dropbox.com/scl/fi/6iprmc6owpai477ve4bem/user.test.excelsheet.csv?rlkey=5psck913a69noegvyvqgq8cwa&st=kyjtvi93&");
  const text = await response.text();
  const lines = text.trim().split("\n");
  credentials = lines.slice(1).map(line => {
    const [username, password] = line.split(",");
    return { username: username.trim(), password: password.trim() };
  });
}
// Why are you still reading this comment? Go away!
// Login function
async function loginFamily() {
  if (credentials.length === 0) {
    await loadCredentials(); // Ensure credentials are loaded
  }

  const user = document.getElementById("familyUser").value;
  const pass = document.getElementById("familyPass").value;

  const match = credentials.find(cred => cred.username === user && cred.password === pass);

  if (match) {
    closeLoginScreen();
  } else {
    document.getElementById("loginError").textContent = "Invalid credentials!";
  }
}

// --- Photo Modal Navigation ---
let photoUrls = [];
let currentPhotoIndex = 0;

// Function to open modal and set current index
function openModalWithIndex(index) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImage');
  currentPhotoIndex = index;
  modalImg.src = photoUrls[index];
  modal.style.display = 'flex';
}

// Update photoGrid click handlers to use openModalWithIndex
function setupPhotoGridNavigation() {
  const grid = document.getElementById('photoGrid');
  const imgs = grid.querySelectorAll('img');
  photoUrls = Array.from(imgs).map(img => img.src);
  imgs.forEach((img, idx) => {
    img.onclick = (e) => {
      e.stopPropagation();
      openModalWithIndex(idx);
    };
  });
}

// Keyboard navigation for modal
function handleModalKeydown(e) {
  const modal = document.getElementById('photoModal');
  if (modal.style.display !== 'flex') return;
  if (e.key === 'ArrowRight') {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoUrls.length;
    document.getElementById('modalImage').src = photoUrls[currentPhotoIndex];
  } else if (e.key === 'ArrowLeft') {
    currentPhotoIndex = (currentPhotoIndex - 1 + photoUrls.length) % photoUrls.length;
    document.getElementById('modalImage').src = photoUrls[currentPhotoIndex];
  } else if (e.key === 'Escape') {
    closeModal();
  }
}

document.addEventListener('keydown', handleModalKeydown);
//oh you deep into the code huh? well hello there! I see a freak when I see one :D
// Call this after photos are loaded into the grid
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(setupPhotoGridNavigation, 500);
} else {
  window.addEventListener('DOMContentLoaded', () => setTimeout(setupPhotoGridNavigation, 500));
}

// Optional: preload credentials on page load
window.onload = loadCredentials;
//DAMN YOU FOUND ME AGAIN! YOU MUST REALLY LIKE READING COMMENTS HUH :P 
//WELL SINCE YOU ARE HERE, HAVE A GREAT DAY AHEAD! KEEP SMILING :D

// --- Easter Egg Triggers ---
(() => {
  const header = document.querySelector('#photoWindow .window-header');
  let clickTimes = [];
  const CLICK_COUNT = 5;
  const WINDOW_MS = 1500; // clicks within 1.5s

  function revealEasterEgg(toggle) {
    document.body.classList.toggle('easter-revealed', toggle);
    if (toggle) runConfetti();
  }

  if (header) {
    header.addEventListener('click', () => {
      const now = Date.now();
      clickTimes.push(now);
      // keep only last CLICK_COUNT timestamps
      if (clickTimes.length > CLICK_COUNT) clickTimes.shift();
      // if we have CLICK_COUNT clicks within WINDOW_MS, toggle
      if (clickTimes.length === CLICK_COUNT && (now - clickTimes[0] <= WINDOW_MS)) {
        revealEasterEgg(true);
        // auto-hide after 8 seconds
        setTimeout(() => revealEasterEgg(false), 8000);
        clickTimes = [];
      }
    });
  }

  // Keyboard shortcut: Ctrl+Shift+E toggles egg
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      const isShown = document.body.classList.contains('easter-revealed');
      revealEasterEgg(!isShown);
    }
  });

})();

// --- Confetti Generator ---
function runConfetti() {
  const count = Math.min(Math.max(Math.floor(window.innerWidth / 12), 24), 120);
  const colors = ['#00477f', '#ffd520'];
  const container = document.createDocumentFragment();
  const created = [];

  // no sound: confetti is visual-only

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.background = color;
    const dx = (Math.random() * 160 - 80).toFixed(0) + 'px';
    const dur = (1200 + Math.random() * 1600).toFixed(0) + 'ms';
    const rotate = (Math.random() * 720 - 360).toFixed(0) + 'deg';
    // position randomly across the viewport width
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--duration', dur);
    el.style.setProperty('--rotate', rotate);
    container.appendChild(el);
    created.push(el);
  }

  document.body.appendChild(container);

  // cleanup after the longest duration + small buffer
  const maxDur = Math.max(...created.map(e => parseInt(getComputedStyle(e).getPropertyValue('--duration'))));
  setTimeout(() => {
    created.forEach(e => e.remove());
  }, maxDur + 500);
}

// --- Music Playlist (simple: prev/next + audio) ---
const playlist = [
  { src: "https://dl.dropbox.com/scl/fi/rlb6wndp0eeej7hhuu43t/I-ll-Always-Remember-You-Hannah-Montana-lyrics.mp3?rlkey=hhatc08wgt3egjdue7yce19f3&st=h0dbu5e3&" },
  { src: "https://dl.dropbox.com/scl/fi/cctmduhatytkaunuqgiv5/4K-DEPEND-ON-YOU-TIME100-Talks-Performance-1.mp3?rlkey=y943vngw9b76n7cmbiu41p5pu&st=cie2324s&"},
  { src: "https://dl.dropbox.com/scl/fi/93oylg2hdvmk7pf6n9g7c/Castle-On-The-Hill-Ed-Sheeran.mp3?rlkey=zah31wsgvnd2dcmzv8dxyqbcj&st=qb3sybxq&" },
  { src: "https://dl.dropbox.com/scl/fi/0nrnsonv0obgrs8xqaowy/Tracy-Chapman-Fast-Car.mp3?rlkey=6wdlhoap748qyrncmer2pevgo&st=5nlpwcvj&"},
  { src: "https://dl.dropbox.com/scl/fi/djdkqcq66v602fffxa0i0/Cat-Burns-live-more-love-more.mp3?rlkey=oq8pax685bcrdjb9bfnxrq0qc&st=i84wuyvv&"},
  { src: "https://dl.dropbox.com/scl/fi/ny8r999snork5ryoyffpe/LE-SSERAFIM-Perfect-Night.mp3?rlkey=96rxi3jk0urfepi2ejh0tgwy6&st=gixoioge&"},
  { src: "https://dl.dropbox.com/scl/fi/posagham0y7gbjmz1kw80/Little-Mix-Power-Lyrics-ft.-Stormzy.mp3?rlkey=w2ap2bxyat56kuq07tdaej726&st=vn6wtqnf&"},
  { src: "https://dl.dropbox.com/scl/fi/49ylnmjyhkk98ly1ut0rd/The-Cheetah-Girls-Cinderella-with-lyrics.mp3?rlkey=tfou0e3wxvwkkilkj2k5yrihv&st=mhpotbjc&"}
];

let currentTrackIndex = 0;

function loadTrack(index) {
  if (!playlist.length) {
    const audio = document.getElementById('audioPlayer');
    if (audio) audio.removeAttribute('src');
    return;
  }
  currentTrackIndex = ((index % playlist.length) + playlist.length) % playlist.length;
  const audio = document.getElementById('audioPlayer');
  if (audio) audio.src = playlist[currentTrackIndex].src;
}

function nextTrack() {
  if (!playlist.length) return;
  loadTrack(currentTrackIndex + 1);
  const audio = document.getElementById('audioPlayer');
  if (audio) audio.play().catch(() => {});
}

function prevTrack() {
  if (!playlist.length) return;
  loadTrack(currentTrackIndex - 1);
  const audio = document.getElementById('audioPlayer');
  if (audio) audio.play().catch(() => {});
}

function initPlaylist() {
  const audio = document.getElementById('audioPlayer');
  const nextBtn = document.getElementById('nextTrack');
  const prevBtn = document.getElementById('prevTrack');
  if (!audio) return;
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);
  audio.addEventListener('ended', nextTrack);
  // expose simple addTrack(src) at runtime (no title)
  window.addTrack = function(src) {
    playlist.push({ src });
    if (playlist.length === 1) loadTrack(0);
  };
  if (playlist.length > 0) loadTrack(0);
}
