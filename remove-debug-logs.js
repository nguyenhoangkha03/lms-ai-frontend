const fs = require('fs');
const path = require('path');

const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');

fs.readFile(middlewarePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading middleware.ts:', err);
    return;
  }

  // Remove debug logs
  const updatedData = data
    .replace(
      /\s*\/\/ Debug logs[\s\S]*?console\.log\('🔍 Debug - Pathname:', pathname\);/g,
      ''
    )
    .replace(
      /\s*\/\/ Debug logs for auth check[\s\S]*?console\.log\('🔍 Debug - Role check:', routeConfig\.allowedRoles\.includes\(userRole\)\);/g,
      ''
    )
    .replace(/\s*console\.log\('❌ Debug[^']*'[^;]*\);/g, '')
    .replace(/\s*console\.log\('✅ Debug[^']*'[^;]*\);/g, '');

  fs.writeFile(middlewarePath, updatedData, 'utf8', err => {
    if (err) {
      console.error('Error writing middleware.ts:', err);
      return;
    }
    console.log('Debug logs removed successfully!');
  });
});
