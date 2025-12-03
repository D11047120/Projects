import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import RequestForm from './components/RequestForm';
import QuotesPage from './components/QuotesPage';
import AgencyForm from './components/AgencyForm';
import RequestsDetails from './components/RequestsDetails';
import RequestsList from './components/RequestsList';
import ManagerApprovalPage from './components/ManagerApprovalPage';
import ManagerProjects from './components/ManagerProjects';
import FacilitatorPage from './components/FacilitatorRequests';
import ManagerPage from './components/ManagerPage';
import Login from './components/Login';
import ProtectedRoute from "./components/ProtectedRoute";




function App() {
  return (
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Welcome to TravelUp!</h1>
              </div>
            } />
            <Route path='/facilitator/requests' element={<ProtectedRoute allowedRoles={['facilitator']}><FacilitatorPage/></ProtectedRoute>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path="/manager/requests" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPage /></ProtectedRoute>} />
            <Route path="/manager/requests/:requestId" element={<ProtectedRoute allowedRoles={['manager']}><ManagerApprovalPage /></ProtectedRoute>} />
            <Route path="/facilitator/agencies" element={<ProtectedRoute allowedRoles={['facilitator']}><AgencyForm /></ProtectedRoute>} />
            <Route path="/traveler/new-request" element={<ProtectedRoute allowedRoles={['traveler']}><RequestForm /></ProtectedRoute>} />
            <Route path="/requests" element={<RequestsList />} />
            <Route path="/facilitator/requests/:requestId" element={<QuotesPage />} />
            <Route path="/traveler/requests/:requestId" element={<RequestsDetails />} />
            <Route path="/manager/projects" element={<ProtectedRoute allowedRoles={['manager']}><ManagerProjects /></ProtectedRoute>} />

            
          </Routes>
        </main>
        
      </div>
  );
}

export default App;
