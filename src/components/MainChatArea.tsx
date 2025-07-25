import { useState, useEffect, useRef, useCallback } from 'react'
import { Hash, Volume2, Send, Paperclip, Smile, Image, Video, Gift, Sticker, Plus, Bell, Pin, Users, Inbox, HelpCircle } from 'lucide-react'
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
      <div className="flex-1 flex items-center justify-center bg-[#36393f]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#f2f3f5] mb-2">Welcome to Voxen</h3>
          <p className="text-[#b9bbbe]">Select a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#36393f]">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] bg-[#36393f] shadow-sm">
        <div className="flex items-center">
          {channel.type === 'text' ? (
            <Hash className="w-6 h-6 text-[#8e9297] mr-2" />
          ) : (
            <Volume2 className="w-6 h-6 text-[#8e9297] mr-2" />
          )}
          <h3 className="font-semibold text-white text-[16px]">{channel.name}</h3>
          {channel.description && (
            <>
              <div className="w-px h-6 bg-[#4f545c] mx-2" />
              <span className="text-[#72767d] text-[15px]">{channel.description}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="w-6 h-6 text-[#b9bbbe] hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-[#b9bbbe] hover:text-white">
            <Pin className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-[#b9bbbe] hover:text-white">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-[#b9bbbe] hover:text-white">
            <Inbox className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-[#b9bbbe] hover:text-white">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-start">
              <div className="w-16 h-16 bg-[#5865f2] rounded-full flex items-center justify-center mb-4">
                {channel.type === 'text' ? (
                  <Hash className="w-8 h-8 text-white" />
                ) : (
                  <Volume2 className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-[32px] font-bold text-white mb-2">Welcome to #{channel.name}!</h2>
              <p className="text-[#b9bbbe] text-[16px]">
                This is the start of the #{channel.name} channel.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1]
            const showAvatar = !prevMessage || prevMessage.userId !== message.userId
            
            return (
              <div key={message.id} className={`message-item px-4 py-0.5 -mx-4 hover:bg-[#32353b] ${showAvatar ? 'mt-4' : 'mt-0.5'}`}>
                <div className="flex items-start space-x-4">
                  {showAvatar ? (
                    <Avatar className="w-10 h-10 mt-0.5">
                      <AvatarFallback className="bg-[#5865f2] text-white text-[14px] font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <span className="text-[11px] text-[#72767d] opacity-0 hover:opacity-100 transition-opacity">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline space-x-2 mb-0.5">
                        <span className="font-medium text-white text-[16px] hover:underline cursor-pointer">
                          {user.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-[12px] text-[#72767d]">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    {message.content && (
                      <p className="text-[#dcddde] text-[16px] leading-[22px] break-words">
                        {message.content}
                      </p>
                    )}
                    
                    {message.fileUrl && (
                      <div className="mt-2">
                        {message.fileType === 'image' && (
                          <div className="relative inline-block">
                            <img 
                              src={message.fileUrl} 
                              alt="Uploaded image"
                              className="max-w-[400px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {message.fileType === 'video' && (
                          <video 
                            src={message.fileUrl}
                            controls
                            className="max-w-[400px] max-h-[300px] rounded-lg"
                          />
                        )}
                        
                        {message.fileType === 'file' && (
                          <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-4 max-w-[432px]">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-[#5865f2] rounded-lg flex items-center justify-center">
                                <Paperclip className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#00aff4] font-medium text-[16px] truncate hover:underline cursor-pointer">
                                  {message.content.replace('Uploaded ', '')}
                                </p>
                                {message.fileSize && (
                                  <p className="text-[#b9bbbe] text-[14px]">
                                    {formatFileSize(message.fileSize)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Upload Progress */}
      {uploading && (
        <div className="px-4 py-3 bg-[#2f3136] border-t border-[#202225]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] text-[#dcddde]">Uploading file...</span>
                <span className="text-[12px] text-[#b9bbbe]">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channel.name}`}
            className="bg-[#40444b] border-none text-white placeholder-[#72767d] text-[16px] h-11 pl-4 pr-12 rounded-lg focus:ring-0 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={uploading}
          />
          
          {/* Input Actions */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-[#b9bbbe] hover:text-white p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-[#b9bbbe] hover:text-white p-0"
              disabled={uploading}
            >
              <Gift className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-[#b9bbbe] hover:text-white p-0"
              disabled={uploading}
            >
              <Sticker className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-[#b9bbbe] hover:text-white p-0"
              disabled={uploading}
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
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