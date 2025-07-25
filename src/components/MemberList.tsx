import { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface MemberListProps {
  server: any
  user: any
}

export function MemberList({ server, user }: MemberListProps) {
  const [members, setMembers] = useState<any[]>([])

  const loadMembers = useCallback(async () => {
    if (!server) return

    try {
      const memberList = await blink.db.serverMembers.list({
        where: { serverId: server.id }
      })
      setMembers(memberList)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }, [server])

  useEffect(() => {
    if (server) {
      loadMembers()
    }
  }, [server, loadMembers])

  if (!server) {
    return <div className="w-60 bg-gray-800" />
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-500'
      case 'admin': return 'bg-orange-500'
      case 'moderator': return 'bg-blue-500'
      default: return 'bg-gray-500'
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
    <div className="w-60 bg-gray-800 border-l border-gray-700">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">
          MEMBERS — {members.length}
        </h3>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor('online')}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white truncate">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                    {member.role !== 'member' && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 ${getRoleColor(member.role)} text-white`}
                      >
                        {member.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}