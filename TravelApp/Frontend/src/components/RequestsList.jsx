import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authProvider'; // ✅ get logged-in role
import './RequestsList.css'; 

const BASE_URL = 'http://localhost:5211/api';

const RequestStatus = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  WaitingQuotes: 'WaitingQuotes',
  WaitingSelection: 'WaitingSelection',
  WaitingApproval: 'WaitingApproval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Canceled: 'Canceled'
};

function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const { role } = useAuth(); // ✅ dynamically get role from auth

  const getStatusDisplayName = (statusValue) => {
    switch (statusValue) {
      case RequestStatus.Draft: return 'Drafted';
      case RequestStatus.Submitted: return 'Submitted';
      case RequestStatus.WaitingQuotes: return 'Waiting for Quotes';
      case RequestStatus.WaitingSelection: return 'Waiting for Selection';
      case RequestStatus.WaitingApproval: return 'Waiting for Approval';
      case RequestStatus.Approved: return 'Approved';
      case RequestStatus.Rejected: return 'Rejected';
      case RequestStatus.Canceled: return 'Cancelled';
      default: return 'Unknown Status';
    }
  };

  useEffect(() => {
    const fetchAllRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/Requests`);
        let requestsData = response.data.$values || response.data;
        requestsData = requestsData.filter(r => r && r.id != null);
        setRequests(requestsData);
      } catch (err) {
        console.error("Error fetching all requests:", err);
        setError("Failed to load all travel requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllRequests();
  }, []);

  // ✅ Navigate based on user role
  const handleViewDetails = (id) => {
    if (role === 'facilitator') {
      navigate(`/facilitator/requests/${id}`);
    } else if (role === 'traveler') {
      navigate(`/traveler/requests/${id}`);
    } else if (role === 'manager') {
      navigate(`/manager/requests/${id}`);
    } else {
      console.warn('Unknown role:', role);
    }
  };

  // Filtering
  let displayedRequests = [...requests];
  if (statusFilter !== "all") {
    displayedRequests = displayedRequests.filter(r => r.status === statusFilter);
  }

  // Sorting
  if (sortOption === "recent") {
    displayedRequests.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } else if (sortOption === "status") {
    displayedRequests.sort((a, b) => a.status.localeCompare(b.status));
  } else if (sortOption === "idAsc") {
    displayedRequests.sort((a, b) => a.id - b.id);
  }

  if (loading) return <div>Loading all requests...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="all-requests-list-container">
      <h2>Requests</h2>

      <div className="filter-sort-bar">
        <div>
          <label>Sort by: </label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="status">Status</option>
            <option value="idAsc">Creation</option>
          </select>
        </div>
        <div>
          <label>Filter by Status: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            {Object.values(RequestStatus).map(status => (
              <option key={status} value={status}>
                {getStatusDisplayName(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {displayedRequests.length === 0 ? (
        <p>No travel requests found.</p>
      ) : (
        displayedRequests.map(request => (
          <div key={request.id} className="request-card">
            <h3>
              Request {request.requestCode}
              <span className={`status-badge status-${getStatusDisplayName(request.status).toLowerCase().replace(/\s/g, '')}`}>
                {getStatusDisplayName(request.status)}
              </span>
            </h3>
            <p><strong>Project:</strong> {request.project?.name || 'N/A'}</p>
            <p><strong>Description:</strong> {request.description || 'N/A'}</p>
            <p><strong>Origin:</strong> {request.originCity || 'N/A'}</p>
            <p><strong>Destination:</strong> {request.destinationCity || 'N/A'}</p>
            <p><strong>Start Date:</strong> {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'Invalid Date'}</p>
            {request.isRound && request.endDate && (
              <p><strong>End Date:</strong> {new Date(request.endDate).toLocaleDateString()}</p>
            )}
            <button onClick={() => handleViewDetails(request.id)} className="view-details-button">
              View Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default RequestsList;