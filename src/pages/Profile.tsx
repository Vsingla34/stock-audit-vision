
import { AppLayout } from "@/components/layout/AppLayout";
import { UserProfile } from "@/components/user/UserProfile";

const Profile = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>
        
        <div className="max-w-2xl">
          <UserProfile />
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
