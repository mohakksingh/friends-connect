import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  UserCircle2,
  Users,
  Loader2,
  AlertCircle,
  Mail,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.BACKEND_URL}/api/friends/myfriends`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriends(response.data);
    } catch (err) {
      console.error("Error fetching friend list:", err);
      setError("Failed to fetch friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoute = () => {
    navigate("/");
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6" />
                Friend List
              </CardTitle>
              <CardDescription>
                {friends.length} {friends.length === 1 ? "friend" : "friends"}{" "}
                in your network
              </CardDescription>
            </div>
            <Button variant="outline" onclick={handleRoute}>
              Find New Friends
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg mb-6">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {friends.length === 0 ? (
            <div className="text-center py-12 px-4">
              <UserCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No friends yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start connecting with people to build your network
              </p>

              <Button variant="outline">Find Friends</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback className="bg-primary/10">
                        {friend.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{friend.username}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{friend.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Friends;
