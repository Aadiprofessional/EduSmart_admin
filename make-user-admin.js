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

async function makeUserAdmin() {
  console.log('🚀 Making existing user admin...');
  
  try {
    // First, let's see all existing profiles
    console.log('Step 1: Checking existing profiles...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log('Existing profiles:');
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Name: ${profile.name}`);
      console.log(`   Role: ${profile.role}`);
      console.log('');
    });
    
    // Update the first user to be admin (or you can specify a specific ID)
    if (profiles.length > 0) {
      const userToUpdate = profiles[0]; // Update the first user
      
      console.log(`Step 2: Making user ${userToUpdate.email} an admin...`);
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userToUpdate.id)
        .select();
      
      if (updateError) {
        console.error('❌ Error updating user role:', updateError.message);
        return;
      }
      
      console.log('✅ User updated successfully!');
      console.log('Updated profile:', updatedProfile[0]);
      
      console.log('\n🎉 Admin user ready!');
      console.log('=================================');
      console.log('Email:', userToUpdate.email);
      console.log('User ID (Admin UID):', userToUpdate.id);
      console.log('Role: admin');
      console.log('=================================');
      console.log('\nYou can now login to the admin panel with this user\'s credentials.');
      console.log('The User ID above is your Admin UID for API calls.');
      
    } else {
      console.log('❌ No profiles found. Please create a user first.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
makeUserAdmin().catch(console.error); 