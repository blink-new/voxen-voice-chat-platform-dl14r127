import { useState } from 'react'
import { Settings, Palette, User, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { UserProfileDialog } from './UserProfileDialog'
import { ThemeCustomizer } from './ThemeCustomizer'
import { blink } from '../blink/client'

interface UserPanelProps {
  user: any
  userProfile: any
  onProfileUpdate: () => void
}

export function UserPanel({ user, userProfile, onProfileUpdate }: UserPanelProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showThemeDialog, setShowThemeDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="absolute bottom-0 left-18 w-60 h-16 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-3">
      {/* User Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userProfile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(userProfile?.status || 'online')}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {userProfile?.displayName || user.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {userProfile?.status || 'Online'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* Profile Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => setShowProfileDialog(true)}
        >
          <User className="w-4 h-4" />
        </Button>

        {/* Theme Customizer */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => setShowThemeDialog(true)}
        >
          <Palette className="w-4 h-4" />
        </Button>

        {/* Settings Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-gray-800 border-gray-700" align="end" side="top">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setShowProfileDialog(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setShowThemeDialog(true)}
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize Theme
              </Button>
              
              <div className="border-t border-gray-700 my-1" />
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => blink.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dialogs */}
      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        user={user}
        userProfile={userProfile}
        onProfileUpdate={onProfileUpdate}
      />

      <ThemeCustomizer
        open={showThemeDialog}
        onOpenChange={setShowThemeDialog}
        user={user}
      />
    </div>
  )
}