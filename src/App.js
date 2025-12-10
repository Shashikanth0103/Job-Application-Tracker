import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [applications, setApplications] = useState([]);
  const [atsScore, setAtsScore] = useState(null);

  const API_URL = 'https://h62d8lusw4.execute-api.ap-south-1.amazonaws.com/prod';

  return (
    <div className="App">
      <header>
        <h1>Job Application Tracker</h1>
        <p>Track applications, upload resumes, and get ATS scores</p>
      </header>

      <div className="tabs">
        <button onClick={() => setActiveTab('add')} className={activeTab === 'add' ? 'active' : ''}>
          Add Application
        </button>
        <button onClick={() => setActiveTab('view')} className={activeTab === 'view' ? 'active' : ''}>
          View Applications
        </button>
        <button onClick={() => setActiveTab('upload')} className={activeTab === 'upload' ? 'active' : ''}>
          Upload Resume
        </button>
        <button onClick={() => setActiveTab('score')} className={activeTab === 'score' ? 'active' : ''}>
          ATS Score
        </button>
      </div>

      <div className="content">
        {activeTab === 'add' && <AddApplication apiUrl={API_URL} />}
        {activeTab === 'view' && <ViewApplications apiUrl={API_URL} applications={applications} setApplications={setApplications} />}
        {activeTab === 'upload' && <UploadResume apiUrl={API_URL} />}
        {activeTab === 'score' && <ATSScore apiUrl={API_URL} atsScore={atsScore} setAtsScore={setAtsScore} />}
      </div>
    </div>
  );
}

function AddApplication({ apiUrl }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!company.trim() || !role.trim()) {
      setMessage('Please fill in Company Name and Job Role');
      return;
    }

    try {
      const applicationID = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const applicationData = {
        userID: 'user001',
        applicationID: applicationID,
        company: company.trim(),
        role: role.trim(),
        status: status,
        dateApplied: applicationDate
      };

      const response = await fetch(`${apiUrl}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        setMessage('Application added successfully! Now upload your resume.');
        setCompany('');
        setRole('');
        setStatus('Applied');
        setApplicationDate(new Date().toISOString().split('T')[0]);
      } else {
        setMessage('Failed to add application');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error adding application');
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Job Application</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input 
          type="text" 
          placeholder="Company Name *" 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          required 
        />
        
        <input 
          type="text" 
          placeholder="Job Role *" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          required 
        />
        
        <div style={{display: 'flex', gap: '10px'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>Status:</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{width: '100%', padding: '8px'}}
            >
              <option value="Applied">Applied</option>
              <option value="Waiting">Waiting</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview">Interview</option>
              <option value="Second Round">Second Round</option>
              <option value="Final Round">Final Round</option>
              <option value="Offer">Offer</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>Application Date:</label>
            <input 
              type="date" 
              value={applicationDate} 
              onChange={(e) => setApplicationDate(e.target.value)}
              style={{width: '100%', padding: '8px'}}
            />
          </div>
        </div>
        
        <button onClick={handleSubmit} style={{padding: '12px', fontSize: '16px', fontWeight: 'bold'}}>
          Add Application
        </button>
      </div>
      {message && <p className="message" style={{marginTop: '15px'}}>{message}</p>}
    </div>
  );
}

function ViewApplications({ apiUrl, applications, setApplications }) {
  const [loading, setLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    setDeleteMessage('');
    try {
      const response = await fetch(`${apiUrl}/applications?userID=user001`);
      const data = await response.json();
      
      // Handle different response formats
      let apps = [];
      if (Array.isArray(data)) {
        apps = data;
      } else if (data.body) {
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        apps = Array.isArray(bodyData) ? bodyData : [];
      } else if (data.items) {
        apps = data.items;
      }
      
      // Filter out resume-only items
      apps = apps.filter(app => !app.itemType || app.itemType !== 'resume');
      
      setApplications(apps);
    } catch (error) {
      console.error('Error:', error);
      setDeleteMessage('Failed to load applications');
    }
    setLoading(false);
  };

  const deleteApplication = async (userID, applicationID, company, role) => {
    if (!window.confirm(`Are you sure you want to remove the application for ${role} at ${company}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/applications?userID=${userID}&applicationID=${applicationID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setApplications(applications.filter(app => app.applicationID !== applicationID));
        setDeleteMessage('Application removed successfully');
        setTimeout(() => setDeleteMessage(''), 3000);
      } else {
        setDeleteMessage('Failed to remove application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      setDeleteMessage('Error removing application');
    }
  };

  return (
    <div className="view-container">
      <h2>My Applications</h2>
      <button onClick={fetchApplications}>Load Applications</button>
      {loading && <p>Loading...</p>}
      {deleteMessage && <p className="message">{deleteMessage}</p>}
      
      <div className="applications-list">
        {applications && applications.length > 0 ? applications.map((app, index) => (
          <div key={app.applicationID || index} className="app-card">
            <h3>{app.company}</h3>
            <p><strong>Role:</strong> {app.role}</p>
            <p><strong>Status:</strong> {app.status}</p>
            <p><strong>Date:</strong> {app.dateApplied}</p>
            {app.resumeFileName && (
              <p><strong>Resume:</strong>  {app.resumeFileName}</p>
            )}
            {app.atsScore && (
              <p><strong>ATS Score:</strong> {app.atsScore}/100</p>
            )}
            
            <div className="app-actions" style={{marginTop: '10px'}}>
              <button 
                onClick={() => deleteApplication(app.userID, app.applicationID, app.company, app.role)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )) : <p>No applications yet</p>}
      </div>
    </div>
  );
}

function UploadResume({ apiUrl }) {
  const [file, setFile] = useState(null);
  const [selectedApp, setSelectedApp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  // Fetch applications when component loads
  React.useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${apiUrl}/applications?userID=user001`);
      const data = await response.json();
      
      let apps = [];
      if (Array.isArray(data)) {
        apps = data;
      } else if (data.body) {
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        apps = Array.isArray(bodyData) ? bodyData : [];
      } else if (data.items) {
        apps = data.items;
      }
      
      // Filter out resume-only items
      apps = apps.filter(app => !app.itemType || app.itemType !== 'resume');
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    if (!selectedApp) {
      setMessage('Please select an application to link this resume');
      return;
    }

    setLoading(true);
    setMessage('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userID: 'user001', 
            fileName: file.name, 
            fileContent: base64,
            applicationID: selectedApp
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setMessage(` Resume uploaded and text extracted! (${data.extractedTextLength} characters)`);
          setFile(null);
          setSelectedApp('');
          // Refresh applications to show updated resume status
          fetchApplications();
        } else {
          setMessage(' Upload failed: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        setMessage(' Upload failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="form-container">
      <h2>Upload Resume</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <div>
          <label style={{display: 'block', marginBottom: '5px'}}>Select Application:</label>
          <select 
            value={selectedApp} 
            onChange={(e) => setSelectedApp(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          >
            <option value="">-- Select Application --</option>
            {applications.map(app => (
              <option key={app.applicationID} value={app.applicationID}>
                {app.company} - {app.role} {app.resumeFileName ? '(Resume uploaded ✅)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '5px'}}>Choose PDF Resume:</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>

        <button 
          onClick={handleUpload} 
          disabled={loading}
          style={{padding: '12px', fontSize: '16px', fontWeight: 'bold'}}
        >
          {loading ? 'Uploading & Extracting Text...' : 'Upload Resume'}
        </button>
      </div>
      {message && <p className="message" style={{marginTop: '15px'}}>{message}</p>}
    </div>
  );
}

function ATSScore({ apiUrl, atsScore, setAtsScore }) {
  const [selectedApp, setSelectedApp] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);

  // Fetch applications when component loads
  React.useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${apiUrl}/applications?userID=user001`);
      const data = await response.json();
      
      let apps = [];
      if (Array.isArray(data)) {
        apps = data;
      } else if (data.body) {
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        apps = Array.isArray(bodyData) ? bodyData : [];
      }
      
      // Filter to only show applications with resumes
      apps = apps.filter(app => app.resumeText && (!app.itemType || app.itemType !== 'resume'));
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const calculateScore = async () => {
    if (!selectedApp) {
      setError('Please select an application');
      return;
    }
    if (!jobDesc.trim()) {
      setError('Please enter the job description');
      return;
    }

    setLoading(true);
    setError('');
    setAtsScore(null);

    try {
      const response = await fetch(`${apiUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userID: 'user001',
          applicationID: selectedApp,
          jobDescription: jobDesc.trim() 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      setAtsScore(data);
    } catch (error) {
      console.error('Error calculating score:', error);
      setError(`Failed to calculate ATS score: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Calculate ATS Score</h2>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <div>
          <label style={{display: 'block', marginBottom: '5px'}}>Select Application (with resume):</label>
          <select 
            value={selectedApp} 
            onChange={(e) => setSelectedApp(e.target.value)}
            style={{width: '100%', padding: '8px'}}
          >
            <option value="">-- Select Application --</option>
            {applications.filter(app => app.resumeText).map(app => (
              <option key={app.applicationID} value={app.applicationID}>
                {app.company} - {app.role} 
              </option>
            ))}
          </select>
          {applications.length === 0 && (
            <p style={{color: '#888', fontSize: '14px', marginTop: '5px'}}>
              No applications with resumes found. Please upload a resume first.
            </p>
          )}
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '5px'}}>Job Description:</label>
          <textarea 
            placeholder="Paste the job description here..." 
            value={jobDesc} 
            onChange={(e) => setJobDesc(e.target.value)} 
            rows="10"
            style={{width: '100%', padding: '8px', fontFamily: 'inherit'}}
          />
        </div>

        <button 
          onClick={calculateScore} 
          disabled={loading}
          style={{padding: '12px', fontSize: '16px', fontWeight: 'bold'}}
        >
          {loading ? 'Calculating...' : 'Calculate ATS Score'}
        </button>
      </div>
      
      {error && <p className="error-message" style={{color: 'red', marginTop: '15px'}}>{error}</p>}
      
      {atsScore && (
        <div className="score-result" style={{marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
          <h3 style={{color: atsScore.score >= 80 ? '#28a745' : atsScore.score >= 60 ? '#ffc107' : '#dc3545'}}>
            ATS Score: {atsScore.score}/100
          </h3>
          
          {atsScore.suggestion && (
            <p style={{fontSize: '16px', marginTop: '10px', fontWeight: '500'}}>
              {atsScore.suggestion}
            </p>
          )}

          <div style={{marginTop: '20px'}}>
            <p><strong>Keywords Matched:</strong> {atsScore.matchedKeywordsCount} / {atsScore.totalKeywordsInJD}</p>
          </div>

          {atsScore.matchedKeywords && atsScore.matchedKeywords.length > 0 && (
            <div style={{marginTop: '15px'}}>
              <p><strong> Matched Keywords:</strong></p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                {atsScore.matchedKeywords.map((kw, i) => (
                  <span key={i} style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {atsScore.missingKeywords && atsScore.missingKeywords.length > 0 && (
            <div style={{marginTop: '15px'}}>
              <p><strong> Missing Keywords (consider adding):</strong></p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                {atsScore.missingKeywords.map((kw, i) => (
                  <span key={i} style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {atsScore.matchedPhrases && atsScore.matchedPhrases.length > 0 && (
            <div style={{marginTop: '15px'}}>
              <p><strong> Matched Key Phrases</strong></p>
              <ul style={{marginTop: '8px'}}>
                {atsScore.matchedPhrases.map((phrase, i) => (
                  <li key={i}>{phrase}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;