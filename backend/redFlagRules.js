const RED_FLAG_RULES = {
  chest: {
    reason: "Chest pain -- possible cardiac / respiratory emergency. Seek immediate attention.",
    patterns: [/chest\s*pain/i, /heart\s*attack/i, /cardiac/i, /angina/i, /\bmi\b/i],
    ayushPatterns: [/hridroga/i, /hridaya\s*shula/i],
  },
  stroke: {
    reason: "Sudden facial drooping / arm weakness / speech difficulty -- FAST stroke criteria met.",
    patterns: [/stroke/i, /face.*droop/i, /arm.*weak/i, /speech.*difficult/i, /slurred/i, /\btia\b/i],
    ayushPatterns: [/pakshaghata/i, /ardhanga/i],
  },
  breathless: {
    reason: "Severe breathlessness -- possible acute respiratory failure or pulmonary embolism.",
    patterns: [/breathless/i, /can.?t\s*breathe/i, /difficulty\s*breath/i, /shortness.*breath/i, /\bsob\b/i],
    ayushPatterns: [/tamaka\s*shwasa/i, /\bshwasa\b/i],
  },
  unconscious: {
    reason: "Altered / loss of consciousness -- requires immediate triage evaluation.",
    patterns: [/unconscious/i, /fainted/i, /not\s*respond/i, /syncope/i, /collapse/i, /loss.*conscious/i],
    ayushPatterns: [/moorcha/i, /murcha/i, /apasmara/i],
  },
  bleeding: {
    reason: "Severe uncontrolled bleeding -- haemodynamic instability risk.",
    patterns: [/bleeding/i, /haemorrhage/i, /hemorrhage/i, /blood\s*loss/i, /coughing\s*blood/i, /vomiting\s*blood/i],
    ayushPatterns: [/raktapitta/i, /rakta\s*srava/i],
  },
  seizure: {
    reason: "Active or post-ictal seizure -- requires urgent neurological assessment.",
    patterns: [/seizure/i, /convulsion/i, /epilep/i, /\bfits\b/i, /post.?ictal/i],
    ayushPatterns: [/akshepaka/i],
  },
  snakebite: {
    reason: "Suspected envenomation -- anti-venom may be time-critical.",
    patterns: [/snake.*bit/i, /bit.*snake/i, /envenomat/i, /scorpion.*sting/i],
    ayushPatterns: [/sarpavisha/i],
  },
  poison: {
    reason: "Suspected poisoning or overdose -- poison control and emergency support needed.",
    patterns: [/poison/i, /overdose/i, /\btoxic\b/i, /organo.*phosphate/i],
    ayushPatterns: [/visha\s*jwara/i, /\bvisha\b/i],
  },
};

function detectRedFlag(symptomId, chiefComplaint, isAyushMode = false) {

  if (symptomId && RED_FLAG_RULES[symptomId]) {
    return { red_flag: true, red_flag_reason: RED_FLAG_RULES[symptomId].reason };
  }

  if (!chiefComplaint) return { red_flag: false, red_flag_reason: null };

  for (const rule of Object.values(RED_FLAG_RULES)) {
    const patterns = isAyushMode
      ? [...rule.patterns, ...(rule.ayushPatterns || [])]
      : rule.patterns;
    for (const pat of patterns) {
      if (pat.test(chiefComplaint)) {
        return { red_flag: true, red_flag_reason: rule.reason };
      }
    }
  }

  return { red_flag: false, red_flag_reason: null };
}

module.exports = { RED_FLAG_RULES, detectRedFlag };
