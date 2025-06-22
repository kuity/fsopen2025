const CountryDetails = ({ countryDetails }) => {
  if (countryDetails) {
    return (
      <div>
        <h1>{countryDetails.name.common}</h1>
        Capital: {countryDetails.capital[0]} <br />
        Area: {countryDetails.area} <br />
        <h2>Languages</h2>
        <ul>
          {Object.values(countryDetails.languages).map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
        <img className="countryBox" src={countryDetails.flags.png} />
        <br />
      </div>
    );
  }
};

export default CountryDetails;
