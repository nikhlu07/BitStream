import React from 'react';
import StreamingDashboard from '../components/StreamingDashboard';

const StreamingDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <StreamingDashboard />
    </div>
  );
};

export default StreamingDemo;