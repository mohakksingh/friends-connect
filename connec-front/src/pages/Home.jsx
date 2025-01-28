import { useState } from 'react';
import UserSearch from '../components/UserSearch';
import UserList from '../components/UserList';
import FriendRecommendations from '../components/FriendsRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to FriendConnect</h1>
      <Tabs defaultValue="find" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="find">Find Friends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="find">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Find Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <UserSearch 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                />
                <div className="mt-6">
                  <UserList searchTerm={searchTerm} />
                </div>
              </CardContent>
            </Card>
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle>Friend Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendRecommendations />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Friend Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <FriendRecommendations />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
