function createWeatherCards(data, communeName, options) {
  // Vider les sections précédentes
  weatherInformation.innerHTML = '';
  forecastContainer.innerHTML = '';
  
  // Créer une carte pour chaque jour de prévision (limité par selectedDays)
  const maxDays = Math.min(selectedDays, data.forecast.length);
  
  // Traiter la prévision du jour actuel (jour 0)
  const todayForecast = data.forecast[0];
  
  // Créer la carte du jour
  const mainCard = document.createElement("div");
  mainCard.className = "weather-card";
  
  // Ajouter l'icône météo
  const weatherIconDiv = document.createElement("div");
  weatherIconDiv.className = "weather-icon";
  const weatherIcon = document.createElement("i");
  weatherIcon.className = `fas ${getWeatherIcon(todayForecast.weather)} fa-3x`;
  weatherIconDiv.appendChild(weatherIcon);
  mainCard.appendChild(weatherIconDiv);
  
  // Ajouter les détails météo
  const weatherDetails = document.createElement("div");
  weatherDetails.className = "weather-details";
  
  // Information sur la ville
  const cityInfo = document.createElement("div");
  cityInfo.className = "city-info";
  
  const cityName = document.createElement("div");
  cityName.className = "city-name";
  cityName.textContent = communeName;
  
  const weatherDate = document.createElement("div");
  weatherDate.className = "weather-date";
  const today = new Date();
  weatherDate.textContent = formatDate(today);
  
  cityInfo.appendChild(cityName);
  cityInfo.appendChild(weatherDate);
  weatherDetails.appendChild(cityInfo);
  
  // Températures
  const weatherTemps = document.createElement("div");
  weatherTemps.className = "weather-temps";
  
  const tempMin = document.createElement("div");
  tempMin.className = "temp-min";
  tempMin.innerHTML = `<i class="fas fa-temperature-low"></i> Min: ${todayForecast.tmin}°C`;
  
  const tempMax = document.createElement("div");
  tempMax.className = "temp-max";
  tempMax.innerHTML = `<i class="fas fa-temperature-high"></i> Max: ${todayForecast.tmax}°C`;
  
  weatherTemps.appendChild(tempMin);
  weatherTemps.appendChild(tempMax);
  weatherDetails.appendChild(weatherTemps);
  
  // Grille de détails supplémentaires
  const weatherDetailsGrid = document.createElement("div");
  weatherDetailsGrid.className = "weather-details-grid";
  
  // Ajouter les détails standard
  weatherDetailsGrid.innerHTML = `
    <div class="weather-detail-item">
      <i class="fas fa-tint"></i> Probabilité de pluie: ${todayForecast.probarain}%
    </div>
    <div class="weather-detail-item">
      <i class="fas fa-sun"></i> Ensoleillement: ${displayHours(todayForecast.sun_hours)}
    </div>
  `;
  
  // Ajouter les détails optionnels en fonction des choix utilisateur
  if (options.showLatitude && options.latitude) {
    const latitudeItem = document.createElement("div");
    latitudeItem.className = "weather-detail-item";
    latitudeItem.innerHTML = `<i class="fas fa-map-marker-alt"></i> Latitude: ${options.latitude}`;
    weatherDetailsGrid.appendChild(latitudeItem);
  }
  
  if (options.showLongitude && options.longitude) {
    const longitudeItem = document.createElement("div");
    longitudeItem.className = "weather-detail-item";
    longitudeItem.innerHTML = `<i class="fas fa-map-marker-alt"></i> Longitude: ${options.longitude}`;
    weatherDetailsGrid.appendChild(longitudeItem);
  }
  
  if (options.showRainfall) {
    const rainfallItem = document.createElement("div");
    rainfallItem.className = "weather-detail-item";
    rainfallItem.innerHTML = `<i class="fas fa-cloud-rain"></i> Cumul de pluie: ${todayForecast.rr10}mm`;
    weatherDetailsGrid.appendChild(rainfallItem);
  }
  
  if (options.showWindSpeed) {
    const windSpeedItem = document.createElement("div");
    windSpeedItem.className = "weather-detail-item";
    windSpeedItem.innerHTML = `<i class="fas fa-wind"></i> Vent moyen: ${todayForecast.wind10m}km/h`;
    weatherDetailsGrid.appendChild(windSpeedItem);
  }
  
  if (options.showWindDirection) {
    const windDirItem = document.createElement("div");
    windDirItem.className = "weather-detail-item";
    windDirItem.innerHTML = `<i class="fas fa-compass"></i> Direction vent: ${todayForecast.dirwind10m}° (${getWindDirection(todayForecast.dirwind10m)})`;
    weatherDetailsGrid.appendChild(windDirItem);
  }
  
  weatherDetails.appendChild(weatherDetailsGrid);
  mainCard.appendChild(weatherDetails);
  
  // Ajouter la carte principale à la section
  weatherInformation.appendChild(mainCard);
  weatherInformation.style.display = "flex";
  
  // Si l'utilisateur a sélectionné plus d'un jour
  if (maxDays > 1) {
    // Créer les cartes pour les jours suivants
    for (let i = 1; i < maxDays; i++) {
      const forecast = data.forecast[i];
      const forecastDate = new Date();
      forecastDate.setDate(today.getDate() + i);
      
      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-day";
      
      // En-tête avec la date
      const forecastHeader = document.createElement("div");
      forecastHeader.className = "forecast-header";
      
      const dateDisplay = document.createElement("div");
      dateDisplay.className = "forecast-date";
      dateDisplay.textContent = capitalizeFirstLetter(formatDate(forecastDate));
      
      const weatherIconForecast = document.createElement("i");
      weatherIconForecast.className = `fas ${getWeatherIcon(forecast.weather)}`;
      
      forecastHeader.appendChild(dateDisplay);
      forecastHeader.appendChild(weatherIconForecast);
      forecastCard.appendChild(forecastHeader);
      
      // Détails de la prévision
      const forecastDetails = document.createElement("div");
      forecastDetails.className = "forecast-details";
      
      // Ajouter les détails standards
      forecastDetails.innerHTML = `
        <div class="forecast-detail-item">
          <i class="fas fa-temperature-low"></i> Min: ${forecast.tmin}°C
        </div>
        <div class="forecast-detail-item">
          <i class="fas fa-temperature-high"></i> Max: ${forecast.tmax}°C
        </div>
        <div class="forecast-detail-item">
          <i class="fas fa-tint"></i> Pluie: ${forecast.probarain}%
        </div>
        <div class="forecast-detail-item">
          <i class="fas fa-sun"></i> Soleil: ${displayHours(forecast.sun_hours)}
        </div>
      `;
      
      // Ajouter les détails optionnels
      if (options.showRainfall) {
        forecastDetails.innerHTML += `
          <div class="forecast-detail-item">
            <i class="fas fa-cloud-rain"></i> Pluie: ${forecast.rr10}mm
          </div>
        `;
      }
      
      if (options.showWindSpeed) {
        forecastDetails.innerHTML += `
          <div class="forecast-detail-item">
            <i class="fas fa-wind"></i> Vent: ${forecast.wind10m}km/h
          </div>
        `;
      }
      
      if (options.showWindDirection) {
        forecastDetails.innerHTML += `
          <div class="forecast-detail-item">
            <i class="fas fa-compass"></i> Direction: ${forecast.dirwind10m}° (${getWindDirection(forecast.dirwind10m)})
          </div>
        `;
      }
      
      forecastCard.appendChild(forecastDetails);
      forecastContainer.appendChild(forecastCard);
    }
    
    forecastContainer.style.display = "flex";
  }
  
  // Masquer le formulaire
  document.getElementById("cityForm").style.display = "none";
  
  // Ajouter un bouton pour retourner à la recherche
  const reloadButton = document.createElement("div");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.className = "reloadButton";
  
  // Si on affiche plusieurs jours, ajouter le bouton après forecastContainer
  if (maxDays > 1) {
    forecastContainer.after(reloadButton);
  } else {
    weatherInformation.after(reloadButton);
  }
  
  // Ajouter l'événement de rechargement
  reloadButton.addEventListener("click", function() {
    location.reload();
  });
}

function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}