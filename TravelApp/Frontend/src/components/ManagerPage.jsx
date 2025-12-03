import { useEffect, useState } from 'react';
import axios from 'axios';
import './ManagerPage.css';

const BASE_URL = 'http://localhost:5211/api';

function ManagerPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/Requests/manager-view`)
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load requests.");
        setLoading(false);
      });
  }, []);

  const handleDecision = (id, approve, requestCode) => {
    const action = approve ? 'approve' : 'reject';
    const confirmMessage = `Are you sure you want to ${action.toUpperCase()} request ${requestCode}?`;

    if (!window.confirm(confirmMessage)) {
      return; // Cancelled
    }

    const newStatus = approve ? 'Approved' : 'Rejected';

    axios.put(`${BASE_URL}/Requests/${id}`, {
      id,
      status: newStatus
    })
    .then(() => {
      setRequests(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
    })
    .catch(() => {
      alert("Error updating request status.");
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="manager-page-container">
      <h2 className="page-title">Requests Awaiting Manager Decision</h2>
      <table className="manager-table">
        <thead>
          <tr>
            <th>Request Code</th>
            <th>Traveler</th>
            <th>Project</th>
            <th>Budget</th>
            <th>Quote Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => {
            const quoteTotal = req.selectedQuote
              ? [...(req.selectedQuote.flights || []), ...(req.selectedQuote.hotels || [])]
                  .reduce((sum, item) => {
                    if ('price' in item) return sum + item.price;
                    if ('pricePerNight' in item) {
                      const nights = item.checkIn && item.checkOut
                        ? Math.max(1, (new Date(item.checkOut) - new Date(item.checkIn)) / (1000 * 60 * 60 * 24))
                        : 1;
                      return sum + item.pricePerNight * nights;
                    }
                    return sum;
                  }, 0)
              : 0;

            return (
              <tr key={req.id}>
                <td>{req.requestCode}</td>
                <td>{req.traveler?.firstName} {req.traveler?.lastName}</td>
                <td>{req.project?.name}</td>
                <td>${req.project?.budget?.toFixed(2) || '0.00'}</td>
                <td>${quoteTotal.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === 'WaitingApproval' ? (
                    <div className="action-buttons">
                      <button
                        className="approve-button"
                        onClick={() => handleDecision(req.id, true, req.requestCode)}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleDecision(req.id, false, req.requestCode)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <em>No actions available</em>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerPage;