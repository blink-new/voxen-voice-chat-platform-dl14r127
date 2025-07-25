import { useState, useEffect, useRef, useCallback } from 'react'
import { Hash, Volume2, Send, Paperclip, Smile, Image, Video } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface MainChatAreaProps {
  channel: any
  server: any
  user: any
}

export function MainChatArea({ channel, server, user }: MainChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
    if (!channel) return
    
    try {
      const messageList = await blink.db.messages.list({
        where: { channelId: channel.id },
        orderBy: { createdAt: 'asc' },
        limit: 100
      })
      setMessages(messageList)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [channel])

  const sendMessage = async () => {
    if (!newMessage.trim() || !channel) return

    try {
      const message = await blink.db.messages.create({
        id: `msg_${Date.now()}`,
        channelId: channel.id,
        userId: user.id,
        content: newMessage.trim()
      })

      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    if (channel) {
      loadMessages()
    }
  }, [channel, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !channel) return

    // Check file size (600MB limit)
    const maxSize = 600 * 1024 * 1024 // 600MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Files must be under 600MB',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `uploads/${channel.id}/${file.name}`,
        {
          upsert: true,
          onProgress: (percent) => setUploadProgress(percent)
        }
      )

      // Determine file type
      let fileType = 'file'
      if (file.type.startsWith('image/')) fileType = 'image'
      else if (file.type.startsWith('video/')) fileType = 'video'

      const message = await blink.db.messages.create({
        id: `msg_${Date.now()}`,
        channelId: channel.id,
        userId: user.id,
        content: `Uploaded ${file.name}`,
        fileUrl: publicUrl,
        fileType,
        fileSize: file.size
      })

      setMessages(prev => [...prev, message])
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-700">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Welcome to Voxen</h3>
          <p className="text-gray-400">Select a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-700">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center border-b border-gray-600 bg-gray-800">
        {channel.type === 'text' ? (
          <Hash className="w-5 h-5 text-gray-400 mr-2" />
        ) : (
          <Volume2 className="w-5 h-5 text-gray-400 mr-2" />
        )}
        <h3 className="font-semibold text-white">{channel.name}</h3>
        {channel.description && (
          <span className="text-gray-400 text-sm ml-2">— {channel.description}</span>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                
                {message.content && (
                  <p className="text-gray-300 mt-1">{message.content}</p>
                )}
                
                {message.fileUrl && (
                  <div className="mt-2">
                    {message.fileType === 'image' && (
                      <img 
                        src={message.fileUrl} 
                        alt="Uploaded image"
                        className="max-w-md max-h-96 rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(message.fileUrl, '_blank')}
                      />
                    )}
                    
                    {message.fileType === 'video' && (
                      <video 
                        src={message.fileUrl}
                        controls
                        className="max-w-md max-h-96 rounded-lg"
                      />
                    )}
                    
                    {message.fileType === 'file' && (
                      <div className="bg-gray-600 rounded-lg p-3 max-w-md">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium truncate">
                            {message.content.replace('Uploaded ', '')}
                          </span>
                        </div>
                        {message.fileSize && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatFileSize(message.fileSize)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Upload Progress */}
      {uploading && (
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Uploading...</span>
            <Progress value={uploadProgress} className="flex-1" />
            <span className="text-sm text-gray-400">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${channel.name}`}
              className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 pr-20"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={uploading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-white"
                disabled={uploading}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || uploading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,*/*"
        />
      </div>
    </div>
  )
}