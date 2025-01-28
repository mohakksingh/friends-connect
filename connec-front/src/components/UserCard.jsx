import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { User, Mail, UserPlus, UserCheck, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const UserCard = ({ user }) => {
  const [friendStatus, setFriendStatus] = useState("none");
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    checkFriendStatus();
  }, [user]);

  const checkFriendStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.BASE_URL}/api/friends/status/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriendStatus(response.data.status);
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  const sendFriendRequest = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.BASE_URL}/api/friends/request/${user.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriendStatus("pending");
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = () => {
    if (user.id === currentUser?.id) return null;

    const buttonProps = {
      none: {
        onClick: sendFriendRequest,
        disabled: loading,
        variant: "default",
        children: (
          <>
            {loading ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-2 w-2" />
            )}
            {loading ? "Sending..." : "Add Friend"}
          </>
        ),
      },
      pending: {
        disabled: true,
        variant: "secondary",
        children: (
          <>
            <Clock className="mr-2 h-4 w-4" />
            Request Pending
          </>
        ),
      },
      friends: {
        disabled: true,
        variant: "secondary",
        children: (
          <>
            <UserCheck className="mr-2 h-2 w-2" />
            Friends
          </>
        ),
      },
    };

    const props = buttonProps[friendStatus] || {};

    return <Button {...props} />;
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.username}
            </h3>
            <div className="flex items-start flex-col text-sm space-y-2 text-gray-500">
              <div className="flex flex-row">
                <Mail className="mr-2 h-4 w-4" />
                {user.email}
              </div>
              {getActionButton()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
