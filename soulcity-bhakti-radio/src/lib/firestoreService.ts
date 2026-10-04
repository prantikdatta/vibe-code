import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { Aarti, NavratriSettings } from '../types.ts';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SongSubmissionData {
  id?: string;
  title: string;
  sourceType: 'direct' | 'youtube';
  url: string;
  youtubeVideoId?: string;
  audioUrl?: string;
  deityId: string;
  category: string;
  artist?: string;
  note?: string;
  submittedBy: string;
  submittedByUid?: string;
  submittedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

// 1. Fetch official approved tracks from Firestore
export async function fetchApprovedTracksFromFirestore(): Promise<Aarti[]> {
  const path = 'tracks';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const tracks: Aarti[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.approved !== false) {
        tracks.push({
          id: docSnap.id,
          title: data.title || 'Untitled Track',
          hindiTitle: data.hindiTitle,
          deityId: data.deityId || 'shiva',
          sourceType: data.sourceType || (data.youtubeVideoId ? 'youtube' : 'direct'),
          audioUrl: data.audioUrl || data.youtubeUrl || '',
          youtubeUrl: data.youtubeUrl,
          youtubeVideoId: data.youtubeVideoId,
          thumbnailUrl: data.thumbnailUrl,
          type: data.type || 'Aarti',
          duration: data.duration || '04:30',
          artist: data.artist,
          recommendedDays: data.recommendedDays || [],
          festivalTags: data.festivalTags || [],
          navratriDay: data.navratriDay,
          deviForm: data.deviForm,
          isCustom: false,
        });
      }
    });
    return tracks;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

// 2. Add an official track (Admin)
export async function addOfficialTrackToFirestore(track: Partial<Aarti>): Promise<string> {
  const path = 'tracks';
  try {
    const newDocRef = doc(collection(db, path));
    const payload = {
      title: track.title,
      hindiTitle: track.hindiTitle || null,
      deityId: track.deityId,
      sourceType: track.sourceType || 'direct',
      audioUrl: track.audioUrl || null,
      youtubeUrl: track.youtubeUrl || null,
      youtubeVideoId: track.youtubeVideoId || null,
      thumbnailUrl: track.thumbnailUrl || null,
      type: track.type || 'Aarti',
      duration: track.duration || '04:30',
      artist: track.artist || null,
      recommendedDays: track.recommendedDays || [],
      festivalTags: track.festivalTags || [],
      navratriDay: track.navratriDay || null,
      deviForm: track.deviForm || null,
      approved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: auth.currentUser?.email || 'admin',
    };
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// 3. Update an official track (Admin)
export async function updateOfficialTrackInFirestore(trackId: string, updates: Partial<Aarti>): Promise<void> {
  const path = `tracks/${trackId}`;
  try {
    const docRef = doc(db, 'tracks', trackId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 4. Delete an official track (Admin)
export async function deleteOfficialTrackFromFirestore(trackId: string): Promise<void> {
  const path = `tracks/${trackId}`;
  try {
    await deleteDoc(doc(db, 'tracks', trackId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 5. Submit a public song suggestion (Public)
export async function submitSongSuggestionToFirestore(submission: {
  title: string;
  sourceType: 'direct' | 'youtube';
  url: string;
  deityId: string;
  category: string;
  artist?: string;
  note?: string;
}): Promise<string> {
  const path = 'songSubmissions';
  try {
    const isYt = submission.sourceType === 'youtube' || submission.url.includes('youtube.com') || submission.url.includes('youtu.be');
    let ytId = '';
    if (isYt) {
      const match = submission.url.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|https:\/\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (match) ytId = match[1];
    }

    const payload: SongSubmissionData = {
      title: submission.title,
      sourceType: isYt ? 'youtube' : 'direct',
      url: submission.url,
      youtubeVideoId: ytId || undefined,
      audioUrl: isYt ? undefined : submission.url,
      deityId: submission.deityId,
      category: submission.category,
      artist: submission.artist || 'User Suggestion',
      note: submission.note || '',
      submittedBy: auth.currentUser?.email || 'Anonymous Devotee',
      submittedByUid: auth.currentUser?.uid || 'anonymous',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// 6. Fetch pending song suggestions (Admin)
export async function fetchSongSubmissionsFromFirestore(): Promise<SongSubmissionData[]> {
  const path = 'songSubmissions';
  if (!auth.currentUser) {
    console.warn('fetchSongSubmissionsFromFirestore: User is not authenticated as admin.');
    return [];
  }
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: SongSubmissionData[] = [];
    snapshot.forEach((d) => {
      list.push({
        id: d.id,
        ...(d.data() as Omit<SongSubmissionData, 'id'>),
      });
    });
    return list;
  } catch (err) {
    console.warn('fetchSongSubmissionsFromFirestore: Read restricted to admin accounts.');
    return [];
  }
}

// 7. Update submission status (Approve or Reject) (Admin)
export async function updateSongSubmissionStatusInFirestore(
  submissionId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
  approvedTrackData?: Partial<Aarti>
): Promise<void> {
  const path = `songSubmissions/${submissionId}`;
  try {
    const subRef = doc(db, 'songSubmissions', submissionId);
    await updateDoc(subRef, {
      status,
      adminNotes: adminNotes || '',
    });

    if (status === 'approved' && approvedTrackData) {
      await addOfficialTrackToFirestore(approvedTrackData);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 8. Delete a submission (Admin)
export async function deleteSongSubmissionFromFirestore(submissionId: string): Promise<void> {
  const path = `songSubmissions/${submissionId}`;
  try {
    await deleteDoc(doc(db, 'songSubmissions', submissionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 9. Navratri Settings Firestore persistence
export async function fetchNavratriConfigFromFirestore(): Promise<NavratriSettings | null> {
  const path = 'navratriSettings/config';
  try {
    const docSnap = await getDoc(doc(db, 'navratriSettings', 'config'));
    if (docSnap.exists()) {
      return docSnap.data() as NavratriSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveNavratriConfigToFirestore(settings: NavratriSettings): Promise<void> {
  const path = 'navratriSettings/config';
  try {
    await setDoc(doc(db, 'navratriSettings', 'config'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
