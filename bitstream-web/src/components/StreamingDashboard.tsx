import React, { useState } from 'react';
import { useStreamingScore } from '../hooks/useStreamingScore';
import { ContentUpload } from './ContentUpload';
import { CreatorEarnings } from './CreatorEarnings';
import { useContentManagement } from '../hooks/useContentManagement';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Video, DollarSign, BarChart3 } from 'lucide-react';

const StreamingDashboard: React.FC = () => {
  const {
    score,
    startStreaming,
    stopStreaming,
    resetScore,
    createCheckpoint,
    recoverFromCheckpoint,
  } = useStreamingScore(5000, 2); // Checkpoint every 5 seconds, +2 points per second
  
  const { creatorContent, isLoading: contentLoading } = useContentManagement();
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = () => {
    switch (score.connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'reconnecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (score.connectionStatus) {
      case 'connected':
        return '🟢';
      case 'reconnecting':
        return '🟡';
      case 'disconnected':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleUploadSuccess = (contentId: bigint) => {
    setShowUpload(false);
    setActiveTab('content');
  };

  if (showUpload) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ContentUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your content and track earnings
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Content
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Content ({creatorContent.length})
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="streaming">
            Streaming Test
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Total Content</h3>
                  <p className="text-2xl font-bold">{creatorContent.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Active Content</h3>
                  <p className="text-2xl font-bold">
                    {creatorContent.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Avg Price</h3>
                  <p className="text-2xl font-bold">
                    {creatorContent.length > 0 
                      ? (creatorContent.reduce((sum, c) => sum + Number(c.price), 0) / creatorContent.length / 1_000_000).toFixed(3)
                      : '0.000'
                    } STX
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <CreatorEarnings />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Content</h2>
            <Button onClick={() => setShowUpload(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          {contentLoading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your content...</p>
            </Card>
          ) : creatorContent.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first piece of content to start earning
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorContent.map((content, index) => (
                <Card key={index} className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Content #{index + 1}</h3>
                      <Badge variant={content.isActive ? "default" : "secondary"}>
                        {content.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Price: {(Number(content.price) / 1_000_000).toFixed(6)} STX/min
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(Number(content.createdAt) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <CreatorEarnings />
        </TabsContent>

        {/* Streaming Test Tab */}
        <TabsContent value="streaming" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Streaming Test System</h2>
            <p className="text-gray-600 mt-2">
              Test the streaming score system with secure checkpoints
            </p>
          </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Connection Status</h2>
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            <span className="text-2xl">{getStatusIcon()}</span>
            <span className="font-medium capitalize">{score.connectionStatus}</span>
          </div>
        </div>

        {score.isStreaming && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Streaming active</span>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Score */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-orange-800 mb-2">Current Score</h3>
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {score.currentScore.toLocaleString()}
            </div>
            <p className="text-sm text-orange-700">
              {score.isStreaming ? 'Streaming...' : 'Paused'}
            </p>
          </div>
        </div>

        {/* Secure Score */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-green-800 mb-2">Secure Score</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score.secureScore.toLocaleString()}
            </div>
            <p className="text-sm text-green-700">
              Last checkpoint: {formatTime(score.lastCheckpoint)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Progress to Next Checkpoint</h3>
          <span className="text-sm text-gray-600">
            +{score.currentScore - score.secureScore} points
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(((Date.now() - score.lastCheckpoint) / 5000) * 100, 100)}%` 
            }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Checkpoints created every 5 seconds during streaming
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={startStreaming}
            disabled={score.isStreaming}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Stream
          </button>
          
          <button
            onClick={stopStreaming}
            disabled={!score.isStreaming}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Stop Stream
          </button>
          
          <button
            onClick={createCheckpoint}
            disabled={!score.isStreaming}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Checkpoint
          </button>
          
          <button
            onClick={recoverFromCheckpoint}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Recover
          </button>
          
          <button
            onClick={resetScore}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Streaming:</strong> Score increases continuously while active</p>
          <p>• <strong>Checkpoints:</strong> Secure points are saved every 5 seconds</p>
          <p>• <strong>Recovery:</strong> If connection drops, score recovers from last checkpoint</p>
          <p>• <strong>Persistence:</strong> Secure scores survive page refreshes</p>
          <p>• <strong>Reset:</strong> Clears both current and secure scores</p>
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StreamingDashboard;