import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RequestsDetails.css';

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

const UserRole = {
  Traveler: 'Traveler',
  Facilitator: 'Facilitator',
  Manager: 'Manager'
};

function RequestsDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const currentUserRole = UserRole.Traveler;

  const getStatusDisplayName = (statusValue, role) => {
    if (role === UserRole.Traveler && statusValue === RequestStatus.WaitingQuotes) {
      return 'Submitted';
    }
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

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Requests/${requestId}`);
      let requestData = response.data;

      if (requestData?.quotes?.$values) {
        requestData.quotes = requestData.quotes.$values;
      } else if (!Array.isArray(requestData.quotes)) {
        requestData.quotes = [];
      }

      setRequest(requestData);
    } catch (err) {
      console.error("Error fetching request details:", err);
      setError("Failed to load request details.");
    } finally {
      setLoading(false);
    }
  };

  const calculateQuoteTotal = (quote) => {
    const flightTotal = (quote.flights || []).reduce((sum, f) => sum + f.price, 0);
    const hotelTotal = (quote.hotels || []).reduce((sum, h) => {
      const nights = Math.max(
        1,
        Math.ceil((new Date(h.checkOut) - new Date(h.checkIn)) / (1000 * 60 * 60 * 24))
      );
      return sum + nights * h.pricePerNight;
    }, 0);
    return flightTotal + hotelTotal;
  };

  useEffect(() => {
    if (requestId) fetchRequestDetails();
  }, [requestId]);

  const handleSelectQuote = async (quoteId) => {
    setMessage('');
    setIsError(false);
    try {
      const payload = {
        id: parseInt(requestId),
        status: RequestStatus.WaitingApproval,
        selectedQuoteId: quoteId
      };
      const response = await axios.put(`${BASE_URL}/Requests/${requestId}`, payload);
      if (response.status === 204) {
        setMessage('Quote selected successfully! Request sent for manager approval.');
        fetchRequestDetails();
      } else {
        setMessage('Error selecting quote: Unexpected response.');
        setIsError(true);
      }
    } catch (err) {
      console.error('Error selecting quote:', err);
      setIsError(true);
      setMessage('Error selecting quote. Check console.');
    }
  };

  const handleCancelRequest = async () => {
    setMessage('');
    setIsError(false);
    if (!window.confirm("Are you sure you want to cancel this request? This action cannot be undone.")) return;
    try {
      const payload = { id: parseInt(requestId), status: RequestStatus.Canceled };
      const response = await axios.put(`${BASE_URL}/Requests/${requestId}`, payload);
      if (response.status === 204) {
        setMessage('Request successfully canceled!');
        fetchRequestDetails();
      } else {
        setMessage('Error canceling request: Unexpected response.');
        setIsError(true);
      }
    } catch (err) {
      console.error('Error canceling request:', err);
      setIsError(true);
      setMessage('Error canceling request. Check console.');
    }
  };

  const handleBack = () => navigate('/');

  if (loading) return <div className="traveler-page-container">Loading request details...</div>;
  if (error) {
    return (
      <div className="traveler-page-container">
        <h2 style={{ color: 'red', textAlign: 'center' }}>Error Loading Page</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>{error}</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handleBack} className="form-button back-button">Go Back</button>
        </div>
      </div>
    );
  }
  if (!request) return <div className="traveler-page-container error-message">Request not found.</div>;

  const canCancelRequest = ![RequestStatus.Approved, RequestStatus.Rejected, RequestStatus.Canceled, RequestStatus.WaitingApproval].includes(request.status);
  const hasQuotes = Array.isArray(request.quotes) && request.quotes.length > 0;

  let quotesToDisplay = [];
  if (request.selectedQuoteId) {
    const found = request.quotes?.find(q => q.id === request.selectedQuoteId);
    quotesToDisplay = found ? [found] : request.quotes;
  } else if (hasQuotes) {
    quotesToDisplay = request.quotes;
  }

  return (
    <div className="traveler-page-container">
      <h2>Request Details (Traveler)</h2>
      <div className={`request-status-display status-${getStatusDisplayName(request.status, currentUserRole).toLowerCase().replace(/\s/g, '')}`}>
        {getStatusDisplayName(request.status, currentUserRole)}
      </div>

      <h3 className="section-title">Request {request.requestCode}</h3>
      <div className="request-details-section">
        <p><strong>Project: </strong> {request.projectName}</p>
        <p><strong>Description:</strong> {request.description}</p>
        <p><strong>Origin:</strong> {request.originCity}</p>
        <p><strong>Destination:</strong> {request.destinationCity}</p>
        <p><strong>Dates:</strong> {new Date(request.startDate).toLocaleDateString()} {request.isRound ? ` - ${new Date(request.endDate).toLocaleDateString()}` : ''}</p>
        <p><strong>Hotel Needed:</strong> {request.needHotel ? 'Yes' : 'No'}</p>
        {request.needHotel && (
          <p><strong>Hotel Dates:</strong> {new Date(request.checkInDate).toLocaleDateString()} - {new Date(request.checkOutDate).toLocaleDateString()}</p>
        )}
      </div>

      <h3 className="section-title">Available Quotes ({quotesToDisplay.length})</h3>
      <div className="quotes-list-window">
        {quotesToDisplay.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No quotes available yet for this request.</p>
        ) : (
          quotesToDisplay.map((quote) => (
            <div key={quote.id} className="quote-item">
              <div className="quote-header">
                <span>{quote.agency?.name || 'N/A'}</span>
                <span className="cost">Cost: ${calculateQuoteTotal(quote).toFixed(2)}</span>
              </div>

              {/* Flights */}
              <div className="quote-details-section">
                <h4>Flights</h4>
                {quote.flights?.length ? (
                  <table className="quote-table">
                    <thead>
                      <tr>
                        <th>Flight Number</th>
                        <th>Departure Airport</th>
                        <th>Arrival Airport</th>
                        <th>Departure Time</th>
                        <th>Arrival Time</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.flights.map((flight) => (
                        <tr key={flight.id}>
                          <td>{flight.flightNumber}</td>
                          <td>{flight.departureAirport}</td>
                          <td>{flight.arrivalAirport}</td>
                          <td>{new Date(flight.departureTime).toLocaleString()}</td>
                          <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
                          <td>${flight.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="quote-empty">No flight details available.</p>
                )}
              </div>

              {/* Hotels */}
              <div className="quote-details-section">
                <h4>Hotels</h4>
                {quote.hotels?.length ? (
                  <table className="quote-table">
                    <thead>
                      <tr>
                        <th>Hotel Name</th>
                        <th>CheckIn</th>
                        <th>CheckOut</th>
                        <th>Nights</th>
                        <th>Price/Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.hotels.map((hotel) => {
                        const checkIn = new Date(hotel.checkIn);
                        const checkOut = new Date(hotel.checkOut);
                        const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
                        return (
                          <tr key={hotel.id}>
                            <td>{hotel.hotelName}</td>
                            <td>{checkIn.toLocaleDateString()}</td>
                            <td>{checkOut.toLocaleDateString()}</td>
                            <td>{nights}</td>
                            <td>${hotel.pricePerNight.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="quote-empty">No hotel details available.</p>
                )}
              </div>

              {/* Select button disappears after a quote is chosen or request canceled */}
              {!request.selectedQuoteId && request.status !== RequestStatus.Canceled && (
                <button
                  onClick={() => handleSelectQuote(quote.id)}
                  className="select-quote-button"
                >
                  Select This Quote
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {message && (
        <p className={`form-message ${isError ? 'error-message' : 'success-message'}`}>{message}</p>
      )}

      <div className="button-group">
        {canCancelRequest && (
          <button type="button" onClick={handleCancelRequest} className="form-button cancel-button">
            Cancel Request
          </button>
        )}
        <button type="button" onClick={handleBack} className="form-button back-button">
          Back
        </button>
      </div>
    </div>
  );
}

export default RequestsDetails;