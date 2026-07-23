// ===== Hermes 系统重构 · 飞书类型契约 =====
// 参照现有飞书收发结构 && 设计方案 §6（现状不动）
// 飞书消息：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events

/** 飞书消息来源标记 */
export type FeishuChatId = string;
export type FeishuSenderId = string;

/** 飞书 webhook 接收的消息体 */
export interface FeishuWebhookEvent {
  /** 加密用，不关心 */
  encrypt?: string;
  /** 事件类型 */
  event_type?: string;
  /** 事件体 */
  event?: {
    /** 消息内容 */
    message?: {
      chat_id: FeishuChatId;
      chat_type: 'p2p' | 'group';
      content: string;            // JSON 字符串，含 text / image 等
      message_id: string;
      message_type: 'text' | 'image' | 'file' | 'audio';
      sender: { sender_id: { open_id: FeishuSenderId } };
      create_time: string;
    };
  };
}

/** 飞书消息发送体 */
export interface FeishuSendMessage {
  receive_id: FeishuChatId;
  msg_type: 'text' | 'image' | 'file' | 'audio' | 'interactive';
  content: string;                // JSON 序列化后的内容
}

/** 飞书卡片的交互回调 */
export interface FeishuCardAction {
  open_id: FeishuSenderId;
  open_message_id: string;
  value: Record<string, string>;
}

/** 飞书去重记录 */
export interface SeenMessage {
  message_id: string;
  seen_at: string;
}
