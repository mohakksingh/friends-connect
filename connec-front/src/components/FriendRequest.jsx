import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:3000/api/friends/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data); 
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setError("Failed to fetch friend requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      setError(null); 

      await axios.put(
        `http://localhost:3000/api/friends/${action}/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (err) {
      console.error(`Error handling friend request (${action}):`, err);
      setError(`Failed to ${action} friend request. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Friend Requests</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No pending friend requests
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
              >
                <div>
                  <h3 className="font-semibold">{request.sender.username}</h3>
                  <p className="text-gray-600">{request.sender.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(request._id, "accept")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request._id, "reject")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
