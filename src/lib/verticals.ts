import type { IntakeFieldType, Profession, ServiceExtra } from "@/lib/types";

export interface DefaultServiceTemplate {
  name: string;
  durationMinutes: number;
  priceCents: number;
  depositRequired: boolean;
  depositPercent: number;
  extra?: ServiceExtra;
}

export interface IntakeFieldTemplate {
  label: string;
  fieldType: IntakeFieldType;
  options?: string[];
  required: boolean;
  isWaiver?: boolean;
  requiresSignature?: boolean;
  waiverText?: string;
}

export interface ProfessionConfig {
  id: Profession;
  label: string;
  tagline: string;
  icon: string; // lucide-react icon name
  defaultServices: DefaultServiceTemplate[];
  defaultIntakeFields: IntakeFieldTemplate[];
  reminderPrepLine: string;
}

const DOG_BREEDS = [
  "Labrador Retriever", "Golden Retriever", "German Shepherd", "French Bulldog",
  "Poodle", "Bulldog", "Beagle", "Rottweiler", "Dachshund", "Yorkshire Terrier",
  "Boxer", "Shih Tzu", "Husky", "Great Dane", "Chihuahua", "Cavalier King Charles Spaniel",
  "Australian Shepherd", "Cocker Spaniel", "Border Collie", "Maltese",
  "Pomeranian", "Schnauzer", "Mastiff", "Pit Bull Terrier", "Doberman Pinscher",
  "Shiba Inu", "Bichon Frise", "Corgi", "Bernese Mountain Dog", "Whippet",
  "Other / Mixed Breed",
];

export const PROFESSIONS: Record<Profession, ProfessionConfig> = {
  tattoo_artist: {
    id: "tattoo_artist",
    label: "Tattoo Artist",
    tagline: "Portfolio, deposits, and aftercare waivers built in",
    icon: "PenTool",
    defaultServices: [
      { name: "1 Hour Session", durationMinutes: 60, priceCents: 15000, depositRequired: true, depositPercent: 30, extra: { styleTags: ["traditional", "blackwork"] } },
      { name: "2 Hour Session", durationMinutes: 120, priceCents: 28000, depositRequired: true, depositPercent: 30, extra: { styleTags: ["realism"] } },
      { name: "3 Hour Session", durationMinutes: 180, priceCents: 40000, depositRequired: true, depositPercent: 30 },
      { name: "Half-Day Session", durationMinutes: 240, priceCents: 65000, depositRequired: true, depositPercent: 30 },
      { name: "Full-Day Session", durationMinutes: 480, priceCents: 120000, depositRequired: true, depositPercent: 30 },
    ],
    defaultIntakeFields: [
      { label: "Reference photo", fieldType: "file_upload", required: true },
      { label: "Placement & size on body", fieldType: "short_text", required: true },
      { label: "Style preference", fieldType: "dropdown", options: ["Traditional", "Neo-traditional", "Blackwork", "Realism", "Watercolor"], required: false },
      { label: "Allergies or medical notes", fieldType: "long_text", required: false },
      { label: "Aftercare waiver", fieldType: "checkbox", required: true, isWaiver: true, requiresSignature: true, waiverText: "I understand the aftercare instructions provided and agree to follow them. I confirm I have no known allergies or conditions that have not been disclosed above, and I release the artist from liability for complications arising from improper aftercare." },
    ],
    reminderPrepLine: "Please arrive with clean, lotion-free skin at the tattoo site.",
  },
  dog_groomer: {
    id: "dog_groomer",
    label: "Dog Groomer",
    tagline: "Breed-based durations and safety flags out of the box",
    icon: "PawPrint",
    defaultServices: [
      { name: "Small Dog Groom", durationMinutes: 45, priceCents: 5000, depositRequired: false, depositPercent: 0, extra: { breedSizeDurations: { S: 45, M: 60, L: 90, XL: 120 } } },
      { name: "Medium Dog Groom", durationMinutes: 60, priceCents: 6500, depositRequired: false, depositPercent: 0, extra: { breedSizeDurations: { S: 45, M: 60, L: 90, XL: 120 } } },
      { name: "Large Dog Groom", durationMinutes: 90, priceCents: 8500, depositRequired: false, depositPercent: 0, extra: { breedSizeDurations: { S: 45, M: 60, L: 90, XL: 120 } } },
      { name: "XL Dog Groom", durationMinutes: 120, priceCents: 11000, depositRequired: false, depositPercent: 0, extra: { breedSizeDurations: { S: 45, M: 60, L: 90, XL: 120 } } },
    ],
    defaultIntakeFields: [
      { label: "Dog's name", fieldType: "short_text", required: true },
      { label: "Breed", fieldType: "dropdown", options: DOG_BREEDS, required: true },
      { label: "Age", fieldType: "short_text", required: false },
      { label: "Vaccination up to date", fieldType: "checkbox", required: true },
      { label: "Aggressive or anxious behavior notes", fieldType: "long_text", required: false },
      { label: "Emergency contact", fieldType: "short_text", required: true },
      { label: "This booking includes multiple pets", fieldType: "checkbox", required: false },
    ],
    reminderPrepLine: "Please walk your dog before drop-off and bring their leash.",
  },
  music_teacher: {
    id: "music_teacher",
    label: "Music Teacher",
    tagline: "Recurring lessons and package billing built in",
    icon: "Music",
    defaultServices: [
      { name: "30 Min Lesson", durationMinutes: 30, priceCents: 4000, depositRequired: false, depositPercent: 0, extra: { recurringLessonDefault: true } },
      { name: "45 Min Lesson", durationMinutes: 45, priceCents: 5500, depositRequired: false, depositPercent: 0, extra: { recurringLessonDefault: true } },
      { name: "60 Min Lesson", durationMinutes: 60, priceCents: 7000, depositRequired: false, depositPercent: 0, extra: { recurringLessonDefault: true } },
      { name: "4-Lesson Package (30 min)", durationMinutes: 30, priceCents: 14000, depositRequired: false, depositPercent: 0 },
    ],
    defaultIntakeFields: [
      { label: "Instrument", fieldType: "dropdown", options: ["Piano", "Guitar", "Violin", "Voice", "Drums", "Other"], required: true },
      { label: "Skill level", fieldType: "dropdown", options: ["Beginner", "Intermediate", "Advanced"], required: true },
      { label: "Student age", fieldType: "short_text", required: false },
      { label: "Goals / notes", fieldType: "long_text", required: false },
      { label: "Parent or guardian contact (if student is a minor)", fieldType: "short_text", required: false },
    ],
    reminderPrepLine: "Please bring your instrument and any sheet music we're working on.",
  },
  mobile_stylist: {
    id: "mobile_stylist",
    label: "Mobile Hairstylist",
    tagline: "Travel buffers and location intake handled automatically",
    icon: "Sparkles",
    defaultServices: [
      { name: "Haircut & Style", durationMinutes: 60, priceCents: 8000, depositRequired: true, depositPercent: 20 },
      { name: "Blowout", durationMinutes: 30, priceCents: 4500, depositRequired: false, depositPercent: 0 },
      { name: "Bridal / Event Makeup", durationMinutes: 90, priceCents: 15000, depositRequired: true, depositPercent: 30 },
      { name: "Color Service", durationMinutes: 120, priceCents: 18000, depositRequired: true, depositPercent: 25, extra: { addons: [{ name: "Blow dry", minutes: 30, priceCents: 2500 }, { name: "Updo", minutes: 45, priceCents: 4000 }] } },
    ],
    defaultIntakeFields: [
      { label: "Service address", fieldType: "long_text", required: true },
      { label: "Event type", fieldType: "dropdown", options: ["Wedding", "Photo shoot", "Regular appointment"], required: false },
      { label: "Hair / skin notes", fieldType: "long_text", required: false },
      { label: "Reference photo", fieldType: "file_upload", required: false },
      { label: "Allergies", fieldType: "short_text", required: false },
    ],
    reminderPrepLine: "Please have hair washed and dried with no product unless we discussed otherwise.",
  },
  physiotherapist: {
    id: "physiotherapist",
    label: "Physiotherapist",
    tagline: "Health intake and consent waivers, ready to go",
    icon: "HeartPulse",
    defaultServices: [
      { name: "Initial Assessment", durationMinutes: 60, priceCents: 12000, depositRequired: false, depositPercent: 0 },
      { name: "Follow-up Session", durationMinutes: 30, priceCents: 7000, depositRequired: false, depositPercent: 0 },
      { name: "Extended Treatment", durationMinutes: 45, priceCents: 9500, depositRequired: false, depositPercent: 0 },
    ],
    defaultIntakeFields: [
      { label: "Reason for visit", fieldType: "long_text", required: true },
      { label: "Health / medical history", fieldType: "long_text", required: false },
      { label: "Current medications", fieldType: "short_text", required: false },
      { label: "Referring physician", fieldType: "short_text", required: false },
      { label: "Consent to treatment", fieldType: "checkbox", required: true, isWaiver: true, requiresSignature: true, waiverText: "I consent to receive physiotherapy treatment and understand the risks and benefits have been explained to me." },
    ],
    reminderPrepLine: "Please wear comfortable clothing that allows movement of the affected area.",
  },
  personal_trainer: {
    id: "personal_trainer",
    label: "Personal Trainer",
    tagline: "Liability waivers and goal tracking from day one",
    icon: "Dumbbell",
    defaultServices: [
      { name: "Single Session", durationMinutes: 60, priceCents: 7500, depositRequired: false, depositPercent: 0 },
      { name: "30 Min Express Session", durationMinutes: 30, priceCents: 4500, depositRequired: false, depositPercent: 0 },
      { name: "Initial Fitness Assessment", durationMinutes: 75, priceCents: 9000, depositRequired: false, depositPercent: 0 },
    ],
    defaultIntakeFields: [
      { label: "Fitness goals", fieldType: "long_text", required: true },
      { label: "Injuries or physical limitations", fieldType: "long_text", required: false },
      { label: "Medical conditions", fieldType: "short_text", required: false },
      { label: "Liability waiver", fieldType: "checkbox", required: true, isWaiver: true, requiresSignature: true, waiverText: "I acknowledge that physical exercise carries inherent risk and I voluntarily participate, releasing the trainer from liability for injury except in cases of gross negligence." },
    ],
    reminderPrepLine: "Please wear athletic clothing and bring a water bottle.",
  },
};

export const PROFESSION_LIST = Object.values(PROFESSIONS);
