///////////// P Ä I V Ä N  S Ä Ä ///////////////
import { API_KEY } from "./config.js";

async function fetchCities() {
  return await fetch("./cities.json") // tämä on sisäinen polku, joten absoluuttista http://localhost:<portti>/cities.json -polkua ei tarvita
    .then((response) => response.json())
    .then((data) => {
      return data; // funktio palauttaa kaupungit
    });
}

// Noutaa annettujen koordinaattien säätiedot ja palauttaa ne
async function fetchWeatherData(lat, lon) {
  const URL = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  return await fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      return data; // palauttaa säätiedon
  })
}

// Kaupunkien valikko
const selectCity = document.querySelector('#citiesButton');
selectCity.addEventListener('click', () => {
  document.querySelector('#citiesList').classList.toggle('active');
})

// Renderöi json filusta kaupungit ja lisää ne buttoneiksi
async function renderCities() {
  const citiesObject = await fetchCities();
  const citiesDisp = document.querySelector('#citiesList');

  console.log('city list', citiesObject.cities)

  citiesObject.cities.forEach((city) => {
    const cityList = document.createElement("li");
    const cityButton = document.createElement("button");
    cityButton.textContent = city.city;
    cityList.appendChild(cityButton);
    citiesDisp.appendChild(cityList);
  
  // Valitsee kaupungin klikkaamalla ja sulkee valikon kun kaupunki on valittu
  cityButton.addEventListener("click", async () => {
    const lat = city.latitude;
    const lon = city.longitude;
    citiesDisp.classList.remove('active');
    selectLocation(lat, lon); // Valitsee kaupungin sen koordinaattien perusteella
  })
  })
}

renderCities();

// Muotoilee syötetyt säätiedot
async function renderWeatherData(weatherData) {
  const weatherElement = document.querySelector('#weather');

  const cityName = document.createElement('h2');
  cityName.textContent = weatherData.name;

  const tempDiv = document.createElement('div');
  tempDiv.textContent = `Lämpötila: ${weatherData.main.temp}°C`;

  const feelsLike = document.createElement('div');
  feelsLike.textContent = `Tuntuu kuin: ${weatherData.main.feels_like}°C`;

  const humidityDiv = document.createElement('div');
  humidityDiv.textContent = `Ilmankosteus: ${weatherData.main.humidity} %`;

  document.querySelector('#weather').classList.remove('light');
  document.querySelector('#weather').classList.remove('sunny');
  document.querySelector('#weather').classList.remove('dark');

  // Lisää icons sään mukaan
  const icon = document.createElement('div');
  const desc = weatherData.weather[0].icon;
  let iconHTML;

  switch (true) {
    case (desc === '01d' || desc === '01n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/01d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('sunny');
      break;
    case (desc === '02d' || desc === '02n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/02d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('light');
      break;
    case (desc === '03d' || desc === '03n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/03d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('light');
      break; 
    case (desc === '04d' || desc === '04n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/04d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('light');
      break; 
    case (desc === '09d' || desc === '09n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/09d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('dark');
      break;   
    case (desc === '10d' || desc === '10n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/10d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('dark');
      break;
    case (desc === '11d' || desc === '11n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/11d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('dark');
      break;
    case (desc === '13d' || desc === '13n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/13d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('light');
      break; 
    case (desc === '50d' || desc === '50n'):
      iconHTML = "<img src='https://openweathermap.org/img/wn/50d@2x.png'></img>";
      document.querySelector('#weather').classList.toggle('dark');
      break; 
  }
  icon.innerHTML = iconHTML;
  
  weatherElement.innerHTML = "";  // Tyhjentää aikaisemman sijainnin säätiedot

  weatherElement.appendChild(cityName);
  weatherElement.appendChild(tempDiv);
  weatherElement.appendChild(feelsLike);
  weatherElement.appendChild(humidityDiv);
  weatherElement.appendChild(icon);
}

// Noutaa annettujen koordinaattien säätiedot ja renderöi ne
async function selectLocation(lat, lon) {
  const weatherData = await fetchWeatherData(lat, lon); // Hakee alueen säätiedot
  console.log("selected:", weatherData.name);
  renderWeatherData(weatherData); // Renderöi säätiedot näkyviin
}

/*
 * 6. Toteuta sivulle paikannus geolocation-APIlla:
 * https://www.w3schools.com/html/html5_geolocation.asp.
 *
 * Huomaa, että nyt puhutaan kahdesta eri rajapinnasta (API), joten täsmennetään vielä:
 *
 * 1. openweathermap.org on erään palveluntarjoajan ylläpitämä
 *    https-yhteyden yli toimiva web-API
 *
 * 2. geolocation-API on selaimen sisäänrakennettu
 *    paikkatietorajapinta
 *
 * Tee sivulle paikannusnappi, joka käynnistää sijainnin määrittämisen
 * ja hakee paikallisen säätiedon näkyville.
 * Voit käyttää paikannusta myös ensimmäisen säätietokutsun tekoon
 * jos tahdot.
 */

// Valitsee paikannuksen klikkaamalla paikanna nappulaa
const locateButton = document.querySelector('#locationButton');
  locateButton.addEventListener("click", () => {
  getLocation();
})

// Sijainnin paikannus
function getLocation() {
  if (navigator.geolocation) {
    // Kirjaa sijainnin koordinaatit ja valitsee sijainnin niiden perusteella
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      selectLocation(lat, lon);
  })
  }
  else {
    alert('Sijainti ei saatavilla'); // Jos sijaintia ei saatavilla
  }
}
