import React from 'react';
import HereMap from './components/HereMap';
import './styles/App.css';

const App = () => {
  const apiKey = 'ZwJpQXPIykn1KNiFFc9h6rSS3hXYbdhVHUvRkFfyLeI'; // Replace with your HERE Maps API key

  return (
    <div className="App">
      <h1>Maps</h1>
      <HereMap apiKey={apiKey} />
    </div>
  );
};

export default App;