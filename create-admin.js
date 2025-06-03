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

// Admin user details
const adminEmail = 'admin@edusmart.com';
const adminPassword = 'admin123456';

async function createAdminUser() {
  console.log('🚀 Creating admin user...');
  
  try {
    // Step 1: Create the auth user
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log('User ID:', authData.user.id);

    // Step 2: Create/update the profile with admin privileges
    console.log('Step 2: Creating admin profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
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

    console.log('\n🎉 Admin user created successfully!');
    console.log('=================================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID (Admin UID):', authData.user.id);
    console.log('=================================');
    console.log('\nYou can now login to the admin panel with these credentials.');
    console.log('The User ID above is your Admin UID for API calls.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAdminUser().catch(console.error); 