// The guided tutorial runs once for a new player. Completion is remembered
// separately from the statistics save, and a storage failure simply means the
// tutorial is not offered again.

const KEY = 'toh-tutorial-v1';

export function isTutorialDone() {
  try {
    return window.localStorage.getItem(KEY) === 'done';
  } catch (error) {
    return true;
  }
}

export function markTutorialDone() {
  try {
    window.localStorage.setItem(KEY, 'done');
    return true;
  } catch (error) {
    return false;
  }
}