import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modern Languages courses from METU School of Foreign Languages
const newCourses = [
  // German - GER
  { code: "GER101", name: "German I", credits: 3, departmentCode: "ENG" },
  { code: "GER102", name: "German II", credits: 3, departmentCode: "ENG" },
  { code: "GER201", name: "German III", credits: 3, departmentCode: "ENG" },
  { code: "GER202", name: "German IV", credits: 3, departmentCode: "ENG" },
  { code: "GER301", name: "German V", credits: 3, departmentCode: "ENG" },
  { code: "GER302", name: "German VI", credits: 3, departmentCode: "ENG" },

  // French - FRE
  { code: "FRE101", name: "French I", credits: 3, departmentCode: "ENG" },
  { code: "FRE102", name: "French II", credits: 3, departmentCode: "ENG" },
  { code: "FRE201", name: "French III", credits: 3, departmentCode: "ENG" },
  { code: "FRE202", name: "French IV", credits: 3, departmentCode: "ENG" },
  { code: "FRE301", name: "French V", credits: 3, departmentCode: "ENG" },
  { code: "FRE302", name: "French VI", credits: 3, departmentCode: "ENG" },

  // Spanish - SPA
  { code: "SPA101", name: "Spanish I", credits: 3, departmentCode: "ENG" },
  { code: "SPA102", name: "Spanish II", credits: 3, departmentCode: "ENG" },
  { code: "SPA201", name: "Spanish III", credits: 3, departmentCode: "ENG" },
  { code: "SPA202", name: "Spanish IV", credits: 3, departmentCode: "ENG" },

  // Russian - RUS
  { code: "RUS101", name: "Russian I", credits: 3, departmentCode: "ENG" },
  { code: "RUS102", name: "Russian II", credits: 3, departmentCode: "ENG" },
  { code: "RUS201", name: "Russian III", credits: 3, departmentCode: "ENG" },
  { code: "RUS202", name: "Russian IV", credits: 3, departmentCode: "ENG" },

  // Chinese - CHI
  { code: "CHI101", name: "Chinese I", credits: 3, departmentCode: "ENG" },
  { code: "CHI102", name: "Chinese II", credits: 3, departmentCode: "ENG" },
  { code: "CHI201", name: "Chinese III", credits: 3, departmentCode: "ENG" },
  { code: "CHI202", name: "Chinese IV", credits: 3, departmentCode: "ENG" },

  // Japanese - JPN
  { code: "JPN101", name: "Japanese I", credits: 3, departmentCode: "ENG" },
  { code: "JPN102", name: "Japanese II", credits: 3, departmentCode: "ENG" },
  { code: "JPN201", name: "Japanese III", credits: 3, departmentCode: "ENG" },
  { code: "JPN202", name: "Japanese IV", credits: 3, departmentCode: "ENG" },

  // Italian - ITA
  { code: "ITA101", name: "Italian I", credits: 3, departmentCode: "ENG" },
  { code: "ITA102", name: "Italian II", credits: 3, departmentCode: "ENG" },
  { code: "ITA201", name: "Italian III", credits: 3, departmentCode: "ENG" },
  { code: "ITA202", name: "Italian IV", credits: 3, departmentCode: "ENG" },

  // Arabic - ARA
  { code: "ARA101", name: "Arabic I", credits: 3, departmentCode: "ENG" },
  { code: "ARA102", name: "Arabic II", credits: 3, departmentCode: "ENG" },
  { code: "ARA201", name: "Arabic III", credits: 3, departmentCode: "ENG" },
  { code: "ARA202", name: "Arabic IV", credits: 3, departmentCode: "ENG" },

  // Korean - KOR
  { code: "KOR101", name: "Korean I", credits: 3, departmentCode: "ENG" },
  { code: "KOR102", name: "Korean II", credits: 3, departmentCode: "ENG" },
  { code: "KOR201", name: "Korean III", credits: 3, departmentCode: "ENG" },
  { code: "KOR202", name: "Korean IV", credits: 3, departmentCode: "ENG" },

  // Persian - PER
  { code: "PER101", name: "Persian I", credits: 3, departmentCode: "ENG" },
  { code: "PER102", name: "Persian II", credits: 3, departmentCode: "ENG" },

  // Greek - GRE
  { code: "GRE101", name: "Greek I", credits: 3, departmentCode: "ENG" },
  { code: "GRE102", name: "Greek II", credits: 3, departmentCode: "ENG" },
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
  }
}

// Sort courses by code
data.courses.sort((a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code));

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Added ${addedCount} new courses`);
console.log(`📊 Total courses: ${data.courses.length}`);
