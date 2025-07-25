import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface CreateServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onServerCreated: () => void
}

export function CreateServerDialog({ 
  open, 
  onOpenChange, 
  user, 
  onServerCreated 
}: CreateServerDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    setIconFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeIcon = () => {
    setIconFile(null)
    setIconPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createServer = async () => {
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
      let iconUrl = null

      // Upload icon if provided
      if (iconFile) {
        setUploadProgress(25)
        const { publicUrl } = await blink.storage.upload(
          iconFile,
          `server-icons/${Date.now()}_${iconFile.name}`,
          {
            upsert: true,
            onProgress: (percent) => setUploadProgress(25 + (percent * 0.5))
          }
        )
        iconUrl = publicUrl
      }

      setUploadProgress(75)

      // Create server
      const serverId = `server_${Date.now()}`
      await blink.db.servers.create({
        id: serverId,
        name: name.trim(),
        description: description.trim() || null,
        iconUrl,
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

      setUploadProgress(100)

      toast({
        title: 'Server created!',
        description: `${name} has been created successfully`
      })

      // Reset form
      setName('')
      setDescription('')
      removeIcon()
      onOpenChange(false)
      onServerCreated()

    } catch (error) {
      console.error('Error creating server:', error)
      toast({
        title: 'Failed to create server',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Server</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Server Icon */}
          <div className="space-y-2">
            <Label>Server Icon</Label>
            <div className="flex items-center space-x-4">
              {iconPreview ? (
                <div className="relative">
                  <img 
                    src={iconPreview} 
                    alt="Server icon preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    onClick={removeIcon}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  {iconPreview ? 'Change Icon' : 'Upload Icon'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 512x512px, under 10MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleIconUpload}
            />
          </div>

          {/* Server Name */}
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name *</Label>
            <Input
              id="server-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Server"
              className="bg-gray-700 border-gray-600 text-white"
              disabled={uploading}
            />
          </div>

          {/* Server Description */}
          <div className="space-y-2">
            <Label htmlFor="server-description">Description</Label>
            <Textarea
              id="server-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what your server is about..."
              className="bg-gray-700 border-gray-600 text-white resize-none"
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Creating server...</span>
                <span className="text-gray-400">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={createServer}
              disabled={!name.trim() || uploading}
              className="bg-primary hover:bg-primary/90"
            >
              {uploading ? 'Creating...' : 'Create Server'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}