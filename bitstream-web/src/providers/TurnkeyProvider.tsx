import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TurnkeyProvider, TurnkeyProviderConfig } from '@turnkey/react-wallet-kit'

// Create a client - EXACTLY like stacks_craftPay
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10 // 10 minutes
    }
  }
})
const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID!,
  authProxyConfigId: import.meta.env.VITE_TURNKEY_AUTH_PROXY_CONFIG_ID!
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TurnkeyProvider
        config={turnkeyConfig}
        callbacks={{
          onError: (error) => console.error('Turnkey error:', error),
          onAuthenticationSuccess: ({ session }) => {
            console.log('User authenticated:', session)
            // Store authentication state
            if (session) {
              localStorage.setItem(
                'bitstream_auth',
                JSON.stringify({
                  authenticated: true,
                  userId: session.userId,
                  organizationId: session.organizationId,
                  timestamp: Date.now()
                })
              )
            }
          }
        }}
      >
        {children}
      </TurnkeyProvider>
    </QueryClientProvider>
  )
}