import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './QuotesPage.css';
import { useAuth} from './authProvider';

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


function QuotesPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAgencyId, setSelectedAgencyId] = useState('');

  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [modalType, setModalType] = useState(null); // "flight" or "hotel"
  const [showModal, setShowModal] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [flightForm, setFlightForm] = useState({
  flightNumber: '',
  departureAirport: '',
  arrivalAirport:'',
  departureTime: '',
  arrivalTime: '',
  price: ''
});

const [hotelForm, setHotelForm] = useState({
  hotelName: '',
  checkIn: '',
  checkOut: '',
  pricePerNight: ''
});
const { role } = useAuth();

const [editingItemId, setEditingItemId] = useState(null); // Flight or Hotel ID



  const getStatusDisplayName = (statusValue, role) => {
    if (role === "traveler") {
      if (statusValue === RequestStatus.WaitingQuotes) {
        return 'Submitted';
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
        return 'Waiting for Selection';
      case RequestStatus.WaitingApproval:
        return 'Waiting for Approval';
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestResponse = await axios.get(`${BASE_URL}/Requests/${requestId}`);
        setRequest(requestResponse.data);

        const agenciesResponse = await axios.get(`${BASE_URL}/Agencies`);
        console.log("Agencies API Response Data:", agenciesResponse.data); 
        
        if (agenciesResponse.data && typeof agenciesResponse.data === 'object' && '$values' in agenciesResponse.data) {
          if (Array.isArray(agenciesResponse.data.$values)) {
            setAgencies(agenciesResponse.data.$values);
          } else {
            console.error("Agencies API $values property is not an array:", agenciesResponse.data.$values);
            setError("Failed to load agencies: Unexpected data format.");
          }
        } else if (Array.isArray(agenciesResponse.data)) {
          setAgencies(agenciesResponse.data);
        } else {
          console.error("Agencies API did not return an array or expected object format:", agenciesResponse.data);
          setError("Failed to load agencies: Unexpected data format.");
        }

        const quotesResponse = await axios.get(`${BASE_URL}/Quotes/ByRequest/${requestId}`);
        console.log("Quotes API Response Data:", quotesResponse.data); 
        
        if (quotesResponse.data && typeof quotesResponse.data === 'object' && '$values' in quotesResponse.data) {
          if (Array.isArray(quotesResponse.data.$values)) {
            setQuotes(quotesResponse.data.$values);
          } else {
            console.error("Quotes API $values property is not an array:", quotesResponse.data.$values);
            setError("Failed to load quotes: Unexpected data format in $values.");
          }
        } else if (Array.isArray(quotesResponse.data)) {
          setQuotes(quotesResponse.data);
        } else {
          console.error("Quotes API did not return an array or expected object format:", quotesResponse.data);
          setError("Failed to load quotes: Unexpected data format.");
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load request or quotes. Please ensure the backend is running, the Request ID (${requestId}) is valid, and check your browser's console for details.`);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  const handleAddQuote = async (e) => {
  e.preventDefault();
  setMessage('');
  setIsError(false);

  if (!selectedAgencyId) {
    setMessage('Please select an agency to add a quote.');
    setIsError(true);
    return;
  }

  try {
    const payload = {
      requestId: parseInt(requestId),
      agencyId: parseInt(selectedAgencyId)
    };

    const response = await axios.post(`${BASE_URL}/Quotes`, payload);

    if (response.status === 201) {
      setMessage('Quote added successfully!');
      setIsError(false);

      let newQuote = response.data;

      // Ensure nested structure exists if missing (helps avoid errors when rendering)
      if (!newQuote.flights) newQuote.flights = [];
      if (!newQuote.hotels) newQuote.hotels = [];

      // Add agency name to quote
      newQuote.agency = agencies.find(a => a.id === newQuote.agencyId);

      setQuotes(prevQuotes => [...prevQuotes, newQuote]);
      setSelectedAgencyId('');
    } else {
      setMessage('Unexpected response from the server.');
      setIsError(true);
    }
  } catch (err) {
    console.error('Error adding quote:', err);
    setIsError(true);

    if (err.response?.data) {
      const errorMessages = Object.values(err.response.data)
        .flat()
        .filter(msg => typeof msg === 'string')
        .join('; ');
      setMessage(`Validation Error: ${errorMessages}`);
    } else if (err.request) {
      setMessage('No response from the backend. Please check your connection or backend status.');
    } else {
      setMessage('An unexpected error occurred while setting up the request.');
    }
  }
};

  const openEditModal = (type, quoteId, item) => {
    setModalType(type);
    setActiveQuoteId(quoteId);
    setEditingItemId(item.id);
    setShowModal(true);

    if (type === 'flight') {
      setFlightForm({
        flightNumber: item.flightNumber,
        departureAirport: item.departureAirport,
        arrivalAirport: item.arrivalAirport,
        departureTime: item.departureTime.slice(0, 16), // format for input
        arrivalTime: item.arrivalTime.slice(0, 16),
        price: item.price
      });
    } else {
      setHotelForm({
        hotelName: item.hotelName,
        checkIn:item.checkIn,
        checkOut:item.checkOut,
        pricePerNight: item.pricePerNight
      });
    }
  };


  const handleFinishQuoting = async () => {
    setMessage('');
    setIsError(false);
    
    if (quotes.length === 0) {
      setMessage('Please add at least one quote before finishing the quoting process.');
      setIsError(true);
      return;
    }

    try {
      const updatePayload = {
        id: parseInt(requestId),
        status: RequestStatus.WaitingSelection
      };
      console.log("PUT payload:", updatePayload);

      
      await axios.put(`${BASE_URL}/Requests/${requestId}`, updatePayload);

      setMessage('Quoting process finished. Request status updated to Waiting for Traveler Selection!');
      setIsError(false);
      navigate(`/facilitator/requests`); 
    } catch (err) {
      console.error('Error finishing quoting process:', err);
      setIsError(true);
      setMessage('Failed to finish quoting process. Please try again.');
    }
  };
  const handleFlightChange = (e) => {
  setFlightForm({ ...flightForm, [e.target.name]: e.target.value });
  };

const handleHotelChange = (e) => {
  setHotelForm({ ...hotelForm, [e.target.name]: e.target.value });
};
const handleSaveSubitem = async (e) => {
  e.preventDefault();
  try {
    if (!activeQuoteId || !modalType) return;

    if (modalType === 'flight') {
      const payload = {
        flightNumber: flightForm.flightNumber,
        departureAirport: flightForm.departureAirport,
        arrivalAirport: flightForm.arrivalAirport,
        departureTime: flightForm.departureTime,  
        arrivalTime: flightForm.arrivalTime,
        price: parseFloat(flightForm.price),
        quoteId: activeQuoteId
      };

      const res = await axios.post(`${BASE_URL}/QuoteFlights`, payload);

      setQuotes(prev =>
        prev.map(q =>
          q.id === activeQuoteId
            ? { ...q, flights: [...(q.flights || []), res.data] }
            : q
        )
      );
    } else if (modalType === 'hotel') {
      const payload = {
        hotelName: hotelForm.hotelName,
        checkIn: hotelForm.checkIn,
        checkOut: hotelForm.checkOut,
        pricePerNight: parseFloat(hotelForm.pricePerNight),
        quoteId: activeQuoteId
      };


      const res = await axios.post(`${BASE_URL}/QuoteHotels`, payload);
      const checkInDate = new Date(res.data.checkIn);
      const checkOutDate = new Date(res.data.checkOut);
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const enrichedHotel = {
        ...res.data,
        nights, 
      };
      setQuotes(prev =>
        prev.map(q =>
          q.id === activeQuoteId
            ? { ...q, hotels: [...(q.hotels || []), enrichedHotel] }
            : q
        )
      );
    }

    // Close modal & reset
    setShowModal(false);
    setModalType(null);
    setActiveQuoteId(null);
    setEditingItemId(null);
    setFlightForm({flightNumber: '', departureAirport: '', arrivalAirport: '', departureTime: '', arrivalTime: '', price: '' });
    setHotelForm({ hotelName: '', checkIn: '', checkOut: '', pricePerNight: '' });

  } catch (error) {
    console.error('Error saving subitem:', error);
    alert('Failed to save item. Check console for details.');
  }
};

  const handleDeleteSubitem = async (type, itemId, quoteId) => {
  const confirm = window.confirm('Are you sure you want to delete this item?');
  if (!confirm) return;

  try {
    if (type === 'flight') {
      await axios.delete(`${BASE_URL}/QuoteFlights/${itemId}`);
      setQuotes(prev =>
        prev.map(q =>
          q.id === quoteId ? { ...q, flights: q.flights.filter(f => f.id !== itemId) } : q
        )
      );
    } else {
      await axios.delete(`${BASE_URL}/QuoteHotels/${itemId}`);
      setQuotes(prev =>
        prev.map(q =>
          q.id === quoteId ? { ...q, hotels: q.hotels.filter(h => h.id !== itemId) } : q
        )
      );
    }
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete item.');
  }
};

const calculateQuoteTotal = (quote) => {
  const flightTotal = (quote.flights || []).reduce((sum, f) => sum + f.price, 0);

  const hotelTotal = (quote.hotels || []).reduce((sum, h) => {
    const nights = Math.max(1, Math.ceil((new Date(h.checkOut) - new Date(h.checkIn)) / (1000 * 60 * 60 * 24)));
    return sum + nights * h.pricePerNight;
  }, 0);

  return flightTotal + hotelTotal;
};



  const handleBack = () => {
    navigate('/facilitator/requests');
  };

  if (loading) {
    return <div className="facilitator-page-container">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="facilitator-page-container">
        <h2 style={{color: 'red', textAlign: 'center'}}>Error Loading Page</h2>
        <p style={{textAlign: 'center', color: '#666'}}>{error}</p>
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <button onClick={handleBack} className="form-button back-button">Back</button>
        </div>
      </div>
    );
  }

  if (!request) {
    return <div className="facilitator-page-container error-message">Request not found.</div>;
  }

  const canAddQuotes = request.status === RequestStatus.WaitingQuotes;
  const isQuotingFinished = request.status === RequestStatus.WaitingSelection || 
                            request.status === RequestStatus.Approved || 
                            request.status === RequestStatus.Rejected || 
                            request.status === RequestStatus.Canceled;

  console.log("Quotes state before rendering:", quotes, "Is Array:", Array.isArray(quotes));

  return (
    <div className="facilitator-page-container">
      
      <h2>Request Quotes (Facilitator)</h2>
      <div className={`request-status-display status-${getStatusDisplayName(request.status, role).toLowerCase().replace(/\s/g, '')}`}>
        {getStatusDisplayName(request.status, role)}
      </div>

      <h3 className="section-title">Request {request.requestCode}</h3>
      <div className="form-section">
        <div className="form-group">
            <label>Project</label>
            <input type="text" value={request?.projectName} readOnly className="form-input" />
          </div>
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={request.description} readOnly className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Origin City</label>
            <input type="text" value={request.originCity} readOnly className="form-input" />
          </div>
          <div className="form-group">
            <label>Destination City</label>
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
            <label>Start Date</label>
            <input type="date" value={request.startDate.split('T')[0]} readOnly className="form-input" />
          </div>
          {request.isRound && (
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={request.endDate ? request.endDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
          )}
        </div>

        <div className="toggle-switch-group">
          <label>Need Hotel ?</label>
          <label className="switch">
            <input type="checkbox" checked={request.needHotel} disabled />
            <span className="slider"></span>
          </label>
        </div>

        {request.needHotel && (
          <div className="form-row">
            <div className="form-group">
              <label>Hotel Check-in</label>
              <input type="date" value={request.checkInDate ? request.checkInDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
            <div className="form-group">
              <label>Hotel Check-out</label>
              <input type="date" value={request.checkOutDate ? request.checkOutDate.split('T')[0] : ''} readOnly className="form-input" />
            </div>
          </div>
        )}
      </div>
      {(role === 'facilitator' || role === 'manager' )&& (
      <>
      <hr style={{ borderTop: '1px dashed #ccc', margin: '40px 0' }} />
      <h3 className="section-title">Add New Quote</h3>
      {!canAddQuotes && (
        <p className="form-message error-message" style={{textAlign: 'center'}}>
          Quotes can only be added when the request status is "Waiting for Quotes". Current status: {getStatusDisplayName(request.status, role)}.
        </p>  
      )}
      <form onSubmit={handleAddQuote} className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="agencySelect"> </label>
            <select
              id="agencySelect"
              value={selectedAgencyId}
              onChange={(e) => setSelectedAgencyId(e.target.value)}
              required
              className="form-select"
              disabled={!canAddQuotes}
            >
              <option value="">Select an Agency</option>
              {Array.isArray(agencies) && agencies.map(agency => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ alignSelf: 'flex-end', marginLeft: '20px' }}>
            <button type="submit" className="form-button add-quote-button" disabled={!canAddQuotes}>
              Add Quote
            </button>
          </div>
        </div>
      </form>

      {message && (
        <p className={`form-message ${isError ? 'error-message' : 'success-message'}`}>
          {message}
        </p>
      )}

      <h3 className="section-title">Available Quotes ({quotes.length})</h3>
      <div className="quotes-list-window">
        {Array.isArray(quotes) && quotes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No quotes added yet for this request.</p>
        ) : (
          Array.isArray(quotes) && quotes.map(quote => (
            <div key={quote.id} className="quote-item">
              <div className="quote-header">
                <span>{quote.agency?.name || 'N/A'}</span>
                <span className="cost">Total: ${calculateQuoteTotal(quote).toFixed(2)}</span>
              </div>
              <div className="quote-details-section">
              <div className="quote-subheader">
                <h4>Flights</h4>
                <button
                  className="add-subitem-button"
                  title="Add Flight"
                  onClick={() => {
                    setActiveQuoteId(quote.id);
                    setModalType('flight');
                    setShowModal(true);
                  }}
                >+</button>
              </div>
              <table className="subtable">
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
                  {quote.flights && quote.flights.length > 0 ? (
                    quote.flights.map((flight, idx) => (
                      <tr key={idx}>
                        <td>{flight.flightNumber}</td>
                        <td>{flight.departureAirport}</td>
                        <td>{flight.arrivalAirport}</td>
                        <td>{new Date(flight.departureTime).toLocaleString()}</td>
                        <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
                        <td>${flight.price.toFixed(2)}</td>
                        <td>
                          <button className="btn-small btn-edit" onClick={() => openEditModal('flight', quote.id, flight)}>✏️</button>
                        </td>
                        <td>
                          <button className="btn-small btn-delete" onClick={() => handleDeleteSubitem('flight', flight.id, quote.id)}>🗑</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="empty-cell">No flight details.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {request.needHotel && (
            <div className="quote-details-section">
              <div className="quote-subheader">
                <h4>Hotels</h4>
                <button
                  className="add-subitem-button"
                  title="Add Hotel"
                  onClick={() => {
                    setActiveQuoteId(quote.id);
                    setModalType('hotel');
                    setShowModal(true);
                  }}
                >+</button>
              </div>
              <table className="subtable">
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>CheckIn </th>
                    <th>CheckOut </th>
                    <th>Nights</th>
                    <th>PriceNight</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.hotels && quote.hotels.length > 0 ? (
                    quote.hotels.map((hotel, idx) => (
                      <tr key={idx}>
                        <td>{hotel.hotelName}</td>
                        <td>{new Date(hotel.checkIn).toLocaleDateString()}</td>
                        <td>{new Date(hotel.checkOut).toLocaleDateString()}</td>
                        <td>{hotel.nights}</td>
                        <td>${hotel.pricePerNight.toFixed(2)}</td>
                        <td>
                          <button class="btn-small btn-edit" onClick={() => openEditModal('hotel', quote.id, hotel)}>✏️</button>
                        </td>
                        <td>
                          <button class="btn-small btn-delete" onClick={() => handleDeleteSubitem('hotel', hotel.id, quote.id)}>🗑</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="empty-cell">No hotel details.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
            </div>
          ))
        )}
      </div>
      {showModal && (
  <div className="modal-backdrop">
    <div className="modal">
      <h3>Add {modalType === 'flight' ? 'Flight' : 'Hotel'} to Quote </h3>

      <form onSubmit={handleSaveSubitem}>
            {modalType === 'flight' ? (
              <>
                <label>Flight Number</label>
                <input name="flightNumber" value={flightForm.flightNumber} placeholder='eg. FN01' onChange={handleFlightChange} required />
                
                <label>Departure Airport</label>
                <input name="departureAirport" value={flightForm.departureAirport} placeholder='eg. Humberto Delgado Airport' onChange={handleFlightChange} required />

                <label>Arrival Airport</label>
                <input name="arrivalAirport" value={flightForm.arrivalAirport} placeholder='eg. Francisco Sa Carneiro Airport' onChange={handleFlightChange} required />

                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={flightForm.departureTime || ''}
                  onChange={handleFlightChange}
                  className="form-input"
                  required
                />
                <label>Arrival Time</label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={flightForm.arrivalTime || ''}
                  onChange={handleFlightChange}
                  className="form-input"
                  required
                />

                <label>Price</label>
                <input type="number" name="price" value={flightForm.price} placeholder='eg. 100' onChange={handleFlightChange} step="0.01" required />
              </>
            ) : (
              <>
                <label>Hotel Name</label>
                <input name="hotelName" value={hotelForm.hotelName} onChange={handleHotelChange} required />

                <label>Check-In</label>
                <input
                  type="datetime-local"
                  name="checkIn"
                  value={hotelForm.checkIn || ''}
                  onChange={handleHotelChange}
                  className="form-input"
                  required
                />
                <label>Check-Out</label>
                <input
                  type="datetime-local"
                  name="checkOut"
                  value={hotelForm.checkOut || ''}
                  onChange={handleHotelChange}
                  className="form-input"
                  required
                />
                <label>Price per Night</label>
                <input name="pricePerNight" type="number" step="0.01" value={hotelForm.pricePerNight} onChange={handleHotelChange} required />
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="form-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="form-button primary">Save</button>
            </div>
          </form>
    </div>
  </div>
)}


      <div className="button-group">
        <button
          type="button"
          onClick={handleFinishQuoting}
          className="form-button finish-quoting-button"
          disabled={!canAddQuotes || quotes.length === 0}
        >
          Finish Quoting
        </button>
        <button type="button" onClick={handleBack} className="form-button back-button">
          Back
        </button>
        </div>
        </>
        )}
    </div>
  );
}

export default QuotesPage;
