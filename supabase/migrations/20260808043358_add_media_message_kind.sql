ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_kind_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_kind_check
  CHECK (message_kind IN ('text','audio','locked','gift','media'));