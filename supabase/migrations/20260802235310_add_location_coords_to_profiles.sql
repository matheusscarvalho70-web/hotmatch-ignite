-- Add geographic coordinates to profiles so Discover and Feed can sort by distance.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;
