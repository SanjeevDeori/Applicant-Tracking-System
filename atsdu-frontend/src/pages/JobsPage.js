import React, { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  // Simulated 'Apply' action
  const applyJob = (jobId) => {
    setApplyMsg(`Applied to job: ${jobId}`);
    // You would POST to `/jobs/:id/apply` if such an endpoint exists
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Job Listings</h2>
      {loading ? <p>Loading...</p> : jobs.length === 0 ? <p>No jobs found.</p> : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id || job.id} style={{ marginBottom: 10 }}>
              <strong>{job.title}</strong>: {job.description}
              <button style={{ marginLeft: 10 }} onClick={() => applyJob(job._id || job.id)}>Apply</button>
            </li>
          ))}
        </ul>
      )}
      {applyMsg && <div style={{ color: "green", marginTop: 20 }}>{applyMsg}</div>}
    </div>
  );
}
