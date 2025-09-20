import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Phone, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalyticsChartsProps {
  data?: {
    recordsProcessed: number;
    uniqueNumbers: number;
    callsCount: number;
    smsCount: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

export const AnalyticsCharts = ({ data }: AnalyticsChartsProps) => {
  const [activityTrendData, setActivityTrendData] = useState<any[]>([]);
  const [topContactsData, setTopContactsData] = useState<any[]>([]);
  const [callTypeData, setCallTypeData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const axios = (await import('axios')).default;
      const { API_BASE_URL } = await import('@/lib/utils');

      const params: any = {};
      if (data?.timeRange?.start) params.from = data.timeRange.start;
      if (data?.timeRange?.end) params.to = data.timeRange.end;
      if ((data as any)?.batchId) params.batchId = (data as any).batchId;
      const [timelineRes, topRes, freqRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/analytics/timeline`, { params }),
        axios.get(`${API_BASE_URL}/api/analytics/top-numbers`, { params: { ...params, limit: 5 } }),
        axios.get(`${API_BASE_URL}/api/analytics/frequency`, { params })
      ]);
      setActivityTrendData(timelineRes.data.data || []);
      setTopContactsData((topRes.data.data || []).map((x: any) => ({ contact: x.number, calls: x.calls, duration: 0, sms: x.sms, uniqueNumbers: x.uniqueContacts })));
      console.log(topContactsData, 'topContactsData');
      const callsTotal = (freqRes.data.data || []).reduce((acc: number, x: any) => acc + (x.calls || 0), 0);
      const smsTotal = (freqRes.data.data || []).reduce((acc: number, x: any) => acc + (x.sms || 0), 0);
      setCallTypeData([
        { name: 'Voice Calls', value: callsTotal, color: '#8884d8' },
        { name: 'SMS', value: smsTotal, color: '#82ca9d' },
      ]);
      setHourlyData([]);
    }
    load();
  }, [data?.timeRange?.start, data?.timeRange?.end, (data as any)?.batchId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.recordsProcessed?.toLocaleString() || '1,247'}</div>
            <p className="text-xs text-muted-foreground">CDR entries processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topContactsData[0]?.calls?.toLocaleString() || '892'}</div>
            <p className="text-xs text-muted-foreground">Outgoing & incoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topContactsData[0]?.sms?.toLocaleString() || '355'}</div>
            <p className="text-xs text-muted-foreground">Text messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Numbers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topContactsData[0]?.uniqueNumbers?.toLocaleString() || '89'}</div>
            <p className="text-xs text-muted-foreground">Distinct contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Daily call and SMS activity over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#82ca9d" />
                <XAxis 
                  dataKey="date" 
                  stroke="#82ca9d"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="hsl(var(--foreground))" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sms" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Types</CardTitle>
            <CardDescription>Distribution of voice calls vs SMS</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={callTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                >
                  {callTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Contacts</CardTitle>
            <CardDescription>Most frequently contacted numbers</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topContactsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#0000" />
                <XAxis type="number" stroke="#000" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="contact" 
                  stroke="#00000" 
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffff', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'duration') return [formatDuration(value as number), 'Duration'];
                    return [value, name === 'calls' ? 'Calls' : 'SMS'];
                  }}
                />
                <Bar dataKey="calls" fill="#000" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity</CardTitle>
            <CardDescription>Communication patterns by hour of day</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="hsl(var(--foreground))" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="calls" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="sms" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};