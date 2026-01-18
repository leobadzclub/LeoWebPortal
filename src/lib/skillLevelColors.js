/**
 * Get color classes for skill levels
 * @param {string} skillLevel - The skill level (beginner, intermediate, intermediate+, advanced)
 * @returns {Object} Object with background and text color classes
 */
export function getSkillLevelColors(skillLevel) {
  const level = skillLevel?.toLowerCase();
  
  switch (level) {
    case 'beginner':
      return {
        bg: 'bg-blue-200',
        text: 'text-blue-900',
        border: 'border-blue-300',
        label: 'Beginner',
      };
    case 'intermediate':
      return {
        bg: 'bg-violet-200',
        text: 'text-violet-900',
        border: 'border-violet-300',
        label: 'Intermediate',
      };
    case 'intermediate+':
      return {
        bg: 'bg-yellow-200',
        text: 'text-yellow-900',
        border: 'border-yellow-300',
        label: 'Intermediate+',
      };
    case 'advanced':
      return {
        bg: 'bg-orange-200',
        text: 'text-orange-900',
        border: 'border-orange-300',
        label: 'Advanced',
      };
    default:
      return {
        bg: 'bg-gray-200',
        text: 'text-gray-900',
        border: 'border-gray-300',
        label: skillLevel || 'Not set',
      };
  }
}

/**
 * Get skill level badge component classes
 * @param {string} skillLevel - The skill level
 * @returns {string} Combined class string for badge
 */
export function getSkillLevelBadgeClasses(skillLevel) {
  const colors = getSkillLevelColors(skillLevel);
  return `${colors.bg} ${colors.text} ${colors.border} border-2 font-semibold px-3 py-1 rounded-full text-sm`;
}
