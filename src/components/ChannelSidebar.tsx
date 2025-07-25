import { useState } from 'react'
import { Hash, Volume2, Plus, ChevronDown, Settings, UserPlus, Bell, Pin, Users, Inbox } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Separator } from './ui/separator'

interface ChannelSidebarProps {
  server: any
  channels: any[]
  selectedChannel: any
  onSelectChannel: (channel: any) => void
  onChannelsUpdate: () => void
}

export function ChannelSidebar({ 
  server, 
  channels, 
  selectedChannel, 
  onSelectChannel,
  onChannelsUpdate 
}: ChannelSidebarProps) {
  const [textChannelsOpen, setTextChannelsOpen] = useState(true)
  const [voiceChannelsOpen, setVoiceChannelsOpen] = useState(true)

  if (!server) {
    return (
      <div className="w-60 bg-[#2f3136] flex items-center justify-center">
        <p className="text-[#72767d]">Select a server</p>
      </div>
    )
  }

  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')

  return (
    <div className="w-60 bg-[#2f3136] flex flex-col">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-md hover:bg-[#36393f] transition-colors duration-150 cursor-pointer">
        <h2 className="font-semibold text-white truncate text-[15px]">{server.name}</h2>
        <ChevronDown className="w-4 h-4 text-[#b9bbbe]" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* Text Channels */}
          <Collapsible open={textChannelsOpen} onOpenChange={setTextChannelsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-2 py-1.5 h-7 text-xs font-semibold text-[#8e9297] hover:text-[#dcddde] hover:bg-transparent group"
              >
                <ChevronDown className={`w-3 h-3 mr-1 transition-transform duration-150 ${textChannelsOpen ? '' : '-rotate-90'}`} />
                TEXT CHANNELS
                <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {textChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1.5 h-8 text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] rounded channel-item group ${
                    selectedChannel?.id === channel.id ? 'bg-[#393c43] text-white active' : ''
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-[15px]">{channel.name}</span>
                  <div className="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <UserPlus className="w-4 h-4" />
                    <Settings className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Voice Channels */}
          <Collapsible open={voiceChannelsOpen} onOpenChange={setVoiceChannelsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-2 py-1.5 h-7 text-xs font-semibold text-[#8e9297] hover:text-[#dcddde] hover:bg-transparent group mt-4"
              >
                <ChevronDown className={`w-3 h-3 mr-1 transition-transform duration-150 ${voiceChannelsOpen ? '' : '-rotate-90'}`} />
                VOICE CHANNELS
                <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {voiceChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1.5 h-8 text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] rounded channel-item group ${
                    selectedChannel?.id === channel.id ? 'bg-[#393c43] text-white active' : ''
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-[15px]">{channel.name}</span>
                  <div className="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <UserPlus className="w-4 h-4" />
                    <Settings className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}