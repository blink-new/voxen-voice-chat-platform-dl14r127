import { useState, useEffect, useCallback } from 'react'
import { Palette, Save, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'
import { VoxenLogo } from './VoxenLogo'

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

export function ThemeCustomizer({ open, onOpenChange, user }: ThemeCustomizerProps) {
  const [primaryColor, setPrimaryColor] = useState('#6366F1')
  const [accentColor, setAccentColor] = useState('#8B5CF6')
  const [backgroundColor, setBackgroundColor] = useState('#0F0F23')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const loadUserTheme = useCallback(async () => {
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length > 0 && profiles[0].themeColors) {
        const theme = JSON.parse(profiles[0].themeColors)
        setPrimaryColor(theme.primary || '#6366F1')
        setAccentColor(theme.accent || '#8B5CF6')
        setBackgroundColor(theme.background || '#0F0F23')
      }
    } catch (error) {
      console.error('Error loading user theme:', error)
    }
  }, [user.id])

  useEffect(() => {
    loadUserTheme()
  }, [loadUserTheme])

  const presetThemes = [
    {
      name: 'Voxen Default',
      primary: '#6366F1',
      accent: '#8B5CF6',
      background: '#0F0F23'
    },
    {
      name: 'Ocean Blue',
      primary: '#0EA5E9',
      accent: '#06B6D4',
      background: '#0C1426'
    },
    {
      name: 'Forest Green',
      primary: '#10B981',
      accent: '#34D399',
      background: '#0A1F1A'
    },
    {
      name: 'Sunset Orange',
      primary: '#F97316',
      accent: '#FB923C',
      background: '#1F1611'
    },
    {
      name: 'Royal Purple',
      primary: '#9333EA',
      accent: '#A855F7',
      background: '#1A0F2E'
    },
    {
      name: 'Rose Pink',
      primary: '#E11D48',
      accent: '#F43F5E',
      background: '#2D0A14'
    },
    {
      name: 'Midnight Dark',
      primary: '#6B7280',
      accent: '#9CA3AF',
      background: '#000000'
    },
    {
      name: 'Arctic White',
      primary: '#1F2937',
      accent: '#374151',
      background: '#F9FAFB'
    }
  ]

  const applyPreset = (preset: any) => {
    setPrimaryColor(preset.primary)
    setAccentColor(preset.accent)
    setBackgroundColor(preset.background)
  }

  const resetToDefault = () => {
    setPrimaryColor('#6366F1')
    setAccentColor('#8B5CF6')
    setBackgroundColor('#0F0F23')
  }

  const saveTheme = async () => {
    setSaving(true)
    
    try {
      const themeColors = JSON.stringify({
        primary: primaryColor,
        accent: accentColor,
        background: backgroundColor
      })

      // Check if user profile exists
      const profiles = await blink.db.userProfiles.list({
        where: { userId: user.id },
        limit: 1
      })

      if (profiles.length > 0) {
        await blink.db.userProfiles.update(profiles[0].id, {
          themeColors
        })
      } else {
        await blink.db.userProfiles.create({
          id: `profile_${Date.now()}`,
          userId: user.id,
          displayName: user.email?.split('@')[0] || 'User',
          themeColors
        })
      }

      // Apply theme to CSS variables
      document.documentElement.style.setProperty('--primary', primaryColor)
      document.documentElement.style.setProperty('--accent', accentColor)
      document.documentElement.style.setProperty('--background', backgroundColor)

      toast({
        title: 'Theme saved!',
        description: 'Your custom theme has been applied'
      })

      onOpenChange(false)

    } catch (error) {
      console.error('Error saving theme:', error)
      toast({
        title: 'Failed to save theme',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Customize Theme
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {presetThemes.map((preset) => (
                <div
                  key={preset.name}
                  className="p-4 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-500"
                        style={{ backgroundColor: preset.background }}
                      />
                    </div>
                  </div>
                  <h4 className="font-medium text-white">{preset.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Click to apply this theme
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="#6366F1"
                  />
                </div>
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="#0F0F23"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="p-4 rounded-lg border border-gray-600"
                style={{ backgroundColor: backgroundColor }}
              >
                <div className="space-y-3">
                  {/* Voxen Logo Preview */}
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <VoxenLogo size={28} color="white" />
                    </div>
                    <div className="text-white font-semibold">Voxen Logo</div>
                  </div>
                  
                  <div 
                    className="px-4 py-2 rounded-md text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div 
                    className="px-4 py-2 rounded-md text-white font-medium"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent Button
                  </div>
                  <div className="text-white">
                    Sample text on background
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={resetToDefault}
            disabled={saving}
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={saveTheme}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Theme'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}