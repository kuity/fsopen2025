import axios from "axios";

const api_key = import.meta.env.VITE_SOME_KEY;
const baseUrl = "https://api.openweathermap.org/data/2.5/weather?";

const getCountryWeather = (lat, lon) => {
  return axios.get(
    `${baseUrl}lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
  );
};

export default { getCountryWeather };
