import { useState, useEffect, useRef, useCallback } from 'react';

interface StreamingScoreState {
  currentScore: number;
  secureScore: number; // Last confirmed/secure checkpoint
  isStreaming: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastCheckpoint: number;
}

interface StreamingScoreHook {
  score: StreamingScoreState;
  startStreaming: () => void;
  stopStreaming: () => void;
  resetScore: () => void;
  createCheckpoint: () => void;
  recoverFromCheckpoint: () => void;
}

export const useStreamingScore = (
  checkpointIntervalMs: number = 10000, // 10 seconds
  scoreIncrement: number = 1
): StreamingScoreHook => {
  const [score, setScore] = useState<StreamingScoreState>({
    currentScore: 0,
    secureScore: 0,
    isStreaming: false,
    connectionStatus: 'disconnected',
    lastCheckpoint: Date.now(),
  });

  const streamingInterval = useRef<NodeJS.Timeout | null>(null);
  const checkpointIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Simulate streaming increment
  const incrementScore = useCallback(() => {
    setScore(prev => ({
      ...prev,
      currentScore: prev.currentScore + scoreIncrement,
    }));
  }, [scoreIncrement]);

  // Create secure checkpoint
  const createCheckpoint = useCallback(() => {
    try {
      setScore(prev => {
        const newSecureScore = prev.currentScore;
        
        // Save to localStorage for persistence
        localStorage.setItem('bitstream_secure_score', newSecureScore.toString());
        localStorage.setItem('bitstream_checkpoint_time', Date.now().toString());
        
        console.log(`✅ Checkpoint created: ${newSecureScore} points secured`);
        
        return {
          ...prev,
          secureScore: newSecureScore,
          lastCheckpoint: Date.now(),
        };
      });
    } catch (error) {
      console.error('Error creating checkpoint:', error);
    }
  }, []);

  // Recover from last checkpoint
  const recoverFromCheckpoint = useCallback(() => {
    try {
      const savedScore = localStorage.getItem('bitstream_secure_score');
      const checkpointTime = localStorage.getItem('bitstream_checkpoint_time');
      
      if (savedScore && checkpointTime) {
        const recoveredScore = parseInt(savedScore, 10);
        
        if (!isNaN(recoveredScore)) {
          setScore(prev => ({
            ...prev,
            currentScore: recoveredScore,
            secureScore: recoveredScore,
            lastCheckpoint: parseInt(checkpointTime, 10),
            connectionStatus: 'connected',
          }));
          
          console.log(`🔄 Recovered from checkpoint: ${recoveredScore} points`);
        }
      }
    } catch (error) {
      console.error('Error recovering from checkpoint:', error);
    }
  }, []);

  // Start streaming
  const startStreaming = useCallback(() => {
    setScore(prev => {
      if (prev.isStreaming) return prev;

      // Start score increment interval
      streamingInterval.current = setInterval(incrementScore, 1000); // Every second

      // Start checkpoint interval
      checkpointIntervalRef.current = setInterval(createCheckpoint, checkpointIntervalMs);

      console.log('🚀 Streaming started');

      return {
        ...prev,
        isStreaming: true,
        connectionStatus: 'connected',
      };
    });
  }, [incrementScore, createCheckpoint, checkpointIntervalMs]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (streamingInterval.current) {
      clearInterval(streamingInterval.current);
      streamingInterval.current = null;
    }

    if (checkpointIntervalRef.current) {
      clearInterval(checkpointIntervalRef.current);
      checkpointIntervalRef.current = null;
    }

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    setScore(prev => ({
      ...prev,
      isStreaming: false,
      connectionStatus: 'disconnected',
    }));

    console.log('⏹️ Streaming stopped');
  }, []);

  // Reset score to 0
  const resetScore = useCallback(() => {
    setScore(prev => ({
      ...prev,
      currentScore: 0,
      secureScore: 0,
      lastCheckpoint: Date.now(),
    }));

    localStorage.removeItem('bitstream_secure_score');
    localStorage.removeItem('bitstream_checkpoint_time');

    console.log('🔄 Score reset to 0');
  }, []);

  // Simulate connection interruption and recovery
  useEffect(() => {
    if (!score.isStreaming) return;

    // Simulate random disconnections (for demo purposes)
    const simulateDisconnection = () => {
      if (Math.random() < 0.05) { // 5% chance every second
        console.log('⚠️ Connection interrupted - recovering from checkpoint');
        
        setScore(prev => ({
          ...prev,
          connectionStatus: 'reconnecting',
        }));

        // Stop current streaming
        if (streamingInterval.current) {
          clearInterval(streamingInterval.current);
          streamingInterval.current = null;
        }

        // Attempt reconnection after 2 seconds
        reconnectTimeout.current = setTimeout(() => {
          recoverFromCheckpoint();
          
          // Restart streaming
          streamingInterval.current = setInterval(incrementScore, 1000);
          
          setScore(prev => ({
            ...prev,
            connectionStatus: 'connected',
          }));
          
          console.log('✅ Connection restored');
        }, 2000);
      }
    };

    const disconnectionCheck = setInterval(simulateDisconnection, 1000);

    return () => {
      clearInterval(disconnectionCheck);
    };
  }, [score.isStreaming, incrementScore, recoverFromCheckpoint]);

  // Load saved score on mount
  useEffect(() => {
    recoverFromCheckpoint();
  }, [recoverFromCheckpoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    score,
    startStreaming,
    stopStreaming,
    resetScore,
    createCheckpoint,
    recoverFromCheckpoint,
  };
};