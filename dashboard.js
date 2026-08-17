import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue
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

const loginPanel =
  document.getElementById("loginPanel");

const dashboardPanel =
  document.getElementById("dashboardPanel");

const loginStatus =
  document.getElementById("loginStatus");

const mapEl =
  document.getElementById("map");

const locationCard =
  document.getElementById("locationCard");

const loginBtn =
  document.getElementById("loginBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");


// ==========================================
// MAP VARIABLES
// ==========================================

let map = null;
let marker = null;


// ==========================================
// DATABASE LISTENER
// ==========================================

let locationsUnsubscribe = null;


// ==========================================
// INITIALIZE MAP
// ==========================================

function initMap() {

  if (map) {
    return;
  }

  if (typeof L === "undefined") {

    console.error(
      "Leaflet has not loaded yet."
    );

    if (locationCard) {
      locationCard.textContent =
        "Map library is still loading. Please refresh the page.";
    }

    return;
  }

  map = L.map(mapEl).setView(
    [20, 0],
    2
  );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);
}


// ==========================================
// DISPLAY LOCATION
// ==========================================

function displayLocation(data) {

  if (
    !data ||
    typeof data.latitude !== "number" ||
    typeof data.longitude !== "number"
  ) {

    locationCard.textContent =
      "No location has been shared yet.";

    document.getElementById("lat").textContent =
      "—";

    document.getElementById("lng").textContent =
      "—";

    document.getElementById("accuracy").textContent =
      "—";

    document.getElementById("updated").textContent =
      "—";

    return;
  }


  const lat = data.latitude;
  const lng = data.longitude;


  // ========================================
  // UPDATE STATISTICS
  // ========================================

  document.getElementById("lat").textContent =
    lat.toFixed(6);

  document.getElementById("lng").textContent =
    lng.toFixed(6);

  document.getElementById("accuracy").textContent =
    `${data.accuracy ?? "—"} m`;

  document.getElementById("updated").textContent =
    data.timestamp
      ? new Date(data.timestamp).toLocaleString()
      : "—";


  // ========================================
  // INITIALIZE MAP
  // ========================================

  initMap();

  if (!map) {
    return;
  }


  // ========================================
  // UPDATE MARKER
  // ========================================

  if (!marker) {

    marker = L.marker([
      lat,
      lng
    ]).addTo(map);

  } else {

    marker.setLatLng([
      lat,
      lng
    ]);
  }


  // ========================================
  // MARKER POPUP
  // ========================================

  marker
    .bindPopup(
      `<b>Shared location</b><br>
       Accuracy: ${data.accuracy ?? "—"} m`
    )
    .openPopup();


  // ========================================
  // CENTER MAP
  // ========================================

  map.setView(
    [lat, lng],
    16
  );


  // Fix map size

  setTimeout(() => {

    if (map) {
      map.invalidateSize();
    }

  }, 200);


  // ========================================
  // GOOGLE MAPS LINK
  // ========================================

  const mapsUrl =
    `https://www.google.com/maps?q=${
      encodeURIComponent(lat + "," + lng)
    }`;


  // ========================================
  // LOCATION CARD
  // ========================================

  locationCard.innerHTML = `

    <p>
      <b>Latitude:</b>
      ${lat}
    </p>

    <p>
      <b>Longitude:</b>
      ${lng}
    </p>

    <p>
      <b>Accuracy:</b>
      ${data.accuracy ?? "—"} m
    </p>

    <p>
      <b>Shared:</b>
      ${
        data.timestamp
          ? new Date(data.timestamp).toLocaleString()
          : "—"
      }
    </p>

    <a
      class="map-link"
      href="${mapsUrl}"
      target="_blank"
      rel="noopener noreferrer">

      Open in Google Maps ↗

    </a>

  `;
}


// ==========================================
// LOGIN
// ==========================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      if (!email || !password) {

        loginStatus.textContent =
          "Please enter your email and password.";

        return;
      }


      loginStatus.textContent =
        "Signing in…";

      loginBtn.disabled = true;


      try {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        loginStatus.textContent = "";

      } catch (error) {

        console.error(
          "Login error:",
          error
        );

        loginStatus.textContent =
          "Login failed. Check your email and password.";

        loginBtn.disabled = false;
      }
    }
  );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );
      }
    }
  );
}


// ==========================================
// AUTHENTICATION STATE
// ==========================================

onAuthStateChanged(
  auth,
  (user) => {

    if (user && user.email) {

      // ====================================
      // LOGGED IN
      // ====================================

      loginPanel.classList.add("hidden");

      dashboardPanel.classList.remove("hidden");


      if (loginBtn) {
        loginBtn.disabled = false;
      }


      // ====================================
      // INITIALIZE MAP
      // ====================================

      initMap();


      // ====================================
      // REMOVE OLD LISTENER
      // ====================================

      if (locationsUnsubscribe) {
        locationsUnsubscribe();
        locationsUnsubscribe = null;
      }


      // ====================================
      // READ LOCATIONS
      // ====================================

      const locationsRef =
        ref(db, "locations");


      locationsUnsubscribe = onValue(
        locationsRef,

        (snapshot) => {

          const all =
            snapshot.val() || {};


          const values =
            Object.values(all)
              .filter(
                item =>
                  item &&
                  typeof item.latitude === "number" &&
                  typeof item.longitude === "number" &&
                  typeof item.timestamp === "number"
              )
              .sort(
                (a, b) =>
                  b.timestamp - a.timestamp
              );


          if (values.length > 0) {

            displayLocation(
              values[0]
            );

          } else {

            displayLocation(null);
          }
        },


        (error) => {

          console.error(
            "Database error:",
            error
          );

          locationCard.textContent =
            "Unable to read shared data. Check your Firebase Database Rules.";
        }
      );


    } else {

      // ====================================
      // LOGGED OUT
      // ====================================

      loginPanel.classList.remove("hidden");

      dashboardPanel.classList.add("hidden");


      if (loginBtn) {
        loginBtn.disabled = false;
      }


      if (locationsUnsubscribe) {
        locationsUnsubscribe();
        locationsUnsubscribe = null;
      }
    }
  }
);