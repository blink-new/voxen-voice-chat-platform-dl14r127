import { ReactNode } from 'react'
import { Button } from './ui/button'
import { blink } from '../blink/client'

interface AuthGuardProps {
  user: any
  children: ReactNode
}

export function AuthGuard({ user, children }: AuthGuardProps) {
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Voxen
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Next-Gen Voice & Chat Platform
            </p>
            <p className="text-sm text-muted-foreground">
              Connect, collaborate, and create with crystal-clear voice chat and AI-powered tools
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => blink.auth.login()}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Sign In to Voxen
            </Button>
            <p className="text-xs text-muted-foreground">
              Join thousands of communities already using Voxen
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}