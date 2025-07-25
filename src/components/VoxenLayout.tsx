import { useState, useEffect, useCallback } from 'react'
import { ServerSidebar } from './ServerSidebar'
import { ChannelSidebar } from './ChannelSidebar'
import { MainChatArea } from './MainChatArea'
import { MemberList } from './MemberList'
import { VoiceControls } from './VoiceControls'
import { UserPanel } from './UserPanel'
import { DMsSidebar } from './DMsSidebar'
import { DMChatArea } from './DMChatArea'
import { blink } from '../blink/client'

interface VoxenLayoutProps {
  user: any
}

export function VoxenLayout({ user }: VoxenLayoutProps) {
  const [selectedServer, setSelectedServer] = useState<any>(null)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [servers, setServers] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isDMsSelected, setIsDMsSelected] = useState(false)
  const [selectedDM, setSelectedDM] = useState<string>('')
  const [selectedDMName, setSelectedDMName] = useState<string>('')

  // Load and apply user theme on startup
  const loadAndApplyTheme = useCallback(async () => {
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length > 0 && profiles[0].themeColors) {
        const theme = JSON.parse(profiles[0].themeColors)
        // Apply theme to CSS variables
        document.documentElement.style.setProperty('--theme-primary', theme.primary || '#6366F1')
        document.documentElement.style.setProperty('--theme-accent', theme.accent || '#8B5CF6')
        document.documentElement.style.setProperty('--theme-background', theme.background || '#0F0F23')
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    }
  }, [user.id])

  const createDefaultServer = useCallback(async () => {
    try {
      const serverId = `server_${Date.now()}`
      const server = await blink.db.servers.create({
        id: serverId,
        name: 'My First Server',
        description: 'Welcome to Voxen!',
        ownerId: user.id,
        themeColors: JSON.stringify({
          primary: '#6366F1',
          accent: '#8B5CF6',
          background: '#0F0F23'
        })
      })

      // Add user as owner
      await blink.db.serverMembers.create({
        id: `member_${Date.now()}`,
        serverId: serverId,
        userId: user.id,
        role: 'owner'
      })

      // Create default channels
      await blink.db.channels.create({
        id: `channel_${Date.now()}_general`,
        serverId: serverId,
        name: 'general',
        type: 'text',
        position: 0
      })

      await blink.db.channels.create({
        id: `channel_${Date.now()}_voice`,
        serverId: serverId,
        name: 'General Voice',
        type: 'voice',
        position: 1
      })

      setServers([server])
      setSelectedServer(server)
    } catch (error) {
      console.error('Error creating default server:', error)
    }
  }, [user.id])

  const loadUserProfile = useCallback(async () => {
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length === 0) {
        // Create default profile
        const newProfile = await blink.db.userProfiles.create({
          id: `profile_${Date.now()}`,
          userId: user.id,
          displayName: user.email?.split('@')[0] || 'User',
          status: 'online'
        })
        setUserProfile(newProfile)
      } else {
        setUserProfile(profiles[0])
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [user.id, user.email])

  const loadServers = useCallback(async () => {
    try {
      // Load servers where user is a member
      const memberServers = await blink.db.serverMembers.list({
        where: { userId: user.id }
      })
      
      if (memberServers.length > 0) {
        const serverIds = memberServers.map(m => m.serverId)
        const serverList = await blink.db.servers.list({
          where: { id: { in: serverIds } }
        })
        setServers(serverList)
        
        if (serverList.length > 0 && !selectedServer) {
          setSelectedServer(serverList[0])
        }
      } else {
        // Create a default server for new users
        await createDefaultServer()
      }
    } catch (error) {
      console.error('Error loading servers:', error)
    }
  }, [user.id, selectedServer, createDefaultServer])

  const loadChannels = useCallback(async (serverId: string) => {
    try {
      const channelList = await blink.db.channels.list({
        where: { serverId },
        orderBy: { position: 'asc' }
      })
      setChannels(channelList)
      
      if (channelList.length > 0 && !selectedChannel) {
        setSelectedChannel(channelList[0])
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }, [selectedChannel])

  useEffect(() => {
    loadAndApplyTheme()
    loadUserProfile()
    loadServers()
  }, [loadAndApplyTheme, loadUserProfile, loadServers])

  useEffect(() => {
    if (selectedServer) {
      loadChannels(selectedServer.id)
    }
  }, [selectedServer, loadChannels])

  const handleSelectDMs = () => {
    console.log('Switching to DMs')
    setIsDMsSelected(true)
    setSelectedServer(null)
    setSelectedChannel(null)
    setSelectedDM('')
    setSelectedDMName('')
  }

  const handleSelectServer = (server: any) => {
    console.log('Switching to server:', server.name)
    setIsDMsSelected(false)
    setSelectedDM('')
    setSelectedDMName('')
    setSelectedServer(server)
    // Don't clear selectedChannel here - let it load from the server
  }

  const handleSelectDM = (friendId: string, friendName: string) => {
    setSelectedDM(friendId)
    setSelectedDMName(friendName)
  }

  return (
    <div className="h-screen flex bg-[#36393f] text-[#dcddde] relative">
      {/* Server Sidebar */}
      <ServerSidebar 
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={handleSelectServer}
        user={user}
        onServersUpdate={loadServers}
        onSelectDMs={handleSelectDMs}
        isDMsSelected={isDMsSelected}
      />
      
      {/* Channel/DMs Sidebar */}
      {isDMsSelected ? (
        <DMsSidebar 
          onSelectDM={handleSelectDM}
          selectedDM={selectedDM}
        />
      ) : (
        <ChannelSidebar 
          server={selectedServer}
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          onChannelsUpdate={() => selectedServer && loadChannels(selectedServer.id)}
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {isDMsSelected && selectedDM ? (
            <DMChatArea 
              friendId={selectedDM}
              friendName={selectedDMName}
            />
          ) : (
            <MainChatArea 
              channel={selectedChannel}
              server={selectedServer}
              user={user}
            />
          )}
        </div>
        
        {/* Member List - Only show for servers, not DMs */}
        {!isDMsSelected && (
          <MemberList 
            server={selectedServer}
            user={user}
          />
        )}
      </div>
      
      {/* Voice Controls - Fixed at bottom */}
      <div className="absolute bottom-0 left-[332px] right-0">
        <VoiceControls user={user} />
      </div>
      
      {/* User Panel - Fixed at bottom left */}
      <UserPanel 
        user={user}
        userProfile={userProfile}
        onProfileUpdate={loadUserProfile}
      />
    </div>
  )
}