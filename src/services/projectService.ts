import { db } from './firebase';
import { 
  doc, setDoc, getDocs, collection, 
  query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import type { ProjectIdentity } from '../types/core';
import { 
  EVERINE_PROJECT_IDENTITY, 
  EVERINE_WORKERS, 
  EVERINE_SUBCONTRACTORS, 
  EVERINE_PTW_LIST, 
  EVERINE_INSPECTIONS, 
  EVERINE_RAIN_GAUGE, 
  EVERINE_CHEMICALS, 
  EVERINE_FOGGING_RECORDS, 
  EVERINE_MANPOWER_HISTORY 
} from '../data/everineSeedData';

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

    // Default to Everine live project with 204 workers & full site dataset
    const autoEverine = await this.initializeWithEverineData();
    return { project: autoEverine, source: 'local' };
  }

  /**
   * One-click seed function to load all 204 Everine workers, PTWs,
   * inspections, rain gauge and daily manpower records into HSE OS.
   */
  static async initializeWithEverineData(): Promise<ProjectIdentity> {
    const project = EVERINE_PROJECT_IDENTITY;
    await this.saveProject(project);

    // Seed local cache for instant zero-latency view
    localStorage.setItem('hse_os_site_workers_directory', JSON.stringify(EVERINE_WORKERS));
    localStorage.setItem('hse_os_subcontractors_list', JSON.stringify(EVERINE_SUBCONTRACTORS));
    localStorage.setItem('hse_os_ptw_list', JSON.stringify(EVERINE_PTW_LIST));
    localStorage.setItem('hse_os_inspections_list', JSON.stringify(EVERINE_INSPECTIONS));
    localStorage.setItem('hse_os_doe_rain_gauge', JSON.stringify(EVERINE_RAIN_GAUGE));
    localStorage.setItem('hse_os_doe_chemical_register', JSON.stringify(EVERINE_CHEMICALS));
    localStorage.setItem('hse_os_doe_vector_control', JSON.stringify(EVERINE_FOGGING_RECORDS));
    localStorage.setItem('hse_os_health_fogging_list', JSON.stringify(EVERINE_FOGGING_RECORDS));
    localStorage.setItem('hse_os_daily_manpower_history', JSON.stringify(EVERINE_MANPOWER_HISTORY));

    // Also persist collections into Firestore in background
    try {
      await Promise.all([
        this.saveData('site_workers_directory', EVERINE_WORKERS, project.id),
        this.saveData('subcontractors_list', EVERINE_SUBCONTRACTORS, project.id),
        this.saveData('ptw_list', EVERINE_PTW_LIST, project.id),
        this.saveData('inspections_list', EVERINE_INSPECTIONS, project.id),
        this.saveData('doe_rain_gauge', EVERINE_RAIN_GAUGE, project.id),
        this.saveData('doe_chemical_register', EVERINE_CHEMICALS, project.id),
        this.saveData('doe_vector_control', EVERINE_FOGGING_RECORDS, project.id),
        this.saveData('health_fogging_list', EVERINE_FOGGING_RECORDS, project.id),
        this.saveData('daily_manpower_history', EVERINE_MANPOWER_HISTORY, project.id),
      ]);
    } catch (e) {
      console.warn('[ProjectService] Background Firestore sync for Everine:', e);
    }

    return project;
  }

  /**
   * Clear local active project
   */
  static clearLocalProject(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  /**
   * Helper to load and save generic data collections (PTW, Inspections, Subcons, etc.)
   */
  static loadData<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`hse_os_${key}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(`[ProjectService] Failed to load data for ${key}:`, e);
    }

    // Auto-fallback to live Everine datasets if key matches and no user override exists
    if (key === 'site_workers_directory') return (EVERINE_WORKERS as unknown) as T;
    if (key === 'subcontractors_list') return (EVERINE_SUBCONTRACTORS as unknown) as T;
    if (key === 'ptw_list') return (EVERINE_PTW_LIST as unknown) as T;
    if (key === 'inspections_list') return (EVERINE_INSPECTIONS as unknown) as T;
    if (key === 'doe_rain_gauge') return (EVERINE_RAIN_GAUGE as unknown) as T;
    if (key === 'doe_chemical_register') return (EVERINE_CHEMICALS as unknown) as T;
    if (key === 'doe_vector_control' || key === 'health_fogging_list') return (EVERINE_FOGGING_RECORDS as unknown) as T;
    if (key === 'daily_manpower_history') return (EVERINE_MANPOWER_HISTORY as unknown) as T;

    return defaultValue;
  }

  static async saveData<T>(key: string, data: T, projectId?: string): Promise<void> {
    try {
      localStorage.setItem(`hse_os_${key}`, JSON.stringify(data));
      
      // Also sync to Firestore project subdocument if projectId exists
      if (projectId) {
        const docRef = doc(db, COLLECTION_PROJECTS, projectId, 'operational_data', key);
        await setDoc(docRef, { data, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn(`[ProjectService] Saved locally, remote sync error for ${key}:`, e);
    }
  }
}

