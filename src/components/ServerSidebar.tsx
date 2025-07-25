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

  return (
    <div className="w-18 bg-gray-900 flex flex-col items-center py-3 space-y-2">
      <TooltipProvider>
        {/* Servers */}
        {servers.map((server) => (
          <Tooltip key={server.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar 
                  className={`w-12 h-12 cursor-pointer transition-all duration-200 hover:rounded-2xl ${
                    selectedServer?.id === server.id 
                      ? 'rounded-2xl ring-2 ring-primary' 
                      : 'rounded-3xl hover:rounded-2xl'
                  }`}
                  onClick={() => onSelectServer(server)}
                >
                  <AvatarImage src={server.iconUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {server.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Active indicator */}
                {selectedServer?.id === server.id && (
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{server.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Separator */}
        <div className="w-8 h-0.5 bg-gray-700 rounded-full my-2" />

        {/* Add Server */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-3xl bg-gray-700 hover:bg-primary hover:rounded-2xl transition-all duration-200"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>

        {/* Server Settings */}
        {selectedServer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-3xl bg-gray-700 hover:bg-accent hover:rounded-2xl transition-all duration-200"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
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