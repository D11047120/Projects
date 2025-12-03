import React, { useEffect, useState } from "react";
import axios from "axios";
import './ManagerProjects.css';

const BASE_URL = "http://localhost:5211/api";

function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "" });
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const res = await axios.get(`${BASE_URL}/Projects`);
    setProjects(res.data);
  }

  async function addProject() {
    await axios.post(`${BASE_URL}/Projects`, newProject);
    setNewProject({ name: "" });
    loadProjects();
  }

  async function updateProject(p) {
    await axios.put(`${BASE_URL}/Projects/${p.id}`, p);
    loadProjects();
  }

  async function importCsv() {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append("file", csvFile);
    await axios.post(`${BASE_URL}/Projects/import`, formData);
    setCsvFile(null);
    loadProjects();
  }

  return (
    <div className="manager-projects-container">
      <h2>Manage Projects</h2>

      <h3>Add New Project</h3>
        <input
        type="text"
        placeholder="Code"
        value={newProject.code || ''}
        onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
        />
        <input
        type="text"
        placeholder="Name"
        value={newProject.name || ''}
        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
        />
        <input
        type="number"
        placeholder="Budget"
        value={newProject.budget || ''}
        onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) })}
        />
        <button onClick={addProject}>Add Project</button>

      <h3>Import from CSV</h3>
      <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
      <button onClick={importCsv}>Upload CSV</button>

      <h3>Existing Projects</h3>
      <table className="projects-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <input
                  value={p.code}
                  onChange={(e) => setProjects(projects.map(x => x.id === p.id ? { ...x, code: e.target.value } : x))}
                />
              </td>
              <td>
                <input
                  value={p.name}
                  onChange={(e) => setProjects(projects.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))}
                />
              </td>
              <td>
                <button onClick={() => updateProject(p)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManagerProjects;
