// Medicine family - starter achievement library for v1.0 launch.

import type { Achievement, Chain } from "@/lib/types";

export const MEDICINE_ACHIEVEMENTS: Achievement[] = [
  // ASCENDED
  {
    id: "med_nobel_med",
    family: "medicine",
    tier: "ASCENDED",
    label: "Nobel Prize in Physiology or Medicine",
    description: "Once-a-generation recognition for medical breakthrough.",
    signals: [{ kind: "award", match: ["Nobel Prize in Medicine", "Nobel Prize in Physiology"] }],
    evidence: ["Katalin Karikó", "Drew Weissman"],
  },
  {
    id: "med_lasker_award",
    family: "medicine",
    tier: "ASCENDED",
    label: "Lasker Award",
    description: "Top US biomedical research prize. Often predicts a Nobel.",
    signals: [{ kind: "award", match: ["Lasker Award", "Lasker Basic Medical Research Award"] }],
    evidence: ["broad"],
  },
  {
    id: "med_dept_chair_top_hospital",
    family: "medicine",
    tier: "ASCENDED",
    label: "Department chair at top hospital",
    description: "Chair of a clinical department at MGH/Hopkins/Mayo/UCSF.",
    signals: [
      { kind: "company", match: ["Mass General Hospital", "Johns Hopkins", "Mayo Clinic", "UCSF Medical Center", "Cleveland Clinic"], title: ["Chair", "Chairman", "Department Chair"] },
    ],
    evidence: ["broad"],
  },
  // MYTHIC
  {
    id: "med_hopkins_mgh_residency",
    family: "medicine",
    tier: "MYTHIC",
    label: "Hopkins / MGH / UCSF residency",
    description: "Residency at a top-3 medical center.",
    signals: [
      { kind: "company", match: ["Johns Hopkins Hospital", "Mass General Hospital", "MGH", "UCSF Medical Center"], title: ["Resident", "Fellow"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "med_top_residency_competitive",
    family: "medicine",
    tier: "MYTHIC",
    label: "Top neurosurg / derm / ortho residency",
    description: "Top program in one of the most competitive specialties.",
    signals: [{ kind: "free_text", patterns: [/Neurosurgery Residency|Dermatology Residency|Orthopedic Surgery Residency|Plastic Surgery Residency/i] }],
    evidence: ["narrow"],
  },
  {
    id: "med_top_3_med_school",
    family: "medicine",
    tier: "MYTHIC",
    label: "Harvard Med / Hopkins Med / Stanford Med",
    description: "MD from a top-3 medical school.",
    signals: [
      { kind: "school", match: ["Harvard Medical School", "Johns Hopkins School of Medicine", "Stanford School of Medicine"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "med_biotech_founder_ipo",
    family: "medicine",
    tier: "MYTHIC",
    label: "Biotech founder w/ IPO or major exit",
    description: "Founded a biotech that IPO'd or was acquired for $1B+.",
    signals: [
      { kind: "company", match: [""], title: ["Founder", "CEO", "Co-Founder"] },
      { kind: "free_text", patterns: [/biotech|pharmaceutical|drug discovery/i] },
    ],
    evidence: ["broad"],
  },
  // S
  {
    id: "med_md_t10",
    family: "medicine",
    tier: "S",
    label: "MD from a top-10 medical school",
    description: "MD from UCSF/Penn/Columbia/Yale/Mich/WashU/Duke/NYU.",
    signals: [
      { kind: "school", match: ["UCSF School of Medicine", "Perelman", "Columbia Vagelos", "Yale Medicine", "Michigan Medicine", "WashU Medicine", "Duke Medicine", "NYU Grossman"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "med_attending_top_hospital",
    family: "medicine",
    tier: "S",
    label: "Attending physician at top hospital",
    description: "Attending at MGH/Hopkins/UCSF/Mayo/Cleveland Clinic.",
    signals: [
      { kind: "company", match: ["Mass General Hospital", "Johns Hopkins Hospital", "UCSF Medical Center", "Mayo Clinic"], title: ["Attending", "Physician"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "med_md_phd",
    family: "medicine",
    tier: "S",
    label: "MD/PhD",
    description: "Dual MD/PhD degree.",
    signals: [{ kind: "free_text", patterns: [/MD\/PhD|MD-PhD|MSTP/i] }],
    evidence: ["broad"],
  },
  // A
  {
    id: "med_md_known",
    family: "medicine",
    tier: "A",
    label: "MD from a known medical school",
    description: "MD from any accredited US/international medical school.",
    signals: [{ kind: "school", match: ["School of Medicine"], regex: [/MD\b/i] }],
    evidence: ["very broad"],
  },
  {
    id: "med_residency_anywhere",
    family: "medicine",
    tier: "A",
    label: "Medical residency",
    description: "Currently a medical resident or fellow.",
    signals: [{ kind: "free_text", patterns: [/Medical Resident|Resident Physician|Medical Fellow/i] }],
    evidence: ["very broad"],
  },
  // B
  {
    id: "med_med_student",
    family: "medicine",
    tier: "B",
    label: "Medical student",
    description: "Currently in medical school.",
    signals: [{ kind: "free_text", patterns: [/Medical Student|MS1|MS2|MS3|MS4|medical school/i] }],
    evidence: ["very broad"],
  },
  // C
  {
    id: "med_premed_advanced",
    family: "medicine",
    tier: "C",
    label: "Pre-med w/ research + clinical hours",
    description: "Pre-med candidate with serious research + clinical commitments.",
    signals: [{ kind: "free_text", patterns: [/Pre-med|pre-medical|MCAT/i] }],
    evidence: ["very broad"],
  },
  // D
  {
    id: "med_premed_basic",
    family: "medicine",
    tier: "D",
    label: "Pre-med (early)",
    description: "Says 'pre-med' on LinkedIn.",
    signals: [{ kind: "free_text", patterns: [/aspiring physician|pre-med/i] }],
    evidence: ["large"],
  },
];

export const MEDICINE_CHAINS: Chain[] = [
  {
    id: "med_chain_hopkins_path",
    name: "The Hopkins Path",
    family: "medicine",
    requires: ["med_top_3_med_school", "med_hopkins_mgh_residency"],
    bumpTo: "ASCENDED",
    description: "Top-3 med school into Hopkins/MGH/UCSF residency - the apex clinical track.",
  },
  {
    id: "med_chain_md_phd_attending",
    name: "Physician-Scientist Track",
    family: "medicine",
    requires: ["med_md_phd", "med_attending_top_hospital"],
    bumpTo: "MYTHIC",
    description: "MD/PhD + attending at a top hospital - the physician-scientist apex.",
  },
  {
    id: "med_chain_biotech_apex",
    name: "Biotech Apex",
    family: "medicine",
    requires: ["med_md_phd", "med_biotech_founder_ipo"],
    bumpTo: "ASCENDED",
    description: "MD/PhD founder taking biotech public.",
  },
];
