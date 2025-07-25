import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { UserPlus, MessageCircle, Check, X, Search } from 'lucide-react'

interface Friend {
  id: string
  user_id: string
  friend_user_id: string
  status: string
  friend_name?: string
  friend_avatar?: string
  last_message?: string
  unread_count?: number
}

interface DMsSidebarProps {
  onSelectDM: (friendId: string, friendName: string) => void
  selectedDM?: string
}

export function DMsSidebar({ onSelectDM, selectedDM }: DMsSidebarProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [isAddingFriend, setIsAddingFriend] = useState(false)

  const loadFriends = async () => {
    try {
      const user = await blink.auth.me()
      const friendsData = await blink.db.friends.list({
        where: {
          AND: [
            { user_id: user.id },
            { status: 'accepted' }
          ]
        }
      })
      setFriends(friendsData)
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const user = await blink.auth.me()
      const pendingData = await blink.db.friends.list({
        where: {
          AND: [
            { friend_user_id: user.id },
            { status: 'pending' }
          ]
        }
      })
      setPendingRequests(pendingData)
    } catch (error) {
      console.error('Failed to load pending requests:', error)
    }
  }

  const sendFriendRequest = async () => {
    if (!friendEmail.trim()) return
    
    setIsAddingFriend(true)
    try {
      const user = await blink.auth.me()
      
      // For demo purposes, we'll create a mock friend request
      await blink.db.friends.create({
        user_id: user.id,
        friend_user_id: `user_${Date.now()}`, // Mock friend ID
        status: 'pending'
      })
      
      setFriendEmail('')
      alert('Friend request sent!')
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request')
    } finally {
      setIsAddingFriend(false)
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await blink.db.friends.update(requestId, { status: 'accepted' })
      loadFriends()
      loadPendingRequests()
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await blink.db.friends.delete(requestId)
      loadPendingRequests()
    } catch (error) {
      console.error('Failed to reject friend request:', error)
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.friend_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
  }, [])

  return (
    <div className="w-60 bg-[#2f3136] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#202225]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Direct Messages</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-[#b9bbbe] hover:text-white">
                <UserPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#36393f] border-[#202225]">
              <DialogHeader>
                <DialogTitle className="text-white">Add Friend</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#2f3136]">
                  <TabsTrigger value="add" className="text-[#b9bbbe] data-[state=active]:text-white">Add Friend</TabsTrigger>
                  <TabsTrigger value="pending" className="text-[#b9bbbe] data-[state=active]:text-white">
                    Pending {pendingRequests.length > 0 && <Badge className="ml-1 bg-[#5865f2]">{pendingRequests.length}</Badge>}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="add" className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter friend's email"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="bg-[#202225] border-[#202225] text-white placeholder:text-[#72767d]"
                    />
                    <Button 
                      onClick={sendFriendRequest}
                      disabled={isAddingFriend || !friendEmail.trim()}
                      className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
                    >
                      {isAddingFriend ? 'Sending...' : 'Send Friend Request'}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="pending" className="space-y-2">
                  {pendingRequests.length === 0 ? (
                    <p className="text-[#b9bbbe] text-sm text-center py-4">No pending requests</p>
                  ) : (
                    pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-[#2f3136] rounded">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#5865f2] text-white text-xs">
                              {request.friend_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{request.friend_name || 'Unknown User'}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => acceptFriendRequest(request.id)}
                            className="h-6 w-6 p-0 text-green-500 hover:text-green-400"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectFriendRequest(request.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#72767d]" />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#202225] border-[#202225] text-white placeholder:text-[#72767d] h-8"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-12 w-12 text-[#72767d] mx-auto mb-2" />
            <p className="text-[#b9bbbe] text-sm">No conversations yet</p>
            <p className="text-[#72767d] text-xs mt-1">Add friends to start chatting!</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onSelectDM(friend.friend_user_id, friend.friend_name || 'Unknown User')}
                className={`w-full flex items-center space-x-3 p-2 rounded hover:bg-[#393c43] transition-colors ${
                  selectedDM === friend.friend_user_id ? 'bg-[#393c43]' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.friend_avatar} />
                    <AvatarFallback className="bg-[#5865f2] text-white text-xs">
                      {friend.friend_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-[#2f3136] rounded-full"></div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{friend.friend_name || 'Unknown User'}</p>
                  {friend.last_message && (
                    <p className="text-[#b9bbbe] text-xs truncate">{friend.last_message}</p>
                  )}
                </div>
                {friend.unread_count && friend.unread_count > 0 && (
                  <Badge className="bg-[#f23f42] text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                    {friend.unread_count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}