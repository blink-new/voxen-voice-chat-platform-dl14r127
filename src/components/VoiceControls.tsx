import { useState } from 'react'
import { Mic, MicOff, Headphones, HeadphonesIcon, Settings, PhoneOff } from 'lucide-react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface VoiceControlsProps {
  user: any
}

export function VoiceControls({ user }: VoiceControlsProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [volume, setVolume] = useState([100])

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-4">
      {/* Voice Status */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Connected to voice</span>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center space-x-2">
        {/* Microphone */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-full ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        {/* Headphones */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-full ${
            isDeafened 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          onClick={() => setIsDeafened(!isDeafened)}
        >
          {isDeafened ? <HeadphonesIcon className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
        </Button>

        {/* Voice Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-800 border-gray-700">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Voice Settings</h4>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Input Volume</label>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>{volume[0]}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Output Volume</label>
                <Slider
                  value={[80]}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="pt-2 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  Advanced Settings
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Disconnect */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Voice Quality Indicator */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-full ${
                  bar <= 4 ? 'bg-green-500' : 'bg-gray-600'
                }`}
                style={{ height: `${bar * 3 + 6}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">Good</span>
        </div>
      </div>
    </div>
  )
}