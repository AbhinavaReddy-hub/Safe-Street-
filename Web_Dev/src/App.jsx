import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import AnalyzedReports from './components/AnalyzedReports/AnalyzedReports';
import AssignedReports from './components/AssignedReports/AssignedReports';
import CompletedReports from './components/CompletedReports/CompletedReports';
import TeamAnalytics from './components/TeamAnalytics/TeamAnalytics';
import { CollapsedProvider } from './context/collapse';
import Insights from './components/Insights/Insights';
import SignupPage from './auth/SignUp';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './auth/Login';
import { useEffect } from 'react';

function App() {
 useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
     let cur =  window.location.href.split('/').pop();
     if(cur==='login' || cur==='signup'){
      window.location.href = '/';
     }
    }
  }, []);
  return (
    <CollapsedProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path='/login' element ={<LoginPage/>}/>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyzedreports"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyzedReports/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignedreports"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssignedReports/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/completedreports"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompletedReports/>
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Layout>
                  <Insights />
                </Layout>
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </BrowserRouter>
    </CollapsedProvider>
  );
}

export default App;
