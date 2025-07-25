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
    <div className="h-[52px] bg-[#232428] border-t border-[#1e1f22] flex items-center justify-between px-2">
      {/* Voice Status */}
      <div className="flex items-center space-x-2 flex-1">
        <div className="flex items-center space-x-2 text-sm text-[#b5bac1]">
          <div className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse" />
          <span className="text-[13px]">Voice Connected</span>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center space-x-2">
        {/* Microphone */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded-md transition-colors duration-150 ${
            isMuted 
              ? 'bg-[#f23f42] hover:bg-[#d73c3f] text-white' 
              : 'bg-[#4e5058] hover:bg-[#6d6f78] text-[#b5bac1]'
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        {/* Headphones */}
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded-md transition-colors duration-150 ${
            isDeafened 
              ? 'bg-[#f23f42] hover:bg-[#d73c3f] text-white' 
              : 'bg-[#4e5058] hover:bg-[#6d6f78] text-[#b5bac1]'
          }`}
          onClick={() => setIsDeafened(!isDeafened)}
        >
          {isDeafened ? <HeadphonesIcon className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Button>

        {/* Voice Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-md bg-[#4e5058] hover:bg-[#6d6f78] text-[#b5bac1] transition-colors duration-150"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#2b2d31] border-[#1e1f22] shadow-xl" side="top">
            <div className="space-y-4">
              <h4 className="font-semibold text-[#f2f3f5] text-[16px]">Voice Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#b5bac1] uppercase tracking-wide">Input Volume</label>
                  <div className="mt-2">
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-[#87898c] mt-1">
                      <span>0%</span>
                      <span>{volume[0]}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#b5bac1] uppercase tracking-wide">Output Volume</label>
                  <div className="mt-2">
                    <Slider
                      value={[80]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-[#87898c] mt-1">
                      <span>0%</span>
                      <span>80%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3f4147]">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-[#4e5058] border-[#6d6f78] text-[#f2f3f5] hover:bg-[#6d6f78] text-[14px] h-8"
                >
                  Open Voice Settings
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Disconnect */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-md bg-[#4e5058] hover:bg-[#f23f42] text-[#b5bac1] hover:text-white transition-colors duration-150"
        >
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>

      {/* Voice Quality Indicator */}
      <div className="flex items-center space-x-2 flex-1 justify-end">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5 items-end">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-full transition-colors duration-150 ${
                  bar <= 4 ? 'bg-[#23a559]' : 'bg-[#4e5058]'
                }`}
                style={{ height: `${bar * 2 + 4}px` }}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#87898c] font-medium">Good</span>
        </div>
      </div>
    </div>
  )
}