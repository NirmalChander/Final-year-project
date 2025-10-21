import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import {
  createChatSession,
  getChatSessions,
  updateChatSession,
  deleteChatSession,
  createChatMessage,
  getChatMessages,
  deleteChatMessages,
  type ChatSession as DBChatSession,
  type ChatMessage as DBChatMessage,
} from '../lib/database';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: {
    file: File;
    url: string;
    name: string;
  };
  legalReferences?: Array<{ section: string; description: string }>;
  actionSteps?: Array<{ step: string; description: string }>;
  contactInfo?: Array<{ department: string; helpline: string; type: 'phone' | 'email' | 'website'; description?: string }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'legal-ai-chat-sessions';
const CURRENT_SESSION_KEY = 'legal-ai-current-session';
const MIGRATION_KEY = 'legal-ai-migration-completed';

const convertDBSessionToLocal = (dbSession: DBChatSession, messages: DBChatMessage[]): ChatSession => ({
  id: dbSession.id,
  title: dbSession.title,
  messages: messages.map(msg => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    legalReferences: msg.legal_references,
    actionSteps: msg.action_steps,
    contactInfo: msg.contact_info,
  })),
  createdAt: new Date(dbSession.created_at),
  updatedAt: new Date(dbSession.updated_at),
});

const convertLocalMessageToDB = (message: Message, sessionId: string): Omit<DBChatMessage, 'timestamp'> => ({
  id: message.id,
  session_id: sessionId,
  type: message.type,
  content: message.content,
  legal_references: message.legalReferences,
  action_steps: message.actionSteps,
  contact_info: message.contactInfo,
});

export const useChatHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingMessages, setSavingMessages] = useState<Set<string>>(new Set()); // Track messages being saved
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set()); // Track messages that failed to save

  // Clean up duplicate sessions (same title and similar creation time)
  const cleanupDuplicateSessions = async (userId: string) => {
    try {
      const allSessions = await getChatSessions(userId);
      const sessionMap = new Map<string, DBChatSession[]>();

      // Group sessions by title
      allSessions.forEach(session => {
        const key = session.title;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, []);
        }
        sessionMap.get(key)!.push(session);
      });

      // Find and remove duplicates (keep the most recent one)
      for (const [title, sessions] of sessionMap) {
        if (sessions.length > 1) {
          // Sort by updated_at, keep the most recent
          sessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

          // Remove all but the first (most recent) session
          for (let i = 1; i < sessions.length; i++) {
            console.log(`Removing duplicate session: ${sessions[i].id} (${title})`);
            await deleteChatSession(sessions[i].id);
            await deleteChatMessages(sessions[i].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup duplicate sessions:', error);
    }
  };

  // Migrate localStorage data to Supabase
  const migrateLocalData = async (userId: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      // Check if user already has sessions in Supabase (avoid duplicate migration)
      const existingSessions = await getChatSessions(userId);
      if (existingSessions.length > 0) {
        console.log('User already has sessions in Supabase, skipping migration');
        localStorage.setItem(MIGRATION_KEY, 'true');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_SESSION_KEY);
        return;
      }

      const localSessions: ChatSession[] = JSON.parse(stored).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));

      console.log(`Migrating ${localSessions.length} chat sessions to Supabase...`);

      for (const localSession of localSessions) {
        // Create session in Supabase
        const dbSession = await createChatSession(userId, localSession.title);

        // Create messages in Supabase
        for (const message of localSession.messages) {
          await createChatMessage(convertLocalMessageToDB(message, dbSession.id));
        }
      }

      // Mark migration as completed and clear localStorage
      localStorage.setItem(MIGRATION_KEY, 'true');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);

      console.log('Successfully migrated local chat data to Supabase');
    } catch (error) {
      console.error('Failed to migrate local data:', error);
      // Don't set migration flag on failure, so it can retry next time
      throw error;
    }
  };

  // Load sessions from Supabase
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) {
        setSessions([]);
        setCurrentSessionId(null);
        setIsLoading(false);
        return;
      }

      try {
        // Check if migration is needed
        const migrationCompleted = localStorage.getItem(MIGRATION_KEY);
        if (!migrationCompleted) {
          await migrateLocalData(user.id);
        }

        // Load sessions from Supabase
        let dbSessions = await getChatSessions(user.id);

        // Clean up duplicates if any exist
        if (dbSessions.length > 1) {
          await cleanupDuplicateSessions(user.id);
          // Reload after cleanup
          dbSessions = await getChatSessions(user.id);
        }

        const sessionsWithMessages: ChatSession[] = [];

        for (const dbSession of dbSessions) {
          const messages = await getChatMessages(dbSession.id);
          sessionsWithMessages.push(convertDBSessionToLocal(dbSession, messages));
        }

        setSessions(sessionsWithMessages);

        // Set current session
        if (sessionsWithMessages.length > 0) {
          const savedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
          let targetSessionId = savedCurrentSessionId;

          if (!savedCurrentSessionId || !sessionsWithMessages.find(s => s.id === savedCurrentSessionId)) {
            const mostRecent = sessionsWithMessages.reduce((latest, current) =>
              current.updatedAt > latest.updatedAt ? current : latest
            );
            targetSessionId = mostRecent.id;
          }

          setCurrentSessionId(targetSessionId);
        } else {
          // Create initial session if no sessions exist
          await createNewSession();
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
        // Fallback to localStorage if Supabase fails AND migration hasn't been completed
        const migrationCompleted = localStorage.getItem(MIGRATION_KEY);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!migrationCompleted && stored) {
          try {
            const parsedSessions: ChatSession[] = JSON.parse(stored).map((session: any) => ({
              ...session,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
              messages: session.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }));
            setSessions(parsedSessions);

            if (parsedSessions.length > 0) {
              const savedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
              let targetSessionId = savedCurrentSessionId;

              if (!savedCurrentSessionId || !parsedSessions.find(s => s.id === savedCurrentSessionId)) {
                const mostRecent = parsedSessions.reduce((latest, current) =>
                  current.updatedAt > latest.updatedAt ? current : latest
                );
                targetSessionId = mostRecent.id;
              }

              setCurrentSessionId(targetSessionId);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback sessions:', fallbackError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
      } catch (error) {
        console.error('Failed to save current session ID:', error);
      }
    }
  }, [currentSessionId]);

  const createNewSession = async (): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');

    const newSession: ChatSession = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'ai',
          content: 'Namaste! I am your AI Legal Assistant, here to help you navigate the Indian legal system. I can assist you with understanding laws, rights, procedures, and legal documentation. How may I assist you today?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Create in Supabase
      const dbSession = await createChatSession(user.id, newSession.title);
      await createChatMessage(convertLocalMessageToDB(newSession.messages[0], dbSession.id));

      // Update local state
      const sessionWithDBId = {
        ...newSession,
        id: dbSession.id,
      };

      setSessions(prev => [sessionWithDBId, ...prev]);
      setCurrentSessionId(sessionWithDBId.id);
      return sessionWithDBId.id;
    } catch (error) {
      console.error('Failed to create session in Supabase:', error);
      // Fallback to local state only
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    }
  };

  const getCurrentSession = (): ChatSession | null => {
    return sessions.find(session => session.id === currentSessionId) || null;
  };

  const updateCurrentSession = async (updates: Partial<ChatSession>) => {
    if (!currentSessionId) return;

    try {
      if (updates.title) {
        await updateChatSession(currentSessionId, { title: updates.title });
      }

      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, ...updates, updatedAt: new Date() }
          : session
      ));
    } catch (error) {
      console.error('Failed to update session in Supabase:', error);
      // Update local state anyway
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, ...updates, updatedAt: new Date() }
          : session
      ));
    }
  };

  const addMessageToCurrentSession = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentSessionId) {
      console.warn('No current session ID, cannot add message');
      return;
    }

    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Add to local state immediately (optimistic update)
    setSessions(prev => prev.map(session =>
      session.id === currentSessionId
        ? {
            ...session,
            messages: [...session.messages, newMessage],
            updatedAt: new Date(),
            title: session.title === 'New Chat' && message.type === 'user'
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
              : session.title
          }
        : session
    ));

    // Mark message as being saved
    setSavingMessages(prev => new Set(prev).add(newMessage.id));

    // Retry logic for saving to Supabase
    const saveWithRetry = async (retries = 3): Promise<void> => {
      try {
        // Add to Supabase
        await createChatMessage(convertLocalMessageToDB(newMessage, currentSessionId));

        // Update title in Supabase if it changed
        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (currentSession && currentSession.title === 'New Chat' && message.type === 'user') {
          const newTitle = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          await updateChatSession(currentSessionId, { title: newTitle });
        }

        // Mark as successfully saved
        setSavingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(newMessage.id);
          return newSet;
        });

        // Remove from failed messages if it was there
        setFailedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(newMessage.id);
          return newSet;
        });

      } catch (error) {
        console.error(`Failed to save message to Supabase (attempt ${4 - retries}/3):`, error);

        if (retries > 1) {
          // Wait with exponential backoff
          await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
          return saveWithRetry(retries - 1);
        } else {
          // Mark as failed
          setSavingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(newMessage.id);
            return newSet;
          });
          setFailedMessages(prev => new Set(prev).add(newMessage.id));

          // Store in localStorage as backup
          try {
            const pendingMessages = JSON.parse(localStorage.getItem('pending-messages') || '[]');
            pendingMessages.push({
              message: newMessage,
              sessionId: currentSessionId,
              timestamp: Date.now()
            });
            localStorage.setItem('pending-messages', JSON.stringify(pendingMessages));
          } catch (storageError) {
            console.error('Failed to store message in localStorage backup:', storageError);
          }
        }
      }
    };

    // Start saving process
    saveWithRetry();
  };

  const retryFailedMessages = async () => {
    const failedMessageIds = Array.from(failedMessages);
    if (failedMessageIds.length === 0) return;

    // Get pending messages from localStorage
    try {
      const pendingMessages = JSON.parse(localStorage.getItem('pending-messages') || '[]');
      const messagesToRetry = pendingMessages.filter((item: any) =>
        failedMessageIds.includes(item.message.id)
      );

      for (const item of messagesToRetry) {
        await addMessageToCurrentSession(item.message);
      }

      // Remove retried messages from localStorage
      const remainingPending = pendingMessages.filter((item: any) =>
        !failedMessageIds.includes(item.message.id)
      );
      localStorage.setItem('pending-messages', JSON.stringify(remainingPending));
    } catch (error) {
      console.error('Failed to retry failed messages:', error);
    }
  };

  // Process pending messages on load
  useEffect(() => {
    if (!isLoading && user && currentSessionId) {
      const processPendingMessages = async () => {
        try {
          const pendingMessages = JSON.parse(localStorage.getItem('pending-messages') || '[]');
          const currentSessionPending = pendingMessages.filter((item: any) =>
            item.sessionId === currentSessionId
          );

          for (const item of currentSessionPending) {
            // Only add if not already in the session
            const currentSession = sessions.find(s => s.id === currentSessionId);
            const messageExists = currentSession?.messages.some(m => m.id === item.message.id);
            if (!messageExists) {
              await addMessageToCurrentSession(item.message);
            }
          }

          // Clean up processed messages
          const remainingPending = pendingMessages.filter((item: any) =>
            item.sessionId !== currentSessionId
          );
          localStorage.setItem('pending-messages', JSON.stringify(remainingPending));
        } catch (error) {
          console.error('Failed to process pending messages:', error);
        }
      };

      processPendingMessages();
    }
  }, [isLoading, user, currentSessionId, sessions]);

  // Periodically retry failed messages
  useEffect(() => {
    if (failedMessages.size > 0) {
      const retryInterval = setInterval(() => {
        retryFailedMessages();
      }, 30000); // Retry every 30 seconds

      return () => clearInterval(retryInterval);
    }
  }, [failedMessages.size]);

  const deleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      await deleteChatMessages(sessionId);
    } catch (error) {
      console.error('Failed to delete session from Supabase:', error);
    }

    // Always update local state
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const switchToSession = (sessionId: string) => {
    // Prevent switching if there are messages currently being saved
    if (savingMessages.size > 0) {
      console.warn('Cannot switch sessions while messages are being saved');
      return;
    }
    setCurrentSessionId(sessionId);
  };

  const clearAllSessions = async () => {
    if (!user) return;

    try {
      const dbSessions = await getChatSessions(user.id);
      for (const session of dbSessions) {
        await deleteChatSession(session.id);
        await deleteChatMessages(session.id);
      }
    } catch (error) {
      console.error('Failed to clear sessions from Supabase:', error);
    }

    // Always clear local state
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  };

  return {
    sessions,
    currentSessionId,
    currentSession: getCurrentSession(),
    isLoading,
    savingMessages,
    failedMessages,
    createNewSession,
    switchToSession,
    addMessageToCurrentSession,
    updateCurrentSession,
    deleteSession,
    clearAllSessions,
    retryFailedMessages
  };
};