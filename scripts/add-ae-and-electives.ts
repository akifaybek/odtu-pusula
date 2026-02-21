import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aerospace Engineering courses (AE -> AEE in database)
const aeCourses = [
  // Core courses
  { code: "AEE101", name: "Introduction to Aerospace Engineering", credits: 1, departmentCode: "AEE" },
  { code: "AEE172", name: "Introduction to Computers and Programming", credits: 3, departmentCode: "AEE" },
  { code: "AEE200", name: "Seminar", credits: 0, departmentCode: "AEE" },
  { code: "AEE244", name: "Aerodynamics I", credits: 4, departmentCode: "AEE" },
  { code: "AEE261", name: "Flight Mechanics I", credits: 4, departmentCode: "AEE" },
  { code: "AEE262", name: "Flight Mechanics II", credits: 4, departmentCode: "AEE" },
  { code: "AEE264", name: "Aircraft Propulsion", credits: 3, departmentCode: "AEE" },
  { code: "AEE300", name: "Summer Practice I", credits: 0, departmentCode: "AEE" },
  { code: "AEE305", name: "Numerical Methods", credits: 3, departmentCode: "AEE" },
  { code: "AEE331", name: "Mechanics of Aerospace Structures I", credits: 4, departmentCode: "AEE" },
  { code: "AEE334", name: "Mechanics of Aerospace Structures II", credits: 4, departmentCode: "AEE" },
  { code: "AEE341", name: "Aerodynamics II", credits: 4, departmentCode: "AEE" },
  { code: "AEE342", name: "Aerodynamics III", credits: 3, departmentCode: "AEE" },
  { code: "AEE372", name: "Control of Aerospace Vehicles", credits: 4, departmentCode: "AEE" },
  { code: "AEE383", name: "Aerospace Engineering Laboratory I", credits: 2, departmentCode: "AEE" },
  { code: "AEE400", name: "Summer Practice II", credits: 0, departmentCode: "AEE" },
  { code: "AEE435", name: "Aerospace Structures Design", credits: 4, departmentCode: "AEE" },

  // Technical Electives
  { code: "AEE384", name: "Aerospace Engineering Laboratory II", credits: 2, departmentCode: "AEE" },
  { code: "AEE402", name: "Introduction to Helicopter Aerodynamics", credits: 3, departmentCode: "AEE" },
  { code: "AEE403", name: "Computational Aerodynamics", credits: 3, departmentCode: "AEE" },
  { code: "AEE404", name: "Introduction to Turbulence", credits: 3, departmentCode: "AEE" },
  { code: "AEE410", name: "Unsteady Aerodynamics", credits: 3, departmentCode: "AEE" },
  { code: "AEE422", name: "Guided Missiles Fundamentals", credits: 3, departmentCode: "AEE" },
  { code: "AEE438", name: "Fundamentals of Aeroelasticity", credits: 3, departmentCode: "AEE" },
  { code: "AEE442", name: "Introduction to Aircraft Design", credits: 3, departmentCode: "AEE" },
  { code: "AEE443", name: "Space Vehicle Design", credits: 3, departmentCode: "AEE" },
  { code: "AEE445", name: "Space Flight Dynamics and Control", credits: 3, departmentCode: "AEE" },
  { code: "AEE446", name: "Preliminary Design of Helicopters", credits: 3, departmentCode: "AEE" },
  { code: "AEE452", name: "Rocket Propulsion", credits: 3, departmentCode: "AEE" },
  { code: "AEE453", name: "Gas Turbine Engines", credits: 3, departmentCode: "AEE" },
  { code: "AEE454", name: "Introduction to Combustion", credits: 3, departmentCode: "AEE" },
  { code: "AEE464", name: "Flight Simulation and Control", credits: 3, departmentCode: "AEE" },
  { code: "AEE476", name: "Introduction to Flight Control Systems", credits: 3, departmentCode: "AEE" },
  { code: "AEE477", name: "Automatic Control of Atmospheric and Space Flight Vehicles", credits: 3, departmentCode: "AEE" },
  { code: "AEE483", name: "Avionics", credits: 3, departmentCode: "AEE" },
  { code: "AEE484", name: "Unmanned Air Vehicles", credits: 3, departmentCode: "AEE" },
  { code: "AEE485", name: "Airplane Performance and Stability", credits: 3, departmentCode: "AEE" },
  { code: "AEE486", name: "Sustainable Air Transportation", credits: 3, departmentCode: "AEE" },
  { code: "AEE489", name: "Introduction to Aircraft Maintenance Engineering", credits: 3, departmentCode: "AEE" },
  { code: "AEE495", name: "Special Topics in Aerospace Engineering", credits: 3, departmentCode: "AEE" },
];

// Additional non-technical electives from the catalog that might be missing
const additionalElectives = [
  // Art History
  { code: "AH205", name: "World Art History I: Pre-History to Middle Ages", credits: 3, departmentCode: "ARCH" },
  { code: "AH206", name: "World Art History II: Renaissance to Contemporary Art", credits: 3, departmentCode: "ARCH" },
  { code: "AH221", name: "Introduction to History of Modern Art", credits: 3, departmentCode: "ARCH" },
  { code: "AH301", name: "Art and Its Interpretations", credits: 3, departmentCode: "ARCH" },
  { code: "AH311", name: "Anatolian Civilizations", credits: 3, departmentCode: "ARCH" },
  { code: "AH331", name: "Selected Topics in Art History I", credits: 3, departmentCode: "ARCH" },
  { code: "AH332", name: "Selected Topics in Art History II", credits: 3, departmentCode: "ARCH" },
  { code: "AH341", name: "Contemporary Art", credits: 3, departmentCode: "ARCH" },
  { code: "AH401", name: "History of Photography", credits: 3, departmentCode: "ARCH" },

  // Conservation
  { code: "CONS310", name: "History of Conservation and Restoration", credits: 3, departmentCode: "ARCH" },

  // Building Science
  { code: "BS201", name: "Analysis of Building Systems", credits: 3, departmentCode: "ARCH" },
  { code: "BS301", name: "Building Science Fundamentals: Lighting and Acoustics", credits: 3, departmentCode: "ARCH" },
  { code: "BS302", name: "Building Service Systems I", credits: 3, departmentCode: "ARCH" },
  { code: "BS303", name: "Building Service Systems II", credits: 3, departmentCode: "ARCH" },
  { code: "BS311", name: "Principles of Architectural Lighting", credits: 3, departmentCode: "ARCH" },
  { code: "BS312", name: "Special Topics in Lighting", credits: 3, departmentCode: "ARCH" },
  { code: "BS321", name: "Principles of Acoustics", credits: 3, departmentCode: "ARCH" },
  { code: "BS322", name: "Special Topics in Acoustics", credits: 3, departmentCode: "ARCH" },
  { code: "BS331", name: "Energy Conscious Building Design", credits: 3, departmentCode: "ARCH" },
  { code: "BS341", name: "Fire Safety in Buildings", credits: 3, departmentCode: "ARCH" },
  { code: "BS401", name: "Building Science Fundamentals: Energy", credits: 3, departmentCode: "ARCH" },
  { code: "BS411", name: "Computer Applications in Building Science", credits: 3, departmentCode: "ARCH" },
  { code: "BS431", name: "Solar Energy Utilization in Buildings", credits: 3, departmentCode: "ARCH" },

  // Archaeometry
  { code: "ARME221", name: "Introduction to Archaeometry", credits: 3, departmentCode: "ARCH" },

  // Theatre courses
  { code: "THEA101", name: "Introduction to Theatre", credits: 3, departmentCode: "ENG" },
  { code: "THEA102", name: "History of Theatre I", credits: 3, departmentCode: "ENG" },
  { code: "THEA103", name: "History of Theatre II", credits: 3, departmentCode: "ENG" },
  { code: "THEA211", name: "Costume Design", credits: 3, departmentCode: "ENG" },
  { code: "THEA213", name: "Make-up", credits: 3, departmentCode: "ENG" },
  { code: "THEA221", name: "Stage Design", credits: 3, departmentCode: "ENG" },
  { code: "THEA231", name: "Stage Lighting", credits: 3, departmentCode: "ENG" },
  { code: "THEA271", name: "Creative Drama", credits: 3, departmentCode: "ENG" },
  { code: "THEA311", name: "Dance", credits: 3, departmentCode: "ENG" },
  { code: "THEA401", name: "Drama Theory", credits: 3, departmentCode: "ENG" },
  { code: "THEA402", name: "Topics in Theatre", credits: 3, departmentCode: "ENG" },

  // Music courses
  { code: "MUS121", name: "Polyphonic Choir I", credits: 3, departmentCode: "ENG" },
  { code: "MUS122", name: "Polyphonic Choir II", credits: 3, departmentCode: "ENG" },
  { code: "MUS131", name: "Traditional Turkish Music Choir I", credits: 3, departmentCode: "ENG" },
  { code: "MUS132", name: "Traditional Turkish Music Choir II", credits: 3, departmentCode: "ENG" },
  { code: "MUS221", name: "Polyphonic Choir III", credits: 3, departmentCode: "ENG" },
  { code: "MUS222", name: "Polyphonic Choir IV", credits: 3, departmentCode: "ENG" },
  { code: "MUS232", name: "History of Music in Anatolia", credits: 3, departmentCode: "ENG" },
  { code: "MUS251", name: "Introduction to Turkish Folk Music I", credits: 3, departmentCode: "ENG" },
  { code: "MUS252", name: "Introduction to Turkish Folk Music II", credits: 3, departmentCode: "ENG" },
  { code: "MUS321", name: "Polyphonic Choir V", credits: 3, departmentCode: "ENG" },
  { code: "MUS322", name: "Polyphonic Choir VI", credits: 3, departmentCode: "ENG" },
  { code: "MUS421", name: "Polyphonic Choir VII", credits: 3, departmentCode: "ENG" },
  { code: "MUS422", name: "Polyphonic Choir VIII", credits: 3, departmentCode: "ENG" },

  // Instrument courses
  { code: "INST101", name: "Instrument/Voice I", credits: 1, departmentCode: "ENG" },
  { code: "INST102", name: "Instrument/Voice II", credits: 1, departmentCode: "ENG" },
  { code: "INST201", name: "Instrument/Voice III", credits: 1, departmentCode: "ENG" },
  { code: "INST202", name: "Instrument/Voice IV", credits: 1, departmentCode: "ENG" },
  { code: "INST301", name: "Instrument/Voice V", credits: 1, departmentCode: "ENG" },
  { code: "INST302", name: "Instrument/Voice VI", credits: 1, departmentCode: "ENG" },
  { code: "INST401", name: "Instrument/Voice VII", credits: 1, departmentCode: "ENG" },
  { code: "INST402", name: "Instrument/Voice VIII", credits: 1, departmentCode: "ENG" },

  // SLTP Art topics
  { code: "SLTP351", name: "Painting I", credits: 3, departmentCode: "ENG" },
  { code: "SLTP352", name: "Painting II", credits: 3, departmentCode: "ENG" },
  { code: "SLTP353", name: "Painting III", credits: 3, departmentCode: "ENG" },
  { code: "SLTP354", name: "Painting IV", credits: 3, departmentCode: "ENG" },
  { code: "SLTP361", name: "Sculpture I", credits: 3, departmentCode: "ENG" },
  { code: "SLTP362", name: "Sculpture II", credits: 3, departmentCode: "ENG" },
  { code: "SLTP363", name: "Sculpture III", credits: 3, departmentCode: "ENG" },
  { code: "SLTP364", name: "Sculpture IV", credits: 3, departmentCode: "ENG" },
  { code: "SLTP371", name: "Ceramics I", credits: 3, departmentCode: "ENG" },
  { code: "SLTP372", name: "Ceramics II", credits: 3, departmentCode: "ENG" },
  { code: "SLTP373", name: "Ceramics III", credits: 3, departmentCode: "ENG" },
  { code: "SLTP374", name: "Ceramics IV", credits: 3, departmentCode: "ENG" },
  { code: "SLTP381", name: "Photography I", credits: 3, departmentCode: "ENG" },
  { code: "SLTP382", name: "Photography II", credits: 3, departmentCode: "ENG" },
  { code: "SLTP383", name: "Photography III", credits: 3, departmentCode: "ENG" },
  { code: "SLTP384", name: "Photography IV", credits: 3, departmentCode: "ENG" },

  // Physical Education - additional
  { code: "PES103", name: "Team and Dual Sports I", credits: 3, departmentCode: "PES" },
  { code: "PES104", name: "Team and Dual Sports II", credits: 3, departmentCode: "PES" },
  { code: "PES106", name: "Aquatics", credits: 3, departmentCode: "PES" },
  { code: "PES141", name: "Introduction to Sports Sciences", credits: 3, departmentCode: "PES" },
  { code: "PES203", name: "Team and Dual Sports III", credits: 3, departmentCode: "PES" },
  { code: "PES205", name: "Racket Sports", credits: 3, departmentCode: "PES" },
  { code: "PES210", name: "Athletics", credits: 3, departmentCode: "PES" },
  { code: "PES220", name: "Gymnastics", credits: 3, departmentCode: "PES" },
  { code: "PES231", name: "Physical Education and Sport for Children I", credits: 3, departmentCode: "PES" },
  { code: "PES232", name: "Physical Education and Sport for Children II", credits: 3, departmentCode: "PES" },
  { code: "PES240", name: "Volleyball", credits: 3, departmentCode: "PES" },
  { code: "PES243", name: "Basketball", credits: 3, departmentCode: "PES" },
  { code: "PES244", name: "Football", credits: 3, departmentCode: "PES" },
  { code: "PES245", name: "Handball", credits: 3, departmentCode: "PES" },
  { code: "PES250", name: "Tennis", credits: 3, departmentCode: "PES" },
  { code: "PES261", name: "Folk Dances I", credits: 3, departmentCode: "PES" },
  { code: "PES262", name: "Folk Dances II", credits: 3, departmentCode: "PES" },
  { code: "PES271", name: "Social Dance I", credits: 3, departmentCode: "PES" },
  { code: "PES272", name: "Social Dance II", credits: 3, departmentCode: "PES" },
  { code: "PES280", name: "Outdoor Sports", credits: 3, departmentCode: "PES" },
  { code: "PES290", name: "Indoor Sports", credits: 3, departmentCode: "PES" },
  { code: "PES303", name: "Exercise for Health", credits: 3, departmentCode: "PES" },
  { code: "PES304", name: "Introduction to Sportive Recreation", credits: 3, departmentCode: "PES" },
  { code: "PES308", name: "Advanced Swimming", credits: 3, departmentCode: "PES" },
  { code: "PES312", name: "Recreation", credits: 3, departmentCode: "PES" },
  { code: "PES314", name: "Special Issues in Sports", credits: 3, departmentCode: "PES" },
  { code: "PES340", name: "Outdoor and Winter Activities", credits: 3, departmentCode: "PES" },
  { code: "PES361", name: "Folk Dances III", credits: 3, departmentCode: "PES" },
  { code: "PES362", name: "Folk Dances IV", credits: 3, departmentCode: "PES" },
  { code: "PES371", name: "Social Dance III", credits: 3, departmentCode: "PES" },
  { code: "PES372", name: "Social Dance IV", credits: 3, departmentCode: "PES" },
  { code: "PES381", name: "Modern Dance I", credits: 3, departmentCode: "PES" },
  { code: "PES382", name: "Modern Dance II", credits: 3, departmentCode: "PES" },
  { code: "PES391", name: "Classical Ballet I", credits: 3, departmentCode: "PES" },
  { code: "PES392", name: "Classical Ballet II", credits: 3, departmentCode: "PES" },
  { code: "PES410", name: "Exercise Physiology", credits: 3, departmentCode: "PES" },
  { code: "PES420", name: "Kinesiology", credits: 3, departmentCode: "PES" },
  { code: "PES430", name: "Sports Psychology", credits: 3, departmentCode: "PES" },
  { code: "PES440", name: "Sports Management", credits: 3, departmentCode: "PES" },
  { code: "PES450", name: "Sport Sociology", credits: 3, departmentCode: "PES" },

  // Language courses - additional
  { code: "ARAP101", name: "Arabic I", credits: 3, departmentCode: "ENG" },
  { code: "ARAP102", name: "Arabic II", credits: 3, departmentCode: "ENG" },
  { code: "ARAP201", name: "Arabic III", credits: 3, departmentCode: "ENG" },
  { code: "ARAP202", name: "Arabic IV", credits: 3, departmentCode: "ENG" },
  { code: "CHN101", name: "Chinese I", credits: 3, departmentCode: "ENG" },
  { code: "CHN102", name: "Chinese II", credits: 3, departmentCode: "ENG" },
  { code: "CHN201", name: "Chinese III", credits: 3, departmentCode: "ENG" },
  { code: "CHN202", name: "Chinese IV", credits: 3, departmentCode: "ENG" },
  { code: "FREN101", name: "French I", credits: 3, departmentCode: "ENG" },
  { code: "FREN102", name: "French II", credits: 3, departmentCode: "ENG" },
  { code: "FREN201", name: "French III", credits: 3, departmentCode: "ENG" },
  { code: "FREN202", name: "French IV", credits: 3, departmentCode: "ENG" },
  { code: "FREN301", name: "French V", credits: 3, departmentCode: "ENG" },
  { code: "FREN302", name: "French VI", credits: 3, departmentCode: "ENG" },
  { code: "FREN401", name: "French VII", credits: 3, departmentCode: "ENG" },
  { code: "FREN402", name: "French VIII", credits: 3, departmentCode: "ENG" },
  { code: "GERM101", name: "German I", credits: 3, departmentCode: "ENG" },
  { code: "GERM102", name: "German II", credits: 3, departmentCode: "ENG" },
  { code: "GERM201", name: "German III", credits: 3, departmentCode: "ENG" },
  { code: "GERM202", name: "German IV", credits: 3, departmentCode: "ENG" },
  { code: "GERM301", name: "German V", credits: 3, departmentCode: "ENG" },
  { code: "GERM302", name: "German VI", credits: 3, departmentCode: "ENG" },
  { code: "GERM401", name: "German VII", credits: 3, departmentCode: "ENG" },
  { code: "GERM402", name: "German VIII", credits: 3, departmentCode: "ENG" },
  { code: "GRE101", name: "Greek I", credits: 3, departmentCode: "ENG" },
  { code: "GRE102", name: "Greek II", credits: 3, departmentCode: "ENG" },
  { code: "GRE201", name: "Greek III", credits: 3, departmentCode: "ENG" },
  { code: "GRE202", name: "Greek IV", credits: 3, departmentCode: "ENG" },
  { code: "ITAL101", name: "Italian I", credits: 3, departmentCode: "ENG" },
  { code: "ITAL102", name: "Italian II", credits: 3, departmentCode: "ENG" },
  { code: "ITAL201", name: "Italian III", credits: 3, departmentCode: "ENG" },
  { code: "ITAL202", name: "Italian IV", credits: 3, departmentCode: "ENG" },
  { code: "JA101", name: "Japanese I", credits: 3, departmentCode: "ENG" },
  { code: "JA102", name: "Japanese II", credits: 3, departmentCode: "ENG" },
  { code: "JA201", name: "Japanese III", credits: 3, departmentCode: "ENG" },
  { code: "JA202", name: "Japanese IV", credits: 3, departmentCode: "ENG" },
  { code: "JA301", name: "Japanese V", credits: 3, departmentCode: "ENG" },
  { code: "JA302", name: "Japanese VI", credits: 3, departmentCode: "ENG" },
  { code: "PERS101", name: "Persian I", credits: 3, departmentCode: "ENG" },
  { code: "PERS102", name: "Persian II", credits: 3, departmentCode: "ENG" },
  { code: "PERS201", name: "Persian III", credits: 3, departmentCode: "ENG" },
  { code: "PERS202", name: "Persian IV", credits: 3, departmentCode: "ENG" },
  { code: "RUS101", name: "Russian I", credits: 3, departmentCode: "ENG" },
  { code: "RUS102", name: "Russian II", credits: 3, departmentCode: "ENG" },
  { code: "RUS201", name: "Russian III", credits: 3, departmentCode: "ENG" },
  { code: "RUS202", name: "Russian IV", credits: 3, departmentCode: "ENG" },
  { code: "RUS301", name: "Russian V", credits: 3, departmentCode: "ENG" },
  { code: "RUS302", name: "Russian VI", credits: 3, departmentCode: "ENG" },
  { code: "SPAN101", name: "Spanish I", credits: 3, departmentCode: "ENG" },
  { code: "SPAN102", name: "Spanish II", credits: 3, departmentCode: "ENG" },
  { code: "SPAN201", name: "Spanish III", credits: 3, departmentCode: "ENG" },
  { code: "SPAN202", name: "Spanish IV", credits: 3, departmentCode: "ENG" },
  { code: "SPAN301", name: "Spanish V", credits: 3, departmentCode: "ENG" },
  { code: "SPAN302", name: "Spanish VI", credits: 3, departmentCode: "ENG" },

  // CEIT additional courses
  { code: "CEIT101", name: "Fundamentals of Information Technology and Applications", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT111", name: "Basic Computer Skills for Education", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT214", name: "Introduction to Educational Data Mining and Learning Analytics", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT225", name: "Computer Hardware and Operating Systems", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT310", name: "Computer Networking in Education", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT311", name: "Instructional Design", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT317", name: "Research Methods", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT319", name: "Open and Distance Learning", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT414", name: "Design and Development of Online Learning Environments", credits: 3, departmentCode: "CEIT" },
  { code: "CEIT415", name: "Advanced Web Design", credits: 3, departmentCode: "CEIT" },

  // English additional
  { code: "ENG101", name: "Development of Reading and Writing Skills I", credits: 3, departmentCode: "ENG" },
  { code: "ENG102", name: "Development of Reading and Writing Skills II", credits: 3, departmentCode: "ENG" },
  { code: "ENG211", name: "Introduction to Linguistics", credits: 3, departmentCode: "ENG" },
  { code: "ENG212", name: "English Phonology and Morphology", credits: 3, departmentCode: "ENG" },
  { code: "ENG219", name: "Introduction to English Literature I", credits: 3, departmentCode: "ENG" },
  { code: "ENG221", name: "Introduction to English Literature II", credits: 3, departmentCode: "ENG" },
  { code: "ENG222", name: "Mythology and Literature", credits: 3, departmentCode: "ENG" },
  { code: "ENG223", name: "Biblical Tradition and English Literature", credits: 3, departmentCode: "ENG" },
  { code: "ENG224", name: "Introduction to Critical Reading", credits: 3, departmentCode: "ENG" },
  { code: "ENG225", name: "Classical Background of English Literature", credits: 3, departmentCode: "ENG" },
  { code: "ENG227", name: "Drama", credits: 3, departmentCode: "ENG" },
  { code: "ENG228", name: "Novel", credits: 3, departmentCode: "ENG" },
  { code: "ENG229", name: "Short Story", credits: 3, departmentCode: "ENG" },
  { code: "ENG230", name: "Poetry", credits: 3, departmentCode: "ENG" },
  { code: "ENG301", name: "British Culture and Institutions", credits: 3, departmentCode: "ENG" },
  { code: "ENG302", name: "American Culture and Institutions", credits: 3, departmentCode: "ENG" },
  { code: "ENG320", name: "The English Language and the Future of World Englishes", credits: 3, departmentCode: "ENG" },

  // Turkish courses
  { code: "TURK301", name: "Turkish Language I", credits: 3, departmentCode: "TURK" },
  { code: "TURK302", name: "Turkish Language II", credits: 3, departmentCode: "TURK" },
  { code: "TURK303", name: "Turkish Culture and History", credits: 3, departmentCode: "TURK" },
  { code: "TURK304", name: "Turkish Literature", credits: 3, departmentCode: "TURK" },
  { code: "TURK305", name: "Turkish Language for Non-Native Speakers I", credits: 3, departmentCode: "TURK" },
  { code: "TURK306", name: "Turkish Language for Non-Native Speakers II", credits: 3, departmentCode: "TURK" },
  { code: "TURK307", name: "Turkish Language for Non-Native Speakers III", credits: 3, departmentCode: "TURK" },
  { code: "TURK308", name: "Turkish Language for Non-Native Speakers IV", credits: 3, departmentCode: "TURK" },
];

// Combine all courses
const allNewCourses = [...aeCourses, ...additionalElectives];

// Read existing data
const dataPath = path.join(__dirname, 'metu-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Get existing course codes
const existingCodes = new Set(data.courses.map((c: { code: string }) => c.code));

// Add only new courses
let addedCount = 0;
for (const course of allNewCourses) {
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
