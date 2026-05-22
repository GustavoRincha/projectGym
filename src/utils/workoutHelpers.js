/**
 * Utility functions for parsing, formatting, and grouping exercises in workouts.
 * Supports Bi-Set (supersets) by encoding a [biset:ID] suffix in the machine field.
 */

/**
 * Parses the machine string to extract the actual machine name and any bi-set ID.
 * @param {string} machineStr 
 * @returns {{name: string, bisetId: string|null}}
 */
export const parseMachine = (machineStr) => {
  if (!machineStr) return { name: '', bisetId: null };
  const match = machineStr.match(/(.*?)\s*\[biset:(.*?)\]$/);
  if (match) {
    return { name: match[1].trim(), bisetId: match[2] };
  }
  return { name: machineStr.trim(), bisetId: null };
};

/**
 * Formats a machine name and bi-set ID back into the machine string.
 * @param {string} name 
 * @param {string|null} bisetId 
 * @returns {string}
 */
export const formatMachine = (name, bisetId) => {
  const cleanName = name ? name.replace(/\s*\[biset:.*?\]$/, '').trim() : '';
  if (bisetId) {
    return `${cleanName} [biset:${bisetId}]`;
  }
  return cleanName;
};

/**
 * Returns a clean machine name without the bi-set suffix.
 * @param {string} machineStr 
 * @returns {string}
 */
export const getCleanMachineName = (machineStr) => {
  return parseMachine(machineStr).name;
};

/**
 * Groups a list of exercises into blocks of individual exercises and Bi-Sets.
 * Adjacent or related exercises sharing the same bi-set ID are grouped together.
 * @param {Array} exercises 
 * @returns {Array} List of grouped blocks
 */
export const groupExercises = (exercises) => {
  if (!exercises) return [];
  const groups = [];
  const bisetGroupsMap = {}; // Maps bisetId -> group object

  exercises.forEach((ex) => {
    if (ex.machine === 'Cardio') {
      groups.push({
        id: `cardio-${ex.id}`,
        isBiset: false,
        exercises: [{ ...ex, cleanMachine: 'Cardio' }]
      });
      return;
    }

    const { name: cleanMachine, bisetId } = parseMachine(ex.machine);
    const exClone = {
      ...ex,
      cleanMachine
    };

    if (bisetId) {
      if (bisetGroupsMap[bisetId]) {
        bisetGroupsMap[bisetId].exercises.push(exClone);
      } else {
        const newGroup = {
          id: `biset-${bisetId}`,
          isBiset: true,
          bisetId: bisetId,
          exercises: [exClone]
        };
        bisetGroupsMap[bisetId] = newGroup;
        groups.push(newGroup);
      }
    } else {
      groups.push({
        id: `single-${ex.id}`,
        isBiset: false,
        exercises: [exClone]
      });
    }
  });

  return groups;
};
