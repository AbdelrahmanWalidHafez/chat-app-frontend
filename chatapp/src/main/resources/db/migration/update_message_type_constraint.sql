-- Update message_type_check constraint to include FILE type
-- Run this SQL script in your PostgreSQL database

ALTER TABLE message DROP CONSTRAINT IF EXISTS message_type_check;

ALTER TABLE message ADD CONSTRAINT message_type_check 
    CHECK (type IN ('IMAGE', 'TEXT', 'AUDIO', 'FILE'));

