const fs = require('fs');
const path = require('path');

// Read the GeoJSON file
const geoJsonPath = path.join(__dirname, '../utils/busStops.geojson');
const outputPath = path.join(__dirname, '../utils/busStopsData.ts');

try {
  const geoJsonData = fs.readFileSync(geoJsonPath, 'utf8');
  const parsedData = JSON.parse(geoJsonData);
  
  // Create TypeScript content
  const tsContent = `// Auto-generated from busStops.geojson
// This file contains all bus stops data for Addis Ababa

export const busStopsGeoJSON = ${JSON.stringify(parsedData, null, 2)} as const;

export default busStopsGeoJSON;
`;

  // Write the TypeScript file
  fs.writeFileSync(outputPath, tsContent);
  console.log('✅ Successfully converted GeoJSON to TypeScript!');
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📊 Features: ${parsedData.features.length} bus stops`);
} catch (error) {
  console.error('❌ Error converting GeoJSON:', error.message);
  process.exit(1);
}
