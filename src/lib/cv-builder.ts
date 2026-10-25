export const cvSections = [
  'Role',
  'Contact',
  'Readiness',
  'Profile',
  'Experience',
  'Education',
  'Certificates',
  'Skills',
  'Languages',
  'Achievements',
  'Community',
  'Projects',
  'Role details',
  'References',
  'Extras',
  'Review',
] as const;

export type CvSection = (typeof cvSections)[number];

export type CvData = {
  role: string;
  advert: string;
  opportunityTypes: string;
  industry: string;
  cvType: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  town: string;
  province: string;
  linkedin: string;
  portfolio: string;
  contactPreference: string;
  workStatus: string;
  workPermitExpiry: string;
  availableFrom: string;
  noticePeriod: string;
  licenceCode: string;
  transport: string;
  relocate: string;
  relocateProvinces: string;
  travel: string;
  shifts: string;
  workModes: string;
  checkConsent: string;
  salaryRange: string;
  headline: string;
  strongestEvidence: string;
  proudAchievementOne: string;
  proudAchievementTwo: string;
  careerDirection: string;
  summary: string;
  primaryJobTitle: string;
  primaryEmployer: string;
  primaryWorkLocation: string;
  primaryEmploymentType: string;
  primaryWorkDates: string;
  primaryDuties: string;
  primaryMetric: string;
  primaryFrequency: string;
  primaryOutcome: string;
  primaryLeadership: string;
  primaryLeadershipDetails: string;
  primaryTools: string;
  primaryRecognition: string;
  managerContactPermission: string;
  formalExperience: string;
  informalExperienceTypes: string;
  informalExperienceDetails: string;
  careerBreak: string;
  careerBreakNote: string;
  leavingReasons: string;
  schoolGrade: string;
  schoolDetails: string;
  matricPass: string;
  subjects: string;
  matricPlan: string;
  postSchoolEducation: string;
  educationQualification: string;
  educationInstitution: string;
  educationInstitutionType: string;
  educationNqfLevel: string;
  educationStatus: string;
  educationYears: string;
  educationResults: string;
  educationModules: string;
  qualificationCheck: string;
  certificates: string;
  professionalRegistration: string;
  safetyCompliance: string;
  credentialIds: string;
  showCredentialIds: string;
  technicalSkills: string;
  softwareSkills: string;
  skillProof: string;
  workplaceSkills: string;
  workplaceExamples: string;
  typingNumeracy: string;
  skillGaps: string;
  languages: string;
  awards: string;
  leadership: string;
  publications: string;
  sportsArts: string;
  volunteering: string;
  projects: string;
  industryDetails: string;
  referenceOne: string;
  referenceOnePermission: string;
  referenceTwo: string;
  referenceTwoPermission: string;
  referencesDisplay: string;
  interests: string;
  declaration: string;
  coverLetter: string;
  bursaryStatement: string;
};

export const emptyCvData: CvData = {
  role: '', advert: '', opportunityTypes: '', industry: '', cvType: '',
  fullName: '', phone: '', whatsapp: '', email: '', town: '', province: '',
  linkedin: '', portfolio: '', contactPreference: '',
  workStatus: '', workPermitExpiry: '', availableFrom: '', noticePeriod: '', licenceCode: '',
  transport: '', relocate: '', relocateProvinces: '', travel: '', shifts: '',
  workModes: '', checkConsent: '', salaryRange: '',
  headline: '', strongestEvidence: '', proudAchievementOne: '',
  proudAchievementTwo: '', careerDirection: '', summary: '',
  primaryJobTitle: '', primaryEmployer: '', primaryWorkLocation: '',
  primaryEmploymentType: '', primaryWorkDates: '', primaryDuties: '',
  primaryMetric: '', primaryFrequency: '', primaryOutcome: '',
  primaryLeadership: '', primaryLeadershipDetails: '', primaryTools: '', primaryRecognition: '',
  managerContactPermission: '',
  formalExperience: '', informalExperienceTypes: '', informalExperienceDetails: '',
  careerBreak: '', careerBreakNote: '', leavingReasons: '',
  schoolGrade: '', schoolDetails: '', matricPass: '', subjects: '',
  matricPlan: '', postSchoolEducation: '', educationQualification: '',
  educationInstitution: '', educationInstitutionType: '', educationNqfLevel: '',
  educationStatus: '', educationYears: '', educationResults: '', educationModules: '',
  qualificationCheck: '',
  certificates: '', professionalRegistration: '', safetyCompliance: '',
  credentialIds: '', showCredentialIds: '',
  technicalSkills: '', softwareSkills: '', skillProof: '',
  workplaceSkills: '', workplaceExamples: '', typingNumeracy: '', skillGaps: '',
  languages: '', awards: '', leadership: '', publications: '', sportsArts: '',
  volunteering: '', projects: '', industryDetails: '',
  referenceOne: '', referenceOnePermission: '', referenceTwo: '',
  referenceTwoPermission: '', referencesDisplay: 'Available on request',
  interests: '', declaration: '', coverLetter: '', bursaryStatement: '',
};

export type CvProfileSeed = {
  display_name?: string;
  about_me?: string;
  personal_goal?: string;
  target_role?: string;
  city?: string;
  province?: string;
  highest_qualification?: string;
  qualification_status?: string;
  qualification_year?: number | null;
  field_of_study?: string;
  subjects?: unknown;
  skills?: unknown;
  skill_ratings?: unknown;
  certifications?: unknown;
  languages?: unknown;
  experience_by_area?: unknown;
  work_authorization?: string;
  availability_start_date?: string | null;
  drivers_license?: boolean | null;
  own_transport?: boolean | null;
  willing_to_relocate?: boolean | null;
  shift_preferences?: unknown;
  remote_ok?: boolean | null;
};

export function listOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return item.trim() ? [item.trim()] : [];
    if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
      return item.name.trim() ? [item.name.trim()] : [];
    }
    return [];
  });
}

export function prefillCvData(
  saved: unknown,
  profile: CvProfileSeed,
  auth: { name?: string; email?: string },
  legacy: Record<string, unknown> | null,
): CvData {
  const savedData = saved && typeof saved === 'object' && !Array.isArray(saved)
    ? saved as Partial<CvData>
    : {};
  const qualifications = [
    profile.highest_qualification,
    profile.field_of_study,
    profile.qualification_status === 'completed' ? 'Completed' : profile.qualification_status === 'in_progress' ? 'In progress' : '',
    profile.qualification_year ? String(profile.qualification_year) : '',
  ].filter(Boolean).join(' · ');
  const subjects = Array.isArray(profile.subjects)
    ? profile.subjects.flatMap((entry) => {
      if (!entry || typeof entry !== 'object' || !('name' in entry) || typeof entry.name !== 'string') return [];
      const mark = 'mark' in entry && typeof entry.mark === 'number' ? `: ${entry.mark}` : '';
      return [`${entry.name}${mark}`];
    }).join('\n')
    : '';
  const legacySummary = typeof legacy?.summary === 'string' ? legacy.summary : '';
  const legacyEducation = typeof legacy?.education === 'string' ? legacy.education : '';
  const profileList = (value: unknown) => listOfStrings(value).join('\n');
  const profileAuthorization = profile.work_authorization === 'citizen'
    ? 'South African citizen'
    : profile.work_authorization === 'permanent_resident'
      ? 'Permanent resident'
      : profile.work_authorization === 'work_visa'
        ? 'Valid work visa'
        : '';
  const savedValue = (key: keyof CvData, fallback = '') => (
    typeof savedData[key] === 'string' ? savedData[key] as string : fallback
  );

  return {
    ...emptyCvData,
    ...Object.fromEntries(
      Object.entries(savedData).filter(([, value]) => typeof value === 'string'),
    ),
    role: savedValue('role', profile.target_role),
    fullName: savedValue('fullName', profile.display_name || auth.name),
    email: savedValue('email', auth.email),
    town: savedValue('town', profile.city),
    province: savedValue('province', profile.province),
    workStatus: savedValue('workStatus', profileAuthorization),
    availableFrom: savedValue('availableFrom', profile.availability_start_date || ''),
    licenceCode: savedValue('licenceCode', profile.drivers_license ? 'Licence held (add code)' : ''),
    transport: savedValue('transport', profile.own_transport === true ? 'Yes' : profile.own_transport === false ? 'No' : ''),
    relocate: savedValue('relocate', profile.willing_to_relocate === true ? 'Yes' : profile.willing_to_relocate === false ? 'No' : ''),
    shifts: savedValue('shifts', profileList(profile.shift_preferences)),
    workModes: savedValue('workModes', profile.remote_ok ? 'Remote' : ''),
    headline: savedValue('headline', profile.target_role),
    summary: savedValue('summary', legacySummary || profile.about_me || profile.personal_goal || ''),
    formalExperience: savedValue('formalExperience', typeof legacy?.experience === 'string' ? legacy.experience : ''),
    schoolGrade: savedValue('schoolGrade', profile.highest_qualification),
    schoolDetails: savedValue('schoolDetails', legacyEducation || qualifications),
    subjects: savedValue('subjects', subjects),
    postSchoolEducation: savedValue('postSchoolEducation'),
    certificates: savedValue('certificates', profileList(profile.certifications)),
    awards: savedValue('awards', typeof legacy?.achievements === 'string' ? legacy.achievements : ''),
    technicalSkills: savedValue('technicalSkills', profileList(profile.skills)),
    softwareSkills: savedValue('softwareSkills', profileList(profile.skill_ratings)),
    languages: savedValue('languages', profileList(profile.languages)),
    projects: savedValue('projects', typeof legacy?.projects === 'string' ? legacy.projects : ''),
    linkedin: savedValue('linkedin', typeof legacy?.website === 'string' ? legacy.website : ''),
  } as CvData;
}

export type CvOutputSection = { title: string; body: string };

function section(title: string, body: string): CvOutputSection | null {
  const value = body.trim();
  return value ? { title, body: value } : null;
}

function orderSkills(value: string, advert: string): string {
  const lines = value.split(/[\n,]/).map((line) => line.trim()).filter(Boolean);
  const keywords = new Set((advert.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || []));
  return lines.map((text, index) => ({
    text,
    index,
    score: [...keywords].reduce((score, word) => score + (text.toLowerCase().includes(word) ? 1 : 0), 0),
  })).sort((left, right) => right.score - left.score || left.index - right.index).map((item) => item.text).join('\n');
}

export function buildCvOutput(data: CvData): CvOutputSection[] {
  const references = data.referencesDisplay === 'Show permitted reference contacts'
    ? [data.referenceOnePermission === 'Yes' ? data.referenceOne : '', data.referenceTwoPermission === 'Yes' ? data.referenceTwo : ''].filter(Boolean).join('\n')
    : 'Available on request';
  const includesPrivateCredentials = data.showCredentialIds === 'Yes' ? data.credentialIds : '';
  const profile = [
    data.headline,
    data.summary,
    data.strongestEvidence ? `Relevant qualification or experience: ${data.strongestEvidence}` : '',
    data.proudAchievementOne,
    data.proudAchievementTwo,
    data.careerDirection ? `Career direction: ${data.careerDirection}` : '',
  ].filter(Boolean).join('\n');
  const experience = [
    buildPrimaryExperience(data),
    data.formalExperience,
    data.informalExperienceDetails,
    data.volunteering,
    data.careerBreak && data.careerBreak !== 'Skip' ? data.careerBreakNote || `Career break: ${data.careerBreak.toLowerCase()}` : '',
    data.awards,
    data.leadership,
    data.publications,
    data.sportsArts,
    data.projects,
  ].filter(Boolean).join('\n\n');
  const skills = [
    orderSkills(data.technicalSkills, data.advert),
    orderSkills(data.softwareSkills, data.advert),
    orderSkills(data.workplaceSkills, data.advert),
    data.skillProof,
    data.workplaceExamples,
    data.typingNumeracy,
    data.industryDetails,
    data.interests ? `Interests: ${data.interests}` : '',
  ].filter(Boolean).join('\n');
  return [
    section('Profile', profile),
    section('Key skills', skills),
    section('Work experience', experience),
    section('Education', [
      data.schoolDetails,
      data.subjects ? `Subjects and marks\n${data.subjects}` : '',
      [
        data.educationQualification,
        data.educationInstitution,
        data.educationInstitutionType,
        data.educationNqfLevel ? `NQF ${data.educationNqfLevel}` : '',
        data.educationStatus,
        data.educationYears,
        data.educationResults,
        data.educationModules,
      ].filter(Boolean).join(' · '),
      data.postSchoolEducation,
    ].filter(Boolean).join('\n')),
    section('Certifications', [data.certificates, data.professionalRegistration, data.safetyCompliance.split('\n').join(', '), includesPrivateCredentials].filter(Boolean).join('\n')),
    section('Languages', data.languages),
    section('References', [references, data.declaration === 'Yes' ? 'I declare that the information provided is true and complete to the best of my knowledge.' : ''].filter(Boolean).join('\n')),
  ].filter((item): item is CvOutputSection => item !== null);
}

export function buildPrimaryExperience(data: CvData): string {
  if (![data.primaryJobTitle, data.primaryEmployer, data.primaryDuties, data.primaryOutcome].some((value) => value.trim())) return '';
  const heading = [
    data.primaryJobTitle,
    data.primaryEmployer,
    data.primaryWorkLocation,
    data.primaryEmploymentType,
    data.primaryWorkDates,
  ].filter(Boolean).join(' · ');
  const duties = data.primaryDuties.split(/\n+/).map((duty) => duty.trim()).filter(Boolean).map((duty) => `• ${duty}`).join('\n');
  const impact = data.primaryMetric
    ? `Work volume: ${data.primaryMetric}${data.primaryFrequency ? ` ${data.primaryFrequency}` : ''}`
    : '';
  const details = [
    duties,
    impact,
    data.primaryOutcome ? `Result: ${data.primaryOutcome}` : '',
    data.primaryLeadership === 'No' ? '' : data.primaryLeadershipDetails ? `Leadership: ${data.primaryLeadershipDetails}` : '',
    data.primaryTools ? `Tools: ${data.primaryTools}` : '',
    data.primaryRecognition ? `Recognition: ${data.primaryRecognition}` : '',
  ].filter(Boolean).join('\n');
  return [heading, details].filter(Boolean).join('\n');
}

export function cvReadinessLine(data: CvData): string {
  return [
    data.workStatus,
    data.workStatus === 'Valid work permit' && data.workPermitExpiry ? `Work permit expires ${data.workPermitExpiry}` : '',
    data.licenceCode,
    data.availableFrom === 'Other / notice period'
      ? (data.noticePeriod ? `Available after ${data.noticePeriod} notice` : '')
      : data.availableFrom ? `Available ${data.availableFrom}` : '',
    data.transport ? `Own transport: ${data.transport}` : '',
    data.relocate === 'Yes' ? `Open to relocation${data.relocateProvinces ? `: ${data.relocateProvinces}` : ''}` : '',
    data.shifts ? `Shifts: ${data.shifts.split('\n').join(', ')}` : '',
    data.travel,
    data.workModes ? `Work arrangement: ${data.workModes.split('\n').join(', ')}` : '',
  ].filter(Boolean).join(' · ');
}

export function cvPlainText(data: CvData): string {
  const contact = [
    data.email,
    [data.phone, data.whatsapp === 'Yes' ? 'WhatsApp' : ''].filter(Boolean).join(' · '),
    [data.town, data.province].filter(Boolean).join(', '),
    data.linkedin,
    data.portfolio,
  ].filter(Boolean).join(' | ');
  return [
    data.fullName,
    data.headline || data.role,
    contact,
    cvReadinessLine(data),
    '',
    ...buildCvOutput(data).flatMap((item) => [item.title.toUpperCase(), item.body, '']),
  ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\n').trim() + '\n';
}

export function keywordMatch(data: CvData): { total: number; matched: number; missing: string[] } {
  const tokens = (data.advert.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || [])
    .filter((word) => !new Set(['the', 'and', 'for', 'with', 'you', 'our', 'are', 'will', 'this', 'from', 'have', 'your', 'who', 'that', 'not', 'all', 'can', 'job', 'role']).has(word));
  const keywords = [...new Set(tokens)].slice(0, 40);
  const content = [
    data.role, data.headline, data.summary, data.primaryJobTitle, data.primaryEmployer,
    data.primaryDuties, data.primaryOutcome, data.formalExperience, data.informalExperienceDetails,
    data.technicalSkills, data.softwareSkills, data.workplaceSkills, data.schoolDetails, data.postSchoolEducation,
  ].join(' ').toLowerCase();
  const matched = keywords.filter((word) => content.includes(word));
  return { total: keywords.length, matched: matched.length, missing: keywords.filter((word) => !content.includes(word)) };
}

const encoder = new TextEncoder();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function u32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function zipStored(files: Array<{ name: string; body: string }>): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const body = encoder.encode(file.body);
    const crc = crc32(body);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    u32(localView, 0, 0x04034b50);
    u16(localView, 4, 20);
    u16(localView, 6, 0x0800);
    u16(localView, 8, 0);
    u32(localView, 14, crc);
    u32(localView, 18, body.length);
    u32(localView, 22, body.length);
    u16(localView, 26, name.length);
    localHeader.set(name, 30);
    localParts.push(localHeader, body);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    u32(centralView, 0, 0x02014b50);
    u16(centralView, 4, 20);
    u16(centralView, 6, 20);
    u16(centralView, 8, 0x0800);
    u16(centralView, 10, 0);
    u32(centralView, 16, crc);
    u32(centralView, 20, body.length);
    u32(centralView, 24, body.length);
    u16(centralView, 28, name.length);
    u32(centralView, 42, offset);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + body.length;
  }

  const centralDirectory = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  u32(endView, 0, 0x06054b50);
  u16(endView, 8, files.length);
  u16(endView, 10, files.length);
  u32(endView, 12, centralSize);
  u32(endView, 16, centralDirectory);

  const archive = new Uint8Array(offset + centralSize + end.length);
  let archiveOffset = 0;
  for (const part of [...localParts, ...centralParts, end]) {
    archive.set(part, archiveOffset);
    archiveOffset += part.length;
  }
  return new Blob([archive.buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

function xmlEscape(text: string): string {
  return text.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character] || character);
}

export function cvDocx(data: CvData): Blob {
  const lines = cvPlainText(data).split('\n');
  const paragraphs = lines.map((line) => {
    const isHeading = line && line === line.toUpperCase() && line.length < 70;
    const style = isHeading ? '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>' : '';
    return `<w:p>${style}<w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
  }).join('');
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style></w:styles>`;
  return zipStored([
    { name: '[Content_Types].xml', body: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>' },
    { name: '_rels/.rels', body: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/document.xml', body: document },
    { name: 'word/styles.xml', body: styles },
    { name: 'word/_rels/document.xml.rels', body: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
  ]);
}
