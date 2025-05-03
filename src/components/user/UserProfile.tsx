
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserAccess } from "@/hooks/useUserAccess";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const UserProfile = () => {
  const { currentUser, updateUser } = useUser();
  const { locations } = useInventory();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { userRoleDisplay } = useUserAccess();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    username: currentUser?.username || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = () => {
    if (!currentUser) return;
    
    updateUser({
      ...currentUser,
      name: formData.name,
      email: formData.email,
      username: formData.username,
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated",
    });
    
    setIsEditing(false);
  };

  if (!currentUser) return null;

  const assignedLocations = currentUser.assignedLocations || [];
  const canEdit = currentUser.role !== "client"; // Clients can't edit

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>View and manage your profile information</CardDescription>
          </div>
          {!isEditing && canEdit && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      
      {currentUser.role === "client" && (
        <div className="px-6">
          <Alert className="border-amber-200 bg-amber-50 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-700">Client Account</AlertTitle>
            <AlertDescription className="text-amber-600">
              As a client user, you have view-only access to audit data for your assigned locations.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <CardContent className="space-y-6">
        {isEditing && canEdit ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="text-sm font-medium block mb-1">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="mt-1">{currentUser.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="mt-1">{currentUser.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p className="mt-1">{currentUser.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <Badge className="mt-1" variant={
                  currentUser.role === 'admin' ? 'default' : 
                  currentUser.role === 'auditor' ? 'secondary' : 'outline'
                }>
                  {userRoleDisplay()}
                </Badge>
              </div>
            </div>

            {currentUser.role !== "admin" && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Assigned Locations
                </h3>
                {assignedLocations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignedLocations.map(locId => {
                      const location = locations.find(l => l.id === locId);
                      return location ? (
                        <Badge variant="outline" key={locId}>
                          {location.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No locations assigned</p>
                )}
              </div>
            )}

            {currentUser.role === "admin" && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Access</h3>
                <p className="text-sm">As an admin, you have access to all locations and features.</p>
              </div>
            )}

            {currentUser.role === "client" && currentUser.companyId && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Company ID</h3>
                <p>{currentUser.companyId}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && canEdit && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateProfile}>
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
