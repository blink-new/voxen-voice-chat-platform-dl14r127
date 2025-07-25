import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { CreateServerDialog } from './CreateServerDialog'
import { ServerSettingsDialog } from './ServerSettingsDialog'

interface ServerSidebarProps {
  servers: any[]
  selectedServer: any
  onSelectServer: (server: any) => void
  user: any
  onServersUpdate: () => void
}

export function ServerSidebar({ 
  servers, 
  selectedServer, 
  onSelectServer, 
  user, 
  onServersUpdate 
}: ServerSidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [hoveredServer, setHoveredServer] = useState<string | null>(null)

  return (
    <div className="w-[72px] bg-[#202225] flex flex-col items-center py-3 space-y-2 relative">
      <TooltipProvider>
        {/* Home/DM Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative group">
              <div 
                className="w-12 h-12 bg-[#5865f2] rounded-full flex items-center justify-center cursor-pointer server-icon group-hover:bg-[#4752c4] transition-all duration-200"
                onMouseEnter={() => setHoveredServer('home')}
                onMouseLeave={() => setHoveredServer(null)}
              >
                <svg width="28" height="20" viewBox="0 0 28 20" className="fill-white">
                  <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.8242 0.934541 10.5929 0.461744 10.3407 0C8.49004 0.319149 6.68578 0.880111 4.97484 1.67671C1.56662 6.73743 0.649666 11.6851 1.11108 16.5586C3.10102 17.9952 5.3262 19.0429 7.67493 19.6562C8.21672 18.9415 8.69934 18.1833 9.11108 17.3855C8.31466 17.1041 7.55314 16.7564 6.83671 16.3516C7.03134 16.2179 7.22598 16.0787 7.41394 15.9316C11.2599 17.7478 15.4994 17.7478 19.2972 15.9316C19.4852 16.0787 19.6798 16.2179 19.8745 16.3516C19.1581 16.7564 18.3966 17.1041 17.6001 17.3855C18.0119 18.1833 18.4945 18.9415 19.0363 19.6562C21.3851 19.0429 23.6103 17.9952 25.6002 16.5586C26.1403 10.9411 24.7963 6.04702 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.9939C7.34085 9.54254 8.37155 8.34952 9.68041 8.34952C10.9893 8.34952 12.0395 9.54254 12.0199 10.9939C12.0199 12.4453 10.9893 13.6383 9.68041 13.6383ZM17.9403 13.6383C16.6574 13.6383 15.6007 12.4453 15.6007 10.9939C15.6007 9.54254 16.6314 8.34952 17.9403 8.34952C19.2492 8.34952 20.2994 9.54254 20.2798 10.9939C20.2798 12.4453 19.2492 13.6383 17.9403 13.6383Z"/>
                </svg>
              </div>
              
              {/* Discord pill indicator */}
              <div className={`discord-pill ${hoveredServer === 'home' ? 'hover' : ''}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#18191c] text-white border-none">
            <p>Direct Messages</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-[#4f545c] rounded-full my-2" />

        {/* Servers */}
        {servers.map((server) => (
          <Tooltip key={server.id}>
            <TooltipTrigger asChild>
              <div className="relative group">
                <Avatar 
                  className={`w-12 h-12 cursor-pointer server-icon transition-all duration-200 ${
                    selectedServer?.id === server.id 
                      ? 'active' 
                      : ''
                  }`}
                  onClick={() => onSelectServer(server)}
                  onMouseEnter={() => setHoveredServer(server.id)}
                  onMouseLeave={() => setHoveredServer(null)}
                >
                  <AvatarImage src={server.iconUrl} />
                  <AvatarFallback className="bg-[#5865f2] text-white font-semibold text-lg">
                    {server.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Discord pill indicator */}
                <div className={`discord-pill ${
                  selectedServer?.id === server.id 
                    ? 'active' 
                    : hoveredServer === server.id 
                      ? 'hover' 
                      : ''
                }`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#18191c] text-white border-none">
              <p>{server.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Add Server */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 server-icon bg-[#36393f] hover:bg-[#3ba55c] text-[#3ba55c] hover:text-white transition-all duration-200 border-2 border-dashed border-[#3ba55c] hover:border-[#3ba55c]"
                onClick={() => setShowCreateDialog(true)}
                onMouseEnter={() => setHoveredServer('add')}
                onMouseLeave={() => setHoveredServer(null)}
              >
                <Plus className="w-6 h-6" />
              </Button>
              
              {/* Discord pill indicator */}
              <div className={`discord-pill ${hoveredServer === 'add' ? 'hover' : ''}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#18191c] text-white border-none">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>

        {/* Server Settings */}
        {selectedServer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 server-icon bg-[#36393f] hover:bg-[#5865f2] text-[#b9bbbe] hover:text-white transition-all duration-200"
                  onClick={() => setShowSettingsDialog(true)}
                  onMouseEnter={() => setHoveredServer('settings')}
                  onMouseLeave={() => setHoveredServer(null)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                
                {/* Discord pill indicator */}
                <div className={`discord-pill ${hoveredServer === 'settings' ? 'hover' : ''}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#18191c] text-white border-none">
              <p>Server Settings</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>

      {/* Dialogs */}
      <CreateServerDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        user={user}
        onServerCreated={onServersUpdate}
      />

      <ServerSettingsDialog 
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        server={selectedServer}
        user={user}
        onServerUpdated={onServersUpdate}
      />
    </div>
  )
}