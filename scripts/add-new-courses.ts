import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New courses from the curriculum data
const newCourses = [
  // ID - Industrial Design (new ones)
  { code: "ID111", name: "Design Communication I", credits: 3, departmentCode: "ID" },
  { code: "ID112", name: "Design Communication II", credits: 3, departmentCode: "ID" },
  { code: "ID113", name: "Computers in Design", credits: 3, departmentCode: "ID" },
  { code: "ID121", name: "Introduction to Industrial Design", credits: 3, departmentCode: "ID" },
  { code: "ID211", name: "Design Communication III", credits: 3, departmentCode: "ID" },
  { code: "ID221", name: "History of Industrial Design", credits: 3, departmentCode: "ID" },
  { code: "ID223", name: "Design, Society and Culture", credits: 3, departmentCode: "ID" },
  { code: "ID233", name: "Structures", credits: 3, departmentCode: "ID" },
  { code: "ID236", name: "Manufacturing Materials", credits: 3, departmentCode: "ID" },
  { code: "ID242", name: "Human Factors and Ergonomics", credits: 3, departmentCode: "ID" },
  { code: "ID290", name: "Elementary Workshop Practice & Computer Literacy in Design", credits: 0, departmentCode: "ID" },
  { code: "ID390", name: "Summer Practice in a Production Establishment", credits: 0, departmentCode: "ID" },
  { code: "ID395", name: "Portfolio Presentation", credits: 3, departmentCode: "ID" },
  { code: "ID480", name: "Design Management", credits: 3, departmentCode: "ID" },
  { code: "ID490", name: "Summer Practice in a Design Office", credits: 0, departmentCode: "ID" },

  // ARCH - Architecture (new ones)
  { code: "ARCH103", name: "Graphic Communication I", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH104", name: "Graphic Communication II", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH190", name: "Introduction to Surveying and Construction Techniques", credits: 0, departmentCode: "ARCH" },
  { code: "ARCH204", name: "Digital Media in Architecture II", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH211", name: "Architectural History II", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH212", name: "Architectural History III", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH251", name: "Building Materials Technologies", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH252", name: "Building Construction Technologies", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH282", name: "Principles of Built Environment", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH290", name: "Internship in Construction", credits: 0, departmentCode: "ARCH" },
  { code: "ARCH291", name: "Landscape Design", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH312", name: "Principles of City Planning and Urban Design", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH331", name: "Structural Design in Architecture I", credits: 4, departmentCode: "ARCH" },
  { code: "ARCH332", name: "Structural Design in Architecture II", credits: 4, departmentCode: "ARCH" },
  { code: "ARCH381", name: "Environmental and Building Systems", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH382", name: "Environmental Control Technologies", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH390", name: "Internship in Professional Practice", credits: 0, departmentCode: "ARCH" },
  { code: "ARCH452", name: "Professional Practice", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH493", name: "Principles of Cultural Heritage Conservation", credits: 3, departmentCode: "ARCH" },

  // CRP - City and Regional Planning (new ones)
  { code: "CRP108", name: "Urbanization and Urban Sociology", credits: 3, departmentCode: "CRP" },
  { code: "CRP111", name: "Introduction to City and Regional Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP135", name: "Graphic Communication for Planners", credits: 3, departmentCode: "CRP" },
  { code: "CRP146", name: "Introduction to Computers in Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP213", name: "The City in History", credits: 3, departmentCode: "CRP" },
  { code: "CRP214", name: "Creative Thinking for Planners", credits: 3, departmentCode: "CRP" },
  { code: "CRP236", name: "Economics for Planners", credits: 3, departmentCode: "CRP" },
  { code: "CRP238", name: "Introduction to Geographic Information Systems in Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP241", name: "Urban Transport Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP242", name: "Urban Geography", credits: 3, departmentCode: "CRP" },
  { code: "CRP290", name: "Summer Practice - Mapping, Topography & Computer Presentation", credits: 0, departmentCode: "CRP" },
  { code: "CRP341", name: "Urban Economics", credits: 3, departmentCode: "CRP" },
  { code: "CRP370", name: "Principles of Housing", credits: 3, departmentCode: "CRP" },
  { code: "CRP371", name: "Planning Techniques", credits: 3, departmentCode: "CRP" },
  { code: "CRP372", name: "Planning Theory", credits: 3, departmentCode: "CRP" },
  { code: "CRP373", name: "Engineering for Urban Planners", credits: 3, departmentCode: "CRP" },
  { code: "CRP382", name: "Legal and Administrative Aspects of Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP403", name: "Urban Conservation Planning", credits: 3, departmentCode: "CRP" },
  { code: "CRP409", name: "Urban Politics", credits: 3, departmentCode: "CRP" },
  { code: "CRP490", name: "Summer Practice: Municipal, Public or Private Planning Office", credits: 0, departmentCode: "CRP" },

  // Common courses
  { code: "PHYS101", name: "Elementary Physics I", credits: 3, departmentCode: "PHYS" },
  { code: "MATH125", name: "Basic Mathematics I", credits: 4, departmentCode: "MATH" },
  { code: "MATH126", name: "Basic Mathematics II", credits: 4, departmentCode: "MATH" },
  { code: "BA100", name: "Career Planning", credits: 0, departmentCode: "BA" },
  { code: "BA3702", name: "Introduction to Marketing", credits: 3, departmentCode: "BA" },
  { code: "ME212", name: "Principles of Production Engineering", credits: 3, departmentCode: "ME" },
  { code: "OHS101", name: "Occupational Health and Safety I", credits: 0, departmentCode: "ENG" },
  { code: "OHS301", name: "Occupational Health and Safety II", credits: 0, departmentCode: "ENG" },
  { code: "HIST2205", name: "History of the Turkish Revolution I", credits: 0, departmentCode: "HIST" },
  { code: "HIST2206", name: "History of the Turkish Revolution II", credits: 0, departmentCode: "HIST" },
  { code: "TURK201", name: "Elementary Turkish I", credits: 0, departmentCode: "TURK" },
  { code: "TURK202", name: "Intermediate Turkish I", credits: 0, departmentCode: "TURK" },
  { code: "TURK303", name: "Turkish I", credits: 0, departmentCode: "TURK" },
  { code: "TURK304", name: "Turkish II", credits: 0, departmentCode: "TURK" },
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
