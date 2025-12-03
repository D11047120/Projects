import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ManagerApprovalPage.css'; 

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

function ManagerApprovalPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const currentUserRole = UserRole.Manager; // Set current role for display logic

  const getStatusDisplayName = (statusValue, role) => {
    // This function now primarily handles the *display* logic based on role
    // and the actual backend status.
    if (role === UserRole.Traveler) {
      if (statusValue === RequestStatus.WaitingQuotes) {
        return 'Submitted'; // Traveler sees "Submitted" when backend is WaitingQuotes
      }
    }

    switch (statusValue) {
      case RequestStatus.Draft:
        return 'Drafted';
      case RequestStatus.Submitted:
        return 'Submitted';
      case RequestStatus.WaitingQuotes:
        return 'Waiting for Quotes';
      case RequestStatus.WaitingSelection:
        return 'Waiting for Traveler Selection';
      case RequestStatus.WaitingApproval:
        return 'Waiting for Manager Approval';
      case RequestStatus.Approved:
        return 'Approved';
      case RequestStatus.Rejected:
        return 'Rejected';
      case RequestStatus.Canceled:
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Requests/${requestId}`);
      console.log("Manager Approval Page Raw API Response:", response.data);

      let requestData = response.data;
      if (requestData && typeof requestData === 'object' && '$id' in requestData && '$values' in requestData) {
        requestData = requestData.$values[0]; 
      }

      // Ensure quotes and selectedQuote are correctly unwrapped if they have $values
      if (requestData && requestData.quotes && typeof requestData.quotes === 'object' && '$values' in requestData.quotes) {
        requestData.quotes = requestData.quotes.$values;
      } else if (requestData && !Array.isArray(requestData.quotes)) {
        requestData.quotes = []; 
      }

      // Ensure selectedQuote is not wrapped if it's a single object
      if (requestData && requestData.selectedQuote && typeof requestData.selectedQuote === 'object' && '$id' in requestData.selectedQuote && '$values' in requestData.selectedQuote) {
        requestData.selectedQuote = requestData.selectedQuote.$values[0];
      }


      setRequest(requestData);
      console.log("Manager Approval Page Processed State Data:", requestData);
   
    } catch (err) {
      console.error("Error fetching request details:", err);
      setError(`Failed to load request details. Please ensure the backend is running, the Request ID (${requestId}) is valid, and check your browser's console for details.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const handleStatusUpdate = async (newStatus) => {
    setMessage('');
    setIsError(false);

    try {
      const payload = {
        id: parseInt(requestId),
        status: newStatus,
        // No need to send selectedQuoteId here, as it's already set by the traveler
      };

      const response = await axios.put(`${BASE_URL}/Requests/${requestId}`, payload);

      if (response.status === 204) {
        let successMessage = '';
        if (newStatus === RequestStatus.Approved) {
          successMessage = 'Request successfully approved!';
        } else if (newStatus === RequestStatus.Rejected) {
          successMessage = 'Request successfully rejected!';
        }
        setMessage(successMessage);
        setIsError(false);
        fetchRequestDetails(); // Re-fetch to update the status display
      } else {
        setMessage('Error updating request status: Unexpected response.');
        setIsError(true);
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      setIsError(true);
      if (err.response) {
        const errorMessages = Object.values(err.response.data)
                                  .flat()
                                  .filter(msg => typeof msg === 'string')
                                  .join('; ');
        setMessage(`Validation Error: ${errorMessages || 'Please check your input.'}`);
      } else if (err.request) {
        setMessage('No response from backend when updating status. Check backend.');
      } else {
        setMessage('Error setting up status update request.');
      }
    }
  };
  const calculateQuoteTotal = (quote) => {
    const flightTotal = (quote.flights || []).reduce(
      (sum, f) => sum + f.price, 0
    );
    const hotelTotal = (quote.hotels || []).reduce((sum, h) => {
      const nights = Math.max(
        1,
        Math.ceil((new Date(h.checkOut) - new Date(h.checkIn)) / (1000 * 60 * 60 * 24))
      );
      return sum + nights * h.pricePerNight;
    }, 0);
    return flightTotal + hotelTotal;
  };

  const handleBack = () => {
    navigate('/manager/requests'); // Navigate back to the All Requests list
  };

  if (loading) {
    return <div className="manager-page-container">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="manager-page-container">
        <h2 style={{color: 'red', textAlign: 'center'}}>Error Loading Page</h2>
        <p style={{textAlign: 'center', color: '#666'}}>{error}</p>
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <button onClick={handleBack} className="form-button back-button">Go Back</button>
        </div>
      </div>
    );
  }

  if (!request) {
    return <div className="manager-page-container error-message">Request not found.</div>;
  }

  // Determine if manager can approve/reject
  const canApproveOrReject = request.status === RequestStatus.WaitingApproval;

  return (
  <div>
    <div className={`request-status-display status-${getStatusDisplayName(request.status, currentUserRole).toLowerCase().replace(/\s/g, '')}`}>
        {getStatusDisplayName(request.status, currentUserRole)}
      </div>  
    <div className="manager-page-container">
      <h2>Manage Request (Manager)</h2>
      <h3 className="section-title"> Request Details {request.requestCode} </h3>
      <div className="form-section">
        <div className="form-group">
            <label>Project</label>
            <input type="text" value={request.project?.name} readOnly className="form-input" />
          </div>
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={request.description} readOnly className="form-input" />
          </div>
        </div>
        <div className="form-row">     
          <div className="form-group">
            <label>Origin City </label>
            <input type="text" value={request.originCity} readOnly className="form-input" />
          </div>
          <div className="form-group">
            <label>Destination City </label>
            <input type="text" value={request.destinationCity} readOnly className="form-input" />
          </div>
        </div>
        <div className="toggle-switch-group">
          <label>Round Trip?</label>
          <label className="switch">
            <input type="checkbox" checked={request.isRound} disabled />
            <span className="slider"></span>
          </label>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date </label>
            <input type="date" value={request.startDate.split('T')[0]} readOnly className="form-input" />
          </div>
          {request.isRound && (
            <div className="form-group">
              <label>End Date </label>
              <input type="date" value={request.endDate ? request.endDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
          )}
        </div>

        <div className="toggle-switch-group">
          <label>Need Hotel </label>
          <label className="switch">
            <input type="checkbox" checked={request.needHotel} disabled />
            <span className="slider"></span>
          </label>
        </div>

        {request.needHotel && (
          <div className="form-row">
            <div className="form-group">
              <label>Hotel Check-in Date </label>
              <input type="date" value={request.checkInDate ? request.checkInDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
            <div className="form-group">
              <label>Hotel Check-out Date </label>
              <input type="date" value={request.checkOutDate ? request.checkOutDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
          </div>
        )}
      </div>

      <hr style={{ borderTop: '1px dashed #ccc', margin: '40px 0' }} />

     <h3 className="section-title">Selected Quote Details</h3>
      {(() => {
        // Fall back to find quote from quotes[] if selectedQuote is null
        const selected =
          request.selectedQuote ||
          request.quotes?.find((q) => q.id === request.selectedQuoteId);

        return selected ? (
          <div className="quote-item">
            <div className="quote-header">
              <span>{selected.agency?.name || 'N/A'}</span>
              <span className="cost">
                Cost: ${calculateQuoteTotal(selected).toFixed(2)}
              </span>
            </div>

            {/* Flights Section */}
            <div className="quote-details-section">
              <h4>Flights</h4>
              {selected.flights?.length ? (
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
                    {selected.flights.map((flight) => (
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
                <p>No flight details available.</p>
              )}
            </div>

            {/* Hotels Section */}
            <div className="quote-details-section">
              <h4>Hotels</h4>
              {selected.hotels?.length ? (
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
                    {selected.hotels.map((hotel) => {
                      const checkIn = new Date(hotel.checkIn);
                      const checkOut = new Date(hotel.checkOut);
                      const nights = Math.max(
                        1,
                        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                      );
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
                <p>No hotel details available.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              {request.status === RequestStatus.WaitingApproval && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(RequestStatus.Approved)}
                    className="form-button approve-button"
                  >
                    Approve Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(RequestStatus.Rejected)}
                    className="form-button reject-button"
                  >
                    Reject Request
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleBack}
                className="form-button back-button"
              >
                Back to All Requests
              </button>
            </div>
          </div>
        ) : (
          <p>No quote has been selected yet.</p>
        );
      })()}
         
    </div>
  </div>
  
  );
}

export default ManagerApprovalPage;
