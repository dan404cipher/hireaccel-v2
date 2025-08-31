const { MongoClient } = require('mongodb');

async function debugCandidateUsers() {
  const uri = 'mongodb+srv://vaccel:PlHUbhJ3iUnbMOHU@v-accel-suites.rqyglx.mongodb.net/hireaccel?retryWrites=true&w=majority&appName=hire-accel-v2';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('hireaccel');
    
    // Check the current candidates collection
    console.log('\n=== Current Candidates Collection ===');
    const currentCandidates = await db.collection('candidates').find({}).toArray();
    console.log(`Total candidates: ${currentCandidates.length}`);
    
    currentCandidates.forEach((candidate, index) => {
      console.log(`\nCandidate ${index + 1}:`);
      console.log(`  _id: ${candidate._id}`);
      console.log(`  userId: ${candidate.userId}`);
      console.log(`  Profile: ${candidate.profile?.summary || 'No summary'}`);
    });
    
    // Check if there are any candidates with duplicate userIds
    const userIds = currentCandidates.map(c => c.userId?.toString());
    const duplicateUserIds = userIds.filter((id, index) => userIds.indexOf(id) !== index);
    
    if (duplicateUserIds.length > 0) {
      console.log('\n🚨 DUPLICATE USER IDs FOUND:');
      duplicateUserIds.forEach(id => {
        const candidatesWithThisId = currentCandidates.filter(c => c.userId?.toString() === id);
        console.log(`\nUser ID ${id} is used by ${candidatesWithThisId.length} candidates:`);
        candidatesWithThisId.forEach(c => {
          console.log(`  - Candidate ${c._id}: ${c.profile?.summary || 'No summary'}`);
        });
      });
    } else {
      console.log('\n✅ No duplicate userIds found in current data');
    }
    
    // Check the users collection to see what users exist
    console.log('\n=== Users Collection ===');
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`\nUser: ${user.firstName} ${user.lastName}`);
      console.log(`  _id: ${user._id}`);
      console.log(`  email: ${user.email}`);
      console.log(`  role: ${user.role}`);
    });
    
    // Check if the candidate user exists
    const candidateUser = users.find(u => u.role === 'candidate');
    if (candidateUser) {
      console.log(`\n📋 Candidate User Found:`);
      console.log(`  _id: ${candidateUser._id}`);
      console.log(`  email: ${candidateUser.email}`);
      console.log(`  name: ${candidateUser.firstName} ${candidateUser.lastName}`);
      
      // Check how many candidates reference this user
      const candidatesForThisUser = currentCandidates.filter(c => 
        c.userId?.toString() === candidateUser._id.toString()
      );
      console.log(`  Referenced by ${candidatesForThisUser.length} candidates`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the debug
debugCandidateUsers().catch(console.error);
