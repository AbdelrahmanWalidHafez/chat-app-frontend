ALTER TABLE message DROP CONSTRAINT IF EXISTS message_type_check;

ALTER TABLE message ADD CONSTRAINT message_type_check 
    CHECK (type IN ('IMAGE', 'TEXT', 'AUDIO', 'FILE'));

