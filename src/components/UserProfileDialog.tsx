import { useState, useRef, useEffect } from 'react'
import { Upload, X, Save, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  userProfile: any
  onProfileUpdate: () => void
}

export function UserProfileDialog({ 
  open, 
  onOpenChange, 
  user, 
  userProfile, 
  onProfileUpdate 
}: UserProfileDialogProps) {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState('online')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '')
      setBio(userProfile.bio || '')
      setStatus(userProfile.status || 'online')
      setAvatarPreview(userProfile.avatarUrl || null)
      setBackgroundPreview(userProfile.backgroundUrl || null)
    } else if (user) {
      setDisplayName(user.email?.split('@')[0] || '')
    }
  }, [userProfile, user])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Profile pictures must be under 10MB',
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

    setAvatarFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (100MB limit)
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

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  const removeBackground = () => {
    setBackgroundFile(null)
    setBackgroundPreview(null)
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = ''
    }
  }

  const saveProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Display name required',
        description: 'Please enter a display name',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let avatarUrl = userProfile?.avatarUrl || null
      let backgroundUrl = userProfile?.backgroundUrl || null

      // Upload new avatar if provided
      if (avatarFile) {
        setUploadProgress(20)
        const { publicUrl } = await blink.storage.upload(
          avatarFile,
          `avatars/${user.id}_${avatarFile.name}`,
          {
            upsert: true,
            onProgress: (percent) => setUploadProgress(20 + (percent * 0.3))
          }
        )
        avatarUrl = publicUrl
      }

      // Upload new background if provided
      if (backgroundFile) {
        setUploadProgress(50)
        const { publicUrl } = await blink.storage.upload(
          backgroundFile,
          `profile-backgrounds/${user.id}_${backgroundFile.name}`,
          {
            upsert: true,
            onProgress: (percent) => setUploadProgress(50 + (percent * 0.4))
          }
        )
        backgroundUrl = publicUrl
      }

      setUploadProgress(90)

      // Update or create profile
      if (userProfile) {
        await blink.db.userProfiles.update(userProfile.id, {
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          status,
          avatarUrl,
          backgroundUrl
        })
      } else {
        await blink.db.userProfiles.create({
          id: `profile_${Date.now()}`,
          userId: user.id,
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          status,
          avatarUrl,
          backgroundUrl
        })
      }

      setUploadProgress(100)

      toast({
        title: 'Profile updated!',
        description: 'Your profile has been saved successfully'
      })

      onProfileUpdate()
      onOpenChange(false)

    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Failed to save profile',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Background */}
          <div className="space-y-2">
            <Label>Profile Background</Label>
            <div className="relative">
              {backgroundPreview ? (
                <div className="relative">
                  {backgroundFile?.type.startsWith('video/') || userProfile?.backgroundUrl?.includes('.mp4') ? (
                    <video 
                      src={backgroundPreview} 
                      className="w-full h-24 object-cover rounded-lg"
                      muted
                      loop
                      autoPlay
                    />
                  ) : (
                    <img 
                      src={backgroundPreview} 
                      alt="Profile background"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    onClick={removeBackground}
                    disabled={uploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => backgroundInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                {backgroundPreview ? 'Change Background' : 'Upload Background'}
              </Button>
              <p className="text-xs text-gray-400 mt-1">
                Images or videos up to 100MB
              </p>
            </div>
            <input
              ref={backgroundInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleBackgroundUpload}
            />
          </div>

          {/* Profile Avatar */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {displayName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-800 ${getStatusColor(status)}`} />
                {avatarPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 256x256px, under 10MB
                </p>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name *</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              disabled={uploading}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={uploading}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="online">🟢 Online</SelectItem>
                <SelectItem value="away">🟡 Away</SelectItem>
                <SelectItem value="busy">🔴 Busy</SelectItem>
                <SelectItem value="offline">⚫ Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="bg-gray-700 border-gray-600 text-white resize-none"
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Saving profile...</span>
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
              onClick={saveProfile}
              disabled={!displayName.trim() || uploading}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {uploading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}