// Sélection des éléments
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const weatherInformation = document.getElementById("weatherInformation");
const forecastContainer = document.getElementById("forecastContainer");
const darkModeToggle = document.getElementById("toggleDarkMode");
const dayButtons = document.querySelectorAll(".day-btn");

// Variables globales
let selectedDays = 1;
let selectedCommune = null;
let communeData = null;

// Gestion du mode sombre
darkModeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
  const isDarkMode = document.documentElement.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  
  // Mettre à jour l'icône
  const icon = darkModeToggle.querySelector("i");
  if (isDarkMode) {
    icon.className = "fas fa-sun";
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Mode clair';
  } else {
    icon.className = "fas fa-moon";
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Mode sombre';
  }
});

// Vérifier et appliquer le mode sombre enregistré
const savedDarkMode = localStorage.getItem("darkMode") === "true";
if (savedDarkMode) {
  document.documentElement.classList.add("dark-mode");
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Mode clair';
}

// Gestion des boutons de jours
dayButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Retirer la sélection de tous les boutons
    dayButtons.forEach(btn => btn.classList.remove("selected"));
    // Ajouter la sélection au bouton cliqué
    button.classList.add("selected");
    // Mettre à jour le nombre de jours sélectionné
    selectedDays = parseInt(button.getAttribute("data-days"));
  });
});

// Fonction pour effectuer la requête API des communes en utilisant le code postal
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour afficher les communes dans la liste déroulante
function displayCommunes(data) {
  communeSelect.innerHTML = "";
  // S'il y a au moins une commune retournée dans data
  if (data.length) {
    data.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      option.dataset.longitude = commune.centre?.coordinates[0] || "";
      option.dataset.latitude = commune.centre?.coordinates[1] || "";
      communeSelect.appendChild(option);
    });
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
    communeData = data;
  }
  else {
    // Supprimer un message précédent s'il existe déjà
    const existingMessage = document.getElementById("error-message");
    if (!existingMessage) {
      const message = document.createElement("p");
      message.id = "error-message";
      message.textContent = "Le code postal saisi n'est pas valide";
      message.classList.add('errorMessage');
      document.body.appendChild(message);
    }

    // Masquer les éléments inutiles
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Recharger la page après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}

// Fonction pour effectuer la requête API de météo sur plusieurs jours
async function fetchMeteoByCommune(selectedCommune, days = 1) {
  try {
    const response = await fetch(
      `https://api.meteo-concept.com/api/forecast/daily?token=8356b25d0dd0d8f0447d702e3ce9e6d54bc9ea3241d087f1fd5ad56ef48c4ab5&insee=${selectedCommune}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Ajout de l'écouteur d'événement "input" sur le champ code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  if (/^\d{5}$/.test(codePostal)) {
    try {
      const data = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(data);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la recherche de la commune :",
        error
      );
      throw error;
    }
  }
});

// Ajout de l'écouteur d'événement "click" sur le bouton de validation
validationButton.addEventListener("click", async () => {
  selectedCommune = communeSelect.value;
  const communeName = communeSelect.options[communeSelect.selectedIndex].text;
  
  // Récupérer les options sélectionnées
  const showLatitude = document.getElementById("showLatitude").checked;
  const showLongitude = document.getElementById("showLongitude").checked;
  const showRainfall = document.getElementById("showRainfall").checked;
  const showWindSpeed = document.getElementById("showWindSpeed").checked;
  const showWindDirection = document.getElementById("showWindDirection").checked;
  
  if (selectedCommune) {
    try {
      const data = await fetchMeteoByCommune(selectedCommune, selectedDays);
      
      // Récupérer les coordonnées de la commune sélectionnée
      const selectedOption = communeSelect.options[communeSelect.selectedIndex];
      const longitude = selectedOption.dataset.longitude;
      const latitude = selectedOption.dataset.latitude;
      
      // Créer les cartes météo
      createWeatherCards(data, communeName, {
        showLatitude,
        showLongitude,
        showRainfall,
        showWindSpeed,
        showWindDirection,
        latitude,
        longitude
      });
      
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      throw error;
    }
  }
});

// Icones météo aux icônes FontAwesome
function getWeatherIcon(weatherCode) {
  const iconMap = {
    0: "fa-sun", // Soleil
    1: "fa-cloud-sun", // Peu nuageux
    2: "fa-cloud", // Ciel voilé
    3: "fa-cloud", // Nuageux
    4: "fa-cloud", // Très nuageux
    5: "fa-smog", // Brouillard
    6: "fa-smog", // Brouillard givrant
    10: "fa-cloud-rain", // Pluie faible
    11: "fa-cloud-showers-heavy", // Pluie modérée
    12: "fa-cloud-showers-heavy", // Pluie forte
    13: "fa-cloud-rain", // Pluie faible verglaçante
    14: "fa-cloud-rain", // Pluie modérée verglaçante
    15: "fa-cloud-showers-heavy", // Pluie forte verglaçante
    16: "fa-cloud-rain", // Bruine
    20: "fa-snowflake", // Neige faible
    21: "fa-snowflake", // Neige modérée
    22: "fa-snowflake", // Neige forte
    30: "fa-cloud-rain", // Pluie et neige mêlées faibles
    31: "fa-cloud-rain", // Pluie et neige mêlées modérées
    32: "fa-cloud-showers-heavy", // Pluie et neige mêlées fortes
    40: "fa-cloud-rain", // Averses de pluie locales
    41: "fa-cloud-showers-heavy", // Averses de pluie
    42: "fa-cloud-showers-heavy", // Averses de pluie fortes
    43: "fa-cloud-rain", // Averses de pluie faibles
    44: "fa-cloud-showers-heavy", // Averses de pluie modérées à fortes
    45: "fa-cloud-showers-heavy", // Averses de pluie fortes
    46: "fa-cloud-rain", // Averses de pluie faibles et fréquentes
    47: "fa-cloud-showers-heavy", // Averses de pluie modérées et fréquentes
    48: "fa-cloud-showers-heavy", // Averses de pluie fortes et fréquentes
    60: "fa-snowflake", // Averses de neige localisées et faibles
    61: "fa-snowflake", // Averses de neige localisées
    62: "fa-snowflake", // Averses de neige fortes
    63: "fa-snowflake", // Averses de neige faibles
    64: "fa-snowflake", // Averses de neige modérées à fortes
    65: "fa-snowflake", // Averses de neige fortes
    66: "fa-snowflake", // Averses de neige faibles et fréquentes
    67: "fa-snowflake", // Averses de neige modérées et fréquentes
    68: "fa-snowflake", // Averses de neige fortes et fréquentes
    70: "fa-snowflake", // Averses de pluie et neige mêlées localisées
    71: "fa-snowflake", // Averses de pluie et neige mêlées
    72: "fa-snowflake", // Averses de pluie et neige mêlées fortes
    73: "fa-snowflake", // Averses de pluie et neige mêlées faibles
    74: "fa-snowflake", // Averses de pluie et neige mêlées modérées à fortes
    75: "fa-snowflake", // Averses de pluie et neige mêlées fortes
    76: "fa-snowflake", // Averses de pluie et neige mêlées faibles et fréquentes
    77: "fa-snowflake", // Averses de pluie et neige mêlées modérées et fréquentes
    78: "fa-snowflake", // Averses de pluie et neige mêlées fortes et fréquentes
    100: "fa-bolt", // Orages faibles et locaux
    101: "fa-bolt", // Orages locaux
    102: "fa-bolt", // Orages forts et locaux
    103: "fa-bolt", // Orages faibles
    104: "fa-bolt", // Orages
    105: "fa-bolt", // Orages forts
    106: "fa-bolt", // Orages faibles et fréquents
    107: "fa-bolt", // Orages fréquents
    108: "fa-bolt", // Orages forts et fréquents
    120: "fa-bolt", // Orages faibles et locaux de neige ou grésil
    121: "fa-bolt", // Orages locaux de neige ou grésil
    122: "fa-bolt", // Orages locaux de neige ou grésil
    123: "fa-bolt", // Orages faibles de neige ou grésil
    124: "fa-bolt", // Orages de neige ou grésil
    125: "fa-bolt", // Orages de neige ou grésil
    126: "fa-bolt", // Orages faibles et fréquents de neige ou grésil
    127: "fa-bolt", // Orages fréquents de neige ou grésil
    128: "fa-bolt", // Orages fréquents de neige ou grésil
    130: "fa-bolt", // Orages faibles et locaux de pluie et neige mêlées
    131: "fa-bolt", // Orages locaux de pluie et neige mêlées
    132: "fa-bolt", // Orages fort et locaux de pluie et neige mêlées
    133: "fa-bolt", // Orages faibles de pluie et neige mêlées
    134: "fa-bolt", // Orages de pluie et neige mêlées
    135: "fa-bolt", // Orages forts de pluie et neige mêlées
    136: "fa-bolt", // Orages faibles et fréquents de pluie et neige mêlées
    137: "fa-bolt", // Orages fréquents de pluie et neige mêlées
    138: "fa-bolt", // Orages forts et fréquents de pluie et neige mêlées
    140: "fa-bolt", // Orages faibles et locaux de grêle
    141: "fa-bolt", // Orages locaux de grêle
    142: "fa-bolt"  // Orages fort et locaux de grêle
  };

  return iconMap[weatherCode] || "fa-question";
}

// Convertir la direction du vent en points cardinaux
function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO', 'N'];
  return directions[Math.round(degrees / 45)];
}

// Formatter une date
function formatDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options);
}

// Mettre la première lettre en majuscule
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fonction pour changer le fond d'écran selon la météo
function changeBackgroundByWeather(weatherCode) {
  // Retirer toutes les classes météo existantes
  document.body.classList.remove('rainy', 'cloudy', 'snowy', 'stormy', 'foggy', 'night');
  
  // Déterminer le type de météo selon le code
  let weatherClass = '';
  
  if ([10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48].includes(weatherCode)) {
    weatherClass = 'rainy'; // Pluie
  } else if ([20, 21, 22, 30, 31, 32, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78].includes(weatherCode)) {
    weatherClass = 'snowy'; // Neige
  } else if ([100, 101, 102, 103, 104, 105, 106, 107, 108, 120, 121, 122, 123, 124, 125, 126, 127, 128, 130, 131, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142].includes(weatherCode)) {
    weatherClass = 'stormy'; // Orage
  } else if ([5, 6].includes(weatherCode)) {
    weatherClass = 'foggy'; // Brouillard
  } else if ([2, 3, 4].includes(weatherCode)) {
    weatherClass = 'cloudy'; // Nuageux
  } else if (weatherCode === 0 || weatherCode === 1) {
    weatherClass = ''; // Ensoleillé (fond par défaut)
  }
  
  // Ajouter la classe correspondante
  if (weatherClass) {
    document.body.classList.add(weatherClass);
  }
}