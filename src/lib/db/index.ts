import Dexie, { Table } from 'dexie';
import { AlbumProject, PhotoMetadata } from '@/types/album';
import { MosaicProject } from '@/types/mosaic';

export interface StoredPhotoBlob {
  id: string; // matches PhotoMetadata.id
  blob: Blob;
}

export interface StoredTemplate {
  id: string;
  name: string;
  category: string;
  data: string; // JSON string
  createdAt: number;
}

export interface StoredSetting {
  key: string;
  value: any;
}

export class AlbumDatabase extends Dexie {
  projects!: Table<AlbumProject | MosaicProject | any, string>;
  photos!: Table<PhotoMetadata, string>;
  photoBlobs!: Table<StoredPhotoBlob, string>;
  customTemplates!: Table<StoredTemplate, string>;
  settings!: Table<StoredSetting, string>;

  constructor() {
    super('AuraAlbumStudioDB');
    this.version(1).stores({
      projects: 'id, name, category, style, createdAt, updatedAt',
      photos: 'id, projectId, hash, favorite, isDuplicateCandidate, isBlurry, orientation',
      photoBlobs: 'id',
      customTemplates: 'id, category, createdAt',
      settings: 'key',
    });
  }
}

export const db = new AlbumDatabase();

// Project management functions
export async function getAllProjects(): Promise<AlbumProject[]> {
  try {
    return await db.projects.orderBy('updatedAt').reverse().toArray();
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<any | undefined> {
  try {
    return await db.projects.get(id);
  } catch (error) {
    console.error(`Failed to get project ${id}:`, error);
    return undefined;
  }
}

export async function saveProject(project: AlbumProject | MosaicProject | any): Promise<void> {
  try {
    const updated = {
      ...project,
      updatedAt: Date.now(),
    };
    await db.projects.put(updated);
  } catch (error) {
    console.error('Failed to save project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    // Delete project, its photos, and its photo blobs
    const photos = await db.photos.where('projectId').equals(id).toArray();
    const photoIds = photos.map((p) => p.id);

    await db.transaction('rw', db.projects, db.photos, db.photoBlobs, async () => {
      await db.projects.delete(id);
      await db.photos.where('projectId').equals(id).delete();
      if (photoIds.length > 0) {
        await db.photoBlobs.bulkDelete(photoIds);
      }
    });
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    throw error;
  }
}

export async function duplicateProject(id: string): Promise<AlbumProject> {
  const original = await getProjectById(id);
  if (!original) {
    throw new Error('Original project not found');
  }

  const newId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const duplicate: AlbumProject = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Also duplicate photo metadata references
  const originalPhotos = await getPhotosByProjectId(id);
  const newPhotos: PhotoMetadata[] = [];
  const newBlobs: StoredPhotoBlob[] = [];

  for (const photo of originalPhotos) {
    const newPhotoId = `photo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    newPhotos.push({
      ...photo,
      id: newPhotoId,
      projectId: newId,
    });

    const blobEntry = await db.photoBlobs.get(photo.id);
    if (blobEntry) {
      newBlobs.push({
        id: newPhotoId,
        blob: blobEntry.blob,
      });
    }
  }

  await db.transaction('rw', db.projects, db.photos, db.photoBlobs, async () => {
    await db.projects.add(duplicate);
    if (newPhotos.length > 0) {
      await db.photos.bulkAdd(newPhotos);
    }
    if (newBlobs.length > 0) {
      await db.photoBlobs.bulkAdd(newBlobs);
    }
  });

  return duplicate;
}

// Photo management functions
export async function getPhotosByProjectId(projectId: string): Promise<PhotoMetadata[]> {
  try {
    return await db.photos.where('projectId').equals(projectId).toArray();
  } catch (error) {
    console.error(`Failed to get photos for project ${projectId}:`, error);
    return [];
  }
}

export async function savePhotosBatch(
  photos: PhotoMetadata[],
  blobsMap?: Map<string, Blob>
): Promise<void> {
  try {
    await db.transaction('rw', db.photos, db.photoBlobs, async () => {
      await db.photos.bulkPut(photos);
      if (blobsMap && blobsMap.size > 0) {
        const blobEntries: StoredPhotoBlob[] = [];
        blobsMap.forEach((blob, id) => {
          blobEntries.push({ id, blob });
        });
        await db.photoBlobs.bulkPut(blobEntries);
      }
    });
  } catch (error) {
    console.error('Failed to save photos batch:', error);
    throw error;
  }
}

export async function updatePhotoMetadata(
  photoId: string,
  updates: Partial<PhotoMetadata>
): Promise<void> {
  try {
    await db.photos.update(photoId, updates);
  } catch (error) {
    console.error(`Failed to update photo ${photoId}:`, error);
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  try {
    await db.transaction('rw', db.photos, db.photoBlobs, async () => {
      await db.photos.delete(photoId);
      await db.photoBlobs.delete(photoId);
    });
  } catch (error) {
    console.error(`Failed to delete photo ${photoId}:`, error);
  }
}

export async function clearProjectPhotos(projectId: string): Promise<void> {
  try {
    const photos = await db.photos.where('projectId').equals(projectId).toArray();
    const photoIds = photos.map((p) => p.id);
    await db.transaction('rw', db.photos, db.photoBlobs, async () => {
      await db.photos.where('projectId').equals(projectId).delete();
      if (photoIds.length > 0) {
        await db.photoBlobs.bulkDelete(photoIds);
      }
    });
  } catch (error) {
    console.error(`Failed to clear photos for project ${projectId}:`, error);
  }
}

export async function getPhotoBlob(photoId: string): Promise<Blob | undefined> {
  try {
    const item = await db.photoBlobs.get(photoId);
    return item?.blob;
  } catch (error) {
    console.error(`Failed to get photo blob for ${photoId}:`, error);
    return undefined;
  }
}

export async function getPhotoUrl(photoId: string): Promise<string> {
  // First check if we can get full blob URL, else fallback to thumbnail
  const blob = await getPhotoBlob(photoId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  const photo = await db.photos.get(photoId);
  return photo?.thumbnail || '';
}

// Project Import/Export Package (.aura bundle)
export async function exportProjectBundle(projectId: string): Promise<Blob> {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  const photos = await getPhotosByProjectId(projectId);
  const bundle = {
    version: '1.0',
    auraProject: project,
    photos: photos.map((p) => ({
      ...p,
      // preserve thumbnail base64
    })),
    exportedAt: Date.now(),
  };

  const jsonString = JSON.stringify(bundle);
  return new Blob([jsonString], { type: 'application/json' });
}

export async function importProjectBundle(jsonString: string): Promise<AlbumProject> {
  const data = JSON.parse(jsonString);
  if (!data.auraProject || !data.auraProject.id) {
    throw new Error('Invalid Aura Project bundle');
  }

  const originalProject = data.auraProject as AlbumProject;
  const newId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  
  const importedProject: AlbumProject = {
    ...originalProject,
    id: newId,
    name: `${originalProject.name} (Imported)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const photos = (data.photos || []).map((p: PhotoMetadata) => ({
    ...p,
    projectId: newId,
  }));

  await db.transaction('rw', db.projects, db.photos, async () => {
    await db.projects.add(importedProject);
    if (photos.length > 0) {
      await db.photos.bulkAdd(photos);
    }
  });

  return importedProject;
}
