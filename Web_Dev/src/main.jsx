import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import Home from './components/Home/Home.jsx';
import Reports from './components/Reports/Reports.jsx';
import TeamAnalytics from './components/TeamAnalytics/TeamAnalytics.jsx';
import './index.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
