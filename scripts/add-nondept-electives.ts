import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Additional non-departmental elective courses
const newCourses = [
  // Business Administration - missing ones
  { code: "BA4517", name: "Decision Analysis: Tools and Methods", credits: 3, departmentCode: "BA" },
  { code: "BA4839", name: "Financial Modeling with Spreadsheet", credits: 3, departmentCode: "BA" },

  // Computer Engineering - service courses
  { code: "CENG301", name: "Algorithms and Data Structures", credits: 3, departmentCode: "CENG" },
  { code: "CENG302", name: "Introduction to Database Management Systems", credits: 3, departmentCode: "CENG" },
  { code: "CENG305", name: "Object Oriented Programming with Java", credits: 3, departmentCode: "CENG" },
  { code: "CENG310", name: "Algorithms and Data Structures with Python", credits: 3, departmentCode: "CENG" },

  // Economics
  { code: "ECON484", name: "Applied Econometrics II", credits: 3, departmentCode: "ECON" },

  // Physics - missing ones
  { code: "PHYS100", name: "Physics for Non-Scientists I", credits: 3, departmentCode: "PHYS" },
  { code: "PHYS455", name: "Introduction to Quantum Information Theory", credits: 3, departmentCode: "PHYS" },

  // CEIT - missing ones
  { code: "CEIT313", name: "Use of Operating Systems", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT418", name: "Introduction to Data Science for Education", credits: 3, departmentCode: "CEIT" },

  // English - missing ones
  { code: "ENG220", name: "The English Language and the Future of World Englishes", credits: 3, departmentCode: "ENG" },

  // Physical Education - missing ones
  { code: "PES204", name: "Pool and Billiards", credits: 3, departmentCode: "PES" },
  { code: "PES307", name: "Intermediate Swimming", credits: 3, departmentCode: "PES" },
  { code: "PES342", name: "Motor Learning", credits: 3, departmentCode: "PES" },
  { code: "PES480", name: "Physical Activity and Public Health", credits: 3, departmentCode: "PES" },

  // Music - History courses
  { code: "MUS231", name: "History of Jazz", credits: 3, departmentCode: "ENG" },
  { code: "MUS241", name: "History of Music", credits: 3, departmentCode: "ENG" },

  // Engineering Management (graduate but service courses)
  // These are graduate level, skip for now
];

// Read existing data
const dataPath = path.join(__dirname, 'metu-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get existing course codes
const existingCodes = new Set(data.courses.map((c: { code: string }) => c.code));

// Add only new courses
let addedCount = 0;
for (const course of newCourses) {
  if (!existingCodes.has(course.code)) {
    data.courses.push(course);
    addedCount++;
    console.log(`Added: ${course.code} - ${course.name}`);
  } else {
    console.log(`Already exists: ${course.code}`);
  }
}

// Sort courses by code
data.courses.sort((a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code));

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Added ${addedCount} new courses`);
console.log(`📊 Total courses: ${data.courses.length}`);
