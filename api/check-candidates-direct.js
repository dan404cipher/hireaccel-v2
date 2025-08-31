const { MongoClient } = require('mongodb');

async function checkCandidatesDirect() {
  const uri = 'mongodb+srv://vaccel:PlHUbhJ3iUnbMOHU@v-accel-suites.rqyglx.mongodb.net/hireaccel?retryWrites=true&w=majority&appName=hire-accel-v2';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('hireaccel');
    
    // Direct count
    const candidateCount = await db.collection('candidates').countDocuments();
    console.log(`\nTotal candidates in database: ${candidateCount}`);
    
    // Get all candidates
    const candidates = await db.collection('candidates').find({}).toArray();
    console.log(`\nAll candidates:`);
    
    candidates.forEach((candidate, index) => {
      console.log(`\n--- Candidate ${index + 1} ---`);
      console.log(`ID: ${candidate._id}`);
      console.log(`User ID: ${candidate.userId}`);
      console.log(`Summary: ${candidate.profile?.summary || 'No summary'}`);
      console.log(`Skills: ${candidate.profile?.skills?.join(', ') || 'No skills'}`);
      console.log(`Location: ${candidate.profile?.location || 'No location'}`);
    });
    
    // Check for any duplicate userIds
    const userIds = candidates.map(c => c.userId?.toString()).filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)];
    
    console.log(`\nUnique user IDs: ${uniqueUserIds.length}`);
    console.log(`Total candidates: ${candidates.length}`);
    
    if (userIds.length !== uniqueUserIds.length) {
      console.log('🚨 DUPLICATE USER IDs DETECTED!');
      const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index);
      console.log('Duplicate IDs:', duplicates);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkCandidatesDirect().catch(console.error);
