import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Reports from './components/Reports/Reports';
import TeamAnalytics from './components/TeamAnalytics/TeamAnalytics';
import { CollapsedProvider } from './context/collapse';
import Insights from './components/Insights/Insights';


function App() {
  return (
    <CollapsedProvider>
    
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<TeamAnalytics />} />
            <Route path="/insights" element={<Insights/>}/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </CollapsedProvider>
  );
}

export default App;
