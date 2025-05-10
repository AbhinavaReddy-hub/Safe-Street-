import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Reports from './components/Reports/Reports';
import TeamAnalytics from './components/TeamAnalytics/TeamAnalytics';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<TeamAnalytics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
