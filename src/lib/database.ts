import { supabase } from './supabase';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  legal_references?: Array<{ section: string; description: string }>;
  action_steps?: Array<{ step: string; description: string }>;
  contact_info?: Array<{ department: string; helpline: string; type: 'phone' | 'email' | 'website'; description?: string }>;
}

// Chat Sessions
export const createChatSession = async (userId: string, title: string): Promise<ChatSession> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateChatSession = async (sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<ChatSession> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
};

// Chat Messages
export const createChatMessage = async (message: Omit<ChatMessage, 'timestamp'>): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      ...message,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateChatMessage = async (messageId: string, updates: Partial<Pick<ChatMessage, 'content' | 'legal_references' | 'action_steps' | 'contact_info'>>): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteChatMessages = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
};
