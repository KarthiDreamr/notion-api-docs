#!/usr/bin/env node

/**
 * Postman to OpenAPI conversion script
 * Runs conversion and applies post-processing fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Converting Postman collection to OpenAPI...');
  
  try {
    // Run conversion
    execSync('npm run postman:to-openapi', { stdio: 'inherit' });
    
    // Post-process OpenAPI file if needed
    const openApiPath = path.join(__dirname, '../openapi/openapi.yaml');
    if (fs.existsSync(openApiPath)) {
      console.log('✅ OpenAPI file generated successfully');
      
      // Run linting
      console.log('Running OpenAPI linting...');
      execSync('npm run openapi:lint', { stdio: 'inherit' });
    } else {
      console.error('❌ OpenAPI file not found after conversion');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
