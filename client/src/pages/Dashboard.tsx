import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

const stats = [
  {
    title: "Active Agents",
    value: "24",
    change: "+12%",
    icon: Users,
    color: "text-primary"
  },
  {
    title: "Open Positions",
    value: "127",
    change: "+8%",
    icon: Briefcase,
    color: "text-info"
  },
  {
    title: "Interviews Today",
    value: "18",
    change: "+5%",
    icon: Calendar,
    color: "text-warning"
  },
  {
    title: "Partner Companies",
    value: "45",
    change: "+15%",
    icon: Building2,
    color: "text-success"
  }
];

const adminActivity = [
  {
    id: 1,
    type: "interview",
    title: "Interview scheduled",
    description: "Senior Developer position at TechCorp",
    time: "2 hours ago",
    status: "scheduled"
  },
  {
    id: 2,
    type: "assignment",
    title: "Agent assigned",
    description: "Sarah Johnson assigned to Marketing Manager role",
    time: "4 hours ago",
    status: "active"
  },
  {
    id: 3,
    type: "job",
    title: "New job posted",
    description: "Product Manager at InnovateStart",
    time: "6 hours ago",
    status: "new"
  },
  {
    id: 4,
    type: "placement",
    title: "Successful placement",
    description: "Frontend Developer at WebSolutions",
    time: "1 day ago",
    status: "completed"
  }
];

const candidateActivity = [
  {
    id: 1,
    type: "profile",
    title: "Profile Update Required",
    description: "Complete your profile to increase visibility to HRs",
    time: "Just now",
    status: "active"
  },
  {
    id: 2,
    type: "assignment",
    title: "Assignment Status",
    description: "No active assignments yet. Agents will assign you to relevant jobs.",
    time: "Just now",
    status: "new"
  }
];

const topAgents = [
  { name: "Sarah Johnson", placements: 12, success: 94 },
  { name: "Mike Chen", placements: 8, success: 87 },
  { name: "Emily Davis", placements: 10, success: 92 },
  { name: "David Wilson", placements: 6, success: 89 }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your recruitment platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-xs text-success">{stat.change}</span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="flex-shrink-0 mt-1">
                    {activity.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    {activity.status === "scheduled" && (
                      <Calendar className="w-4 h-4 text-warning" />
                    )}
                    {activity.status === "active" && (
                      <AlertCircle className="w-4 h-4 text-info" />
                    )}
                    {activity.status === "new" && (
                      <Briefcase className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Performing Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAgents.map((agent, index) => (
                <div key={agent.name} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.placements} placements</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">{agent.success}%</p>
                    <Progress value={agent.success} className="w-16 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}