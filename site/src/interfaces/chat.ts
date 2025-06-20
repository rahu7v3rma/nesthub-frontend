interface Message {
  id: string;
  ts: number;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
}

export type ChatType = {
  sender: string;
  message: string;
  time: string;
  date: string;
  isReceiver: boolean;
}[];
