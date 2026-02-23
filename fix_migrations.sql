-- Clear broken migrations
DELETE FROM supabase_migrations.schema_migrations WHERE version IN ('002', '003', '004', '005');

-- Show remaining migrations
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
