import { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Crown, Shield, ShieldCheck } from 'lucide-react'
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
    return <div className="w-60 bg-[#2f3136]" />
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-[#faa61a]" />
      case 'admin': return <Shield className="w-3 h-3 text-[#f04747]" />
      case 'moderator': return <ShieldCheck className="w-3 h-3 text-[#43b581]" />
      default: return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-[#faa61a]'
      case 'admin': return 'text-[#f04747]'
      case 'moderator': return 'text-[#43b581]'
      default: return 'text-[#b9bbbe]'
    }
  }

  // Group members by role
  const groupedMembers = members.reduce((acc, member) => {
    const role = member.role || 'member'
    if (!acc[role]) acc[role] = []
    acc[role].push(member)
    return acc
  }, {} as Record<string, any[]>)

  const roleOrder = ['owner', 'admin', 'moderator', 'member']
  const roleLabels = {
    owner: 'SERVER OWNER',
    admin: 'ADMINISTRATORS', 
    moderator: 'MODERATORS',
    member: 'MEMBERS'
  }

  return (
    <div className="w-60 bg-[#2f3136] border-l border-[#202225]">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {roleOrder.map(role => {
            const roleMembers = groupedMembers[role] || []
            if (roleMembers.length === 0) return null

            return (
              <div key={role}>
                <h3 className="text-xs font-semibold text-[#8e9297] mb-2 flex items-center">
                  {roleLabels[role as keyof typeof roleLabels]} — {roleMembers.length}
                </h3>
                
                <div className="space-y-1">
                  {roleMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center space-x-3 p-1 rounded hover:bg-[#393c43] cursor-pointer group transition-colors duration-150"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#5865f2] text-white text-sm font-medium">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#43b581] rounded-full border-2 border-[#2f3136]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-medium truncate ${getRoleColor(member.role)}`}>
                            {user.email?.split('@')[0] || 'User'}
                          </span>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-xs text-[#72767d] truncate">
                          {member.role === 'owner' ? 'Server Owner' : 
                           member.role === 'admin' ? 'Administrator' :
                           member.role === 'moderator' ? 'Moderator' : 'Online'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}