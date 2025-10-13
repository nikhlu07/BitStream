import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Settings,
  LogOut,
  Upload,
  Video,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Content() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("bitstream_user") || "{}");

  const handleSignOut = () => {
    localStorage.removeItem("bitstream_user");
    navigate("/");
  };

  // Mock content data
  const content = [
    { id: 1, title: "Understanding Bitcoin Halving", type: "Video", duration: "15:45", views: 1234, earnings: 0.0523 },
    { id: 2, title: "Live Market Analysis", type: "Livestream", duration: "01:12:30", views: 876, earnings: 0.0981 },
    { id: 3, title: "DeFi Guide", type: "Video", duration: "08:21", views: 2345, earnings: 0.1234 },
    { id: 4, title: "NFTs for Beginners", type: "Video", duration: "12:10", views: 543, earnings: 0.0234 },
    { id: 5, title: "Crypto Staking Tutorial", type: "Video", duration: "18:30", views: 1876, earnings: 0.0765 },
  ];

  return (
    <Dialog>
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
              <Link to="/dashboard/content" className="text-sm font-medium text-primary">
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
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Content Library</h1>
            <div className="flex items-center gap-4">
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Content
                </Button>
              </DialogTrigger>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Earnings (sBTC)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.duration}</TableCell>
                    <TableCell>{item.views.toLocaleString()}</TableCell>
                    <TableCell className="bg-gradient-primary bg-clip-text text-transparent font-bold">
                      {item.earnings.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
          <DialogDescription>
            Fill in the details below to upload your new content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">MP4, WEBM, or OGG</p>
                </div>
                <Input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. How to use BitStream" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="e.g. In this video, I'll show you..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input id="thumbnail" type="file" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}