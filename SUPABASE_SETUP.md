# Supabase Setup Guide (Cloud-Only Storage)

## Overview
This app now uses **cloud-only storage** with Supabase. Chat history is stored exclusively in the cloud and requires an internet connection to function. No local storage is used.

## Features
- ✅ **Cross-device access**: Access your chat history from any device
- ✅ **Real-time sync**: Changes appear immediately across all devices
- ✅ **Secure**: Row Level Security ensures data privacy
- ✅ **Online-only**: Requires internet connection and authentication

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be set up (this takes a few minutes)

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy your Project URL and anon/public key

## 3. Configure Google OAuth

1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google Client ID (from Google Cloud Console)
4. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

## 4. Set Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  legal_references JSONB,
  action_steps JSONB,
  contact_info JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their sessions" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their sessions" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );
```

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Try logging in with Google
3. Create a chat session and verify it syncs to Supabase
4. Check your Supabase dashboard to see the data

## Features

- **Online-only**: Requires internet connection and authentication
- **Cross-device**: Access your chat history from any device after logging in
- **Secure**: Row Level Security ensures users only see their own data
- **Real-time**: Changes sync immediately across all devices

## Troubleshooting

- If authentication fails, check your Google OAuth configuration
- If data doesn't sync, verify your environment variables and database policies
- Check browser console for error messages