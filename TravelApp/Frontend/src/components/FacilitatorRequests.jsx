import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacilitatorRequests.css';

const BASE_URL = 'http://localhost:5211/api';

function FacilitatorPage() {
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [ongoingRequests, setOngoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/Requests/facilitator-view`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        setSubmittedRequests(data.submittedRequests);
        setOngoingRequests(data.ongoingRequests);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load requests.");
        setLoading(false);
      });
  }, []);

const handleMoveToWaiting = (id) => {
  fetch(`${BASE_URL}/Requests/${id}/start-quoting`, {
    method: 'PUT'
  })
  .then(res => {
    if (res.ok) {
      const moved = submittedRequests.find(r => r.id === id);
      setSubmittedRequests(prev => prev.filter(r => r.id !== id));
      setOngoingRequests(prev => [...prev, { ...moved, status: 'WaitingForQuotes' }]);
    } else {
      alert("Unable to update request status.");
    }
  })
  .catch(() => {
    alert("Server error occurred.");
  });
};



  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="facilitator-page-container">
      <h2>Manage Travel Requests</h2>
      <div className="form-row">
        {/* Left Table: Submitted */}
        <div style={{ flex: 1 }}>
          <h3 className="section-title">Submitted Requests</h3>
          {submittedRequests.length === 0 ? (
            <p>No submitted requests.</p>
          ) : (
            <table className="subtable">
              <thead>
                <tr>
                  <th>Request Code</th>
                  <th>Traveler</th>
                  <th>Travel Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submittedRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.requestCode}</td>
                    <td>
                    {req.traveler
                      ? `${req.traveler.firstName} ${req.traveler.lastName}`
                      : 'Trish Voyager'}
                  </td>
                    <td>{new Date(req.startDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="form-button"
                        onClick={() => handleMoveToWaiting(req.id)}
                      >
                        Start Quoting
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Table: Ongoing */}
        <div style={{ flex: 1 }}>
          <h3 className="section-title">Ongoing Requests</h3>
          {ongoingRequests.length === 0 ? (
            <p>No ongoing requests.</p>
          ) : (
            <table className="subtable">
              <thead>
                <tr>
                  <th>Request Code</th>
                  <th>Traveler</th>
                  <th>Travel Date</th>
                  <th>Quotes</th>
                </tr>
              </thead>
              <tbody>
                {ongoingRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.requestCode}</td>
                    <td>
                    {req.traveler
                      ? `${req.traveler.firstName} ${req.traveler.lastName}`
                      : 'Trish Voyager'}
                  </td>
                    <td>{new Date(req.startDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="form-button"
                        onClick={() => navigate(`/facilitator/requests/${req.id}`)}
                      >
                        View Quotes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacilitatorPage;
