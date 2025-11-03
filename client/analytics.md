🧾 Functional Requirement Document (FRD)
Analytics Module — HireAccel Web Platform
1️⃣ Objective
To build a complete Analytics and Insights Page inside the HireAccel MERN application that:
Tracks user behavior across key funnel stages.
Displays event and session data through visual charts.
Records user sessions and generates heatmaps.
Provides referral and source tracking from Meta/Google ads.
Separates registered vs bounced users and their session durations.
This system fixes the current gap where campaigns were run without verified tracking and enables data-driven UX and campaign decisions.
2️⃣ Scope
The Analytics Module will:
Be integrated into the admin dashboard (accessible only by authorized roles).
Collect data from frontend events (React) via an API (Node/Express).
Store analytics data in MongoDB (collection: analytics_events).
Visualize analytics using ApexCharts.
Integrate PostHog for event-level analytics and funnels.
Integrate OpenReplay for heatmaps and session replays.
3️⃣ Key Functionalities
A. Event Tracking
Events to be tracked via frontend:
Event Name	Trigger	Metadata
page_view	On page load	Page URL, referrer, UTM params
signup_button_clicked	On CTA click	Button ID, source page
otp_page_loaded	On OTP screen mount	Referral page
signup_successful	After registration success	User ID, session ID
scroll_event	On scroll >50%	Page URL
session_start	On first load	Timestamp, referrer
session_end	On unload	Duration, pages viewed
💡 Each event will be sent via POST /api/analytics/track
B. Referral & Source Tracking
Capture UTM parameters (utm_source, utm_medium, utm_campaign) from landing URLs.
Store them in localStorage and send along with every event.
Display top referral sources and conversion performance by source.
C. Session Tracking & Bounce Analysis
Use a unique sessionId (UUID) generated on first load.
Save session_start_time and session_end_time on unload or timeout.
Classify user as bounced if:
Duration < 5 seconds, OR
Only one page viewed.
Metrics:
Avg session duration (all, registered, bounced)
Bounce rate %
Number of sessions per source
D. Funnel Tracking
Funnel flow:
/candidate → /signup/candidate → /otp → /dashboard
Metrics to display:
Total users per stage
Drop-off percentage between each stage
Conversion rate (dashboard reached vs total visitors)
This will use PostHog funnels API and backend aggregation for backup.
E. Heatmaps & Session Replay
Integrate Microsoft Clarity SDK for recording sessions and generating heatmaps (free alternative to OpenReplay).
Display:
Click intensity map
Scroll depth heatmap
Playback of sessions with timestamps
Integrate Clarity dashboard in analytics page via iframe (optional).
Clarity provides free session replay and heatmaps - just sign up at clarity.microsoft.com and add your project ID.
F. Charts & Visualization (ApexCharts)
Use ApexCharts to display insights dynamically.
Charts to Include:
Signup Funnel (Bar Chart)
X-axis: Stage (Visited, Signup, OTP, Registered)
Y-axis: Count
Chart: BarChart
Bounce Rate Trend (Line Chart)
X-axis: Date
Y-axis: Bounce rate %
Chart: LineChart
Referral Source Performance (Pie Chart)
Labels: Source (Meta, Google, Direct)
Values: Conversion count
Chart: PieChart
Session Duration Comparison (Horizontal Bar)
X-axis: Duration (seconds)
Y-axis: User type (Bounced, Registered)
Daily Active Users (Area Chart)
X-axis: Date
Y-axis: Active sessions
G. Dashboard Structure
Sections inside /analytics:
Overview (Totals, bounce rate, avg duration, signups)
Funnels & Conversions
Source Insights
Heatmaps & Recordings
Raw Event Logs (table view with filters)
4️⃣ System Architecture
Frontend (React)
useAnalyticsTracker.js → custom hook for event capture
AnalyticsDashboard.jsx → main dashboard
Uses ApexCharts components
Integrates iframe of OpenReplay and PostHog dashboards
Backend (Node.js / Express)
POST /api/analytics/track → store events
GET /api/analytics/summary → aggregated stats
GET /api/analytics/funnels → conversion funnel data
GET /api/analytics/sources → referral insights
Database (MongoDB)
Collection: analytics_events
{
  eventName: String,
  page: String,
  referrer: String,
  userId: String,
  sessionId: String,
  timestamp: Date,
  eventData: Object,
  utm: {
    source: String,
    medium: String,
    campaign: String
  },
  duration: Number
}
5️⃣ Integrations
🔹 PostHog (JS SDK)
import posthog from 'posthog-js';
posthog.init('YOUR_KEY', { api_host: 'https://app.posthog.com', autocapture: true });
🔹 Microsoft Clarity (Heatmap + Replays - FREE)
Add your Clarity project ID to VITE_CLARITY_ID environment variable.
Clarity automatically tracks sessions, clicks, and scrolls when initialized.
Sign up at: https://clarity.microsoft.com
🔹 ApexCharts (Frontend Visuals)
npm install react-apexcharts apexcharts
Example:
import Chart from 'react-apexcharts';
<Chart type="bar" series={[{ data: [20, 40, 60] }]} options={{ xaxis: { categories: ['Visited', 'Signup', 'OTP'] } }} />
6️⃣ Security & Privacy
All events are anonymized (unless user logged in).
Sensitive data (like OTP) must never be captured.
Admin-only access to analytics dashboard.
7️⃣ Deliverables
Analytics API endpoints (Express)
React Analytics Dashboard with ApexCharts
PostHog + Microsoft Clarity integration (free alternative to OpenReplay)
MongoDB aggregation for metrics
Role-based access control (only Admin)
8️⃣ Future Enhancements
Predictive analytics (next drop-off point)
A/B testing integrations
Real-time dashboard (Socket.io)
CSV export for marketing team