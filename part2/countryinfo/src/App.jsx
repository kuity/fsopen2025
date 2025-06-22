import { useState, useEffect } from "react";
import countryService from "./services/country";
import weatherService from "./services/weather";
import SearchBar from "./components/searchbar";
import CountryList from "./components/countrylist";
import CountryDetails from "./components/countrydetails";
import WeatherDetails from "./components/weatherdetails";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countries, setCountries] = useState([]);
  const [displayCountry, setDisplayCountry] = useState(null);
  const [countryDetails, setCountryDetails] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);

  useEffect(() => {
    countryService
      .getAll()
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  useEffect(() => {
    if (displayCountry) {
      countryService
        .getCountry(displayCountry)
        .then((response) => {
          setCountryDetails(response.data);
          weatherService
            .getCountryWeather(response.data.latlng[0], response.data.latlng[1])
            .then((resp) => {
              setWeatherDetails(resp.data);
            })
            .catch((error) => {
              console.error("Error fetching weather details:", error);
            });
        })
        .catch((error) => {
          console.error("Error fetching country details:", error);
        });
    } else {
      setCountryDetails(null);
      setWeatherDetails(null);
    }
  }, [displayCountry]);

  return (
    <>
      <SearchBar
        search={searchTerm}
        handler={(event) => setSearchTerm(event.target.value)}
      />
      <CountryList
        countries={countries}
        searchTerm={searchTerm}
        setDisplayCountry={setDisplayCountry}
      />
      <CountryDetails countryDetails={countryDetails} />
      <WeatherDetails weatherDetails={weatherDetails} />
    </>
  );
};

export default App;
