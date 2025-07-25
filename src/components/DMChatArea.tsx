import React, { useState, useEffect, useRef, useCallback } from 'react'
import { blink } from '../blink/client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Send, Paperclip, Smile, Gift } from 'lucide-react'

interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  sender_name?: string
  sender_avatar?: string
}

interface DMChatAreaProps {
  friendId: string
  friendName: string
}

export function DMChatArea({ friendId, friendName }: DMChatAreaProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      setCurrentUser(user)
      
      const messagesData = await blink.db.direct_messages.list({
        where: {
          OR: [
            { AND: [{ sender_id: user.id }, { recipient_id: friendId }] },
            { AND: [{ sender_id: friendId }, { recipient_id: user.id }] }
          ]
        },
        orderBy: { created_at: 'asc' }
      })
      
      setMessages(messagesData)
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setIsLoading(false)
    }
  }, [friendId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    try {
      const messageData = {
        sender_id: currentUser.id,
        recipient_id: friendId,
        content: newMessage.trim()
      }

      const sentMessage = await blink.db.direct_messages.create(messageData)
      
      setMessages(prev => [...prev, {
        ...sentMessage,
        sender_name: currentUser.displayName || currentUser.email,
        sender_avatar: currentUser.avatar
      }])
      
      setNewMessage('')
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    try {
      const { publicUrl } = await blink.storage.upload(file, `dm-files/${file.name}`, { upsert: true })
      
      const messageData = {
        sender_id: currentUser.id,
        recipient_id: friendId,
        content: `Shared a file: ${file.name}`,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size
      }

      const sentMessage = await blink.db.direct_messages.create(messageData)
      
      setMessages(prev => [...prev, {
        ...sentMessage,
        sender_name: currentUser.displayName || currentUser.email,
        sender_avatar: currentUser.avatar
      }])
      
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [friendId, loadMessages])

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#36393f] flex items-center justify-center">
        <div className="text-[#b9bbbe]">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#36393f] flex flex-col">
      {/* Header */}
      <div className="h-12 bg-[#36393f] border-b border-[#202225] flex items-center px-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#5865f2] text-white text-xs">
              {friendName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-semibold">{friendName}</h3>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-[#b9bbbe] text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarFallback className="bg-[#5865f2] text-white text-2xl">
                  {friendName[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white text-xl font-semibold mb-2">{friendName}</h3>
              <p className="text-[#b9bbbe] text-sm">
                This is the beginning of your direct message history with {friendName}.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.sender_id === currentUser?.id
              const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
              
              return (
                <div key={message.id} className="flex items-start space-x-3">
                  {showAvatar ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.sender_avatar} />
                      <AvatarFallback className="bg-[#5865f2] text-white text-sm">
                        {isCurrentUser ? (currentUser.displayName?.[0] || currentUser.email[0]) : friendName[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10" />
                  )}
                  
                  <div className="flex-1">
                    {showAvatar && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold text-sm">
                          {isCurrentUser ? (currentUser.displayName || currentUser.email) : friendName}
                        </span>
                        <span className="text-[#72767d] text-xs">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-[#dcddde] text-sm leading-relaxed">
                      {message.content}
                      
                      {message.file_url && (
                        <div className="mt-2 p-3 bg-[#2f3136] rounded border-l-4 border-[#5865f2]">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-[#b9bbbe]" />
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00b0f4] hover:underline text-sm"
                            >
                              {message.file_name}
                            </a>
                            {message.file_size && (
                              <span className="text-[#72767d] text-xs">
                                ({(message.file_size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-[#36393f]">
        <div className="flex items-center space-x-3 bg-[#40444b] rounded-lg px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-6 w-6 p-0 text-[#b9bbbe] hover:text-white"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${friendName}`}
            className="flex-1 bg-transparent border-none text-white placeholder:text-[#72767d] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-[#b9bbbe] hover:text-white"
            >
              <Gift className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-[#b9bbbe] hover:text-white"
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="h-6 w-6 p-0 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  )
}