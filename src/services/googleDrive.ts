import { StoryboardProject } from '../types';
import { sanitizeStoryboardForJSON } from '../utils/helpers';

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
}

const DEFAULT_FOLDER_NAME = 'UGC Storyboard Hub';

/**
 * Find or create a dedicated folder in user's Google Drive
 */
export async function getOrCreateUGCFolder(
  accessToken: string,
  folderName: string = DEFAULT_FOLDER_NAME
): Promise<string> {
  // 1. Search for existing folder
  const query = encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  try {
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
  } catch (err) {
    console.warn('Could not query existing Google Drive folder, proceeding to root:', err);
  }

  // 2. Create folder if not found
  try {
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder otomatis untuk menyimpan video & storyboard UGC Master',
      }),
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      return folder.id;
    }
  } catch (err) {
    console.warn('Failed to create folder, will upload to Drive root:', err);
  }

  return 'root';
}

/**
 * Upload Video Blob (MP4/WebM) to Google Drive using standard multipart upload
 */
export async function uploadVideoToDrive({
  videoBlob,
  filename,
  accessToken,
  onProgress,
}: {
  videoBlob: Blob;
  filename: string;
  accessToken: string;
  onProgress?: (pct: number, status: string) => void;
}): Promise<DriveUploadResult> {
  if (onProgress) onProgress(10, 'Menyiapkan folder Google Drive...');

  const folderId = await getOrCreateUGCFolder(accessToken);

  if (onProgress) onProgress(30, 'Mengunggah video ke Google Drive...');

  const metadata = {
    name: filename,
    parents: folderId && folderId !== 'root' ? [folderId] : undefined,
    description: 'Video UGC Storyboard yang dirender dari UGC Master Creator Studio',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const videoArrayBuffer = await videoBlob.arrayBuffer();

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaPartHeader = `${delimiter}Content-Type: ${videoBlob.type || 'video/mp4'}\r\n\r\n`;

  const enc = new TextEncoder();
  const metaBytes = enc.encode(metadataPart);
  const mediaHeaderBytes = enc.encode(mediaPartHeader);
  const closeBytes = enc.encode(closeDelimiter);

  // Combine into single Uint8Array
  const combinedLength =
    metaBytes.byteLength +
    mediaHeaderBytes.byteLength +
    videoArrayBuffer.byteLength +
    closeBytes.byteLength;
  const combined = new Uint8Array(combinedLength);

  let offset = 0;
  combined.set(metaBytes, offset);
  offset += metaBytes.byteLength;
  combined.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.byteLength;
  combined.set(new Uint8Array(videoArrayBuffer), offset);
  offset += videoArrayBuffer.byteLength;
  combined.set(closeBytes, offset);

  if (onProgress) onProgress(70, 'Memproses file di Google Drive...');

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': combined.byteLength.toString(),
    },
    body: combined,
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(
      errJson?.error?.message || `Gagal mengunggah ke Google Drive (Status ${res.status})`
    );
  }

  const result = await res.json();
  if (onProgress) onProgress(100, 'Video berhasil disimpan di Google Drive! 🎉');

  return {
    fileId: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    webContentLink: result.webContentLink,
    size: result.size,
  };
}

/**
 * Upload Storyboard JSON project / script to Google Drive
 */
export async function uploadProjectToDrive({
  project,
  accessToken,
  onProgress,
}: {
  project: StoryboardProject;
  accessToken: string;
  onProgress?: (pct: number, status: string) => void;
}): Promise<DriveUploadResult> {
  if (onProgress) onProgress(15, 'Menghubungkan ke Google Drive...');

  const folderId = await getOrCreateUGCFolder(accessToken);

  if (onProgress) onProgress(45, 'Menyimpan naskah storyboard...');

  const safeTitle = (project.title || 'Storyboard_UGC').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `${safeTitle}_project.json`;

  const projectJsonString = JSON.stringify(sanitizeStoryboardForJSON(project), null, 2);
  const blob = new Blob([projectJsonString], { type: 'application/json' });

  const metadata = {
    name: filename,
    parents: folderId && folderId !== 'root' ? [folderId] : undefined,
    description: `Naskah & Metadata Storyboard UGC: ${project.title}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaPartHeader = `${delimiter}Content-Type: application/json\r\n\r\n`;

  const enc = new TextEncoder();
  const metaBytes = enc.encode(metadataPart);
  const mediaHeaderBytes = enc.encode(mediaPartHeader);
  const jsonBytes = enc.encode(projectJsonString);
  const closeBytes = enc.encode(closeDelimiter);

  const combined = new Uint8Array(
    metaBytes.byteLength + mediaHeaderBytes.byteLength + jsonBytes.byteLength + closeBytes.byteLength
  );

  let offset = 0;
  combined.set(metaBytes, offset);
  offset += metaBytes.byteLength;
  combined.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.byteLength;
  combined.set(jsonBytes, offset);
  offset += jsonBytes.byteLength;
  combined.set(closeBytes, offset);

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: combined,
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(
      errJson?.error?.message || `Gagal menyimpan project ke Google Drive (Status ${res.status})`
    );
  }

  const result = await res.json();
  if (onProgress) onProgress(100, 'Naskah berhasil disimpan di Google Drive! 🎉');

  return {
    fileId: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}
