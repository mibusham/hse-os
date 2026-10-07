import { db } from './firebase';
import { 
  doc, setDoc, getDocs, collection, 
  query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import type { ProjectIdentity } from '../types/core';

const LOCAL_STORAGE_KEY = 'hse_os_active_project';
const COLLECTION_PROJECTS = 'hse_os_projects';

export interface ProjectSaveResult {
  success: boolean;
  source: 'google_cloud' | 'local';
  error?: string;
}

export class ProjectService {
  /**
   * Save or update project directly in Google Cloud Firestore,
   * with resilient automatic fallback to localStorage.
   */
  static async saveProject(project: ProjectIdentity): Promise<ProjectSaveResult> {
    // 1. Always save to local storage immediately for zero-delay offline experience
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('[ProjectService] Failed to cache to localStorage', e);
    }

    // 2. Persist directly into Google Cloud Firestore
    try {
      const projectRef = doc(db, COLLECTION_PROJECTS, project.id);
      
      const payload = {
        id: project.id,
        projectName: project.projectName,
        projectCode: project.projectCode,
        location: project.location,
        projectScope: project.projectScope,
        clientName: project.clientName,
        mainConName: project.mainConName,
        contractValue: project.contractValue,
        startDate: project.startDate,
        targetCompletionDate: project.targetCompletionDate,
        estimatedPersonDays: project.estimatedPersonDays,
        hasDeepExcavation: project.hasDeepExcavation,
        basementLevels: project.basementLevels,
        towerStoreys: project.towerStoreys,
        isReg8Notifiable: project.isReg8Notifiable,
        raw_data: project,
        updatedAt: serverTimestamp()
      };

      await setDoc(projectRef, payload, { merge: true });
      console.log('[ProjectService] Successfully saved project to Google Cloud Firestore:', project.id);
      return { success: true, source: 'google_cloud' };
    } catch (err: any) {
      console.warn('[ProjectService] Firestore write error, retained safely in local cache:', err);
      return { success: true, source: 'local', error: err?.message || 'Firestore write error' };
    }
  }

  /**
   * Load active project from Google Cloud Firestore,
   * falling back to localStorage if offline.
   */
  static async loadActiveProject(): Promise<{ project: ProjectIdentity | null; source: 'google_cloud' | 'local' | 'none' }> {
    try {
      const q = query(
        collection(db, COLLECTION_PROJECTS),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        const project: ProjectIdentity = data.raw_data || {
          id: data.id || docSnap.id,
          projectName: data.projectName,
          projectCode: data.projectCode,
          location: data.location,
          projectScope: data.projectScope,
          clientName: data.clientName,
          mainConName: data.mainConName,
          contractValue: Number(data.contractValue) || 0,
          startDate: data.startDate,
          targetCompletionDate: data.targetCompletionDate,
          estimatedPersonDays: Number(data.estimatedPersonDays) || 0,
          hasDeepExcavation: Boolean(data.hasDeepExcavation),
          basementLevels: Number(data.basementLevels) || 0,
          towerStoreys: Number(data.towerStoreys) || 1,
          isReg8Notifiable: Boolean(data.isReg8Notifiable),
        };

        // Sync fresh copy into local cache
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
        return { project, source: 'google_cloud' };
      }
    } catch (e) {
      console.warn('[ProjectService] Firestore fetch failed, checking localStorage fallback:', e);
    }

    // Fallback: check localStorage
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { project: JSON.parse(cached), source: 'local' };
      }
    } catch (e) {
      console.error('[ProjectService] Failed to read localStorage', e);
    }

    return { project: null, source: 'none' };
  }

  /**
   * Clear local active project
   */
  static clearLocalProject(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
