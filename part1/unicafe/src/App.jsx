import { useState } from "react";

const Button = (props) => {
  return <button onClick={props.handler}>{props.text}</button>;
};

const StatisticsLine = (props) => {
  return (
    <tr>
      <td>{props.text}</td>
      <td>{props.value} </td>
    </tr>
  );
};

const Statistics = (props) => {
  const { good, bad, neutral } = props.clicks;
  const total = good + neutral + bad;
  console.log(total);

  if (total === 0) {
    return (
      <>
        <h1>Statistics</h1>
        <p>No feedback given</p>
      </>
    );
  }

  const positive = (good / total) * 100;
  const average = (good - bad) / total;
  console.log(positive);
  console.log(average);

  return (
    <>
      <h1>Statistics</h1>
      <table>
        <StatisticsLine text="good" value={good} />
        <StatisticsLine text="neutral" value={neutral} />
        <StatisticsLine text="bad" value={bad} />
        <StatisticsLine text="all" value={total} />
        <StatisticsLine text="average" value={average.toFixed(2)} />
        <StatisticsLine text="positive" value={`${positive.toFixed(1)} %`} />
      </table>
    </>
  );
};

const App = () => {
  const [clicks, setClicks] = useState({
    good: 0,
    neutral: 0,
    bad: 0,
  });
  const handleGood = () => {
    setClicks({ ...clicks, good: clicks.good + 1 });
  };
  const handleNeutral = () => {
    setClicks({ ...clicks, neutral: clicks.neutral + 1 });
  };
  const handleBad = () => {
    setClicks({ ...clicks, bad: clicks.bad + 1 });
  };

  return (
    <div>
      <h1>Statistics</h1>
      <Button text="good" handler={handleGood} />
      <Button text="neutral" handler={handleNeutral} />
      <Button text="bad" handler={handleBad} />
      <Statistics clicks={clicks} />
    </div>
  );
};

export default App;
