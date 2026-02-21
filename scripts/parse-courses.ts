import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read raw course data
const rawDataPath = path.join(__dirname, 'courses-raw.txt');
const rawData = fs.readFileSync(rawDataPath, 'utf-8');

// Read existing metu-data.json
const dataPath = path.join(__dirname, 'metu-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get existing course codes
const existingCodes = new Set(data.courses.map((c: { code: string }) => c.code));

// Department code mapping based on course prefix
const departmentMapping: Record<string, string> = {
  'ECON': 'ECON',
  'BA': 'BA',
  'BAS': 'BA', // BA SUNY program
  'ADM': 'ADM',
  'IR': 'IR',
  'MATH': 'MATH',
  'PHYS': 'PHYS',
  'CHEM': 'CHEM',
  'BIOL': 'BIOL',
  'STAT': 'STAT',
  'PSY': 'PSY',
  'SOC': 'SOC',
  'HIST': 'HIST',
  'PHIL': 'PHIL',
  'CENG': 'CENG',
  'EE': 'EE',
  'ME': 'ME',
  'CE': 'CE',
  'CHE': 'CHE',
  'ENVE': 'ENVE',
  'IE': 'IE',
  'AEE': 'AEE',
  'METE': 'METE',
  'MINE': 'MINE',
  'PETE': 'PETE',
  'GEOE': 'GEOE',
  'FDE': 'FDE',
  'ARCH': 'ARCH',
  'CRP': 'CRP',
  'ID': 'ID',
  'FLE': 'FLE',
  'ELE': 'ELE',
  'SSME': 'SSME',
  'CEIT': 'CEIT',
  'PES': 'PES',
  'EDS': 'EDS',
  'ENG': 'ENG',
  'TURK': 'TURK',
  'IS': 'IS',
  'OHS': 'ENG', // OHS courses go under ENG
  'MFGE': 'MFGE',
  'ESE': 'ESE',
  'GIA': 'IR', // Global and International Affairs goes under IR
  'GENE': 'BIOL', // Molecular Biology and Genetics goes under BIOL
  'MSE': 'METE', // Materials Science goes under METE
  'TEFL': 'FLE', // Teaching English as Foreign Language goes under FLE
  'ECE': 'EE', // Electrical and Computer Engineering goes under EE
  'ES': 'ENVE', // Environmental Sciences goes under ENVE
  'ASTR': 'PHYS', // Astronomy goes under PHYS
  // Modern Languages
  'CHIN': 'ENG', // Chinese
  'FREN': 'ENG', // French
  'GERM': 'ENG', // German
  'SPAN': 'ENG', // Spanish
  'JAPN': 'ENG', // Japanese
  'RUSS': 'ENG', // Russian
  'ARAB': 'ENG', // Arabic
  'ITAL': 'ENG', // Italian
  'KOR': 'ENG', // Korean
};

// Parse courses from raw text
const lines = rawData.split('\n');
const newCourses: Array<{code: string, name: string, credits: number, departmentCode: string}> = [];

// Regex to match course lines
// Format: COURSE_CODE\tCOURSE NAME\tCREDITS\t...
const courseRegex = /^([A-Z]+\d+)\t([^\t]+)\t(\d+(?:\.\d+)?)/;

for (const line of lines) {
  const match = line.match(courseRegex);
  if (match) {
    const code = match[1].trim();
    const name = match[2].trim();
    const credits = Math.round(parseFloat(match[3]));

    // Skip empty names, headers, and electives
    if (!name || name === 'Course Name' || name.includes('ELECTIVE')) {
      continue;
    }

    // Find department code from course code prefix
    const prefixMatch = code.match(/^([A-Z]+)/);
    if (!prefixMatch) continue;

    const prefix = prefixMatch[1];
    const departmentCode = departmentMapping[prefix];

    if (!departmentCode) {
      console.log(`Unknown department for: ${code} - ${name}`);
      continue;
    }

    // Skip if already exists
    if (existingCodes.has(code)) {
      continue;
    }

    newCourses.push({
      code,
      name,
      credits,
      departmentCode
    });

    existingCodes.add(code);
  }
}

// Add new courses to data
for (const course of newCourses) {
  data.courses.push(course);
  console.log(`Added: ${course.code} - ${course.name} (${course.departmentCode})`);
}

// Sort courses by code
data.courses.sort((a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code));

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Added ${newCourses.length} new courses`);
console.log(`📊 Total courses: ${data.courses.length}`);
