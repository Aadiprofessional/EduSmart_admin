// Script to create a new admin user
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

// Admin user details
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

async function createAdminUser() {
  console.log(`Attempting to create admin user with email: ${adminEmail}`);
  
  try {
    // First check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError);
      return;
    }
    
    const userExists = existingUser.users.some(user => user.email === adminEmail);
    
    if (userExists) {
      console.log('Admin user already exists. Updating password...');
      
      // Find the user ID
      const userId = existingUser.users.find(user => user.email === adminEmail).id;
      
      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: adminPassword }
      );
      
      if (updateError) {
        console.error('Error updating password:', updateError);
        return;
      }
      
      console.log('Password updated successfully');
      
      // Ensure user has admin profile
      await updateAdminProfile(userId);
    } else {
      console.log('Creating new admin user...');
      
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });
      
      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }
      
      console.log('User created successfully:', newUser);
      
      // Create admin profile
      await updateAdminProfile(newUser.user.id);
    }
    
    console.log('\nLogin credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nPlease use these credentials to login to the admin dashboard');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function updateAdminProfile(userId) {
  // Check if profile exists
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error checking profile:', profileError);
    return;
  }
  
  if (!profileData) {
    // Create new profile
    console.log('Creating admin profile...');
    
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        is_admin: true,
        name: 'Admin User',
        updated_at: new Date().toISOString()
      }]);
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return;
    }
    
    console.log('Admin profile created successfully');
  } else if (!profileData.is_admin) {
    // Update existing profile
    console.log('Updating profile to admin...');
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }
    
    console.log('Profile updated to admin successfully');
  } else {
    console.log('User already has admin profile');
  }
}

createAdminUser(); 