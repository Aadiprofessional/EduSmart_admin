const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://cdqrmxmqsoxncnkxiqwu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXJteG1xc294bmNua3hpcXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc1MzYzOCwiZXhwIjoyMDU5MzI5NjM4fQ.1mhLCVfTJ6BjczuVX0Zs7qqqnMBXDiP46PatouMTGMg';

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up database schema...');
  
  try {
    // First, let's check the current structure of the profiles table
    console.log('Step 1: Checking current profiles table structure...');
    
    const { data: existingProfiles, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('Profiles table might not exist or has different structure:', selectError.message);
    } else {
      console.log('Current profiles table sample:', existingProfiles);
    }

    // Try to add the is_admin column using SQL
    console.log('Step 2: Adding is_admin column to profiles table...');
    
    const { data: alterResult, error: alterError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;' 
      });

    if (alterError) {
      console.log('Could not add column via RPC, trying direct SQL...');
      
      // Alternative approach: try to create/update the table structure
      const { data: createResult, error: createError } = await supabaseAdmin
        .rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS profiles (
              id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              name TEXT,
              avatar_url TEXT,
              is_admin BOOLEAN DEFAULT FALSE
            );
            
            -- Enable RLS
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            
            -- Create policies
            CREATE POLICY "Public profiles are viewable by everyone." ON profiles
              FOR SELECT USING (true);
            
            CREATE POLICY "Users can insert their own profile." ON profiles
              FOR INSERT WITH CHECK (auth.uid() = id);
            
            CREATE POLICY "Users can update own profile." ON profiles
              FOR UPDATE USING (auth.uid() = id);
          `
        });
      
      if (createError) {
        console.error('❌ Error creating table structure:', createError.message);
        
        // Let's try a simpler approach - just insert/update records
        console.log('Step 3: Trying to work with existing table...');
        
        // Get the user ID from the previous script
        const userId = '248574dc-b7b7-4e22-8b2f-987a02aa349e';
        
        // Try to insert a profile record
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            name: 'Admin User',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select();
        
        if (insertError) {
          console.error('❌ Error inserting profile:', insertError.message);
        } else {
          console.log('✅ Profile created/updated:', insertData);
        }
        
        return;
      } else {
        console.log('✅ Table structure created successfully');
      }
    } else {
      console.log('✅ Column added successfully');
    }

    // Now create the admin user
    console.log('Step 3: Creating admin user...');
    
    const adminEmail = 'admin@edusmart.com';
    const adminPassword = 'admin123456';
    
    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    const userId = authData?.user?.id || '248574dc-b7b7-4e22-8b2f-987a02aa349e';
    console.log('✅ Auth user ready, ID:', userId);

    // Create/update the profile with admin privileges
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        is_admin: true,
        name: 'Admin User',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      return;
    }

    console.log('✅ Admin profile created successfully');
    console.log('Profile:', profileData);

    console.log('\n🎉 Database setup completed!');
    console.log('=================================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID (Admin UID):', userId);
    console.log('=================================');
    console.log('\nYou can now login to the admin panel with these credentials.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
setupDatabase().catch(console.error); 