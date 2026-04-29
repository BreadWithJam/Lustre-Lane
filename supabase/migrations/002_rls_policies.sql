-- Enable Row Level Security on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Services table policies
-- Public read access for active services
CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = true);

-- Admin full access to services
CREATE POLICY "Admin full access to services" ON services
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Gallery images table policies
-- Public read access to gallery images
CREATE POLICY "Public can view gallery images" ON gallery_images
    FOR SELECT USING (true);

-- Admin full access to gallery images
CREATE POLICY "Admin full access to gallery images" ON gallery_images
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Message threads table policies
-- Users can view their own threads
CREATE POLICY "Users can view own message threads" ON message_threads
    FOR SELECT USING (
        client_email = auth.jwt() ->> 'email' OR
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Users can create new threads
CREATE POLICY "Users can create message threads" ON message_threads
    FOR INSERT WITH CHECK (true);

-- Users can update their own threads
CREATE POLICY "Users can update own message threads" ON message_threads
    FOR UPDATE USING (
        client_email = auth.jwt() ->> 'email' OR
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Admin full access to message threads
CREATE POLICY "Admin full access to message threads" ON message_threads
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Messages table policies
-- Users can view messages in their threads
CREATE POLICY "Users can view messages in own threads" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM message_threads 
            WHERE id = messages.thread_id 
            AND (
                client_email = auth.jwt() ->> 'email' OR
                auth.jwt() ->> 'role' = 'admin' OR 
                auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
            )
        )
    );

-- Users can create messages in their threads
CREATE POLICY "Users can create messages in own threads" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM message_threads 
            WHERE id = messages.thread_id 
            AND (
                client_email = auth.jwt() ->> 'email' OR
                auth.jwt() ->> 'role' = 'admin' OR 
                auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
            )
        )
    );

-- Admin can update message read status
CREATE POLICY "Admin can update message read status" ON messages
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    ) WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;