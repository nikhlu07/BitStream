import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Settings,
  LogOut,
  Upload,
  TrendingUp,
  Users, 
  Eye,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Analytics() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("bitstream_user") || "{}");

  const handleSignOut = () => {
    localStorage.removeItem("bitstream_user");
    navigate("/");
  };

  // Mock analytics data
  const analytics = {
    totalRevenue: 1.253,
    totalViews: 14567,
    followers: 1234,
    watchTime: 456,
  };

  const revenueData = [
    { name: 'Jan', revenue: 0.12 },
    { name: 'Feb', revenue: 0.23 },
    { name: 'Mar', revenue: 0.35 },
    { name: 'Apr', revenue: 0.41 },
    { name: 'May', revenue: 0.52 },
    { name: 'Jun', revenue: 0.67 },
  ];

  const viewsData = [
    { name: 'Video 1', views: 2345 },
    { name: 'Video 2', views: 1876 },
    { name: 'Video 3', views: 1234 },
    { name: 'Video 4', views: 876 },
    { name: 'Video 5', views: 543 },
  ];

  const topContent = [
    { id: 1, title: "DeFi Guide", views: 2345, revenue: 0.1234 },
    { id: 2, title: "Crypto Staking Tutorial", views: 1876, revenue: 0.0765 },
    { id: 3, title: "Understanding Bitcoin Halving", views: 1234, revenue: 0.0523 },
    { id: 4, title: "Live Market Analysis", views: 876, revenue: 0.0981 },
    { id: 5, title: "NFTs for Beginners", views: 543, revenue: 0.0234 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">BitStream</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Overview
            </Link>
            <Link to="/dashboard/content" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Content Library
            </Link>
            <Link to="/dashboard/analytics" className="text-sm font-medium text-primary">
              Analytics
            </Link>
            <Link to="/wallet" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Earnings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard/content")}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white">
                    {userData.username?.[0]?.toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +15.2%
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {analytics.totalRevenue.toFixed(3)} sBTC
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold">{analytics.followers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold">{analytics.watchTime}h</div>
            <div className="text-sm text-muted-foreground">Total Watch Time</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Views per Video</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Top Content</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Revenue (sBTC)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.views.toLocaleString()}</TableCell>
                  <TableCell className="bg-gradient-primary bg-clip-text text-transparent font-bold">
                    {item.revenue.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}