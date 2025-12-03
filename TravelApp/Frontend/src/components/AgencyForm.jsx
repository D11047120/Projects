import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AgencyForm.css';

const BASE_URL = 'http://localhost:5211/api';

function AgencyForm() {
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [agencies, setAgencies] = useState([]); // ✅ store agencies list

  const navigate = useNavigate();

  // Fetch all agencies
  const loadAgencies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Agencies`);
      setAgencies(res.data);
    } catch (err) {
      console.error('Error fetching agencies:', err);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const payload = {
        name,
        contactEmail,
        phoneNumber,
      };

      const response = await axios.post(`${BASE_URL}/Agencies`, payload);

      if (response.status === 201) {
        setMessage('Agency created successfully!');
        setIsError(false);
        setName('');
        setContactEmail('');
        setPhoneNumber('');
        loadAgencies(); // ✅ refresh list after creation
      } else {
        setMessage('Error creating agency: Unexpected response.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error creating agency:', error);
      setIsError(true);
      setMessage('Validation Error: All fields must be filled !');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="agency-form-container">
      <h2>Create Agency</h2>
      <form onSubmit={handleSubmit} className="agency-form">
        <div className="form-group">
          <label htmlFor="name">Agency Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Global Travel Agency"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Email</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="e.g., contact@globaltravel.com"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., +1234567890"
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" onClick={handleBack} className="form-button back-button">
            Back
          </button>
          <button type="submit" className="form-button">
            Create Agency
          </button>
        </div>
      </form>

      {message && (
        <p className={`form-message ${isError ? 'error-message' : 'success-message'}`}>
          {message}
        </p>
      )}
      <hr style={{ borderTop: '1px dashed #ccc', margin: '40px 0' }} />
      {/* ✅ Agencies List */}
      <h3 style={{ marginTop: '30px' }}>Agencies</h3>
      {agencies.length > 0 ? (
        <table className="agencies-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr key={agency.id}>
                <td>{agency.name}</td>
                <td>{agency.contactEmail}</td>
                <td>{agency.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No agencies found.</p>
      )}
    </div>
  );
}

export default AgencyForm;