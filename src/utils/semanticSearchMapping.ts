// Semantic Service Mapping for Fuzzy Search
// Maps synonyms and related terms to primary service categories

export const SERVICE_SYNONYMS: Record<string, string[]> = {
  // Hair Services
  "haircut": ["hair cut", "snip", "trim", "styling", "cut", "hair styling", "hair trim"],
  "hair coloring": ["hair color", "dye", "colour", "hair dye", "coloring", "colouring", "highlights", "lowlights", "balayage", "ombre"],
  "facial": ["face treatment", "skin care", "skincare", "face massage", "clean up", "cleanup"],
  "manicure": ["nail art", "nail design", "nail polish", "hand care", "nail treatment"],
  "pedicure": ["foot care", "foot spa", "nail care", "toenail treatment"],
  "waxing": ["hair removal", "depilation", "threading", "shaving"],
  "massage": ["body massage", "spa", "relaxation", "therapy", "body treatment"],
  "makeup": ["makeover", "bridal makeup", "party makeup", "cosmetics", "beauty"],
  "hair spa": ["hair treatment", "hair mask", "deep conditioning", "hair repair"],
  "keratin": ["keratin treatment", "hair smoothing", "straightening", "rebonding"],
  "beard": ["beard trim", "beard styling", "beard grooming", "shave"],
  "trimming": ["cut", "snip", "shape", "styling"],
  
  // Category Mappings
  "hair": ["haircut", "hair coloring", "hair spa", "keratin", "styling", "trimming"],
  "nails": ["manicure", "pedicure", "nail art", "nail design"],
  "skin": ["facial", "waxing", "skincare", "skin treatment"],
  "body": ["massage", "spa", "body treatment"],
};

export const PRIMARY_CATEGORIES: Record<string, string> = {
  "hair cut": "haircut",
  "snip": "haircut",
  "trim": "haircut",
  "styling": "haircut",
  "cut": "haircut",
  "hair styling": "haircut",
  "hair trim": "haircut",
  
  "hair color": "hair coloring",
  "dye": "hair coloring",
  "colour": "hair coloring",
  "hair dye": "hair coloring",
  "coloring": "hair coloring",
  "colouring": "hair coloring",
  "highlights": "hair coloring",
  "lowlights": "hair coloring",
  "balayage": "hair coloring",
  "ombre": "hair coloring",
  
  "face treatment": "facial",
  "skin care": "facial",
  "skincare": "facial",
  "face massage": "facial",
  "clean up": "facial",
  "cleanup": "facial",
  
  "nail art": "manicure",
  "nail design": "manicure",
  "nail polish": "manicure",
  "hand care": "manicure",
  "nail treatment": "manicure",
  
  "foot care": "pedicure",
  "foot spa": "pedicure",
  "nail care": "pedicure",
  "toenail treatment": "pedicure",
  
  "hair removal": "waxing",
  "depilation": "waxing",
  "threading": "waxing",
  "shaving": "waxing",
  
  "body massage": "massage",
  "spa": "massage",
  "relaxation": "massage",
  "therapy": "massage",
  "body treatment": "massage",
  
  "makeover": "makeup",
  "bridal makeup": "makeup",
  "party makeup": "makeup",
  "cosmetics": "makeup",
  "beauty": "makeup",
  
  "hair treatment": "hair spa",
  "hair mask": "hair spa",
  "deep conditioning": "hair spa",
  "hair repair": "hair spa",
  
  "keratin treatment": "keratin",
  "hair smoothing": "keratin",
  "straightening": "keratin",
  "rebonding": "keratin",
  
  "beard trim": "beard",
  "beard styling": "beard",
  "beard grooming": "beard",
  "shave": "beard",
};

export function normalizeSearchQuery(query: string): string {
  if (!query) return "";
  
  const normalized = query.toLowerCase().trim();
  
  // Check if it's a synonym, return the primary category
  if (PRIMARY_CATEGORIES[normalized]) {
    return PRIMARY_CATEGORIES[normalized];
  }
  
  return normalized;
}

export function getMatchingServices(query: string, availableServices: string[]): string[] {
  if (!query) return availableServices;
  
  const normalizedQuery = normalizeSearchQuery(query);
  const matches: string[] = [];
  
  availableServices.forEach(service => {
    const normalizedService = service.toLowerCase();
    
    // Direct match
    if (normalizedService.includes(normalizedQuery) || normalizedQuery.includes(normalizedService)) {
      matches.push(service);
      return;
    }
    
    // Check synonyms
    const synonyms = SERVICE_SYNONYMS[normalizedQuery] || [];
    if (synonyms.some(synonym => normalizedService.includes(synonym))) {
      matches.push(service);
      return;
    }
  });
  
  return matches;
}
