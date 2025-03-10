import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus, Settings } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import Cookies from "js-cookie";

// Types for team members
interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export default function Sidebar({
  onSelectConversation,
}: {
  onSelectConversation: (id: string) => void;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState("");
  const teamId = Cookies.get("activeTeamId");

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;

      try {
        const response = await apiClient(`/api/teams/${teamId}/members`);
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teamMembers = data.map((member: any) => ({
          id: member.user.id,
          name: member.user.name || member.user.email.split("@")[0],
          email: member.user.email,
        }));
        setMembers(teamMembers);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    fetchMembers();
  }, [teamId]);

  // Filter members based on search query
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    onSelectConversation(id);
  };

  return (
    <div className="h-full flex flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Sidebar header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Messages</h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto scrollbar-show-on-hover">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`p-3 cursor-pointer hover:bg-sidebar-accent/40 ${
                activeConversation === member.id ? "bg-sidebar-accent" : ""
              }`}
              onClick={() => handleSelectConversation(member.id)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 flex-shrink-0 flex justify-center items-center">
                  {member.name.charAt(0)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{member.name}</h3>
                  </div>
                  <p className="text-sm truncate text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Search className="h-12 w-12 mb-2 opacity-20" />
            <p>No members found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
