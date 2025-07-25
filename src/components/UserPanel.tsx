import { useState } from 'react'
import { Settings, Palette, User, LogOut, Mic, MicOff, Headphones, HeadphonesIcon } from 'lucide-react'
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
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-[#23a559]'
      case 'away': return 'bg-[#f0b232]'
      case 'busy': return 'bg-[#f23f42]'
      case 'invisible': return 'bg-[#80848e]'
      default: return 'bg-[#80848e]'
    }
  }

  return (
    <div className="absolute bottom-0 left-[72px] w-60 h-[52px] bg-[#232428] border-t border-[#1e1f22] flex items-center px-2">
      {/* User Info */}
      <div className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer hover:bg-[#35373c] rounded p-1 transition-colors duration-150">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.avatarUrl} />
            <AvatarFallback className="bg-[#5865f2] text-white text-[13px] font-medium">
              {userProfile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#232428] ${getStatusColor(userProfile?.status || 'online')}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#f2f3f5] truncate leading-[18px]">
            {userProfile?.displayName || user.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-[12px] text-[#b5bac1] truncate leading-[16px]">
            #{user.id?.slice(-4) || '0000'}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-1">
        {/* Microphone */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded transition-colors duration-150 ${
            isMuted 
              ? 'bg-[#f23f42] hover:bg-[#d73c3f] text-white' 
              : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1]'
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        {/* Headphones */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded transition-colors duration-150 ${
            isDeafened 
              ? 'bg-[#f23f42] hover:bg-[#d73c3f] text-white' 
              : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1]'
          }`}
          onClick={() => setIsDeafened(!isDeafened)}
        >
          {isDeafened ? <HeadphonesIcon className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Button>

        {/* Settings Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors duration-150"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-[#111214] border-[#1e1f22] shadow-xl" align="end" side="top">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#5865f2] text-[14px] h-8 px-2"
                onClick={() => setShowProfileDialog(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#5865f2] text-[14px] h-8 px-2"
                onClick={() => setShowThemeDialog(true)}
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize Theme
              </Button>
              
              <div className="border-t border-[#3f4147] my-1" />
              
              <Button
                variant="ghost"
                className="w-full justify-start text-[#f23f42] hover:text-[#f23f42] hover:bg-[#f23f42]/10 text-[14px] h-8 px-2"
                onClick={() => blink.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
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