-- Make image_url nullable in analysis_requests table
ALTER TABLE analysis_requests ALTER COLUMN image_url DROP NOT NULL; 