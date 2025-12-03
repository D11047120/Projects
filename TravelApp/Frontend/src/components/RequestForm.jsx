import React, { useState , useEffect} from 'react';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import './RequestForm.css';

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

function RequestForm() {
  const [generatedRequestCode, setGeneratedRequestCode] = useState('');

  // Projects
  const [projects, setProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Country / City
  const [countries, setCountries] = useState([]);
  const [description, setDescription] = useState('');
  const [originCountry, setOriginCountry] = useState(null);
  const [originCity, setOriginCity] = useState('');
  const [destinationCountry, setDestinationCountry] = useState(null);
  const [destinationCity, setDestinationCity] = useState('');
  const [originCityOptions, setOriginCityOptions] = useState([]);
  const [destinationCityOptions, setDestinationCityOptions] = useState([]);

  // Other Request fields
  const [startDate, setStartDate] = useState(null);
  const [isRound, setIsRound] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [needHotel, setNeedHotel] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [currentRequestStatusDisplay, setCurrentRequestStatusDisplay] = useState(null);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(UserRole.Traveler);

  const navigate = useNavigate();

  // ====== Load Projects ======
  useEffect(() => {
    async function loadProjects(){
      const res = await axios.get(`${BASE_URL}/Projects`);
      setProjects(res.data);
      setProjectOptions(res.data.map(p => ({ value: p.id, label: p.name })));
    }
    loadProjects();
  }, []);

  // ====== Load Countries ======
  useEffect(() => {
    async function loadCountries(){
      const res = await axios.get(`${BASE_URL}/location/countries`);
      setCountries(res.data.map(c => ({ value: c, label: c })));
    }
    loadCountries();
  }, []);

  // Load cities when origin-country changes
  useEffect(() => {
    const loadCities = async () => {
      if (!originCountry) return;
      const res = await axios.get(`${BASE_URL}/location/cities?country=${originCountry.value}`);
      setOriginCityOptions(res.data.map(c => ({ value: c, label: c })));
      setOriginCity(null);
    };
    loadCities();
  }, [originCountry]);

  // Load cities when destination-country changes
  useEffect(() => {
    const loadCities = async () => {
      if (!destinationCountry) return;
      const res = await axios.get(`${BASE_URL}/location/cities?country=${destinationCountry.value}`);
      setDestinationCityOptions(res.data.map(c => ({ value: c, label: c })));
      setDestinationCity(null);
    };
    loadCities();
  }, [destinationCountry]);

  const getStatusDisplayName = (statusValue, role) => {
    switch (statusValue) {
      case RequestStatus.Draft: return 'Drafted';
      case RequestStatus.Submitted: return 'Submitted';
      case RequestStatus.WaitingQuotes: return 'Waiting for Quotes';
      default: return 'Unknown Status';
    }
  };
  


  const submitRequest = async (status) => {
  setMessage('');
  setIsError(false);
  setCurrentRequestStatusDisplay(null);
  setIsSubmittedSuccessfully(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // compare only date parts

  // ====== VALIDATION ======

  // Start Date required & future
  if (!startDate) {
    setMessage("Travel Date (Start Date) is required.");
    setIsError(true);
    return;
  }

  const parsedStart = new Date(startDate);
  if (parsedStart < today) {
    setMessage("Travel Date must be today or in the future.");
    setIsError(true);
    return;
  }

  // Round Trip validations
  if (isRound) {
    if (!endDate) {
      setMessage("Return Date is required for round trips.");
      setIsError(true);
      return;
    }

    const parsedEnd = new Date(endDate);
    if (parsedEnd <= parsedStart) {
      setMessage("Return Date must be after Travel Date.");
      setIsError(true);
      return;
    }
  }

  // Hotel validations
  if (needHotel) {
    if (!checkInDate || !checkOutDate) {
      setMessage("Hotel Check-In and Check-Out dates are required.");
      setIsError(true);
      return;
    }

    const parsedCheckIn = new Date(checkInDate);
    const parsedCheckOut = new Date(checkOutDate);

    if (parsedCheckIn < parsedStart) {
      setMessage("Hotel Check-In cannot be before Travel Date.");
      setIsError(true);
      return;
    }

    if (parsedCheckOut <= parsedCheckIn) {
      setMessage("Hotel Check-Out must be after Check-In.");
      setIsError(true);
      return;
    }
  }

  // ====== SUBMIT ======

  try {
    const payload = {
      projectId,
      description,
      originCity: originCity?.value,
      destinationCity: destinationCity?.value,
      startDate: parsedStart.toISOString(),
      isRound,
      ...(isRound && { endDate: new Date(endDate).toISOString() }),
      needHotel,
      ...(needHotel && { checkInDate: new Date(checkInDate).toISOString() }),
      ...(needHotel && { checkOutDate: new Date(checkOutDate).toISOString() }),
      status
    };

    const response = await axios.post(`${BASE_URL}/Requests`, payload);
    if (response.status === 201) {
      const createdRequest = response.data;

      if (createdRequest?.requestCode) {
        setGeneratedRequestCode(createdRequest.requestCode);
      }

      const effective = status;

      setMessage(`Travel request ${getStatusDisplayName(effective, currentUserRole).toLowerCase()} successfully!`);
      setCurrentRequestStatusDisplay(effective);
      setIsSubmittedSuccessfully(status === RequestStatus.Submitted);

      // Reset form
      setProjectId('');
      setSelectedProject(null);
      setDescription('');
      setOriginCountry(null);
      setOriginCity(null);
      setDestinationCountry(null);
      setDestinationCity(null);
      setStartDate(null);
      setIsRound(false);
      setEndDate(null);
      setNeedHotel(false);
      setCheckInDate(null);
      setCheckOutDate(null);
    } else {
      setMessage('Error submitting request (unexpected response).');
      setIsError(true);
    }
  } catch (err) {
    console.error(err);
    setIsError(true);
    setMessage('Validation Error: Make sure all fields are filled.');
  }
};


  const handleBack = () => {
    navigate('/');
    setProjectId('');
    setSelectedProject(null);
  };

  return (
    <div className="request-form-container">
      {currentRequestStatusDisplay !== null && (
        <div className={`request-status-display status-${getStatusDisplayName(currentRequestStatusDisplay, currentUserRole).toLowerCase().replace(/\s/g, '')}`}>
          {getStatusDisplayName(currentRequestStatusDisplay, currentUserRole)}
          {isSubmittedSuccessfully && generatedRequestCode && (
            <p className="generated-request-code">
              <strong> {generatedRequestCode}</strong>
            </p>
          )}
        </div>
      )}

      <h2>New Request</h2>
      <form onSubmit={(e)=>{e.preventDefault();submitRequest(RequestStatus.Submitted);}} className="request-form">

        {/* Project */}
        <div className='form-group'>
          <label>Project</label>
        
        <div className='form-row'>
          <Select
            value={projectOptions.find(x => x.value === projectId) || null}
            onChange={(opt) => {
              setProjectId(opt.value);
              const proj = projects.find(p => p.id === opt.value);
              setSelectedProject(proj);
            }}
            options={projectOptions}
            isSearchable
            placeholder="Select Project..."
          />
        </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <textarea
            rows={4}
            placeholder="Please insert a small description about your trip..."
            value={description || ''}
            onChange={(e) => setDescription( e.target.value )}
          />
          </div>
        </div>
        {/* Origin/Destination */}
        <div className="form-row">
          <div className="form-group">
            <label>Origin Country</label>
            <Select value={originCountry} options={countries} onChange={setOriginCountry} placeholder="Choose country..."/>
          </div>
          <div className="form-group">
            <label>Origin City</label>
            <Select value={originCity} options={originCityOptions} onChange={setOriginCity} placeholder="Choose city..." isDisabled={!originCountry}/>
          </div>
          <div className="form-group">
            <label>Destination Country</label>
            <Select value={destinationCountry} options={countries} onChange={setDestinationCountry} placeholder="Choose country..."/>
          </div>
          <div className="form-group">
            <label>Destination City</label>
            <Select value={destinationCity} options={destinationCityOptions} onChange={setDestinationCity} placeholder="Choose city..." isDisabled={!destinationCountry}/>
          </div>
        </div>

        {/* Round trip? */}
        <div className="toggle-switch-group">
          <label className="toggle-switch-label">Round Trip?</label>
          <label className="switch">
            <input type="checkbox" checked={isRound} onChange={(e) => setIsRound(e.target.checked)} disabled={isSubmittedSuccessfully}/>
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Travel Date</label>
              <DatePicker  value={startDate} onChange={setStartDate} required={true}/>
          </div>
          {isRound && (
            <div className="form-group">
              <label>Return Date</label>
              <DatePicker  value={endDate} onChange={setEndDate} required={isRound}/>
            </div>
          )}
        </div>

        {/* Hotel? */}
        <div className="toggle-switch-group">
          <label className="toggle-switch-label">Need Hotel?</label>
          <label className="switch">
            <input type="checkbox" checked={needHotel} onChange={(e)=>setNeedHotel(e.target.checked)} disabled={isSubmittedSuccessfully}/>
            <span className="slider"></span>
          </label>
        </div>

        {needHotel && (
          <div className="form-row">
            <div className="form-group">
              <label>Check-in Date</label>
              <DatePicker value={checkInDate} onChange={setCheckInDate} required={needHotel}/>
            </div>
            <div className="form-group">
              <label>Check-out Date</label>
              <DatePicker  value={checkOutDate} onChange={setCheckOutDate} required={needHotel}/>
            </div>
          </div>
        )}

        <div className="button-group">
          {/* Save Draft */}
          {!isSubmittedSuccessfully && (
            <button type="button" onClick={()=>submitRequest(RequestStatus.Draft)} className="form-button save-draft-button">Save Draft</button>
          )}
          {/* Submit */}
          {!isSubmittedSuccessfully && (
            <button type="submit" className="form-button submit-request-button">Submit Request</button>
          )}
          <button type="button" onClick={handleBack} className="form-button back-button">Back</button>
        </div>
      </form>

      {message && (
        <p className={`form-message ${isError ? 'error-message' : 'success-message'}`}>{message}</p>
      )}
    </div>
  );
}

export default RequestForm;
