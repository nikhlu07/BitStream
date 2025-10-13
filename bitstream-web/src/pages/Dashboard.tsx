import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Eye, 
  Video, 
  Wallet as WalletIcon,
  Upload,
  Radio,
  BarChart3,
  DollarSign,
  Users,
  LogOut,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("bitstream_user") || "{}");

  const handleSignOut = () => {
    localStorage.removeItem("bitstream_user");
    navigate("/");
  };

  // Mock creator data
  const stats = {
    totalEarnings: 0.523,
    earningsUSD: 32456,
    activeViewers: 47,
    totalViews: 1234,
    contentCount: 18,
  };

  const recentActivity = [
    { id: 1, content: "Understanding Bitcoin Halving", viewer: "user_45x3", amount: 0.00024, duration: "12:34", time: "5 min ago" },
    { id: 2, content: "Live Market Analysis", viewer: "crypto_fan", amount: 0.0003, duration: "8:21", time: "15 min ago" },
    { id: 3, content: "DeFi Guide", viewer: "defi_newbie", amount: 0.00015, duration: "6:12", time: "1 hour ago" },
  ];
  
  const weeklyEarningsData = [
    { day: "Mon", value: 0.042 },
    { day: "Tue", value: 0.068 },
    { day: "Wed", value: 0.055 },
    { day: "Thu", value: 0.089 },
    { day: "Fri", value: 0.093 },
    { day: "Sat", value: 0.078 },
    { day: "Sun", value: 0.098 },
  ];
  const maxWeeklyEarning = Math.max(...weeklyEarningsData.map(d => d.value)) * 1.1;


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-xl flex items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">BitStream</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-primary">
              Overview
            </Link>
            <Link to="/dashboard/content" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Content Library
            </Link>
            <Link to="/dashboard/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Analytics
            </Link>
            <Link to="/wallet" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Earnings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white">
                    {userData.username?.[0]?.toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/*<DropdownMenuItem onClick={() => navigate("/settings")}>*/}
                {/*  <Settings className="w-4 h-4 mr-2" />*/}
                {/*  Settings*/}
                {/*</DropdownMenuItem>*/}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
              {stats.totalEarnings} sBTC
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              ≈ ${stats.earningsUSD.toLocaleString()} USD
            </div>
            <div className="text-xs text-muted-foreground">Total Earnings</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.activeViewers}</div>
            <div className="text-sm text-muted-foreground mb-2">Currently watching</div>
            <Button variant="link" className="text-xs p-0 h-auto">View details →</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8.3%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mb-2">All-time views</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.contentCount}</div>
            <div className="text-sm text-muted-foreground mb-2">Total pieces</div>
            <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate("/dashboard/content")}>Upload New →</Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button size="lg" className="h-auto py-6 flex flex-col gap-2" onClick={() => navigate("/dashboard/content")}>
            <Upload className="w-6 h-6" />
            <span>Upload Content</span>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2">
            <Radio className="w-6 h-6" />
            <span>Start Livestream</span>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => navigate("/dashboard/analytics")}>
            <BarChart3 className="w-6 h-6" />
            <span>View Analytics</span>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => navigate("/wallet")}
          >
            <DollarSign className="w-6 h-6" />
            <span>Withdraw Earnings</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{activity.content}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.viewer} • {activity.duration} • {activity.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold bg-gradient-primary bg-clip-text text-transparent">
                      +{activity.amount} sBTC
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Earnings This Week</h2>
              <span className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +5.2%
              </span>
            </div>
            <div className="h-64 flex items-end gap-4">
              <div className="h-full flex flex-col justify-between text-right text-xs text-muted-foreground pb-6 pr-2 border-r border-dashed">
                <span>{(maxWeeklyEarning).toFixed(2)}</span>
                <span>{(maxWeeklyEarning / 2).toFixed(2)}</span>
                <span>0.00</span>
              </div>
              <div className="flex-1 h-full grid grid-cols-7 items-end gap-2">
                {weeklyEarningsData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div 
                      className="w-full bg-gradient-to-b from-primary/80 to-primary rounded-t-lg transition-all duration-300 ease-in-out group-hover:opacity-80"
                      style={{ height: `${(data.value / maxWeeklyEarning) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-2">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}