import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTurnkey } from '@turnkey/react-wallet-kit';

interface CustomTurnkeyAuthProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomTurnkeyAuth: React.FC<CustomTurnkeyAuthProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { handleLogin } = useTurnkey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Trigger Turnkey authentication with the email
      await handleLogin();
      onSuccess();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Log in or sign up</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-orange-500 underline">Terms of Service</a> &{' '}
          <a href="#" className="text-orange-500 underline">Privacy Policy</a>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isLoading ? 'Authenticating...' : 'Continue'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Secured by Turnkey
        </p>
      </div>
    </div>
  );
};