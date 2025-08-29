import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingCard } from "@/components/ui/loading-spinner";
import { ApiErrorAlert } from "@/components/ui/error-boundary";
import { useJobStats, useUserStats, useCompanyStats } from "@/hooks/useApi";
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Activity,
  UserCheck,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const { data: jobStats, loading: jobStatsLoading, error: jobStatsError } = useJobStats();
  const { data: userStats, loading: userStatsLoading, error: userStatsError } = useUserStats();
  const { data: companyStats, loading: companyStatsLoading, error: companyStatsError } = useCompanyStats();

  if (jobStatsError || userStatsError || companyStatsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <ApiErrorAlert 
          error={jobStatsError || userStatsError || companyStatsError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <Button>
          <Activity className="h-4 w-4 mr-2" />
          View Activity Log
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={userStats?.totalUsers || 0}
          icon={<Users className="h-4 w-4" />}
          description="All platform users"
          loading={userStatsLoading}
        />
        <MetricCard
          title="Active Jobs"
          value={jobStats?.totalJobs || 0}
          icon={<Briefcase className="h-4 w-4" />}
          description="Currently open positions"
          loading={jobStatsLoading}
        />
        <MetricCard
          title="Partner Companies"
          value={companyStats?.totalCompanies || 0}
          icon={<Building2 className="h-4 w-4" />}
          description="Registered companies"
          loading={companyStatsLoading}
        />
        <MetricCard
          title="System Health"
          value="99.9%"
          icon={<TrendingUp className="h-4 w-4" />}
          description="Uptime this month"
          loading={false}
        />
      </div>

      {/* User Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role and status</CardDescription>
          </CardHeader>
          <CardContent>
            {userStatsLoading ? (
              <LoadingCard />
            ) : (
              <div className="space-y-4">
                {userStats?.roleStats?.map((stat: any) => (
                  <div key={stat.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{stat.role}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stat.total}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.active} active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert
                type="warning"
                title="Storage Usage"
                description="File storage is at 85% capacity"
                icon={<AlertTriangle className="h-4 w-4" />}
              />
              <Alert
                type="info"
                title="Scheduled Maintenance"
                description="System maintenance planned for next Sunday"
                icon={<Clock className="h-4 w-4" />}
              />
              <Alert
                type="success"
                title="Backup Complete"
                description="Daily backup completed successfully"
                icon={<UserCheck className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              time="2 minutes ago"
              action="New company registered"
              details="DataFlow Solutions created account"
              icon={<Building2 className="h-4 w-4" />}
            />
            <ActivityItem
              time="5 minutes ago"
              action="Job posted"
              details="Senior React Developer at TechCorp"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <ActivityItem
              time="10 minutes ago"
              action="User login"
              details="hr@techcorp.com signed in"
              icon={<Users className="h-4 w-4" />}
            />
            <ActivityItem
              time="15 minutes ago"
              action="Application submitted"
              details="New application for Marketing Manager"
              icon={<UserCheck className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Building2 className="h-6 w-6 mb-2" />
              Company Settings
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              System Logs
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon, 
  description, 
  loading 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  description: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
        <div className="text-2xl font-bold">
          {loading ? "..." : typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function Alert({ 
  type, 
  title, 
  description, 
  icon 
}: { 
  type: 'warning' | 'info' | 'success'; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  const colorClasses = {
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800', 
    success: 'border-green-200 bg-green-50 text-green-800',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[type]}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ 
  time, 
  action, 
  details, 
  icon 
}: { 
  time: string; 
  action: string; 
  details: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="p-2 bg-background rounded-md">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{action}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{details}</p>
      </div>
    </div>
  );
}
