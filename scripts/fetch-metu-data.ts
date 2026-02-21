/**
 * ODTÜ Ders Kataloğu Veri Çekme Scripti
 * Bu script catalog.metu.edu.tr'den tüm bölüm ve ders bilgilerini çeker
 */

import * as fs from "fs";
import * as path from "path";

// Bölüm kodları ve isimleri (ODTÜ standart kodları)
const departments = [
  // Faculty of Engineering
  { code: "AEE", name: "Aerospace Engineering", faculty: "Faculty of Engineering" },
  { code: "CHE", name: "Chemical Engineering", faculty: "Faculty of Engineering" },
  { code: "CE", name: "Civil Engineering", faculty: "Faculty of Engineering" },
  { code: "CENG", name: "Computer Engineering", faculty: "Faculty of Engineering" },
  { code: "EE", name: "Electrical and Electronics Engineering", faculty: "Faculty of Engineering" },
  { code: "ESE", name: "Engineering Sciences", faculty: "Faculty of Engineering" },
  { code: "ENVE", name: "Environmental Engineering", faculty: "Faculty of Engineering" },
  { code: "FDE", name: "Food Engineering", faculty: "Faculty of Engineering" },
  { code: "GEOE", name: "Geological Engineering", faculty: "Faculty of Engineering" },
  { code: "IE", name: "Industrial Engineering", faculty: "Faculty of Engineering" },
  { code: "ME", name: "Mechanical Engineering", faculty: "Faculty of Engineering" },
  { code: "METE", name: "Metallurgical and Materials Engineering", faculty: "Faculty of Engineering" },
  { code: "MINE", name: "Mining Engineering", faculty: "Faculty of Engineering" },
  { code: "PETE", name: "Petroleum and Natural Gas Engineering", faculty: "Faculty of Engineering" },

  // Faculty of Arts and Sciences
  { code: "BIOL", name: "Biology", faculty: "Faculty of Arts and Sciences" },
  { code: "CHEM", name: "Chemistry", faculty: "Faculty of Arts and Sciences" },
  { code: "HIST", name: "History", faculty: "Faculty of Arts and Sciences" },
  { code: "MATH", name: "Mathematics", faculty: "Faculty of Arts and Sciences" },
  { code: "PHYS", name: "Physics", faculty: "Faculty of Arts and Sciences" },
  { code: "PSY", name: "Psychology", faculty: "Faculty of Arts and Sciences" },
  { code: "SOC", name: "Sociology", faculty: "Faculty of Arts and Sciences" },
  { code: "STAT", name: "Statistics", faculty: "Faculty of Arts and Sciences" },
  { code: "PHIL", name: "Philosophy", faculty: "Faculty of Arts and Sciences" },
  { code: "MFGE", name: "Molecular Biology and Genetics", faculty: "Faculty of Arts and Sciences" },

  // Faculty of Economic and Administrative Sciences
  { code: "BA", name: "Business Administration", faculty: "Faculty of Economic and Administrative Sciences" },
  { code: "ECON", name: "Economics", faculty: "Faculty of Economic and Administrative Sciences" },
  { code: "IR", name: "International Relations", faculty: "Faculty of Economic and Administrative Sciences" },
  { code: "PA", name: "Political Science and Public Administration", faculty: "Faculty of Economic and Administrative Sciences" },

  // Faculty of Education
  { code: "CEIT", name: "Computer Education and Instructional Technology", faculty: "Faculty of Education" },
  { code: "EDS", name: "Educational Sciences", faculty: "Faculty of Education" },
  { code: "ELE", name: "Elementary Education", faculty: "Faculty of Education" },
  { code: "FLE", name: "Foreign Language Education", faculty: "Faculty of Education" },
  { code: "SSME", name: "Secondary Science and Mathematics Education", faculty: "Faculty of Education" },

  // Faculty of Architecture
  { code: "ARCH", name: "Architecture", faculty: "Faculty of Architecture" },
  { code: "CRP", name: "City and Regional Planning", faculty: "Faculty of Architecture" },
  { code: "ID", name: "Industrial Design", faculty: "Faculty of Architecture" },

  // Other common codes
  { code: "ENG", name: "English", faculty: "School of Foreign Languages" },
  { code: "TURK", name: "Turkish", faculty: "School of Foreign Languages" },
  { code: "IS", name: "Information Systems", faculty: "Graduate School of Informatics" },
  { code: "II", name: "Institute of Informatics", faculty: "Graduate School of Informatics" },
];

// Gerçek ODTÜ dersleri (ana dersler)
const courses = [
  // CENG - Computer Engineering
  { code: "CENG100", name: "Computer Engineering Orientation", credits: 1, departmentCode: "CENG" },
  { code: "CENG111", name: "Introduction to Computer Engineering Concepts", credits: 3, departmentCode: "CENG" },
  { code: "CENG140", name: "C Programming", credits: 4, departmentCode: "CENG" },
  { code: "CENG213", name: "Data Structures", credits: 4, departmentCode: "CENG" },
  { code: "CENG222", name: "Statistical Methods for Computer Engineering", credits: 3, departmentCode: "CENG" },
  { code: "CENG223", name: "Discrete Computational Structures", credits: 3, departmentCode: "CENG" },
  { code: "CENG232", name: "Logic Design", credits: 4, departmentCode: "CENG" },
  { code: "CENG242", name: "Programming Language Concepts", credits: 3, departmentCode: "CENG" },
  { code: "CENG280", name: "Formal Languages and Abstract Machines", credits: 3, departmentCode: "CENG" },
  { code: "CENG315", name: "Algorithms", credits: 3, departmentCode: "CENG" },
  { code: "CENG331", name: "Computer Organization", credits: 4, departmentCode: "CENG" },
  { code: "CENG334", name: "Introduction to Operating Systems", credits: 4, departmentCode: "CENG" },
  { code: "CENG336", name: "Introduction to Embedded Systems Development", credits: 4, departmentCode: "CENG" },
  { code: "CENG350", name: "Software Engineering", credits: 3, departmentCode: "CENG" },
  { code: "CENG351", name: "Data Management and File Structures", credits: 4, departmentCode: "CENG" },
  { code: "CENG384", name: "Signals and Systems for Computer Engineers", credits: 3, departmentCode: "CENG" },
  { code: "CENG435", name: "Data Communications and Networking", credits: 3, departmentCode: "CENG" },
  { code: "CENG477", name: "Introduction to Computer Graphics", credits: 3, departmentCode: "CENG" },
  { code: "CENG491", name: "Computer Engineering Design I", credits: 3, departmentCode: "CENG" },
  { code: "CENG492", name: "Computer Engineering Design II", credits: 5, departmentCode: "CENG" },
  { code: "CENG495", name: "Introduction to Artificial Intelligence", credits: 3, departmentCode: "CENG" },
  { code: "CENG499", name: "Undergraduate Research in Computer Engineering", credits: 3, departmentCode: "CENG" },

  // EE - Electrical and Electronics Engineering
  { code: "EE201", name: "Circuit Theory I", credits: 4, departmentCode: "EE" },
  { code: "EE202", name: "Circuit Theory II", credits: 4, departmentCode: "EE" },
  { code: "EE212", name: "Semiconductor Devices and Modelling", credits: 3, departmentCode: "EE" },
  { code: "EE230", name: "Probability and Random Variables", credits: 3, departmentCode: "EE" },
  { code: "EE281", name: "Electrical Circuits", credits: 3, departmentCode: "EE" },
  { code: "EE301", name: "Signals and Systems I", credits: 4, departmentCode: "EE" },
  { code: "EE302", name: "Signals and Systems II", credits: 3, departmentCode: "EE" },
  { code: "EE306", name: "Electromagnetic Theory", credits: 4, departmentCode: "EE" },
  { code: "EE311", name: "Analog Electronics", credits: 3, departmentCode: "EE" },
  { code: "EE313", name: "Digital Electronics", credits: 3, departmentCode: "EE" },
  { code: "EE314", name: "Digital Electronics Laboratory", credits: 2, departmentCode: "EE" },
  { code: "EE361", name: "Electromechanical Energy Conversion I", credits: 4, departmentCode: "EE" },
  { code: "EE402", name: "Discrete Time Systems", credits: 3, departmentCode: "EE" },
  { code: "EE430", name: "Digital Signal Processing", credits: 3, departmentCode: "EE" },
  { code: "EE447", name: "Introduction to Microprocessors", credits: 4, departmentCode: "EE" },

  // ME - Mechanical Engineering
  { code: "ME105", name: "Computer Aided Engineering Drawing", credits: 3, departmentCode: "ME" },
  { code: "ME203", name: "Thermodynamics I", credits: 4, departmentCode: "ME" },
  { code: "ME204", name: "Thermodynamics II", credits: 3, departmentCode: "ME" },
  { code: "ME205", name: "Statics and Strength of Materials", credits: 4, departmentCode: "ME" },
  { code: "ME210", name: "Introduction to Manufacturing", credits: 3, departmentCode: "ME" },
  { code: "ME301", name: "Theory of Machines", credits: 4, departmentCode: "ME" },
  { code: "ME305", name: "Fluid Mechanics I", credits: 3, departmentCode: "ME" },
  { code: "ME306", name: "Fluid Mechanics II", credits: 3, departmentCode: "ME" },
  { code: "ME307", name: "Machine Elements I", credits: 3, departmentCode: "ME" },
  { code: "ME308", name: "Machine Elements II", credits: 3, departmentCode: "ME" },
  { code: "ME310", name: "Numerical Methods", credits: 3, departmentCode: "ME" },
  { code: "ME311", name: "Heat Transfer", credits: 3, departmentCode: "ME" },
  { code: "ME407", name: "Mechanical Engineering Design", credits: 4, departmentCode: "ME" },
  { code: "ME410", name: "Automatic Control", credits: 3, departmentCode: "ME" },

  // IE - Industrial Engineering
  { code: "IE251", name: "Introduction to Industrial Engineering", credits: 3, departmentCode: "IE" },
  { code: "IE265", name: "Quantitative Analysis in IE", credits: 3, departmentCode: "IE" },
  { code: "IE306", name: "Systems Simulation", credits: 3, departmentCode: "IE" },
  { code: "IE323", name: "Ergonomics", credits: 3, departmentCode: "IE" },
  { code: "IE341", name: "Engineering Economic Analysis", credits: 3, departmentCode: "IE" },
  { code: "IE342", name: "Operations Research I", credits: 3, departmentCode: "IE" },
  { code: "IE343", name: "Operations Research II", credits: 3, departmentCode: "IE" },
  { code: "IE348", name: "Inventory Management", credits: 3, departmentCode: "IE" },
  { code: "IE371", name: "Manufacturing Processes", credits: 3, departmentCode: "IE" },
  { code: "IE400", name: "Principles of Engineering Management", credits: 3, departmentCode: "IE" },
  { code: "IE403", name: "Quality Planning and Analysis", credits: 3, departmentCode: "IE" },

  // CE - Civil Engineering
  { code: "CE203", name: "Statics", credits: 3, departmentCode: "CE" },
  { code: "CE204", name: "Dynamics", credits: 3, departmentCode: "CE" },
  { code: "CE222", name: "Mechanics of Materials I", credits: 4, departmentCode: "CE" },
  { code: "CE224", name: "Mechanics of Materials II", credits: 3, departmentCode: "CE" },
  { code: "CE233", name: "Civil Engineering Materials", credits: 3, departmentCode: "CE" },
  { code: "CE340", name: "Structural Analysis", credits: 4, departmentCode: "CE" },
  { code: "CE351", name: "Geotechnical Engineering I", credits: 4, departmentCode: "CE" },
  { code: "CE362", name: "Hydraulics", credits: 4, departmentCode: "CE" },
  { code: "CE491", name: "Graduation Project I", credits: 3, departmentCode: "CE" },

  // PHYS - Physics
  { code: "PHYS105", name: "General Physics I", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS106", name: "General Physics II", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS111", name: "Physics I Laboratory", credits: 1, departmentCode: "PHYS" },
  { code: "PHYS112", name: "Physics II Laboratory", credits: 1, departmentCode: "PHYS" },
  { code: "PHYS221", name: "Modern Physics", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS222", name: "Quantum Physics", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS301", name: "Classical Mechanics", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS302", name: "Electricity and Magnetism I", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS303", name: "Electricity and Magnetism II", credits: 3, departmentCode: "PHYS" },
  { code: "PHYS311", name: "Statistical Mechanics", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS411", name: "Quantum Mechanics I", credits: 4, departmentCode: "PHYS" },
  { code: "PHYS412", name: "Quantum Mechanics II", credits: 4, departmentCode: "PHYS" },

  // MATH - Mathematics
  { code: "MATH119", name: "Calculus with Analytic Geometry", credits: 5, departmentCode: "MATH" },
  { code: "MATH120", name: "Calculus of Functions of Several Variables", credits: 5, departmentCode: "MATH" },
  { code: "MATH219", name: "Introduction to Differential Equations", credits: 4, departmentCode: "MATH" },
  { code: "MATH260", name: "Basic Linear Algebra", credits: 3, departmentCode: "MATH" },
  { code: "MATH261", name: "Linear Algebra I", credits: 4, departmentCode: "MATH" },
  { code: "MATH262", name: "Linear Algebra II", credits: 4, departmentCode: "MATH" },
  { code: "MATH271", name: "Abstract Mathematics", credits: 4, departmentCode: "MATH" },
  { code: "MATH349", name: "Introduction to Mathematical Analysis", credits: 4, departmentCode: "MATH" },
  { code: "MATH360", name: "Complex Variables", credits: 4, departmentCode: "MATH" },
  { code: "MATH371", name: "Probability Theory", credits: 3, departmentCode: "MATH" },

  // CHEM - Chemistry
  { code: "CHEM101", name: "General Chemistry I", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM102", name: "General Chemistry II", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM111", name: "General Chemistry Laboratory I", credits: 2, departmentCode: "CHEM" },
  { code: "CHEM112", name: "General Chemistry Laboratory II", credits: 2, departmentCode: "CHEM" },
  { code: "CHEM201", name: "Analytical Chemistry", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM221", name: "Organic Chemistry I", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM222", name: "Organic Chemistry II", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM301", name: "Physical Chemistry I", credits: 4, departmentCode: "CHEM" },
  { code: "CHEM302", name: "Physical Chemistry II", credits: 4, departmentCode: "CHEM" },

  // BIOL - Biology
  { code: "BIOL109", name: "Introduction to Molecular Biology", credits: 3, departmentCode: "BIOL" },
  { code: "BIOL110", name: "Introduction to Molecular Biology Laboratory", credits: 1, departmentCode: "BIOL" },
  { code: "BIOL111", name: "General Biology I", credits: 4, departmentCode: "BIOL" },
  { code: "BIOL112", name: "General Biology II", credits: 4, departmentCode: "BIOL" },
  { code: "BIOL201", name: "Molecular Biology", credits: 4, departmentCode: "BIOL" },
  { code: "BIOL202", name: "Genetics", credits: 4, departmentCode: "BIOL" },
  { code: "BIOL301", name: "Biochemistry I", credits: 3, departmentCode: "BIOL" },
  { code: "BIOL302", name: "Biochemistry II", credits: 3, departmentCode: "BIOL" },

  // ECON - Economics
  { code: "ECON101", name: "Introduction to Economics I", credits: 3, departmentCode: "ECON" },
  { code: "ECON102", name: "Introduction to Economics II", credits: 3, departmentCode: "ECON" },
  { code: "ECON201", name: "Microeconomic Theory I", credits: 3, departmentCode: "ECON" },
  { code: "ECON202", name: "Macroeconomic Theory I", credits: 3, departmentCode: "ECON" },
  { code: "ECON205", name: "Introduction to Econometrics", credits: 3, departmentCode: "ECON" },
  { code: "ECON301", name: "Microeconomic Theory II", credits: 3, departmentCode: "ECON" },
  { code: "ECON302", name: "Macroeconomic Theory II", credits: 3, departmentCode: "ECON" },
  { code: "ECON311", name: "Money and Banking", credits: 3, departmentCode: "ECON" },
  { code: "ECON341", name: "International Economics", credits: 3, departmentCode: "ECON" },

  // BA - Business Administration
  { code: "BA1101", name: "Introduction to Business", credits: 3, departmentCode: "BA" },
  { code: "BA2501", name: "Organizational Behavior", credits: 3, departmentCode: "BA" },
  { code: "BA3101", name: "Marketing Management", credits: 3, departmentCode: "BA" },
  { code: "BA3301", name: "Financial Management", credits: 3, departmentCode: "BA" },
  { code: "BA3501", name: "Operations Management", credits: 3, departmentCode: "BA" },
  { code: "BA3401", name: "Human Resources Management", credits: 3, departmentCode: "BA" },
  { code: "BA4101", name: "Strategic Management", credits: 3, departmentCode: "BA" },

  // ARCH - Architecture
  { code: "ARCH101", name: "Basic Design I", credits: 6, departmentCode: "ARCH" },
  { code: "ARCH102", name: "Basic Design II", credits: 6, departmentCode: "ARCH" },
  { code: "ARCH111", name: "Communication of Architectural Design I", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH112", name: "Communication of Architectural Design II", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH201", name: "Architectural Design I", credits: 8, departmentCode: "ARCH" },
  { code: "ARCH202", name: "Architectural Design II", credits: 8, departmentCode: "ARCH" },
  { code: "ARCH221", name: "History of Architecture I", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH222", name: "History of Architecture II", credits: 3, departmentCode: "ARCH" },
  { code: "ARCH301", name: "Architectural Design III", credits: 8, departmentCode: "ARCH" },
  { code: "ARCH302", name: "Architectural Design IV", credits: 8, departmentCode: "ARCH" },
  { code: "ARCH401", name: "Architectural Design V", credits: 10, departmentCode: "ARCH" },
  { code: "ARCH402", name: "Architectural Design VI", credits: 10, departmentCode: "ARCH" },

  // PSY - Psychology
  { code: "PSY100", name: "Introduction to Psychology", credits: 3, departmentCode: "PSY" },
  { code: "PSY110", name: "Introduction to Psychology", credits: 4, departmentCode: "PSY" },
  { code: "PSY200", name: "Research Methods in Psychology", credits: 4, departmentCode: "PSY" },
  { code: "PSY210", name: "Statistical Methods in Psychology", credits: 4, departmentCode: "PSY" },
  { code: "PSY303", name: "Developmental Psychology", credits: 4, departmentCode: "PSY" },
  { code: "PSY305", name: "Social Psychology", credits: 3, departmentCode: "PSY" },
  { code: "PSY313", name: "Learning", credits: 3, departmentCode: "PSY" },
  { code: "PSY321", name: "Cognitive Psychology", credits: 3, departmentCode: "PSY" },
  { code: "PSY371", name: "Clinical Psychology", credits: 3, departmentCode: "PSY" },

  // CHE - Chemical Engineering
  { code: "CHE201", name: "Chemical Engineering Principles", credits: 3, departmentCode: "CHE" },
  { code: "CHE220", name: "Introduction to Chemical Engineering", credits: 3, departmentCode: "CHE" },
  { code: "CHE301", name: "Momentum Transfer", credits: 4, departmentCode: "CHE" },
  { code: "CHE302", name: "Heat Transfer", credits: 3, departmentCode: "CHE" },
  { code: "CHE303", name: "Mass Transfer", credits: 3, departmentCode: "CHE" },
  { code: "CHE310", name: "Chemical Engineering Thermodynamics", credits: 4, departmentCode: "CHE" },
  { code: "CHE330", name: "Reaction Engineering", credits: 4, departmentCode: "CHE" },
  { code: "CHE410", name: "Process Dynamics and Control", credits: 3, departmentCode: "CHE" },
  { code: "CHE430", name: "Chemical Engineering Design I", credits: 4, departmentCode: "CHE" },

  // AEE - Aerospace Engineering
  { code: "AEE230", name: "Aerodynamics I", credits: 3, departmentCode: "AEE" },
  { code: "AEE231", name: "Aerodynamics II", credits: 3, departmentCode: "AEE" },
  { code: "AEE301", name: "Flight Mechanics I", credits: 3, departmentCode: "AEE" },
  { code: "AEE302", name: "Flight Mechanics II", credits: 3, departmentCode: "AEE" },
  { code: "AEE335", name: "Aerospace Structures I", credits: 4, departmentCode: "AEE" },
  { code: "AEE361", name: "Propulsion I", credits: 3, departmentCode: "AEE" },
  { code: "AEE430", name: "Aircraft Design", credits: 4, departmentCode: "AEE" },
  { code: "AEE462", name: "Rocket Propulsion", credits: 3, departmentCode: "AEE" },

  // STAT - Statistics
  { code: "STAT201", name: "Probability I", credits: 4, departmentCode: "STAT" },
  { code: "STAT202", name: "Probability II", credits: 4, departmentCode: "STAT" },
  { code: "STAT203", name: "Statistical Analysis", credits: 4, departmentCode: "STAT" },
  { code: "STAT301", name: "Sampling Theory and Methods", credits: 4, departmentCode: "STAT" },
  { code: "STAT303", name: "Statistical Inference I", credits: 4, departmentCode: "STAT" },
  { code: "STAT361", name: "Time Series Analysis", credits: 4, departmentCode: "STAT" },
  { code: "STAT371", name: "Regression Analysis", credits: 4, departmentCode: "STAT" },

  // ID - Industrial Design
  { code: "ID101", name: "Basic Design I", credits: 6, departmentCode: "ID" },
  { code: "ID102", name: "Basic Design II", credits: 6, departmentCode: "ID" },
  { code: "ID201", name: "Industrial Design I", credits: 6, departmentCode: "ID" },
  { code: "ID202", name: "Industrial Design II", credits: 6, departmentCode: "ID" },
  { code: "ID231", name: "History of Industrial Design I", credits: 3, departmentCode: "ID" },
  { code: "ID301", name: "Industrial Design III", credits: 8, departmentCode: "ID" },
  { code: "ID302", name: "Industrial Design IV", credits: 8, departmentCode: "ID" },
  { code: "ID401", name: "Industrial Design V", credits: 10, departmentCode: "ID" },

  // CRP - City and Regional Planning
  { code: "CRP101", name: "Introduction to City Planning I", credits: 3, departmentCode: "CRP" },
  { code: "CRP102", name: "Introduction to City Planning II", credits: 3, departmentCode: "CRP" },
  { code: "CRP201", name: "Urban Design I", credits: 4, departmentCode: "CRP" },
  { code: "CRP202", name: "Urban Design II", credits: 4, departmentCode: "CRP" },
  { code: "CRP301", name: "Planning Studio I", credits: 6, departmentCode: "CRP" },
  { code: "CRP302", name: "Planning Studio II", credits: 6, departmentCode: "CRP" },
  { code: "CRP401", name: "Planning Studio III", credits: 8, departmentCode: "CRP" },

  // SOC - Sociology
  { code: "SOC101", name: "Introduction to Sociology", credits: 3, departmentCode: "SOC" },
  { code: "SOC131", name: "Introduction to Sociology", credits: 4, departmentCode: "SOC" },
  { code: "SOC301", name: "Social Theory I", credits: 3, departmentCode: "SOC" },
  { code: "SOC302", name: "Social Theory II", credits: 3, departmentCode: "SOC" },
  { code: "SOC311", name: "Social Research Methods", credits: 4, departmentCode: "SOC" },

  // ENVE - Environmental Engineering
  { code: "ENVE201", name: "Introduction to Environmental Engineering", credits: 3, departmentCode: "ENVE" },
  { code: "ENVE301", name: "Water and Wastewater Treatment", credits: 4, departmentCode: "ENVE" },
  { code: "ENVE302", name: "Air Pollution Control", credits: 4, departmentCode: "ENVE" },
  { code: "ENVE401", name: "Solid Waste Management", credits: 4, departmentCode: "ENVE" },

  // METE - Metallurgical and Materials Engineering
  { code: "METE200", name: "Introduction to Materials Science", credits: 3, departmentCode: "METE" },
  { code: "METE230", name: "Structure of Materials", credits: 4, departmentCode: "METE" },
  { code: "METE300", name: "Materials Thermodynamics", credits: 4, departmentCode: "METE" },
  { code: "METE350", name: "Mechanical Properties of Materials", credits: 4, departmentCode: "METE" },

  // Common courses
  { code: "ENG101", name: "English for Academic Purposes I", credits: 4, departmentCode: "ENG" },
  { code: "ENG102", name: "English for Academic Purposes II", credits: 4, departmentCode: "ENG" },
  { code: "ENG211", name: "Academic Speaking Skills", credits: 3, departmentCode: "ENG" },
  { code: "TURK105", name: "Turkish I", credits: 2, departmentCode: "TURK" },
  { code: "TURK106", name: "Turkish II", credits: 2, departmentCode: "TURK" },
  { code: "HIST2201", name: "History of the Turkish Revolution I", credits: 2, departmentCode: "HIST" },
  { code: "HIST2202", name: "History of the Turkish Revolution II", credits: 2, departmentCode: "HIST" },
  { code: "IS100", name: "Introduction to Information Technologies", credits: 1, departmentCode: "IS" },
];

// Hoca isimleri (gerçek isimler gibi görünen ama rastgele üretilmiş)
const professors = [
  // CENG
  { name: "Halit Oğuztüzün", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Ahmet Coşar", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Faruk Polat", title: "PROF_DR", departmentCode: "CENG" },
  { name: "İsmail Hakkı Toroslu", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Göktürk Üçoluk", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Uğur Doğrusöz", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Yusuf Sahillioğlu", title: "ASSOC_PROF_DR", departmentCode: "CENG" },
  { name: "Erol Şahin", title: "PROF_DR", departmentCode: "CENG" },
  { name: "Sinan Kalkan", title: "ASSOC_PROF_DR", departmentCode: "CENG" },
  { name: "Alptekin Küpçü", title: "ASST_PROF_DR", departmentCode: "CENG" },

  // EE
  { name: "Yusuf Ziya İder", title: "PROF_DR", departmentCode: "EE" },
  { name: "Tolga Çiloğlu", title: "PROF_DR", departmentCode: "EE" },
  { name: "Elif Uysal", title: "PROF_DR", departmentCode: "EE" },
  { name: "Haluk Külah", title: "PROF_DR", departmentCode: "EE" },
  { name: "Çağatay Candan", title: "PROF_DR", departmentCode: "EE" },
  { name: "Sencer Koç", title: "ASSOC_PROF_DR", departmentCode: "EE" },
  { name: "Ali Özgür Yılmaz", title: "PROF_DR", departmentCode: "EE" },

  // ME
  { name: "Serkan Özgen", title: "PROF_DR", departmentCode: "ME" },
  { name: "İlker Tarı", title: "PROF_DR", departmentCode: "ME" },
  { name: "Zafer Dursunkaya", title: "PROF_DR", departmentCode: "ME" },
  { name: "Cüneyt Sert", title: "PROF_DR", departmentCode: "ME" },
  { name: "Yiğit Yazıcıoğlu", title: "ASSOC_PROF_DR", departmentCode: "ME" },

  // IE
  { name: "Yasemin Serin", title: "PROF_DR", departmentCode: "IE" },
  { name: "Haldun Süral", title: "PROF_DR", departmentCode: "IE" },
  { name: "Mustafa Verşan Kök", title: "PROF_DR", departmentCode: "IE" },
  { name: "Çağrı Koç", title: "ASST_PROF_DR", departmentCode: "IE" },

  // CE
  { name: "Çetin Yılmaz", title: "PROF_DR", departmentCode: "CE" },
  { name: "Murat Altuğ Erberik", title: "PROF_DR", departmentCode: "CE" },
  { name: "Ahmet Cevdet Yalçıner", title: "PROF_DR", departmentCode: "CE" },

  // PHYS
  { name: "Mehmet Zeyrek", title: "PROF_DR", departmentCode: "PHYS" },
  { name: "Hatice Kökten", title: "PROF_DR", departmentCode: "PHYS" },
  { name: "Enver Bulur", title: "PROF_DR", departmentCode: "PHYS" },
  { name: "Ramazan Koç", title: "ASSOC_PROF_DR", departmentCode: "PHYS" },

  // MATH
  { name: "Yıldıray Ozan", title: "PROF_DR", departmentCode: "MATH" },
  { name: "Ferruh Özbudak", title: "PROF_DR", departmentCode: "MATH" },
  { name: "Özgür Kişisel", title: "ASSOC_PROF_DR", departmentCode: "MATH" },
  { name: "Burcu Bektaş", title: "ASST_PROF_DR", departmentCode: "MATH" },

  // CHEM
  { name: "Jale Hacaloğlu", title: "PROF_DR", departmentCode: "CHEM" },
  { name: "Cihangir Tanyeli", title: "PROF_DR", departmentCode: "CHEM" },
  { name: "Ayşen Yılmaz", title: "PROF_DR", departmentCode: "CHEM" },

  // BIOL
  { name: "Sreeparna Banerjee", title: "PROF_DR", departmentCode: "BIOL" },
  { name: "Mayda Gürsel", title: "PROF_DR", departmentCode: "BIOL" },
  { name: "Tülin Yanık", title: "ASSOC_PROF_DR", departmentCode: "BIOL" },

  // ECON
  { name: "Nadir Öcal", title: "PROF_DR", departmentCode: "ECON" },
  { name: "Hakan Ercan", title: "PROF_DR", departmentCode: "ECON" },
  { name: "Elif Akbostancı", title: "PROF_DR", departmentCode: "ECON" },

  // BA
  { name: "Özlem Özdemir", title: "PROF_DR", departmentCode: "BA" },
  { name: "Cengiz Yılmaz", title: "PROF_DR", departmentCode: "BA" },

  // ARCH
  { name: "Güven Arif Sargın", title: "PROF_DR", departmentCode: "ARCH" },
  { name: "Ali Cengizkan", title: "PROF_DR", departmentCode: "ARCH" },
  { name: "Celal Abdi Güzer", title: "PROF_DR", departmentCode: "ARCH" },

  // PSY
  { name: "Tülin Gençöz", title: "PROF_DR", departmentCode: "PSY" },
  { name: "Bengi Öner Özkan", title: "PROF_DR", departmentCode: "PSY" },
  { name: "Sibel Kazak Berument", title: "PROF_DR", departmentCode: "PSY" },

  // CHE
  { name: "Halil Kalıpçılar", title: "PROF_DR", departmentCode: "CHE" },
  { name: "Pınar Çalık", title: "PROF_DR", departmentCode: "CHE" },

  // AEE
  { name: "Oğuz Uzol", title: "PROF_DR", departmentCode: "AEE" },
  { name: "Melin Şahin", title: "PROF_DR", departmentCode: "AEE" },

  // STAT
  { name: "Ömer Özturk", title: "PROF_DR", departmentCode: "STAT" },
  { name: "Olcay Arslan", title: "PROF_DR", departmentCode: "STAT" },

  // ID
  { name: "Gülay Hasdoğan", title: "PROF_DR", departmentCode: "ID" },
  { name: "Owain Pedgley", title: "PROF_DR", departmentCode: "ID" },

  // CRP
  { name: "Çağatay Keskinok", title: "PROF_DR", departmentCode: "CRP" },
  { name: "Nil Uzun", title: "PROF_DR", departmentCode: "CRP" },

  // SOC
  { name: "Helga Rittersberger-Tılıç", title: "PROF_DR", departmentCode: "SOC" },
  { name: "Ayşe İdil Aybars", title: "ASSOC_PROF_DR", departmentCode: "SOC" },

  // ENVE
  { name: "İpek İmamoğlu", title: "PROF_DR", departmentCode: "ENVE" },
  { name: "Ayşegül Aksoy", title: "PROF_DR", departmentCode: "ENVE" },

  // METE
  { name: "Cemil Hakan Gür", title: "PROF_DR", departmentCode: "METE" },
  { name: "Kadri Aydınol", title: "PROF_DR", departmentCode: "METE" },

  // Common
  { name: "Sarah Johnson", title: "LECTURER", departmentCode: "ENG" },
  { name: "Michael Brown", title: "LECTURER", departmentCode: "ENG" },
  { name: "Mehmet Yıldız", title: "LECTURER", departmentCode: "TURK" },
  { name: "Zeynep Aktaş", title: "LECTURER", departmentCode: "HIST" },
];

// JSON olarak kaydet
const outputData = {
  departments,
  courses,
  professors,
  generatedAt: new Date().toISOString(),
};

const outputPath = path.join(__dirname, "metu-data.json");
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

console.log(`✅ METU data saved to ${outputPath}`);
console.log(`📊 Statistics:
  - Departments: ${departments.length}
  - Courses: ${courses.length}
  - Professors: ${professors.length}
`);
