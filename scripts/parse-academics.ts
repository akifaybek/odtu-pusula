import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the raw file
const rawData = fs.readFileSync(path.join(__dirname, 'academics-raw.txt'), 'utf-8');

// Title mapping
const titleMap: Record<string, string> = {
  'Prof. Dr.': 'PROF_DR',
  'Doç. Dr.': 'ASSOC_PROF_DR',
  'Dr. Öğr. Üyesi': 'ASST_PROF_DR',
  'Öğr. Gör.': 'LECTURER',
  'Öğr. Gör. Dr.': 'LECTURER',
  'Arş. Gör.': 'RES_ASST',
  'Arş. Gör. Dr.': 'RES_ASST',
  'Uzm.': 'LECTURER',
  'Uzm. Dr.': 'LECTURER',
  'Okutman': 'LECTURER',
};

// Department code mapping from Turkish names
const departmentMap: Record<string, string> = {
  // Faculty of Engineering
  'Bilgisayar Mühendisliği Bölümü': 'CENG',
  'Elektrik ve Elektronik Mühendisliği Bölümü': 'EE',
  'Makina Mühendisliği Bölümü': 'ME',
  'Endüstri Mühendisliği Bölümü': 'IE',
  'İnşaat Mühendisliği Bölümü': 'CE',
  'Kimya Mühendisliği Bölümü': 'CHE',
  'Havacılık ve Uzay Mühendisliği Bölümü': 'AEE',
  'Çevre Mühendisliği Bölümü': 'ENVE',
  'Gıda Mühendisliği Bölümü': 'FDE',
  'Jeoloji Mühendisliği Bölümü': 'GEOE',
  'Metalurji ve Malzeme Mühendisliği Bölümü': 'METE',
  'Maden Mühendisliği Bölümü': 'MINE',
  'Petrol ve Doğal Gaz Mühendisliği Bölümü': 'PETE',
  'Mühendislik Bilimleri Bölümü': 'ESE',

  // Faculty of Arts and Sciences
  'Biyolojik Bilimler Bölümü': 'BIOL',
  'Biyoloji Bölümü': 'BIOL',
  'Felsefe Bölümü': 'PHIL',
  'Fizik Bölümü': 'PHYS',
  'İstatistik Bölümü': 'STAT',
  'Kimya Bölümü': 'CHEM',
  'Matematik Bölümü': 'MATH',
  'Moleküler Biyoloji ve Genetik Bölümü': 'MFGE',
  'Psikoloji Bölümü': 'PSY',
  'Sosyoloji Bölümü': 'SOC',
  'Tarih Bölümü': 'HIST',

  // Faculty of Economic and Administrative Sciences
  'İktisat Bölümü': 'ECON',
  'İşletme Bölümü': 'BA',
  'Siyaset Bilimi ve Kamu Yönetimi Bölümü': 'ADM',
  'Uluslararası İlişkiler Bölümü': 'IR',

  // Faculty of Architecture
  'Mimarlık Bölümü': 'ARCH',
  'Endüstriyel Tasarım Bölümü': 'ID',
  'Şehir ve Bölge Planlama Bölümü': 'CRP',

  // Faculty of Education
  'Bilgisayar ve Öğretim Teknolojileri Eğitimi Bölümü': 'CEIT',
  'Eğitim Bilimleri Bölümü': 'EDS',
  'Yabancı Diller Eğitimi Bölümü': 'FLE',
  'Matematik ve Fen Bilimleri Eğitimi Bölümü': 'SSME',
  'Temel Eğitim Bölümü': 'ELE',
  'Beden Eğitimi ve Spor Bölümü': 'PES',

  // Graduate Schools / Institutes
  'Enformatik Enstitüsü': 'II',
  'Bilişim Sistemleri Anabilim Dalı': 'IS',
  'Modelleme ve Simülasyon Anabilim Dalı': 'IS',
  'Bilişsel Bilimler Anabilim Dalı': 'IS',
  'Siber Güvenlik Anabilim Dalı': 'IS',
  'Fen Bilimleri Enstitüsü': 'ESE',
  'Sosyal Bilimler Enstitüsü': 'ADM',
  'Uygulamalı Matematik Enstitüsü': 'MATH',
  'Finansal Matematik Anabilim Dalı': 'MATH',
  'Aktüerya Bilimleri Anabilim Dalı': 'STAT',
  'Kriptografi Anabilim Dalı': 'MATH',
  'Deniz Bilimleri Enstitüsü': 'BIOL',
  'Deniz Biyolojisi ve Balıkçılık Anabilim Dalı': 'BIOL',
  'Deniz Bilim (Osinografi) Anabilim Dalı': 'BIOL',
  'Rektörlük': 'ADM',
};

interface Academic {
  name: string;
  title: string;
  departmentCode: string;
}

const academics: Academic[] = [];
const lines = rawData.split('\n');

// Regex to match academic entries
const academicRegex = /^(Prof\. Dr\.|Doç\. Dr\.|Dr\. Öğr\. Üyesi|Öğr\. Gör\. Dr\.|Öğr\. Gör\.|Arş\. Gör\. Dr\.|Arş\. Gör\.|Uzm\. Dr\.|Uzm\.|Okutman)\s+(.+?),\s*(.+?),\s*(.+)$/;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  const match = trimmed.match(academicRegex);
  if (match) {
    const [, titleTr, name, faculty, department] = match;

    const title = titleMap[titleTr];
    if (!title) {
      console.warn(`Unknown title: ${titleTr}`);
      continue;
    }

    // Try to find department code
    let deptCode = departmentMap[department.trim()];

    // If not found, try matching partial
    if (!deptCode) {
      for (const [key, code] of Object.entries(departmentMap)) {
        if (department.includes(key) || key.includes(department.trim())) {
          deptCode = code;
          break;
        }
      }
    }

    // Default to a generic code based on faculty if still not found
    if (!deptCode) {
      if (faculty.includes('Mühendislik')) deptCode = 'ESE';
      else if (faculty.includes('Fen Edebiyat')) deptCode = 'MATH';
      else if (faculty.includes('Mimarlık')) deptCode = 'ARCH';
      else if (faculty.includes('İktisadi')) deptCode = 'ECON';
      else if (faculty.includes('Eğitim')) deptCode = 'EDS';
      else if (faculty.includes('Enformatik')) deptCode = 'IS';
      else deptCode = 'ESE'; // Fallback
    }

    academics.push({
      name: name.trim(),
      title,
      departmentCode: deptCode,
    });
  }
}

console.log(`Parsed ${academics.length} academics`);

// Write to JSON file
fs.writeFileSync(
  path.join(__dirname, 'academics.json'),
  JSON.stringify(academics, null, 2),
  'utf-8'
);

console.log('Written to academics.json');

// Show sample
console.log('\nSample:');
console.log(academics.slice(0, 5));
