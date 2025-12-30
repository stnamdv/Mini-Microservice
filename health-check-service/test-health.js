const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
  console.log('🚀 Testing Health Check Service...\n');

  try {
    // Test overall health
    console.log('📊 Testing overall system health...');
    const overallResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Overall Health:', overallResponse.data.status);
    console.log('   Response Time:', overallResponse.data.responseTime);
    console.log('   Services:', overallResponse.data.services?.length || 0);
    console.log();

    // Test services health
    console.log('🔧 Testing services health...');
    const servicesResponse = await axios.get(`${API_BASE_URL}/api/health/services`);
    console.log('✅ Services Status:', servicesResponse.data.status);
    servicesResponse.data.services.forEach(service => {
      console.log(`   ${service.name}: ${service.status} (${service.responseTime}ms)`);
    });
    console.log();

    // Test databases health
    console.log('💾 Testing databases health...');
    const dbResponse = await axios.get(`${API_BASE_URL}/api/health/databases`);
    console.log('✅ Databases Status:', dbResponse.data.status);
    dbResponse.data.databases.forEach(db => {
      console.log(`   ${db.name}: ${db.status}`);
    });
    console.log();

    // Test individual services
    console.log('🎯 Testing individual service health...');
    const services = ['auth', 'product', 'order', 'mongodb', 'kafka'];
    for (const service of services) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health/${service}`);
        console.log(`✅ ${service}: ${response.data.status}`);
      } catch (error) {
        console.log(`❌ ${service}: Failed - ${error.message}`);
      }
    }

    console.log('\n🎉 Health check testing completed!');

  } catch (error) {
    console.error('❌ Health check test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testHealthCheck();
