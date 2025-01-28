import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import UserCard from "./UserCard";

const FriendRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/recommendations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Recommended Friends</h2>
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.user.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <UserCard user={rec.user} />
              <p className="text-sm text-gray-600 mt-2">
                {rec.mutualFriendsCount} mutual friends
              </p>
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-gray-600 text-center py-4">
              No recommendations available at the moment
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRecommendations;
