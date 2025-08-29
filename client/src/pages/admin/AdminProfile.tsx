import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Activity,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Admin",
    email: user?.email || "admin@hireaccel.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "System Administrator with 8+ years of experience in recruitment technology and platform management.",
    title: "Platform Administrator",
    department: "IT Operations",
    timezone: "America/Los_Angeles",
    language: "English (US)"
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    sessionTimeout: "30",
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
    dataExportAlerts: true
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    systemAlerts: true,
    userActivity: true,
    securityEvents: true,
    reportGeneration: false,
    maintenanceUpdates: true,
    emailDigest: true,
    pushNotifications: false
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    }, 1000);
  };

  const handleSecurityUpdate = async (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Security Setting Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  // Mock admin statistics
  const adminStats = {
    totalUsers: 1247,
    activeJobs: 89,
    systemUptime: "99.9%",
    lastLogin: "2024-01-15 09:23 AM",
    sessionDuration: "4h 32m",
    privilegedActions: 23,
    dataExports: 5,
    systemAlerts: 2
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        </div>
        <Button 
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {editMode ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/admin-avatar.jpg" />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    variant="outline"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{profileData.title}</p>
                <Badge className="mt-2" variant="default">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last login: {adminStats.lastLogin}</span>
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{adminStats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{adminStats.systemUptime}</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{adminStats.privilegedActions}</div>
                <div className="text-xs text-muted-foreground">Actions Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{adminStats.systemAlerts}</div>
                <div className="text-xs text-muted-foreground">Active Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Content */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={profileData.title}
                        onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={profileData.timezone}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                        disabled={!editMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => handleSecurityUpdate('twoFactorEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified of new login attempts
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => handleSecurityUpdate('loginAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Export Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Monitor when data is exported from the system
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.dataExportAlerts}
                        onCheckedChange={(checked) => handleSecurityUpdate('dataExportAlerts', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Session Timeout</Label>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Current Password</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <Input type="password" placeholder="Enter new password" />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <Input type="password" placeholder="Confirm new password" />
                        </div>
                        <Button className="mt-4">
                          <Key className="h-4 w-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Critical system notifications</p>
                      </div>
                      <Switch
                        checked={notifications.systemAlerts}
                        onCheckedChange={(checked) => handleNotificationUpdate('systemAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>User Activity</Label>
                        <p className="text-sm text-muted-foreground">New user registrations and activity</p>
                      </div>
                      <Switch
                        checked={notifications.userActivity}
                        onCheckedChange={(checked) => handleNotificationUpdate('userActivity', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Events</Label>
                        <p className="text-sm text-muted-foreground">Login attempts and security warnings</p>
                      </div>
                      <Switch
                        checked={notifications.securityEvents}
                        onCheckedChange={(checked) => handleNotificationUpdate('securityEvents', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Report Generation</Label>
                        <p className="text-sm text-muted-foreground">Automated report completion notifications</p>
                      </div>
                      <Switch
                        checked={notifications.reportGeneration}
                        onCheckedChange={(checked) => handleNotificationUpdate('reportGeneration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Updates</Label>
                        <p className="text-sm text-muted-foreground">System maintenance and updates</p>
                      </div>
                      <Switch
                        checked={notifications.maintenanceUpdates}
                        onCheckedChange={(checked) => handleNotificationUpdate('maintenanceUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Digest</Label>
                        <p className="text-sm text-muted-foreground">Daily summary email</p>
                      </div>
                      <Switch
                        checked={notifications.emailDigest}
                        onCheckedChange={(checked) => handleNotificationUpdate('emailDigest', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">User Management Action</p>
                        <p className="text-sm text-muted-foreground">Created new HR user account for Jane Smith</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">System Update</p>
                        <p className="text-sm text-muted-foreground">Applied security patch v2.1.3</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Report Generated</p>
                        <p className="text-sm text-muted-foreground">Monthly user analytics report exported</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Security Alert</p>
                        <p className="text-sm text-muted-foreground">Unusual login pattern detected and blocked</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
