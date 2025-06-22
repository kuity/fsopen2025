import { useEffect } from "react";

const CountryList = ({ countries, searchTerm, setDisplayCountry }) => {
  const foundCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  useEffect(() => {
    if (foundCountries.length == 1) {
      setDisplayCountry(foundCountries[0].name.common);
    }
  }, [foundCountries]);

  if (foundCountries.length > 10) {
    return <div>Too many matches, specify another filter</div>;
  } else {
    return (
      <div>
        {foundCountries.map((country) => (
          <div key={country.cca3}>
            {country.name.common}{" "}
            <button onClick={(event) => setDisplayCountry(country.name.common)}>
              Show
            </button>
            <br />
          </div>
        ))}
      </div>
    );
  }
};

export default CountryList;
