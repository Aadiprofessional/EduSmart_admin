// Script to directly update a user's admin status
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://cdqrmxmqsoxncnkxiqwu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXJteG1xc294bmNua3hpcXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc1MzYzOCwiZXhwIjoyMDU5MzI5NjM4fQ.1mhLCVfTJ6BjczuVX0Zs7qqqnMBXDiP46PatouMTGMg';

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }
  }
});

// User ID to update
const userId = 'b1ea521c-3168-472e-8b76-33aac54402fb';

async function makeUserAdmin() {
  console.log(`Attempting to make user ${userId} an admin...`);
  
  try {
    // First check if profile exists
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('Profile does not exist, creating a new one with admin rights');
        
        // Create new profile
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert([{
            id: userId,
            is_admin: true,
            name: 'Admin User',
            updated_at: new Date().toISOString()
          }])
          .select();
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        
        console.log('Successfully created admin profile:', newProfile);
      } else {
        console.error('Error checking profile:', profileError);
        return;
      }
    } else {
      // Update existing profile to have admin rights
      console.log('Existing profile found, updating admin status');
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)
        .select();
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }
      
      console.log('Successfully updated profile to admin:', updatedProfile);
    }
    
    console.log('Operation completed successfully');
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nPlease use these credentials to login to the admin dashboard');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

makeUserAdmin(); 