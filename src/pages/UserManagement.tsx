import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@/context/UserContext";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, UserRound, Building, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { currentUser, users, registerUser, updateUser, deleteUser, hasPermission } = useUser();
  const { locations } = useInventory();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  
  // New user form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    role: "auditor",
    companyId: "",
    assignedLocations: [] as string[]
  });

  // If not admin, redirect to home
  if (!hasPermission("manageUsers")) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as "admin" | "auditor" | "client" }));
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedLocations.includes(locationId);
      return {
        ...prev,
        assignedLocations: isSelected
          ? prev.assignedLocations.filter(id => id !== locationId)
          : [...prev.assignedLocations, locationId]
      };
    });
  };

  const handleAddUser = () => {
    registerUser({
      username: formData.username,
      email: formData.email,
      name: formData.name,
      role: formData.role as "admin" | "auditor" | "client",
      companyId: formData.role === "client" ? formData.companyId : undefined,
      assignedLocations: formData.assignedLocations
    });
    
    toast({
      title: "User created",
      description: `${formData.name} has been added as a ${formData.role}`,
    });
    
    setFormData({
      username: "",
      email: "",
      name: "",
      role: "auditor",
      companyId: "",
      assignedLocations: []
    });
    
    setIsAddUserOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    const user = users.find(u => u.id === selectedUser);
    if (!user) return;
    
    updateUser({
      ...user,
      username: formData.username,
      email: formData.email,
      name: formData.name,
      role: formData.role as "admin" | "auditor" | "client",
      companyId: formData.role === "client" ? formData.companyId : undefined,
      assignedLocations: formData.assignedLocations
    });
    
    toast({
      title: "User updated",
      description: `${formData.name}'s information has been updated`,
    });
    
    setSelectedUser(null);
    setIsEditUserOpen(false);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    const user = users.find(u => u.id === selectedUser);
    if (!user) return;
    
    deleteUser(selectedUser);
    
    toast({
      title: "User deleted",
      description: `${user.name} has been removed from the system`,
    });
    
    setSelectedUser(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId || "",
      assignedLocations: user.assignedLocations || []
    });
    
    setSelectedUser(userId);
    setIsEditUserOpen(true);
  };

  const openDeleteDialog = (userId: string) => {
    setSelectedUser(userId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm">Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right text-sm">Username</label>
                  <Input 
                    id="username" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Role</label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "client" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="companyId" className="text-right text-sm">Company ID</label>
                    <Input 
                      id="companyId" 
                      name="companyId"
                      value={formData.companyId} 
                      onChange={handleInputChange}
                      className="col-span-3" 
                    />
                  </div>
                )}

                {(formData.role === "auditor" || formData.role === "client") && (
                  <div className="grid grid-cols-4 gap-4">
                    <label className="text-right text-sm">Locations</label>
                    <div className="col-span-3 space-y-2">
                      {locations.map(location => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`location-${location.id}`}
                            checked={formData.assignedLocations.includes(location.id)}
                            onCheckedChange={() => handleLocationToggle(location.id)}
                          />
                          <label 
                            htmlFor={`location-${location.id}`}
                            className="text-sm"
                          >
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>Admins</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Auditors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === 'auditor').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Clients</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === 'client').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Locations</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'auditor' ? 'secondary' : 'outline'
                      }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.assignedLocations && user.assignedLocations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.assignedLocations.map(locId => {
                            const location = locations.find(l => l.id === locId);
                            return location ? (
                              <Badge variant="outline" key={locId}>
                                {location.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        user.role === 'admin' ? (
                          <span className="text-xs text-muted-foreground">All locations</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">None assigned</span>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name" className="text-right text-sm">Name</label>
              <Input 
                id="edit-name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-username" className="text-right text-sm">Username</label>
              <Input 
                id="edit-username" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-email" className="text-right text-sm">Email</label>
              <Input 
                id="edit-email" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Role</label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "client" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-companyId" className="text-right text-sm">Company ID</label>
                <Input 
                  id="edit-companyId" 
                  name="companyId"
                  value={formData.companyId} 
                  onChange={handleInputChange}
                  className="col-span-3" 
                />
              </div>
            )}

            {(formData.role === "auditor" || formData.role === "client") && (
              <div className="grid grid-cols-4 gap-4">
                <label className="text-right text-sm">Locations</label>
                <div className="col-span-3 space-y-2">
                  {locations.map(location => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-location-${location.id}`}
                        checked={formData.assignedLocations.includes(location.id)}
                        onCheckedChange={() => handleLocationToggle(location.id)}
                      />
                      <label 
                        htmlFor={`edit-location-${location.id}`}
                        className="text-sm"
                      >
                        {location.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UserManagement;
