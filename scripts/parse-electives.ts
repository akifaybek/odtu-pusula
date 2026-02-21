import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read raw electives data
const rawDataPath = path.join(__dirname, 'electives-raw.txt');
const rawData = fs.readFileSync(rawDataPath, 'utf-8');

// Read existing metu-data.json
const dataPath = path.join(__dirname, 'metu-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get existing course codes
const existingCodes = new Set(data.courses.map((c: { code: string }) => c.code));

// Department code mapping based on course prefix
const departmentMapping: Record<string, string> = {
  'ARCH': 'ARCH',
  'CRP': 'CRP',
  'ID': 'ID',
  'PHYS': 'PHYS',
  'SOC': 'SOC',
  'PSY': 'PSY',
  'MATH': 'MATH',
  'HIST': 'HIST',
  'PHIL': 'PHIL',
  'ADM': 'ADM',
  'ECON': 'ECON',
  'BA': 'BA',
  'IR': 'IR',
  'SSME': 'SSME',
  'MSE': 'METE',
  'PES': 'PES',
  'EDS': 'EDS',
  'CEIT': 'CEIT',
  'ENG': 'ENG',
  'TURK': 'TURK',
  'THEA': 'ENG', // Theatre/Fine Arts goes under ENG
  'MUS': 'ENG', // Music goes under ENG
  'INST': 'ENG', // Instruments goes under ENG
  'SLTP': 'ENG', // Art topics goes under ENG
  'ARAP': 'ENG', // Arabic
  'FREN': 'ENG', // French
  'GERM': 'ENG', // German
  'JA': 'ENG', // Japanese
  'ITAL': 'ENG', // Italian
  'RUS': 'ENG', // Russian
  'SPAN': 'ENG', // Spanish
  'GRE': 'ENG', // Greek
  'CHN': 'ENG', // Chinese
  'PERS': 'ENG', // Persian
  'TKPR': 'ENG', // Vocational school
  'STPS': 'ENG', // Science and Technology Policy
  'AH': 'ARCH', // Art History under ARCH
  'CONS': 'ARCH', // Conservation under ARCH
  'BS': 'ARCH', // Building Science under ARCH
  'ARM': 'ARCH', // Archaeometry
  'ARME': 'ARCH', // Archaeometry
};

// Parse courses from raw text
const lines = rawData.split('\n');
const newCourses: Array<{code: string, name: string, credits: number, departmentCode: string}> = [];
const processedCodes = new Set<string>();

// Multiple regex patterns to match different formats
const patterns = [
  // Format: ARCH203		Digital Media in Architecture I	(3-2)2	4
  /^([A-Z]+\s*\d+)\s+([^(]+?)\s+\(\d+-\d+\)\d+\s+(\d+)/,
  // Format: COURSE_CODE	COURSE_NAME	CREDITS (with possible tab)
  /^([A-Z]+\s*\d+)\s+([^\t]+)\t\s*(\d+)/,
  // Format: PHYS 260	Physics of Sports and Games	3
  /^([A-Z]+\s+\d+)\s+([^\t]+)\s+(\d+)\s*$/,
  // Format: CRP323 Housing, Reinvestment and Household Behaviour 3(3-0)
  /^([A-Z]+\d+)\s+([^0-9]+)\s+(\d+)\(\d+-\d+\)/,
];

for (const line of lines) {
  const trimmedLine = line.trim();

  // Skip empty lines, headers, navigation text, etc.
  if (!trimmedLine ||
      trimmedLine.includes('Skip to main') ||
      trimmedLine.includes('Ana Sayfa') ||
      trimmedLine.includes('Dekanlık') ||
      trimmedLine.includes('Footer') ||
      trimmedLine.includes('COURSE CODE') ||
      trimmedLine.includes('Last updated') ||
      trimmedLine.includes('Üniversiteler Mahallesi') ||
      trimmedLine.includes('© Orta Doğu') ||
      trimmedLine.includes('ODTÜ') ||
      trimmedLine.includes('English') ||
      trimmedLine.includes('Bölümler') ||
      trimmedLine.includes('Formlar') ||
      trimmedLine.includes('Mezunlar') ||
      trimmedLine.includes('Araştırma') ||
      trimmedLine.includes('İletişim') ||
      trimmedLine.includes('Son Güncelleme') ||
      trimmedLine.includes('---') ||
      trimmedLine.startsWith('With consent') ||
      trimmedLine.length < 5) {
    continue;
  }

  let matched = false;

  for (const pattern of patterns) {
    const match = trimmedLine.match(pattern);
    if (match) {
      const code = match[1].replace(/\s+/g, '').trim(); // Remove spaces from code
      const name = match[2].trim();
      let credits = parseInt(match[3]) || 3;

      // Skip if name is empty or looks like a header
      if (!name || name.length < 3 || name === 'CREDITS' || name.includes('COURSE')) {
        continue;
      }

      // Find department code from course code prefix
      const prefixMatch = code.match(/^([A-Z]+)/);
      if (!prefixMatch) continue;

      const prefix = prefixMatch[1];
      const departmentCode = departmentMapping[prefix];

      if (!departmentCode) {
        // Skip graduate courses (5XX, 6XX, 7XX) silently
        const courseNum = code.match(/\d+/)?.[0];
        if (courseNum && parseInt(courseNum) >= 500) {
          continue;
        }
        console.log(`Unknown department for: ${code} - ${name}`);
        continue;
      }

      // Skip graduate level courses (5XX and above)
      const courseNum = code.match(/\d+/)?.[0];
      if (courseNum && parseInt(courseNum) >= 500) {
        continue;
      }

      // Skip if already exists or already processed
      if (existingCodes.has(code) || processedCodes.has(code)) {
        continue;
      }

      // Normalize credits (max 4 for electives usually)
      if (credits > 6) credits = 3;

      newCourses.push({
        code,
        name,
        credits,
        departmentCode
      });

      processedCodes.add(code);
      matched = true;
      break;
    }
  }

  // Try a simpler pattern for remaining lines
  if (!matched) {
    // Simple pattern: CODE followed by name (with optional credits at end)
    const simpleMatch = trimmedLine.match(/^([A-Z]+)\s*(\d{3,4})\s+(.+?)\s*(\d+)?\s*$/);
    if (simpleMatch) {
      const code = `${simpleMatch[1]}${simpleMatch[2]}`;
      const name = simpleMatch[3].trim();
      const credits = parseInt(simpleMatch[4]) || 3;

      if (name.length < 3) continue;

      const prefixMatch = code.match(/^([A-Z]+)/);
      if (!prefixMatch) continue;

      const prefix = prefixMatch[1];
      const departmentCode = departmentMapping[prefix];

      if (!departmentCode) continue;

      // Skip graduate courses
      const courseNum = parseInt(simpleMatch[2]);
      if (courseNum >= 500) continue;

      if (existingCodes.has(code) || processedCodes.has(code)) continue;

      newCourses.push({
        code,
        name,
        credits: credits > 6 ? 3 : credits,
        departmentCode
      });

      processedCodes.add(code);
    }
  }
}

// Add new courses to data
for (const course of newCourses) {
  data.courses.push(course);
  console.log(`Added: ${course.code} - ${course.name} (${course.credits} kr, ${course.departmentCode})`);
}

// Sort courses by code
data.courses.sort((a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code));

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Added ${newCourses.length} new elective courses`);
console.log(`📊 Total courses: ${data.courses.length}`);
