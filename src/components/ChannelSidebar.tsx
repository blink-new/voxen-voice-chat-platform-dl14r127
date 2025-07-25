import { useState } from 'react'
import { Hash, Volume2, Plus, ChevronDown, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

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
      <div className="w-60 bg-gray-800 flex items-center justify-center">
        <p className="text-gray-400">Select a server</p>
      </div>
    )
  }

  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')

  return (
    <div className="w-60 bg-gray-800 flex flex-col">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700 shadow-sm">
        <h2 className="font-semibold text-white truncate">{server.name}</h2>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Text Channels */}
          <Collapsible open={textChannelsOpen} onOpenChange={setTextChannelsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-2 py-1 h-8 text-xs font-semibold text-gray-400 hover:text-gray-300"
              >
                <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${textChannelsOpen ? '' : '-rotate-90'}`} />
                TEXT CHANNELS
                <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {textChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-8 text-gray-300 hover:text-white hover:bg-gray-700 ${
                    selectedChannel?.id === channel.id ? 'bg-gray-700 text-white' : ''
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {channel.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Voice Channels */}
          <Collapsible open={voiceChannelsOpen} onOpenChange={setVoiceChannelsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-2 py-1 h-8 text-xs font-semibold text-gray-400 hover:text-gray-300"
              >
                <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${voiceChannelsOpen ? '' : '-rotate-90'}`} />
                VOICE CHANNELS
                <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {voiceChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1 h-8 text-gray-300 hover:text-white hover:bg-gray-700 ${
                    selectedChannel?.id === channel.id ? 'bg-gray-700 text-white' : ''
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {channel.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}