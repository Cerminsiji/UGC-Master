import { StoryboardProject } from '../types';

export const STORAGE_KEY = 'ugc_master_projects_v1';
export const CURRENT_PROJECT_ID_KEY = 'ugc_master_current_proj_id';

const DB_NAME = 'ugc_master_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects_store';
const KEY_FULL_PROJECTS = 'all_projects';

/**
 * Strips heavy base64 data URLs from projects to guarantee
 * localStorage never exceeds the 5MB browser quota.
 */
export function stripBase64Images(projects: StoryboardProject[]): StoryboardProject[] {
  return projects.map((proj) => {
    const isProductImageBase64 = proj.productImageUrl && proj.productImageUrl.startsWith('data:');
    return {
      ...proj,
      productImageUrl: isProductImageBase64 ? undefined : proj.productImageUrl,
      scenes: proj.scenes.map((scene) => {
        const isSceneImageBase64 = scene.imageUrl && scene.imageUrl.startsWith('data:');
        return {
          ...scene,
          imageUrl: isSceneImageBase64 ? undefined : scene.imageUrl,
        };
      }),
    };
  });
}

/**
 * Resilient localStorage saver with multi-level fallback:
 * 1. Strips base64 image strings.
 * 2. If quota is still tight, keeps the most recent 5 projects.
 * 3. Never throws unhandled QuotaExceededError.
 */
export function saveProjectsToLocalStorage(projects: StoryboardProject[], currentId?: string): boolean {
  if (!projects || projects.length === 0) return false;

  // Level 1: Strip base64 images
  const sanitized = stripBase64Images(projects);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    if (currentId) {
      localStorage.setItem(CURRENT_PROJECT_ID_KEY, currentId);
    }
    return true;
  } catch (err: any) {
    console.warn('LocalStorage quota warning, applying compacting strategy:', err?.message || err);

    // Level 2: Compact to recent projects (active project + up to 5 latest)
    try {
      const activeProj = sanitized.find((p) => p.id === currentId);
      const otherRecent = sanitized.filter((p) => p.id !== currentId).slice(0, 5);
      const compacted = activeProj ? [activeProj, ...otherRecent] : sanitized.slice(0, 5);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(compacted));
      if (currentId) {
        localStorage.setItem(CURRENT_PROJECT_ID_KEY, currentId);
      }
      return true;
    } catch (compactErr) {
      console.warn('LocalStorage severely full, attempting single active project save:', compactErr);

      // Level 3: Keep only the single current project
      try {
        const single = sanitized.find((p) => p.id === currentId) || sanitized[0];
        if (single) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([single]));
          return true;
        }
      } catch (lastErr) {
        console.error('LocalStorage unavailable or permanently full:', lastErr);
      }
    }
  }
  return false;
}

/**
 * Open or initialize IndexedDB instance
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Asynchronously save full projects (including images) to IndexedDB (virtually unlimited quota)
 */
export async function saveProjectsToIndexedDB(projects: StoryboardProject[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(projects, KEY_FULL_PROJECTS);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch {
    // IndexedDB failure is non-fatal (e.g. strict private mode), localStorage fallback will protect text data
  }
}

/**
 * Asynchronously load full projects from IndexedDB
 */
export async function loadProjectsFromIndexedDB(): Promise<StoryboardProject[] | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(KEY_FULL_PROJECTS);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}
