import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  Wallet as WalletIcon, 
  Play, 
  Star,
  Eye,
  LogOut,
  User,
  Settings,
  Radio
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockContent } from "@/data/mockData";

export default function Browse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const userData = JSON.parse(localStorage.getItem("bitstream_user") || "{}");

  const handleSignOut = () => {
    localStorage.removeItem("bitstream_user");
    navigate("/");
  };

  const featuredContent = mockContent.slice(0, 3);
  const liveContent = mockContent.filter(c => c.isLive);
  const allContent = mockContent;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">BitStream</span>
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for creators or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/wallet" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <WalletIcon className="w-4 h-4 text-primary" />
              <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                {userData.balance?.toFixed(4) || "0.1000"} sBTC
              </span>
            </Link>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
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
                {/*<DropdownMenuItem onClick={() => navigate("/profile")}>*/}
                {/*  <User className="w-4 h-4 mr-2" />*/}
                {/*  My Profile*/}
                {/*</DropdownMenuItem>*/}
                <DropdownMenuItem onClick={() => navigate("/wallet")}>
                  <WalletIcon className="w-4 h-4 mr-2" />
                  Wallet
                </DropdownMenuItem>
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
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContent.map((content) => (
              <Card key={content.id} className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all">
                <Link to={`/watch/${content.id}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    {content.isLive && (
                      <Badge className="absolute top-3 left-3 bg-destructive">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs text-white">
                      {content.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-2">{content.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <img 
                        src={content.creatorAvatar} 
                        alt={content.creatorName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">{content.creatorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                        {content.price} sBTC/min
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          {content.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Now Section */}
        {liveContent.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold">Live Now</h2>
              <Badge variant="destructive" className="animate-pulse-subtle">
                <Radio className="w-3 h-3 mr-1" />
                {liveContent.length} streaming
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {liveContent.map((content) => (
                <Card key={content.id} className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all">
                  <Link to={`/watch/${content.id}`}>
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={content.thumbnail} 
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-destructive">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                      <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{content.title}</h3>
                      <div className="flex items-center gap-2">
                        <img 
                          src={content.creatorAvatar} 
                          alt={content.creatorName}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-xs text-muted-foreground">{content.creatorName}</span>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Content Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-6">All Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {allContent.map((content) => (
              <Card key={content.id} className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all">
                <Link to={`/watch/${content.id}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {content.isLive && (
                      <Badge className="absolute top-3 left-3 bg-destructive">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    )}
                    <Badge className="absolute top-3 right-3 bg-black/80 text-white capitalize">
                      {content.type}
                    </Badge>
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs text-white">
                      {content.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2">{content.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <img 
                        src={content.creatorAvatar} 
                        alt={content.creatorName}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-muted-foreground">{content.creatorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent text-xs">
                        {content.price} sBTC/min
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {content.views > 1000 ? `${(content.views / 1000).toFixed(1)}k` : content.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          {content.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}