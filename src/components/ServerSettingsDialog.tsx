import { useState, useRef, useEffect } from 'react'
import { Upload, X, Trash2, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface ServerSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server: any
  user: any
  onServerUpdated: () => void
}

export function ServerSettingsDialog({ 
  open, 
  onOpenChange, 
  server, 
  user, 
  onServerUpdated 
}: ServerSettingsDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (server) {
      setName(server.name || '')
      setDescription(server.description || '')
      setIconPreview(server.iconUrl || null)
      setBackgroundPreview(server.backgroundUrl || null)
    }
  }, [server])

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit for icons)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Server icons must be under 10MB',
        variant: 'destructive'
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    setIconFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (100MB limit for backgrounds)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Background images must be under 100MB',
        variant: 'destructive'
      })
      return
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image or video file',
        variant: 'destructive'
      })
      return
    }

    setBackgroundFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setBackgroundPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeIcon = () => {
    setIconFile(null)
    setIconPreview(null)
    if (iconInputRef.current) {
      iconInputRef.current.value = ''
    }
  }

  const removeBackground = () => {
    setBackgroundFile(null)
    setBackgroundPreview(null)
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = ''
    }
  }

  const saveSettings = async () => {
    if (!name.trim()) {
      toast({
        title: 'Server name required',
        description: 'Please enter a name for your server',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let iconUrl = server.iconUrl
      let backgroundUrl = server.backgroundUrl

      // Upload new icon if provided
      if (iconFile) {
        setUploadProgress(20)
        const { publicUrl } = await blink.storage.upload(
          iconFile,
          `server-icons/${server.id}_${iconFile.name}`,
          {
            upsert: true,
            onProgress: (percent) => setUploadProgress(20 + (percent * 0.3))
          }
        )
        iconUrl = publicUrl
      }

      // Upload new background if provided
      if (backgroundFile) {
        setUploadProgress(50)
        const { publicUrl } = await blink.storage.upload(
          backgroundFile,
          `server-backgrounds/${server.id}_${backgroundFile.name}`,
          {
            upsert: true,
            onProgress: (percent) => setUploadProgress(50 + (percent * 0.4))
          }
        )
        backgroundUrl = publicUrl
      }

      setUploadProgress(90)

      // Update server
      await blink.db.servers.update(server.id, {
        name: name.trim(),
        description: description.trim() || null,
        iconUrl,
        backgroundUrl
      })

      setUploadProgress(100)

      toast({
        title: 'Settings saved!',
        description: 'Server settings have been updated'
      })

      onServerUpdated()
      onOpenChange(false)

    } catch (error) {
      console.error('Error updating server:', error)
      toast({
        title: 'Failed to save settings',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  if (!server) return null

  const isOwner = server.ownerId === user.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Server Settings - {server.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {/* Server Name */}
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                disabled={uploading || !isOwner}
              />
            </div>

            {/* Server Description */}
            <div className="space-y-2">
              <Label htmlFor="server-description">Description</Label>
              <Textarea
                id="server-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={3}
                disabled={uploading || !isOwner}
              />
            </div>

            {/* Server Icon */}
            <div className="space-y-2">
              <Label>Server Icon</Label>
              <div className="flex items-center space-x-4">
                {iconPreview ? (
                  <div className="relative">
                    <img 
                      src={iconPreview} 
                      alt="Server icon"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        onClick={removeIcon}
                        disabled={uploading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                {isOwner && (
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      {iconPreview ? 'Change Icon' : 'Upload Icon'}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended: 512x512px, under 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={iconInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleIconUpload}
              />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            {/* Background Image/Video */}
            <div className="space-y-2">
              <Label>Server Background</Label>
              <div className="space-y-4">
                {backgroundPreview && (
                  <div className="relative">
                    {backgroundFile?.type.startsWith('video/') || server.backgroundUrl?.includes('.mp4') ? (
                      <video 
                        src={backgroundPreview} 
                        className="w-full h-32 object-cover rounded-lg"
                        muted
                        loop
                        autoPlay
                      />
                    ) : (
                      <img 
                        src={backgroundPreview} 
                        alt="Server background"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        onClick={removeBackground}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
                
                {isOwner && (
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => backgroundInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      {backgroundPreview ? 'Change Background' : 'Upload Background'}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">
                      Images or videos up to 100MB. Recommended: 1920x1080px
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={backgroundInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleBackgroundUpload}
              />
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-400">Member management coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Saving settings...</span>
              <span className="text-gray-400">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Actions */}
        {isOwner && (
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!name.trim() || uploading}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {uploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}