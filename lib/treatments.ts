// ============================================
// PlantVillage Disease Treatment Lookup
// 38 classes mapped to treatment recommendations
// ============================================

export interface TreatmentInfo {
  crop: string
  disease: string
  treatment: string
  isHealthy: boolean
  preventions?: string[]
}

// Parse HF model label (e.g., "Tomato___Late_blight" → { crop: "Tomato", disease: "Late Blight" })
export function parseDiseaseLabel(label: string): { crop: string; disease: string } {
  const parts = label.split('___')
  const crop = parts[0].replace(/_/g, ' ')
  const disease = parts[1]?.replace(/_/g, ' ') || 'Unknown'
  return { crop, disease }
}

// Treatment database
export const treatmentDatabase: Record<string, TreatmentInfo> = {
  // Apple
  'Apple___Apple_scab': {
    crop: 'Apple',
    disease: 'Apple Scab',
    treatment: 'Apply fungicides containing myclobutanil or mancozeb. Rake and destroy fallen leaves. Prune for better air circulation.',
    isHealthy: false,
    preventions: ['Remove fallen leaves', 'Prune for airflow', 'Apply preventive fungicide in spring']
  },
  'Apple___Black_rot': {
    crop: 'Apple',
    disease: 'Black Rot',
    treatment: 'Prune diseased branches 4-6 inches below visible symptoms. Remove mummified fruits. Apply fungicides during growing season.',
    isHealthy: false,
    preventions: ['Remove mummified fruits', 'Prune during dormancy', 'Sanitize pruning tools']
  },
  'Apple___Cedar_apple_rust': {
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    treatment: 'Remove nearby cedar/juniper hosts if possible. Apply fungicides containing myclobutanil or triadimefon starting at pink bud stage.',
    isHealthy: false,
    preventions: ['Remove galls from cedar trees', 'Apply preventive fungicides', 'Plant resistant varieties']
  },
  'Apple___healthy': {
    crop: 'Apple',
    disease: 'Healthy',
    treatment: 'No treatment needed. Continue regular care including proper watering, fertilization, and pruning.',
    isHealthy: true,
    preventions: ['Regular pruning', 'Balanced fertilization', 'Adequate watering']
  },

  // Blueberry
  'Blueberry___healthy': {
    crop: 'Blueberry',
    disease: 'Healthy',
    treatment: 'No treatment needed. Maintain acidic soil pH (4.5-5.5) and consistent moisture.',
    isHealthy: true,
    preventions: ['Maintain soil pH 4.5-5.5', 'Mulch to retain moisture', 'Prune old canes']
  },

  // Cherry
  'Cherry_(including_sour)___Powdery_mildew': {
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    treatment: 'Apply sulfur-based fungicides or potassium bicarbonate. Improve air circulation. Avoid overhead watering.',
    isHealthy: false,
    preventions: ['Space plants properly', 'Avoid overhead irrigation', 'Apply preventive sulfur']
  },
  'Cherry_(including_sour)___healthy': {
    crop: 'Cherry',
    disease: 'Healthy',
    treatment: 'No treatment needed. Continue standard care including dormant spraying and proper pruning.',
    isHealthy: true,
    preventions: ['Dormant spraying', 'Annual pruning', 'Proper irrigation']
  },

  // Corn
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    treatment: 'Rotate crops (avoid planting corn in same field for 1-2 years). Apply fungicides if disease appears before tasseling.',
    isHealthy: false,
    preventions: ['Rotate crops annually', 'Remove crop debris', 'Use resistant hybrids']
  },
  'Corn_(maize)___Common_rust_': {
    crop: 'Corn',
    disease: 'Common Rust',
    treatment: 'Fungicides are rarely needed for home gardens. For severe cases, apply azoxystrobin or pyraclostrobin.',
    isHealthy: false,
    preventions: ['Plant resistant varieties', 'Avoid overhead irrigation', 'Space for airflow']
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Leaf Blight',
    treatment: 'Rotate crops. Apply fungicides containing chlorothalonil or mancozeb if disease is severe.',
    isHealthy: false,
    preventions: ['Rotate crops', 'Remove infected debris', 'Use resistant varieties']
  },
  'Corn_(maize)___healthy': {
    crop: 'Corn',
    disease: 'Healthy',
    treatment: 'No treatment needed. Ensure adequate nitrogen and consistent soil moisture.',
    isHealthy: true,
    preventions: ['Adequate nitrogen', 'Consistent watering', 'Weed control']
  },

  // Grape
  'Grape___Black_rot': {
    crop: 'Grape',
    disease: 'Black Rot',
    treatment: 'Remove mummified berries. Apply fungicides (mancozeb, myclobutanil) starting at bud break. Prune for airflow.',
    isHealthy: false,
    preventions: ['Remove mummified berries', 'Prune for airflow', 'Apply preventive fungicides']
  },
  'Grape___Esca_(Black_Measles)': {
    crop: 'Grape',
    disease: 'Esca (Black Measles)',
    treatment: 'No cure available. Remove severely infected vines. Avoid trunk wounds. Use sodium arsenite (where legal) for severe cases.',
    isHealthy: false,
    preventions: ['Avoid trunk wounds', 'Sanitize pruning tools', 'Remove infected vines']
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    crop: 'Grape',
    disease: 'Leaf Blight',
    treatment: 'Apply copper-based fungicides or chlorothalonil. Remove and destroy infected leaves.',
    isHealthy: false,
    preventions: ['Remove infected leaves', 'Apply preventive fungicides', 'Improve air circulation']
  },
  'Grape___healthy': {
    crop: 'Grape',
    disease: 'Healthy',
    treatment: 'No treatment needed. Maintain proper canopy management and spray schedule.',
    isHealthy: true,
    preventions: ['Proper pruning', 'Balanced fertilization', 'Regular spray schedule']
  },

  // Orange
  'Orange___Haunglongbing_(Citrus_greening)': {
    crop: 'Orange',
    disease: 'Citrus Greening (HLB)',
    treatment: 'No cure available. Remove infected trees. Control psyllid vectors with insecticides. Plant certified disease-free trees.',
    isHealthy: false,
    preventions: ['Control psyllid insects', 'Remove infected trees', 'Plant certified trees']
  },

  // Peach
  'Peach___Bacterial_spot': {
    crop: 'Peach',
    disease: 'Bacterial Spot',
    treatment: 'Apply copper sprays during dormancy. Avoid overhead irrigation. Plant resistant varieties.',
    isHealthy: false,
    preventions: ['Dormant copper sprays', 'Avoid overhead watering', 'Plant resistant varieties']
  },
  'Peach___healthy': {
    crop: 'Peach',
    disease: 'Healthy',
    treatment: 'No treatment needed. Continue regular pruning and dormant spraying.',
    isHealthy: true,
    preventions: ['Annual pruning', 'Dormant spraying', 'Thin fruit properly']
  },

  // Pepper
  'Pepper,_bell___Bacterial_spot': {
    crop: 'Pepper',
    disease: 'Bacterial Spot',
    treatment: 'Apply copper-based bactericides. Avoid overhead watering. Rotate crops. Remove infected plants.',
    isHealthy: false,
    preventions: ['Use certified seeds', 'Rotate crops', 'Avoid overhead irrigation']
  },
  'Pepper,_bell___healthy': {
    crop: 'Pepper',
    disease: 'Healthy',
    treatment: 'No treatment needed. Maintain consistent moisture and balanced fertilization.',
    isHealthy: true,
    preventions: ['Consistent watering', 'Mulching', 'Balanced fertilization']
  },

  // Potato
  'Potato___Early_blight': {
    crop: 'Potato',
    disease: 'Early Blight',
    treatment: 'Apply fungicides (chlorothalonil, mancozeb). Rotate crops. Remove infected plant debris.',
    isHealthy: false,
    preventions: ['Rotate crops', 'Remove plant debris', 'Adequate spacing']
  },
  'Potato___Late_blight': {
    crop: 'Potato',
    disease: 'Late Blight',
    treatment: 'Apply fungicides immediately (mancozeb, chlorothalonil). Remove and destroy infected plants. Avoid overhead watering.',
    isHealthy: false,
    preventions: ['Plant certified seed', 'Remove volunteer potatoes', 'Apply preventive fungicides']
  },
  'Potato___healthy': {
    crop: 'Potato',
    disease: 'Healthy',
    treatment: 'No treatment needed. Hill soil around plants and maintain consistent moisture.',
    isHealthy: true,
    preventions: ['Hilling', 'Consistent moisture', 'Crop rotation']
  },

  // Raspberry
  'Raspberry___healthy': {
    crop: 'Raspberry',
    disease: 'Healthy',
    treatment: 'No treatment needed. Prune old canes annually and maintain good air circulation.',
    isHealthy: true,
    preventions: ['Prune old canes', 'Adequate spacing', 'Weed control']
  },

  // Soybean
  'Soybean___healthy': {
    crop: 'Soybean',
    disease: 'Healthy',
    treatment: 'No treatment needed. Ensure proper inoculation with rhizobia and adequate phosphorus.',
    isHealthy: true,
    preventions: ['Rhizobia inoculation', 'Proper spacing', 'Weed control']
  },

  // Squash
  'Squash___Powdery_mildew': {
    crop: 'Squash',
    disease: 'Powdery Mildew',
    treatment: 'Apply sulfur, potassium bicarbonate, or neem oil. Remove severely infected leaves. Ensure good air circulation.',
    isHealthy: false,
    preventions: ['Space for airflow', 'Avoid overhead watering', 'Apply preventive sulfur']
  },

  // Strawberry
  'Strawberry___Leaf_scorch': {
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    treatment: 'Remove infected leaves. Apply fungicides if severe. Ensure proper spacing for air circulation.',
    isHealthy: false,
    preventions: ['Remove infected leaves', 'Space for airflow', 'Avoid overhead irrigation']
  },
  'Strawberry___healthy': {
    crop: 'Strawberry',
    disease: 'Healthy',
    treatment: 'No treatment needed. Mulch with straw and remove old leaves after harvest.',
    isHealthy: true,
    preventions: ['Straw mulch', 'Renovation after harvest', 'Proper spacing']
  },

  // Tomato
  'Tomato___Bacterial_spot': {
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    treatment: 'Apply copper-based bactericides. Avoid overhead watering. Remove infected plants. Rotate crops.',
    isHealthy: false,
    preventions: ['Use certified seeds', 'Rotate crops', 'Avoid overhead irrigation']
  },
  'Tomato___Early_blight': {
    crop: 'Tomato',
    disease: 'Early Blight',
    treatment: 'Remove infected leaves. Apply fungicides (chlorothalonil, copper). Mulch to prevent soil splash.',
    isHealthy: false,
    preventions: ['Mulching', 'Prune lower leaves', 'Rotate crops']
  },
  'Tomato___Late_blight': {
    crop: 'Tomato',
    disease: 'Late Blight',
    treatment: 'Remove and destroy infected plants immediately. Apply fungicides (chlorothalonil, mancozeb). Avoid overhead watering.',
    isHealthy: false,
    preventions: ['Remove volunteers', 'Space for airflow', 'Apply preventive fungicides']
  },
  'Tomato___Leaf_Mold': {
    crop: 'Tomato',
    disease: 'Leaf Mold',
    treatment: 'Improve air circulation. Apply fungicides (chlorothalonil, copper). Lower humidity in greenhouse.',
    isHealthy: false,
    preventions: ['Ventilation', 'Space for airflow', 'Avoid wetting foliage']
  },
  'Tomato___Septoria_leaf_spot': {
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    treatment: 'Remove infected leaves. Apply fungicides. Mulch to prevent soil splash. Rotate crops.',
    isHealthy: false,
    preventions: ['Mulching', 'Remove infected leaves', 'Rotate crops']
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    crop: 'Tomato',
    disease: 'Spider Mites',
    treatment: 'Spray with water to dislodge mites. Apply insecticidal soap or neem oil. Increase humidity.',
    isHealthy: false,
    preventions: ['Regular monitoring', 'Maintain humidity', 'Remove weeds']
  },
  'Tomato___Target_Spot': {
    crop: 'Tomato',
    disease: 'Target Spot',
    treatment: 'Apply fungicides (chlorothalonil, mancozeb). Remove infected leaves. Improve air circulation.',
    isHealthy: false,
    preventions: ['Space for airflow', 'Remove infected leaves', 'Avoid overhead watering']
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    crop: 'Tomato',
    disease: 'Yellow Leaf Curl Virus',
    treatment: 'No cure. Remove infected plants. Control whitefly vectors with insecticides. Use resistant varieties.',
    isHealthy: false,
    preventions: ['Use resistant varieties', 'Control whiteflies', 'Remove infected plants']
  },
  'Tomato___Tomato_mosaic_virus': {
    crop: 'Tomato',
    disease: 'Mosaic Virus',
    treatment: 'No cure. Remove infected plants. Control aphids. Sanitize hands and tools. Use resistant varieties.',
    isHealthy: false,
    preventions: ['Use resistant varieties', 'Control aphids', 'Sanitize tools']
  },
  'Tomato___healthy': {
    crop: 'Tomato',
    disease: 'Healthy',
    treatment: 'No treatment needed. Continue regular care including staking, pruning, and consistent watering.',
    isHealthy: true,
    preventions: ['Staking/support', 'Prune suckers', 'Consistent watering']
  }
}

// Lookup function with fallback
export function getTreatmentInfo(label: string): TreatmentInfo {
  const normalized = label.trim()
  
  // Direct lookup
  if (treatmentDatabase[normalized]) {
    return treatmentDatabase[normalized]
  }
  
  // Try case-insensitive lookup
  const key = Object.keys(treatmentDatabase).find(
    k => k.toLowerCase() === normalized.toLowerCase()
  )
  
  if (key) {
    return treatmentDatabase[key]
  }
  
  // Parse and return generic info
  const { crop, disease } = parseDiseaseLabel(label)
  
  return {
    crop,
    disease,
    treatment: 'Consult a local agricultural extension office for specific treatment recommendations.',
    isHealthy: disease.toLowerCase().includes('healthy'),
    preventions: ['Monitor plant health', 'Practice good sanitation', 'Maintain proper growing conditions']
  }
}

// Get all supported crops
export function getSupportedCrops(): string[] {
  const crops = new Set(Object.values(treatmentDatabase).map(t => t.crop))
  return Array.from(crops).sort()
}

// Get all diseases for a crop
export function getDiseasesForCrop(crop: string): TreatmentInfo[] {
  return Object.values(treatmentDatabase).filter(t => 
    t.crop.toLowerCase() === crop.toLowerCase()
  )
}
