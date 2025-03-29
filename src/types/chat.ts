import { User, TeamMember } from "./user";

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  fileSize: number;
  url?: string;
  fetchingUrl?: boolean;
  s3Url?: string;
}

export type MessageType = "user" | "bot";
export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: Attachment[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  senderInfo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiverInfo?: any;
}

export interface ServerMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  attachments?: Attachment[];
}

interface DateGroup {
  [date: string]: Message[];
}

// Component props
export interface ChatEmptyStateProps {
  type: "welcome" | "start-conversation";
  userName?: string;
  onSayHello?: () => void;
}

export interface ChatHeaderProps {
  user: TeamMember | null;
  userOnline: boolean;
  chatInfoVisible: boolean;
  toggleChatInfo: () => void;
}

export interface ChatInfoPanelProps {
  user: TeamMember | null;
  messages: Message[];
  attachmentUrls: Record<string, string>;
  formatFileSize: (bytes: number) => string;
  onClose: () => void;
}

export interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  isUploading: boolean;
  groupedMessages: DateGroup;
  user: TeamMember | null;
  currentUser: User | null;
  setInput: (input: string) => void;
  attachmentUrls: Record<string, string>;
  formatFileSize: (size: number) => string;
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  showEmojiPicker?: boolean;
}

export interface MessageAttachmentProps {
  attachment: Attachment;
  url?: string;
  formatFileSize: (size: number) => string;
}

export interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  user: User | TeamMember | null;
  attachmentUrls: Record<string, string>;
  formatFileSize: (size: number) => string;
}

export interface MessageInputProps {
  input: string;
  isUploading: boolean;
  showEmojiPicker: boolean;
  setInput: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  handleFileInput: () => void;
  handleEmojiSelect: (emoji: string) => void;
  toggleEmojiPicker: () => void;
}

export interface TypingIndicatorProps {
  user: TeamMember | null;
}

export interface UploadIndicatorProps {
  isUploading: boolean;
}
