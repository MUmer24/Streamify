console.log("Hello, World!");

let songs = [];
let songsAddress = [];
let CurrentSong = new Audio();
let currentlyPlaying = null; // Track the currently playing song item
let songsName = [];
let currFolder;

// -----------------------------------------------------
// Function to convert seconds to minutes:seconds
function formatTime(seconds) {
  let totalSeconds = Math.floor(seconds); // Convert decimal to integer
  let minutes = Math.floor(totalSeconds / 60);
  let remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
// -----------------------------------------------------

// -----------------------------------------------------
// Function to retrieve songs from the source URL and populate the playlist, insert the play svg in list-items and add event listeners to play button
// This function is called when the user clicks the Song Card button
async function getSongs(folder) {
  try {
    songsAddress = [];
    songsName = [];
    songs = [];

    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/Assets/Songs/${folder}/`);
    if (!response.ok) throw new Error("Failed to fetch song list.");
    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;
    let as = div.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        // Populate songsAddress with the full URL of the song
        songsAddress.push(element.href);

        // Extract the song name from the URL and push it to songsName
        let songName = element.href.split(`/${folder}/`)[1];
        songsName.push(songName);

        // Push the song name with spaces replaced by "%20" to the songs array
        songs.push(songName.replaceAll("%20", " "));
      }
    }

    // Insert songs' names in the playlist
    let ulElement = document.querySelector(".songsList ul");
    ulElement.innerHTML = "";
    songs.forEach((song) => {
      let li = document.createElement("li");
      li.textContent = song;
      ulElement.appendChild(li);
    });
    await insert_svg(); // Add SVG elements to song items

    // Add event listener to each song item
    let songList = document.querySelectorAll(".songsList ul li");
    songList.forEach((songItem) => {
      songItem.lastElementChild.addEventListener("click", () => {
        togglePlayPause(songItem);
      });
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
  return songsAddress;
}
// -----------------------------------------------------

// -----------------------------------------------------
// Function to Display SVG elements in each song container
async function insert_svg() {
  try {
    let svgResponse = await fetch("/Assets/img/audio.svg");
    if (!svgResponse.ok) throw new Error("Failed to load SVG.");
    let svgHtml = await svgResponse.text();

    let playbtnResponse = await fetch("/Assets/img/playbtn.svg");
    if (!playbtnResponse.ok) throw new Error("Failed to load Play button SVG.");
    let playbtnHtml = await playbtnResponse.text();

    let songItems = document.querySelectorAll(".songsList ul li");

    songItems.forEach((element) => {
      element.insertAdjacentHTML("afterbegin", svgHtml); // Insert waveform SVG
      element.insertAdjacentHTML("beforeend", playbtnHtml); // Insert play button SVG
    });
  } catch (error) {
    console.error("Error inserting SVGs:", error);
  }
}
// -----------------------------------------------------

// -----------------------------------------------------
// Function to highlight the currently playing song
function highlightPlayingSong(songItem) {
  // Reset previous song's styling
  if (currentlyPlaying) {
    currentlyPlaying.style.color = ""; // Reset text color
    let prevSvg = currentlyPlaying.querySelector("svg");
    if (prevSvg) prevSvg.style.color = ""; // Reset SVG color
  }

  // Apply green color to the new song and its first SVG
  songItem.style.color = "#1cc558";
  let firstSvg = songItem.querySelector("svg");
  if (firstSvg) firstSvg.style.color = "#1cc558";

  currentlyPlaying = songItem;
}
// -----------------------------------------------------

// -----------------------------------------------------
async function togglePlayPause(songItem = currentlyPlaying) {
  // console.log(`Song item: ${songItem} Entered togglePlayPause function`);
  if (!songItem) return; // If no song is selected, do nothing

  let playbtn = document.querySelector("#play");
  let songPath;
  let track = songItem.innerText;
  let mainTrack = track.replaceAll(" ", "%20");
  songPath = `/Assets/Songs/${currFolder}/` + mainTrack;

  document.querySelector(".song_info > span").innerText = track;

  if (CurrentSong.src.endsWith(songPath)) {
    // Toggle between play and pause
    if (CurrentSong.paused) {
      CurrentSong.play();
      highlightPlayingSong(songItem);
      playbtn.src = "/Assets/img/pause.svg";
    } else {
      CurrentSong.pause();
      playbtn.src = "/Assets/img/playbtn.svg";
    }
  } else {
    // Play new song
    CurrentSong.src = songPath;
    CurrentSong.play();
    playbtn.src = "/Assets/img/pause.svg";
    highlightPlayingSong(songItem);
  }
}
// -----------------------------------------------------

// -----------------------------------------------------
async function displayAlbums() {
  let response = await fetch(`http://127.0.0.1:5500/Assets/Songs/`);
  if (!response.ok) throw new Error("Failed to fetch song list.");
  let textResponse = await response.text();
  let div = document.createElement("div");
  div.innerHTML = textResponse;
  let card_container = document.querySelector(".card_container");

  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Songs/")) {
      let spcfolder = e.href.split("/Songs/").slice(-1)[0].replace("_", " ");
      let folder = e.href.split("/Songs/").slice(-1)[0];
      // Get metadata of the folder
      let a = await fetch(
        `http://127.0.0.1:5500/Assets/Songs/${folder}/info.json`
      );
      let response = await a.json();
      card_container.innerHTML += `<div data-folder="${folder}" class="card">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            color="#000000" fill="none">
                            <circle cx="12" cy="12" r="10" fill="green" stroke="green" stroke-width="1.5" />
                            <path
                                d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                fill="black" />
                        </svg>
                        <img class="card_image"
                            src="/Assets/Songs/${folder}/cover.jpeg"
                            alt="card_image">
                        <p>${response.title}</p>
                    </div>`;
    }
  }
  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getSongs(`${item.currentTarget.dataset.folder}`); // Fetch songs from the server
      // Change volume to 10% when lsit is loaded 
      CurrentSong.volume = 0.2;

      // Play the first song in the list upon album load
      let songList = document.querySelectorAll(".songsList ul li");
      await togglePlayPause(songList[0]);
    });
  });
}
// -----------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------
// Main execution function
async function main() {
  try {
    await getSongs("All_Songs"); // Fetch songs from the server

    // Display all the albums on the page
    displayAlbums();

    // Add event listener to the play button in the soundbar
    let playbtn = document.querySelector("#play");
    playbtn.addEventListener("click", () => {
      togglePlayPause();
    });

    // Reset song highlight when playback stops
    CurrentSong.addEventListener("ended", () => {
      if (currentlyPlaying) {
        currentlyPlaying.style.color = "";
        let firstSvg = currentlyPlaying.querySelector("svg");
        if (firstSvg) firstSvg.style.color = "";
        let songList = document.querySelectorAll(".songsList ul li");

        let index = songsName.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
        if (index < songsName.length - 1) {
          currentlyPlaying = songList[index + 1];
        } else if (index == songsName.length - 1)
          currentlyPlaying = songList[0];
        togglePlayPause(currentlyPlaying);
      }
    });

    // Listen for timeupdate event
    CurrentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime_current").innerText = formatTime(
        CurrentSong.currentTime
      );
      document.querySelector(".songtime_total").innerText = formatTime(
        CurrentSong.duration
      );
      document.querySelector(".length").style.width =
        (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
      document.querySelector(".circle").style.left =
        (CurrentSong.currentTime / CurrentSong.duration) * 100 - 0.5 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar_track").addEventListener("click", (e) => {
      let seekbar_track_length =
        (e.offsetX / e.target.getBoundingClientRect().width) * 100;

      document.querySelector(".circle").style.left = seekbar_track_length + "%";
      document.querySelector(".length").style.width =
        seekbar_track_length + "%";

      CurrentSong.currentTime =
        (CurrentSong.duration * seekbar_track_length) / 100;
    });

    // --------------------------------------------------------
    // Add event listener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left_panel").style.left = "0%";
    });

    // Add event listener to close the Hamburger
    document.querySelector(".closebtn").addEventListener("click", () => {
      document.querySelector(".left_panel").style.left = "-100%";
    });
    // --------------------------------------------------------

    // ------------------------------------------------------------------------
    // --------------------------------------------------------
    // Add event listener to previous button
    previous.addEventListener("click", () => {
      console.log("Previous Clicked");

      let index = songsName.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
      if (index > 0) {
        let songName = songs[index - 1]; // Get the song name from the list
        let songItems = document.querySelectorAll(".songsList li"); // Get all <li> elements
        let songItem = [...songItems].find(
          (item) => item.innerText.trim() === songName.trim()
        );

        if (songItem) {
          togglePlayPause(songItem); // Pass the correct <li> element
        } else {
          console.warn("Song item not found in the list.");
        }
      } else {
        console.warn("No previous song available.");
      }
    });

    // Add event listener to next button
    next.addEventListener("click", () => {
      console.log("Next Clicked");

      let index = songsName.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
      if (index > -1) {
        let songName = songs[index + 1]; // Get the song name from the list
        let songItems = document.querySelectorAll(".songsList li"); // Get all <li> elements

        let songItem = [...songItems].find(
          (item) => item.innerText.trim() === songName.trim()
        );

        if (songItem) {
          togglePlayPause(songItem); // Pass the correct <li> element
        } else {
          console.warn("Song item not found in the list.");
        }
      } else {
        console.warn("No next song available.");
      }
    });

    // Add event listener to volume range
    volumebar.addEventListener("change", (e) => {
      
      CurrentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to volume range for mobile devices
    document.querySelector(".volume").addEventListener("click", () => {
      let volumebarActive = "block";
      if (volumebar.style.display == volumebarActive) {
        volumebar.style.display = "none";
      } else {
        volumebar.style.display = "block";
      }
    });
    // --------------------------------------------------------
    // ----------------------------------------------------------------------------
  } catch (error) {
    console.error("Error during main execution:", error);
  }
}

main();
