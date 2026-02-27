import React, { useEffect, useState } from "react";
import axios from "axios";

const Dispatch = () => {
  const [requests, setRequests] = useState([]);

  const API = "http://localhost:5021/api/waste-reports";

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="dispatch-container">
      <h2>Dispatch Console</h2>

      <div className="request-list">
        {requests.map((req) => (
         <div key={req.requestId} className="request-card">
            <strong>Request #{req.requestId}</strong>

            <div>Status: {req.status}</div>
            <div>Enterprise: {req.enterpriseName}</div>
            <div>Waste Type: {req.wasteTypeName}</div>
            <div>Description: {req.reportDescription}</div>
            <div>
              Created:{" "}
              {new Date(req.createdAt).toLocaleString()}
            </div>


            <div>
              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await axios.put(
                    `${API}/${req.requestId}/accept`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );

                  fetchRequests();
                }}
              >
                Accept
              </button>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await axios.put(
                    `${API}/${req.requestId}/cancel`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );

                  fetchRequests();
                }}
              >
                Cancel
              </button>
            </div>

            {/* Xem assignment */}
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");

                const res = await axios.get(

                  {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                );
                console.log(res.data);
                alert("Check console for assignment history");
              }}
            >
              View Assignments
            </button>
          </div>
        ))}
      </div>
    </div>
  );



};

export default Dispatch;