export const DISASTER_TYPES = {
  FLOOD: {
    id: 'flood',
    label: 'Flood',
    color: '#3b82f6',
    opacity: 0.4,
    icon: '🌊',
    tips: [
      'Move to higher ground immediately',
      'Avoid walking through moving water',
      'Do not drive through flooded areas',
      'Monitor local news and weather updates'
    ],
    emergencyContacts: [
      { name: 'Flood Control Room', number: '1800-123-4567' },
      { name: 'Coast Guard', number: '1800-180-4567' }
    ],
    bufferSize: 100, // meters
    routeColor: '#60a5fa'
  },
  FIRE: {
    id: 'fire',
    label: 'Wildfire',
    color: '#ef4444',
    opacity: 0.4,
    icon: '🔥',
    tips: [
      'Evacuate immediately if authorities order it',
      'Keep windows and doors closed',
      'Have an emergency kit ready',
      'Monitor air quality reports'
    ],
    emergencyContacts: [
      { name: 'Fire Control', number: '101' },
      { name: 'Forest Department', number: '1800-425-4444' }
    ],
    bufferSize: 200, // meters
    routeColor: '#f87171'
  },
  EARTHQUAKE: {
    id: 'earthquake',
    label: 'Earthquake',
    color: '#92400e',
    opacity: 0.4,
    icon: '🏚️',
    tips: [
      'Drop, Cover, and Hold On',
      'Stay away from buildings and power lines',
      'Be prepared for aftershocks',
      'Check for injuries and damage'
    ],
    emergencyContacts: [
      { name: 'Emergency Response', number: '112' },
      { name: 'Search & Rescue', number: '1800-121-1212' }
    ],
    bufferSize: 150, // meters
    routeColor: '#b45309'
  },
  CHEMICAL: {
    id: 'chemical',
    label: 'Chemical Spill',
    color: '#7c3aed',
    opacity: 0.4,
    icon: '⚠️',
    tips: [
      'Stay upwind of the incident',
      'Seal all windows and doors',
      'Do not touch or walk through spilled material',
      'Follow evacuation orders immediately'
    ],
    emergencyContacts: [
      { name: 'HazMat Response', number: '108' },
      { name: 'Poison Control', number: '1800-116-117' }
    ],
    bufferSize: 300, // meters
    routeColor: '#8b5cf6'
  },
  TSUNAMI: {
    id: 'tsunami',
    label: 'Tsunami',
    color: '#0891b2',
    opacity: 0.4,
    icon: '🌊',
    tips: [
      'Move to higher ground or inland immediately',
      'Follow evacuation routes',
      'Stay away from the coast',
      'Wait for official all-clear'
    ],
    emergencyContacts: [
      { name: 'Tsunami Warning Center', number: '1800-100-8789' },
      { name: 'Coast Guard', number: '1800-180-4567' }
    ],
    bufferSize: 400, // meters
    routeColor: '#06b6d4'
  }
};

export const SHELTER_TYPES = {
  EMERGENCY: {
    icon: '🏥',
    label: 'Emergency Shelter',
    color: '#22c55e'
  },
  MEDICAL: {
    icon: '🏥',
    label: 'Medical Center',
    color: '#ef4444'
  },
  POLICE: {
    icon: '👮',
    label: 'Police Station',
    color: '#3b82f6'
  },
  FIRE_STATION: {
    icon: '🚒',
    label: 'Fire Station',
    color: '#f97316'
  }
};

export const SAFETY_COLORS = {
  high: '#22c55e',    // Green
  medium: '#eab308',  // Yellow
  low: '#ef4444'      // Red
};

export const ANIMATIONS = {
  routeLine: {
    duration: 1000,
    delay: 200
  },
  marker: {
    duration: 500,
    bounce: 1.2
  }
};