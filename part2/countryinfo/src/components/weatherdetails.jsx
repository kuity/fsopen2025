const WeatherDetails = ({ weatherDetails }) => {
  if (weatherDetails) {
    return (
      <div>
        <h2>Weather in {weatherDetails.name}</h2>
        <p>Temperature {weatherDetails.main.temp} Celsius</p>
        <img
          src={`https://openweathermap.org/img/wn/${weatherDetails.weather[0].icon}@2x.png`}
        />
        <p>Wind {weatherDetails.wind.speed} m/s</p>
      </div>
    );
  }
};

export default WeatherDetails;
