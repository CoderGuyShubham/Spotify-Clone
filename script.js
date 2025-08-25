// script.js
let currentSongs = new Audio();
let songs = [];            // ["My Song.mp3", "Track TWO.mp3", ...] from songs.json
let currentIndex = 0;      // <-- single source of truth for which song is active

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Fetch songs from songs.json (clean, human-readable names allowed)
async function fetchSongs() {
    const res = await fetch("songs.json");
    return await res.json();
}

// Always derive URL from name safely
function songUrl(name) {
    return `songs/${encodeURIComponent(name)}`;
}

// Play by index (more reliable than parsing src)
function playByIndex(index, pause = false) {
    currentIndex = index;
    const track = songs[currentIndex];

    currentSongs.src = songUrl(track);
    if (!pause) {
        currentSongs.play();
        const playIcon = document.getElementById("play");
        if (playIcon) playIcon.src = "img/pause.svg";
    }

    // UI text
    document.querySelector(".song-info").textContent = track;
    document.querySelector(".current-time").textContent = "00:00";
    // duration will update after metadata loads
}

// Build list UI
function renderSongList() {
    const songUL = document.querySelector(".songLists ul");
    songUL.innerHTML = "";
    songs.forEach((name, i) => {
        songUL.innerHTML += `
      <li data-index="${i}">
        <img class="music" src="img/music.svg" alt="music">
        <div class="info">
          <div>${name}</div>
          <div>Shubham</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="play-button" src="img/play-button.svg" alt="play">
        </div>
      </li>`;
    });

    // Click any li to play that song
    Array.from(document.querySelectorAll(".songLists li")).forEach(li => {
        li.addEventListener("click", () => {
            const i = Number(li.dataset.index);
            playByIndex(i);
        });
    });
}

async function main() {
    songs = await fetchSongs();

    // Initial render + load first song paused
    renderSongList();
    playByIndex(0, true);

    // ---- Controls ----
    const playToggleBtn = document.getElementById("playit");
    const playIcon = document.getElementById("play");
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("forward");

    playToggleBtn?.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play();
            if (playIcon) playIcon.src = "img/pause.svg";
        } else {
            currentSongs.pause();
            if (playIcon) playIcon.src = "img/play.svg";
        }
    });

    // Previous / Next now use currentIndex
    prevBtn?.addEventListener("click", () => {
        if (currentIndex > 0) {
            playByIndex(currentIndex - 1);
        }
        // If you want wrap-around, use:
        // playByIndex((currentIndex - 1 + songs.length) % songs.length);
    });

    nextBtn?.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            playByIndex(currentIndex + 1);
        }
        // For wrap-around:
        // playByIndex((currentIndex + 1) % songs.length);
    });

    // Time + seekbar
    currentSongs.addEventListener("timeupdate", () => {
        const cur = currentSongs.currentTime || 0;
        const dur = currentSongs.duration || 0;

        document.querySelector(".current-time").textContent = formatSeconds(cur);
        document.querySelector(".song-duration").textContent = formatSeconds(dur);

        const pct = dur ? (cur / dur) * 100 : 0;
        document.querySelector(".circle").style.left = `${pct}%`;
    });

    // Update duration once metadata is loaded (so it's not "04:00" hardcoded)
    currentSongs.addEventListener("loadedmetadata", () => {
        document.querySelector(".song-duration").textContent = formatSeconds(currentSongs.duration || 0);
    });

    document.querySelector(".seekbar")?.addEventListener("click", e => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        if (currentSongs.duration) {
            currentSongs.currentTime = (percent / 100) * currentSongs.duration;
        }
    });

    // Volume
    const volumeSlider = document.querySelector(".range input");

    if (volumeSlider) {
        // set default volume
        currentSongs.volume = volumeSlider.value / 100;

        // update while dragging
        volumeSlider.addEventListener("input", (e) => {
            let vol = e.target.value / 100;   // convert 0–100 → 0–1
            currentSongs.volume = vol;
            console.log("Volume:", vol);      // 👈 check if it logs correctly
        });
    }

    // Hamburger toggle (restored)
    document.querySelector("#hamburger")?.addEventListener("click", () => {
        const hamburgerIcon = document.querySelector("#hamburger");
        const leftPane = document.querySelector(".left");
        if (!hamburgerIcon || !leftPane) return;

        if (hamburgerIcon.src.includes("hamburger.svg")) {
            hamburgerIcon.src = "img/cross.svg";
            leftPane.style.left = 0;
        } else {
            hamburgerIcon.src = "img/hamburger.svg";
            leftPane.style.left = "-100%";
        }
    });
}

main();
