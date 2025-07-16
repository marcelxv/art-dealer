# Setup Database Trigger for Automatic User Creation

This guide will help you set up a database trigger that automatically creates a user record in the `users` table whenever someone registers with Supabase Auth.

## Why Use a Database Trigger?

- **Automatic**: No need to manually handle user creation in your application code
- **Reliable**: Ensures every auth user has a corresponding profile record
- **Consistent**: Eliminates race conditions and potential errors
- **Clean**: Keeps your application code focused on business logic

## Setup Instructions

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query

### 2. Run the Database Trigger Script

Copy and paste the entire contents of `database_trigger.sql` into the SQL editor and execute it.

The script will:
- Remove the default UUID generation from the users table ID column
- Create a trigger function that handles new user creation
- Set up the trigger to fire when new auth users are created
- Update RLS policies to allow the trigger to work properly

### 3. Verify the Setup

After running the script, you can test the setup:

1. Try registering a new user through your application
2. Check the `users` table in your Supabase dashboard
3. You should see the new user record automatically created with:
   - `id` matching the auth user ID
   - `email` from the auth user
   - `first_name` and `last_name` from the registration form
   - Automatic timestamps

## What the Trigger Does

When a new user signs up via Supabase Auth:

1. **Auth user created**: Supabase creates the user in `auth.users`
2. **Trigger fires**: Our trigger detects the new auth user
3. **Profile created**: Automatically inserts a record in `public.users` with:
   - Same ID as the auth user
   - Email from auth user
   - First/last name from signup metadata
   - Automatic timestamps

## Code Changes Made

The trigger setup also simplified our application code:

### Before (Manual Creation)
```typescript
// Had to manually create user profile after auth signup
const { data, error } = await supabase.auth.signUp({...})
if (data.user) {
  await supabase.from('users').insert([{
    id: data.user.id,
    email: data.user.email,
    first_name: firstName,
    last_name: lastName,
  }])
}
```

### After (Automatic Creation)
```typescript
// User profile is automatically created by the database trigger
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { first_name: firstName, last_name: lastName }
  }
})
```

## Benefits

1. **Cleaner Code**: Registration logic is much simpler
2. **No Race Conditions**: User profile is created atomically
3. **Always Consistent**: Every auth user will have a profile
4. **Error Resilient**: Database handles the creation reliably

## Troubleshooting

### If users aren't being created automatically:

1. **Check trigger exists**:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check function exists**:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. **Check permissions**:
   ```sql
   SELECT * FROM information_schema.table_privileges 
   WHERE table_name = 'users';
   ```

4. **Test the function manually**:
   ```sql
   -- This should work without errors
   SELECT public.handle_new_user();
   ```

### Common Issues:

- **RLS Policies**: Make sure the trigger has permission to insert into users table
- **Column Constraints**: Ensure all required columns have defaults or are handled by the trigger
- **Auth Metadata**: First/last names are stored in `raw_user_meta_data` during signup

## Next Steps

With the trigger set up, your Art Dealer app will now:
- Automatically create user profiles when users register
- Have cleaner, more maintainable code
- Ensure data consistency between auth and profile tables

The registration flow will work seamlessly, and you can focus on building great features! 🎨 