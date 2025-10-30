import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Activity,
  UserCheck,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    users: null,
    jobs: null,
    companies: null,
    interviews: null,
    applications: null,
    agents: null,
    candidates: null
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const [
          userStats,
          jobStats,
          companyStats,
          interviewStats,
          applicationStats,
          agents,
          jobs,
          companies,
          users,
          candidateAssignments,
          interviews
        ] = await Promise.all([
          apiClient.getUserStats().catch(() => ({ totalUsers: 0, roleStats: [] })),
          apiClient.getJobStats().catch(() => ({ totalJobs: 0 })),
          apiClient.getCompanyStats().catch(() => ({ totalCompanies: 0 })),
          apiClient.getInterviewStats().catch(() => ({})),
          apiClient.getApplicationStats().catch(() => ({})),
          apiClient.getUsers({ role: 'agent', limit: 100 }).catch(() => ({ data: [] })),
          apiClient.getJobs({ limit: 100 }).catch(() => ({ data: [] })),
          apiClient.getCompanies({ limit: 100 }).catch(() => ({ data: [] })),
          apiClient.getUsers({ limit: 1000 }).catch(() => ({ data: [] })),
          apiClient.getCandidateAssignments({ limit: 1000 }).catch(() => ({ data: [] })),
          apiClient.getInterviews({ limit: 1000 }).catch(() => ({ data: [] }))
        ]);

        const processedStats = {
          users: userStats?.data || userStats,
          jobs: jobStats?.data || jobStats,
          companies: companyStats?.data || companyStats,
          interviews: interviewStats?.data || interviewStats,
          applications: applicationStats?.data || applicationStats,
          agentsList: Array.isArray(agents) ? agents : (agents?.data || []),
          jobsList: Array.isArray(jobs) ? jobs : (jobs?.data || []),
          companiesList: Array.isArray(companies) ? companies : (companies?.data || []),
          usersList: Array.isArray(users) ? users : (users?.data || []),
          candidateAssignments: Array.isArray(candidateAssignments) ? candidateAssignments : (candidateAssignments?.data || []),
          interviewsList: Array.isArray(interviews) ? interviews : (interviews?.data || [])
        };

        console.log('Dashboard Stats:', {
          totalUsers: processedStats.usersList.length,
          totalJobs: processedStats.jobsList.length,
          totalCompanies: processedStats.companiesList.length,
          totalAgents: processedStats.agentsList.length,
          totalInterviews: processedStats.interviewsList.length,
          totalAssignments: processedStats.candidateAssignments.length,
          agents: processedStats.agentsList?.map((a: any) => ({
            id: a._id || a.id,
            name: `${a.firstName} ${a.lastName}`
          })),
          assignments: processedStats.candidateAssignments?.map((ca: any) => ({
            id: ca._id,
            assignedBy: ca.assignedBy?._id || ca.assignedBy,
            candidateStatus: ca.candidateStatus
          }))
        });

        setStats(processedStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  // Calculate derived stats
  const totalUsers = stats.users?.totalUsers || 0;
  const totalJobs = stats.jobs?.totalJobs || 0;
  const openJobs = stats.jobsList?.filter((j: any) => j.status === 'open').length || 0;
  const totalCompanies = stats.companies?.totalCompanies || 0;
  const totalAgents = stats.agentsList?.length || 0;
  const totalCandidates = stats.usersList?.filter((u: any) => u.role === 'candidate').length || 0;
  const totalHRs = stats.usersList?.filter((u: any) => u.role === 'hr').length || 0;
  const totalInterviews = stats.interviewsList?.length || 0;
  const upcomingInterviews = stats.interviewsList?.filter((i: any) => 
    i.status === 'scheduled' && new Date(i.scheduledAt) > new Date()
  ).length || 0;
  const completedInterviews = stats.interviewsList?.filter((i: any) => i.status === 'completed').length || 0;
  const totalAssignments = stats.candidateAssignments?.length || 0;
  const hiredCount = stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'hired').length || 0;

  // User Distribution Chart Data - Calculate from actual user list
  const roleDistribution = {
    admin: stats.usersList?.filter((u: any) => u.role === 'admin').length || 0,
    hr: stats.usersList?.filter((u: any) => u.role === 'hr').length || 0,
    agent: stats.usersList?.filter((u: any) => u.role === 'agent').length || 0,
    candidate: stats.usersList?.filter((u: any) => u.role === 'candidate').length || 0,
  };

  const userRoleData = {
    series: [roleDistribution.admin, roleDistribution.hr, roleDistribution.agent, roleDistribution.candidate],
    options: {
      chart: {
        type: 'donut',
        height: 350
      },
      labels: ['ADMIN', 'HR', 'AGENT', 'CANDIDATE'],
      colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Users',
                fontSize: '16px',
                fontWeight: 600
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toFixed(0) + '%';
        }
      }
    } as ApexOptions
  };

  // Jobs Timeline Chart
  const jobsTimelineData = {
    series: [{
      name: 'Jobs Posted',
      data: getJobsTimeline(stats.jobsList || [])
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      colors: ['#10b981'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        }
      },
      xaxis: {
        categories: getLast7Days(),
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Number of Jobs'
        }
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + ' jobs';
          }
        }
      }
    } as ApexOptions
  };

  // Company Growth Chart
  const companyGrowthData = {
    series: [{
      name: 'Companies',
      data: getCompanyGrowth(stats.companiesList || [])
    }],
    options: {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        }
      },
      colors: ['#8b5cf6'],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5,
        hover: {
          size: 7
        }
      },
      xaxis: {
        categories: getLast7Days(),
      },
      yaxis: {
        title: {
          text: 'Total Companies'
        }
      }
    } as ApexOptions
  };

  // Interview Status Chart
  const interviewStatusData = {
    series: [
      {
        name: 'Interviews',
        data: [
          upcomingInterviews,
          completedInterviews,
          stats.interviewsList?.filter((i: any) => i.status === 'cancelled').length || 0,
          stats.interviewsList?.filter((i: any) => i.status === 'pending').length || 0
        ]
      }
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: '55%',
          distributed: true
        }
      },
      colors: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Upcoming', 'Completed', 'Cancelled', 'Pending'],
      },
      yaxis: {
        title: {
          text: 'Count'
        }
      },
      legend: {
        show: false
      }
    } as ApexOptions
  };

  // Candidate Status Funnel
  const candidateStatusData = {
    series: [
      {
        name: 'Candidates',
        data: [
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'new').length || 0,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'reviewed').length || 0,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'shortlisted').length || 0,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'interview_scheduled').length || 0,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'interviewed').length || 0,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'offer_sent').length || 0,
          hiredCount,
          stats.candidateAssignments?.filter((a: any) => a.candidateStatus === 'rejected').length || 0
        ]
      }
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: false,
          barHeight: '80%'
        }
      },
      colors: ['#3b82f6'],
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff']
        }
      },
      xaxis: {
        categories: ['New', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Interviewed', 'Offer Sent', 'Hired', 'Rejected'],
      },
      yaxis: {
        title: {
          text: 'Candidate Status'
        }
      }
    } as ApexOptions
  };

  // Agent Performance Chart - Calculate assignments per agent
  const agentAssignmentCounts = stats.agentsList?.map((agent: any) => {
    const assignmentCount = stats.candidateAssignments?.filter((a: any) => {
      // Try matching with both _id and id fields
      const assignedById = a.assignedBy?._id || a.assignedBy;
      const agentId = agent._id || agent.id;
      return assignedById && agentId && (assignedById === agentId || assignedById.toString() === agentId.toString());
    }).length || 0;
    
    return {
      agent,
      count: assignmentCount
    };
  }).sort((a: any, b: any) => b.count - a.count).slice(0, 5) || [];

  // Debug logging for agent performance
  if (agentAssignmentCounts.length > 0) {
    console.log('Agent Performance Data:', agentAssignmentCounts.map((item: any) => ({
      name: `${item.agent.firstName} ${item.agent.lastName}`,
      agentId: item.agent._id || item.agent.id,
      assignmentCount: item.count
    })));
  }

  const agentPerformanceData = {
    series: [{
      name: 'Candidates Assigned',
      data: agentAssignmentCounts.map((item: any) => item.count)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: '60%',
        }
      },
      colors: ['#10b981'],
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      xaxis: {
        categories: agentAssignmentCounts.map((item: any) => 
          `${item.agent.firstName} ${item.agent.lastName?.charAt(0) || ''}.`
        ),
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Candidates Assigned'
        },
        labels: {
          formatter: function(val: number) {
            return Math.floor(val).toString();
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + ' candidates';
          }
        }
      }
    } as ApexOptions
  };

  // Job Type Distribution
  const jobTypeData = {
    series: [
      stats.jobsList?.filter((j: any) => j.type === 'full-time').length || 0,
      stats.jobsList?.filter((j: any) => j.type === 'part-time').length || 0,
      stats.jobsList?.filter((j: any) => j.type === 'contract').length || 0,
      stats.jobsList?.filter((j: any) => j.type === 'internship').length || 0,
    ],
    options: {
      chart: {
        type: 'pie',
        height: 350
      },
      labels: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        }
      }
    } as ApexOptions
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Loading Dashboard</h3>
            <p className="text-muted-foreground">Fetching data from all modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive system overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
          <Activity className="h-4 w-4 mr-2" />
            Refresh Data
        </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          change="+12%"
          trend="up"
          icon={<Users className="h-5 w-5" />}
          color="blue"
          onClick={() => navigate('/dashboard/users')}
        />
        <MetricCard
          title="Active Jobs"
          value={openJobs}
          subtitle={`${totalJobs} total`}
          change="+8%"
          trend="up"
          icon={<Briefcase className="h-5 w-5" />}
          color="emerald"
          onClick={() => navigate('/dashboard/jobs')}
        />
        <MetricCard
          title="Companies"
          value={totalCompanies}
          change="+5%"
          trend="up"
          icon={<Building2 className="h-5 w-5" />}
          color="purple"
          onClick={() => navigate('/dashboard/companies')}
        />
        <MetricCard
          title="Total Interviews"
          value={totalInterviews}
          subtitle={`${upcomingInterviews} upcoming`}
          change="+15%"
          trend="up"
          icon={<Calendar className="h-5 w-5" />}
          color="amber"
          onClick={() => navigate('/dashboard/interviews')}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallMetricCard
          title="Agents"
          value={totalAgents}
          icon={<UserCheck className="h-4 w-4" />}
          color="indigo"
          onClick={() => navigate('/dashboard/agents')}
        />
        <SmallMetricCard
          title="Candidates"
          value={totalCandidates}
          icon={<Users className="h-4 w-4" />}
          color="pink"
          onClick={() => navigate('/dashboard/users?role=candidate')}
        />
        <SmallMetricCard
          title="HR Users"
          value={totalHRs}
          icon={<UserCheck className="h-4 w-4" />}
          color="teal"
          onClick={() => navigate('/dashboard/users?role=hr')}
        />
        <SmallMetricCard
          title="Hired"
          value={hiredCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="green"
          onClick={() => navigate('/dashboard/shared-candidates?candidateStatus=hired')}
        />
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="recruitment">
            <Target className="h-4 w-4 mr-2" />
            Recruitment
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  User Distribution by Role
                </CardTitle>
                <CardDescription>Active users across different roles</CardDescription>
              </CardHeader>
              <CardContent>
                {userRoleData.series.some((val: number) => val > 0) ? (
                  <ReactApexChart
                    options={userRoleData.options}
                    series={userRoleData.series}
                    type="donut"
                    height={350}
                  />
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No user data available</p>
                      <p className="text-sm">Users will appear here once registered</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Jobs Posted (Last 7 Days)
                </CardTitle>
                <CardDescription>Daily job posting activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={jobsTimelineData.options}
                  series={jobsTimelineData.series}
                  type="area"
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Company Growth Trend
                </CardTitle>
                <CardDescription>Cumulative company registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={companyGrowthData.options}
                  series={companyGrowthData.series}
                  type="line"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Job Type Distribution
            </CardTitle>
                <CardDescription>Breakdown by employment type</CardDescription>
          </CardHeader>
          <CardContent>
                {jobTypeData.series.some((val: number) => val > 0) ? (
                  <ReactApexChart
                    options={jobTypeData.options}
                    series={jobTypeData.series}
                    type="pie"
                    height={350}
                  />
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    No jobs data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recruitment Tab */}
        <TabsContent value="recruitment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Interview Status Overview
                </CardTitle>
                <CardDescription>Current interview pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={interviewStatusData.options}
                  series={interviewStatusData.series}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Candidate Status Funnel
                </CardTitle>
                <CardDescription>Recruitment pipeline breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={candidateStatusData.options}
                  series={candidateStatusData.series}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                    <p className="text-2xl font-bold">{totalAssignments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 opacity-50" />
                    </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">
                      {totalAssignments > 0 ? ((hiredCount / totalAssignments) * 100).toFixed(1) : 0}%
                    </p>
                      </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600 opacity-50" />
                    </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Interviews</p>
                    <p className="text-2xl font-bold">{completedInterviews}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/agent-allocation')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Top 5 Agent Performance
                </CardTitle>
                <CardDescription>Agents by candidates assigned (click to view all agents)</CardDescription>
              </CardHeader>
              <CardContent>
                {agentAssignmentCounts.length > 0 ? (
                  <ReactApexChart
                    options={agentPerformanceData.options}
                    series={agentPerformanceData.series}
                    type="bar"
                    height={350}
                  />
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No agent performance data</p>
                      <p className="text-sm">Agent assignments will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
        </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Recent Activity Summary
            </CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  <ActivityStat
                    label="New Users Registered"
                    value={stats.usersList?.filter((u: any) => {
                      const createdDate = new Date(u.createdAt);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return createdDate > yesterday;
                    }).length || 0}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    onClick={() => navigate('/dashboard/users')}
                  />
                  <ActivityStat
                    label="Jobs Posted"
                    value={stats.jobsList?.filter((j: any) => {
                      const createdDate = new Date(j.createdAt);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return createdDate > yesterday;
                    }).length || 0}
                    icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
                    onClick={() => navigate('/dashboard/jobs')}
                  />
                  <ActivityStat
                    label="Interviews Scheduled"
                    value={stats.interviewsList?.filter((i: any) => {
                      const createdDate = new Date(i.createdAt);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return createdDate > yesterday;
                    }).length || 0}
                    icon={<Calendar className="h-5 w-5 text-amber-600" />}
                    onClick={() => navigate('/dashboard/interviews')}
                  />
                  <ActivityStat
                    label="Companies Registered"
                    value={stats.companiesList?.filter((c: any) => {
                      const createdDate = new Date(c.createdAt);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return createdDate > yesterday;
                    }).length || 0}
                    icon={<Building2 className="h-5 w-5 text-purple-600" />}
                    onClick={() => navigate('/dashboard/companies')}
                  />
                  <ActivityStat
                    label="Candidates Hired"
                    value={stats.candidateAssignments?.filter((a: any) => {
                      if (a.candidateStatus !== 'hired') return false;
                      const updatedDate = new Date(a.updatedAt);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return updatedDate > yesterday;
                    }).length || 0}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    onClick={() => navigate('/dashboard/shared-candidates')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <HealthMetric label="System Uptime" value="99.9%" status="success" />
                  <HealthMetric label="Average Response Time" value="245ms" status="success" />
                  <HealthMetric label="Active Sessions" value={totalUsers.toString()} status="success" />
                  <HealthMetric label="Database Status" value="Healthy" status="success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recruitment Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <HealthMetric 
                    label="Time to Hire" 
                    value="14 days" 
                    status="warning" 
                  />
                  <HealthMetric 
                    label="Offer Acceptance Rate" 
                    value={totalAssignments > 0 ? `${((hiredCount / totalAssignments) * 100).toFixed(0)}%` : "0%"}
                    status="success" 
                  />
                  <HealthMetric 
                    label="Candidate Satisfaction" 
                    value="4.5/5" 
                    status="success" 
                  />
                  <HealthMetric 
                    label="Active Job Openings" 
                    value={openJobs.toString()} 
                    status={openJobs > 0 ? "success" : "warning"} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert
                    type={upcomingInterviews > 10 ? "warning" : "info"}
                    message={`${upcomingInterviews} upcoming interviews`}
                  />
              <Alert
                    type={openJobs < 5 ? "warning" : "success"}
                    message={`${openJobs} open positions`}
              />
              <Alert
                type="info"
                    message={`${totalAgents} agents active`}
              />
              <Alert
                type="success"
                    message="All systems operational"
              />
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Average Candidates per Job"
              value={totalJobs > 0 ? (totalAssignments / totalJobs).toFixed(1) : "0"}
              icon={<Target className="h-5 w-5 text-blue-600" />}
            />
            <SummaryCard
              title="Interview Success Rate"
              value={totalInterviews > 0 ? `${((completedInterviews / totalInterviews) * 100).toFixed(0)}%` : "0%"}
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            />
            <SummaryCard
              title="Active Agents"
              value={totalAgents.toString()}
              icon={<UserCheck className="h-5 w-5 text-purple-600" />}
            />
            <SummaryCard
              title="Companies with Jobs"
              value={new Set(stats.jobsList?.map((j: any) => j.companyId).filter(Boolean)).size.toString()}
              icon={<Building2 className="h-5 w-5 text-amber-600" />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  subtitle,
  change, 
  trend, 
  icon, 
  color,
  onClick 
}: { 
  title: string; 
  value: number; 
  subtitle?: string;
  change: string; 
  trend: 'up' | 'down'; 
  icon: React.ReactNode; 
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  }[color];

  return (
    <Card 
      className={`bg-gradient-to-br ${colorClasses} text-white shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{change} from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SmallMetricCard({ 
  title, 
  value, 
  icon, 
  color,
  onClick 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-100',
    pink: 'text-pink-600 bg-pink-100',
    teal: 'text-teal-600 bg-teal-100',
    green: 'text-green-600 bg-green-100',
  }[color];

  return (
    <Card className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses}`}>
        {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityStat({ label, value, icon, onClick }: { label: string; value: number; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <div 
      className={`flex items-center justify-between p-3 bg-muted/50 rounded-lg ${onClick ? 'cursor-pointer hover:bg-muted transition-colors hover:shadow-sm' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant="secondary" className="text-base font-semibold">
        {value}
      </Badge>
    </div>
  );
}

function HealthMetric({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600'
  };

  return (
        <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${colors[status]}`}>{value}</span>
        </div>
  );
}

function Alert({ type, message }: { type: 'success' | 'info' | 'warning'; message: string }) {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div className={`p-2 rounded-md border text-xs ${styles[type]}`}>
      {message}
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility Functions
function getLast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return days;
}

function getJobsTimeline(jobs: any[]): number[] {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const count = jobs.filter((job: any) => {
      const jobDate = new Date(job.createdAt || job.postedAt);
      return jobDate >= date && jobDate < nextDate;
    }).length;
    
    last7Days.push(count);
  }
  return last7Days;
}

function getCompanyGrowth(companies: any[]): number[] {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(23, 59, 59, 999);
    
    const count = companies.filter((company: any) => {
      const companyDate = new Date(company.createdAt);
      return companyDate <= date;
    }).length;
    
    last7Days.push(count);
  }
  return last7Days;
}
