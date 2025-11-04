import OpenAI from 'openai';
import { env } from '../config/env';

async function testOpenAIKey() {
  console.log('🔍 Testing OpenAI API Key Configuration...\n');

  // Check if API key is configured
  if (!env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
  }

  // Check if API key format looks valid (starts with 'sk-')
  if (!env.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn('⚠️  WARNING: API key does not start with "sk-". This may be invalid.');
  }

  console.log(`✅ API Key found: ${env.OPENAI_API_KEY.substring(0, 7)}...${env.OPENAI_API_KEY.substring(env.OPENAI_API_KEY.length - 4)}\n`);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  try {
    console.log('📡 Testing API connection...');

    // Test 1: List models (simple API call to verify key works)
    console.log('\n1️⃣  Testing API connection by listing models...');
    let availableModels: string[] = [];
    try {
      const models = await openai.models.list();
      console.log(`   ✅ Successfully connected to OpenAI API`);
      console.log(`   📊 Available models: ${models.data.length} models found`);
      
      // Filter for chat completion models
      availableModels = models.data
        .map((m) => m.id)
        .filter((id) => id.includes('gpt') || id.includes('turbo'))
        .slice(0, 10); // Show first 10
      
      if (availableModels.length > 0) {
        console.log(`   📋 Chat models available:`);
        availableModels.forEach((model) => {
          console.log(`      - ${model}`);
        });
      }
    } catch (error: any) {
      if (error.status === 401) {
        console.error('   ❌ Authentication failed: Invalid API key');
        throw error;
      }
      throw error;
    }

    // Test 2: Make a simple chat completion request
    console.log('\n2️⃣  Testing chat completion with a simple request...');
    
    // Try to find a working model
    const modelToTest = availableModels.find((m) => 
      m.includes('gpt-3.5-turbo') || m.includes('gpt-4')
    ) || 'gpt-3.5-turbo'; // Fallback to base model
    
    console.log(`   🔧 Using model: ${modelToTest}`);
    
    const testResponse = await openai.chat.completions.create({
      model: modelToTest,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with exactly: "API key is working correctly!"',
        },
        {
          role: 'user',
          content: 'Say hello',
        },
      ],
      max_tokens: 20,
      temperature: 0,
    });

    const content = testResponse.choices[0]?.message?.content;
    if (content) {
      console.log(`   ✅ Chat completion successful`);
      console.log(`   📝 Response: "${content}"`);
    } else {
      console.error('   ❌ No content in response');
      throw new Error('No content in OpenAI response');
    }

    // Test 3: Test JSON mode (used in JD parsing)
    console.log('\n3️⃣  Testing JSON mode (used for JD parsing)...');
    console.log(`   🔧 Using model: ${modelToTest}`);
    
    // Check if model supports JSON mode (gpt-3.5-turbo-1106 and newer, or gpt-4-turbo)
    const supportsJsonMode = modelToTest.includes('1106') || 
                             modelToTest.includes('0125') || 
                             modelToTest.includes('gpt-4');
    
    if (!supportsJsonMode) {
      console.log(`   ⚠️  Model ${modelToTest} may not support JSON mode. Testing anyway...`);
    }
    
    const jsonResponse = await openai.chat.completions.create({
      model: modelToTest,
      messages: [
        {
          role: 'system',
          content: 'You are a JSON parser. Return valid JSON only.',
        },
        {
          role: 'user',
          content: 'Return a JSON object with a single field "test" set to "success"',
        },
      ],
      ...(supportsJsonMode ? { response_format: { type: 'json_object' } } : {}),
      max_tokens: 50,
      temperature: 0.1,
    });

    const jsonContent = jsonResponse.choices[0]?.message?.content;
    if (jsonContent) {
      try {
        const parsed = JSON.parse(jsonContent);
        console.log(`   ✅ JSON mode working correctly`);
        console.log(`   📝 Parsed JSON: ${JSON.stringify(parsed)}`);
      } catch (parseError) {
        console.error(`   ❌ Failed to parse JSON response: ${jsonContent}`);
        throw parseError;
      }
    } else {
      console.error('   ❌ No content in JSON response');
      throw new Error('No content in OpenAI JSON response');
    }

    // Test 4: Check usage/balance (if available)
    console.log('\n4️⃣  Checking API usage...');
    try {
      // Note: OpenAI doesn't have a direct "balance" endpoint, but we can check if requests work
      console.log(`   ℹ️  API key is valid and can make requests`);
      console.log(`   💡 To check usage/billing, visit: https://platform.openai.com/usage`);
    } catch (error) {
      console.warn(`   ⚠️  Could not check usage (this is normal)`);
    }

    console.log('\n✨ All tests passed! OpenAI API key is configured correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ API key is set');
    console.log('   ✅ API connection works');
    console.log(`   ✅ Chat completions work (using ${modelToTest})`);
    console.log(`   ✅ JSON mode ${supportsJsonMode ? 'works' : 'may not be fully supported'}`);
    console.log(`\n💡 Recommended model for JD/Resume parsing: ${modelToTest}`);
    console.log('\n🚀 Ready to use OpenAI for JD parsing and resume parsing!');

  } catch (error: any) {
    console.error('\n❌ OpenAI API test failed!');
    if (error.status === 401) {
      console.error('   Error: Invalid API key. Please check your OPENAI_API_KEY in .env file.');
    } else if (error.status === 429) {
      console.error('   Error: Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      console.error('   Error: OpenAI API server error. Please try again later.');
    } else if (error.message) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error('   Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the test
testOpenAIKey()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

