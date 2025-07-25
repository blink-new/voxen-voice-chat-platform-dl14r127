import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { CreateServerDialog } from './CreateServerDialog'
import { ServerSettingsDialog } from './ServerSettingsDialog'
import { VoxenLogo } from './VoxenLogo'

interface ServerSidebarProps {
  servers: any[]
  selectedServer: any
  onSelectServer: (server: any) => void
  user: any
  onServersUpdate: () => void
  onSelectDMs: () => void
  isDMsSelected: boolean
}

export function ServerSidebar({ 
  servers, 
  selectedServer, 
  onSelectServer, 
  user, 
  onServersUpdate,
  onSelectDMs,
  isDMsSelected
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
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer server-icon transition-all duration-200 ${
                  isDMsSelected 
                    ? 'bg-[#5865f2] active' 
                    : 'bg-[#5865f2] hover:bg-[#4752c4]'
                }`}
                onClick={onSelectDMs}
                onMouseEnter={() => setHoveredServer('home')}
                onMouseLeave={() => setHoveredServer(null)}
              >
                <VoxenLogo size={28} color="white" />
              </div>
              
              {/* Discord pill indicator */}
              <div className={`discord-pill ${
                isDMsSelected 
                  ? 'active' 
                  : hoveredServer === 'home' 
                    ? 'hover' 
                    : ''
              }`} />
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