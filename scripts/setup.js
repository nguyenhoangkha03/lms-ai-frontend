const fs = require('fs');
const path = require('path');

const directories = [
  'src/components/ui',
  'src/components/layout',
  'src/components/forms',
  'src/components/charts',
  'src/components/shared',
  'src/hooks',
  'src/lib',
  'src/store/slices',
  'src/store/api',
  'src/types',
  'src/constants',
  'src/utils',
  'public/icons',
  'public/images',
];

const files = [
  'src/components/ui/index.ts',
  'src/hooks/index.ts',
  'src/store/slices/index.ts',
  'src/store/api/index.ts',
  'src/types/index.ts',
  'src/constants/index.ts',
  'src/utils/index.ts',
];

console.log('🚀 Setting up project structure...\n');

// Create directories
directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`⚠️  Directory already exists: ${dir}`);
  }
});

// Create index files
files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '// Auto-generated index file\nexport {};\n');
    console.log(`✅ Created file: ${file}`);
  } else {
    console.log(`⚠️  File already exists: ${file}`);
  }
});

console.log('\n🎉 Project structure setup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Copy .env.example to .env.local and fill in your values');
console.log('3. Run: npm run dev');
