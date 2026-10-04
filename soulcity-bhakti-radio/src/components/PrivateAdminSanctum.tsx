import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Music,
  Youtube,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Radio,
  LogIn,
  LogOut,
  RefreshCw,
  Send,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase.ts';
import { Aarti, DeityId, AartiType, NavratriSettings } from '../types.ts';
import { DEITIES, EXPLORER_DEITIES } from '../data/deities.ts';
import {
  fetchSongSubmissionsFromFirestore,
  updateSongSubmissionStatusInFirestore,
  deleteSongSubmissionFromFirestore,
  addOfficialTrackToFirestore,
  deleteOfficialTrackFromFirestore,
  saveNavratriConfigToFirestore,
  SongSubmissionData,
} from '../lib/firestoreService.ts';

interface PrivateAdminSanctumProps {
  aartis: Aarti[];
  onRefreshAartis: () => void;
  navratriSettings: NavratriSettings;
  onSaveNavratriSettings: (settings: NavratriSettings) => void;
  indiaDay: string;
  onBackToRadio: () => void;
}

export const PrivateAdminSanctum: React.FC<PrivateAdminSanctumProps> = ({
  aartis,
  onRefreshAartis,
  navratriSettings,
  onSaveNavratriSettings,
  indiaDay,
  onBackToRadio,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'submissions'
    | 'add-track'
    | 'import-youtube'
    | 'ai-review'
    | 'official-library'
    | 'playlists'
    | 'navratri'
    | 'daily-config'
  >('overview');

  // Submissions State
  const [submissions, setSubmissions] = useState<SongSubmissionData[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Add track form state
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackHindiTitle, setNewTrackHindiTitle] = useState('');
  const [newTrackSourceType, setNewTrackSourceType] = useState<'direct' | 'youtube'>('youtube');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackDeityId, setNewTrackDeityId] = useState<DeityId>('shiva');
  const [newTrackCategory, setNewTrackCategory] = useState<AartiType>('Aarti');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('04:30');

  // YouTube Playlist Import State
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedItems, setImportedItems] = useState<any[]>([]);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Status/Toast Message
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Track Auth state & verify custom claim / admin email
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAdminAuthorized(false);
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      try {
        const tokenResult = await user.getIdTokenResult(true);
        const hasAdminClaim = tokenResult.claims.admin === true;
        const isVerifiedAdminEmail = user.email === 'prantikd54848@gmail.com';

        if (hasAdminClaim || isVerifiedAdminEmail) {
          setIsAdminAuthorized(true);
          loadSubmissions();
        } else {
          setIsAdminAuthorized(false);
        }
      } catch (e) {
        console.error('Error verifying admin authorization:', e);
        setIsAdminAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    });

    return () => unsub();
  }, []);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await fetchSongSubmissionsFromFirestore();
      setSubmissions(data);
    } catch (e) {
      console.error('Failed to load submissions:', e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('Authentication successful');
    } catch (e) {
      console.error(e);
      showToast('Authentication failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminAuthorized(false);
    showToast('Signed out');
  };

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Handle single track creation
  const handleAddTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !newTrackUrl.trim()) {
      showToast('Please provide track title and URL');
      return;
    }

    try {
      const isYt = newTrackSourceType === 'youtube' || newTrackUrl.includes('youtube.com') || newTrackUrl.includes('youtu.be');
      let ytId = '';
      if (isYt) {
        const match = newTrackUrl.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|https:\/\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
        if (match) ytId = match[1];
      }

      await addOfficialTrackToFirestore({
        title: newTrackTitle.trim(),
        hindiTitle: newTrackHindiTitle.trim() || undefined,
        deityId: newTrackDeityId,
        sourceType: isYt ? 'youtube' : 'direct',
        youtubeUrl: isYt ? newTrackUrl.trim() : undefined,
        youtubeVideoId: ytId || undefined,
        audioUrl: isYt ? undefined : newTrackUrl.trim(),
        thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : DEITIES[newTrackDeityId]?.image,
        type: newTrackCategory,
        duration: newTrackDuration,
        artist: newTrackArtist.trim() || undefined,
      });

      showToast(`Added official track "${newTrackTitle}"`);
      setNewTrackTitle('');
      setNewTrackHindiTitle('');
      setNewTrackUrl('');
      setNewTrackArtist('');
      onRefreshAartis();
    } catch (e) {
      console.error(e);
      showToast('Failed to add track');
    }
  };

  // Handle server-side YouTube playlist import
  const handleImportPlaylistServer = async () => {
    if (!playlistUrl.trim()) {
      showToast('Please enter a YouTube playlist URL');
      return;
    }

    setIsImporting(true);
    setImportStatusMessage('Authenticating server request & fetching YouTube metadata...');

    try {
      const token = currentUser ? await currentUser.getIdToken() : '';
      const response = await fetch('/api/admin/import-youtube-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server playlist import failed.');
      }

      const items = (data.videos || []).map((v: any) => ({
        ...v,
        selected: true,
        deity: v.suggestedDeity || 'shiva',
        type: v.suggestedType || 'Aarti',
      }));

      setImportedItems(items);
      setImportStatusMessage(`Fetched ${items.length} tracks with Gemini AI classification!`);
      setActiveTab('ai-review');
    } catch (e) {
      console.error(e);
      setImportStatusMessage(e instanceof Error ? e.message : 'Playlist import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  // Bulk approve imported AI items into Firestore
  const handleBulkApproveImported = async () => {
    const selected = importedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      showToast('No items selected for import');
      return;
    }

    try {
      for (const item of selected) {
        await addOfficialTrackToFirestore({
          title: item.cleanTitle || item.title,
          sourceType: 'youtube',
          youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          youtubeVideoId: item.videoId,
          thumbnailUrl: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
          deityId: item.deity || 'shiva',
          type: item.type || 'Aarti',
          duration: item.duration || '05:00',
          artist: item.channelTitle || 'YouTube Artist',
        });
      }

      showToast(`Bulk imported ${selected.length} approved tracks to Firestore!`);
      setImportedItems([]);
      onRefreshAartis();
      setActiveTab('official-library');
    } catch (e) {
      console.error(e);
      showToast('Bulk import failed');
    }
  };

  // Approve song suggestion
  const handleApproveSubmission = async (sub: SongSubmissionData) => {
    try {
      const isYt = sub.sourceType === 'youtube' || sub.url.includes('youtube.com') || sub.url.includes('youtu.be');
      let ytId = sub.youtubeVideoId || '';
      if (!ytId && isYt) {
        const match = sub.url.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|https:\/\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
        if (match) ytId = match[1];
      }

      await updateSongSubmissionStatusInFirestore(sub.id!, 'approved', 'Approved by admin', {
        title: sub.title,
        sourceType: isYt ? 'youtube' : 'direct',
        youtubeUrl: isYt ? sub.url : undefined,
        youtubeVideoId: ytId || undefined,
        audioUrl: isYt ? undefined : sub.url,
        thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : DEITIES[sub.deityId as DeityId]?.image,
        deityId: (sub.deityId as DeityId) || 'shiva',
        type: (sub.category as AartiType) || 'Aarti',
        artist: sub.artist || sub.submittedBy,
        duration: '04:30',
      });

      showToast(`Approved "${sub.title}" and published to official library!`);
      loadSubmissions();
      onRefreshAartis();
    } catch (e) {
      console.error(e);
      showToast('Failed to approve submission');
    }
  };

  // Reject song suggestion
  const handleRejectSubmission = async (id: string) => {
    try {
      await updateSongSubmissionStatusInFirestore(id, 'rejected', 'Rejected by admin');
      showToast('Submission rejected');
      loadSubmissions();
    } catch (e) {
      console.error(e);
      showToast('Failed to reject submission');
    }
  };

  // Delete official track
  const handleDeleteOfficialTrack = async (trackId: string, title: string) => {
    if (!confirm(`Delete "${title}" from official library?`)) return;
    try {
      await deleteOfficialTrackFromFirestore(trackId);
      showToast(`Deleted "${title}"`);
      onRefreshAartis();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete track');
    }
  };

  // 1. UNAUTHENTICATED VIEW
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0705] flex items-center justify-center p-4 text-stone-200">
        <div className="max-w-md w-full p-8 rounded-2xl border border-amber-900/40 bg-[#160e0a] text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif-temple text-gold-gradient">
              Administration Area
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Sign in with an authorized account to access administration controls.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>

          <button
            type="button"
            onClick={onBackToRadio}
            className="flex items-center justify-center gap-1.5 mx-auto text-xs text-stone-400 hover:text-amber-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to SoulCity Bhakti Radio</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED BUT NOT ADMIN CLAIM VIEW
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0a0705] flex items-center justify-center p-4 text-stone-200">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-stone-400 font-mono">Verifying authorization claims...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0705] flex items-center justify-center p-4 text-stone-200">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-900/50 bg-[#180a0b] text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950 border border-rose-600/40 text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif-temple text-rose-200">
              Access Restricted
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Your account <strong>{currentUser.email}</strong> does not have administrator authorization.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-700 cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onBackToRadio}
              className="flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to SoulCity Bhakti Radio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. FULL AUTHORIZED ADMIN SANCTUM DASHBOARD
  return (
    <div className="min-h-screen bg-[#0a0705] text-stone-200 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border-2 border-amber-600/60 bg-[#120a07] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToRadio}
              className="p-2 rounded-xl bg-stone-900 border border-amber-800/40 text-amber-300 hover:text-white cursor-pointer"
              title="Return to Public Radio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif-temple text-gold-gradient">
                  Admin Sanctum
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/50 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Authorized Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Official music library, AI classifications, user song suggestions &amp; festival configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-[#1f130b] border border-amber-800/40 px-3 py-1.5 rounded-xl">
              <span className="text-amber-300 font-semibold">{currentUser.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-stone-400 hover:text-white cursor-pointer ml-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notice */}
        {adminToast && (
          <div className="my-3 p-2.5 rounded-xl bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs text-center font-bold">
            {adminToast}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-3 border-b border-amber-950/60 no-scrollbar text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Radio },
            { id: 'submissions', label: `Pending Suggestions (${submissions.filter(s=>s.status==='pending').length})`, icon: Send },
            { id: 'add-track', label: 'Add Track', icon: Plus },
            { id: 'import-youtube', label: 'Import YouTube Playlist', icon: Youtube },
            { id: 'ai-review', label: `AI Review (${importedItems.length})`, icon: Sparkles },
            { id: 'official-library', label: `Official Library (${aartis.length})`, icon: Music },
            { id: 'navratri', label: 'Navratri Manager', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-[#1a100b] text-stone-300 hover:text-amber-200 border border-amber-900/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="py-6 min-h-[450px]">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-amber-800/40 bg-[#1b110b] shadow-md">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Official Library
                  </span>
                  <span className="text-3xl font-black text-amber-100 font-serif-temple">
                    {aartis.length}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-1">
                    Approved community tracks in Firestore
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-amber-800/40 bg-[#1b110b] shadow-md">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Song Suggestions
                  </span>
                  <span className="text-3xl font-black text-amber-100 font-serif-temple">
                    {submissions.filter((s) => s.status === 'pending').length}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-1">
                    Pending user submissions
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-amber-800/40 bg-[#1b110b] shadow-md">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    India Panchang Day
                  </span>
                  <span className="text-2xl font-black text-amber-200 font-serif-temple">
                    {indiaDay}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-1">
                    Live Indian Standard Time (IST)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-amber-800/40 bg-[#1b110b] shadow-md">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Navratri Status
                  </span>
                  <span className="text-2xl font-black text-amber-300 font-serif-temple">
                    {navratriSettings.enabled ? 'Active' : 'Standby'}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-1">
                    Shardiya Navratri 2026 Portal
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-amber-900/50 bg-[#18100b]">
                <h3 className="text-base font-bold text-amber-200 font-serif-temple mb-2">
                  Server-Side Security Status
                </h3>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>YOUTUBE_API_KEY &amp; GEMINI_API_KEY:</strong> Strictly kept server-side in Node environment. Never exposed to browser bundle.
                  </li>
                  <li>
                    <strong>Firestore Authorization Rules:</strong> Public users can read approved tracks and submit suggestions (`songSubmissions`). Only verified admin accounts can publish or delete official tracks.
                  </li>
                  <li>
                    <strong>Server API Verification:</strong> Server verifies Firebase auth bearer tokens before executing playlist imports or Gemini AI classifications.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PENDING SONG SUGGESTIONS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                  User Song Suggestions Awaiting Approval
                </h3>
                <button
                  type="button"
                  onClick={loadSubmissions}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-200 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {submissions.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-8 text-center">
                  No song suggestions pending review.
                </p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-amber-900/40 bg-[#18100b] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-100">{sub.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === 'pending'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                                : sub.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded">
                            {sub.category} · {DEITIES[sub.deityId as DeityId]?.name || sub.deityId}
                          </span>
                        </div>

                        <p className="text-xs text-amber-300/80 font-mono truncate max-w-lg">
                          {sub.url}
                        </p>

                        <p className="text-[11px] text-stone-400">
                          Submitted by: <strong>{sub.submittedBy}</strong>
                          {sub.note && <span> · Note: &ldquo;{sub.note}&rdquo;</span>}
                        </p>
                      </div>

                      {sub.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApproveSubmission(sub)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-stone-950 font-bold text-xs hover:bg-emerald-500 cursor-pointer shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectSubmission(sub.id!)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-900/80 text-rose-200 font-bold text-xs hover:bg-rose-800 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD SINGLE TRACK */}
          {activeTab === 'add-track' && (
            <form onSubmit={handleAddTrackSubmit} className="max-w-xl space-y-4 text-xs">
              <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                Add Track to Official Library
              </h3>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Track Title *</label>
                <input
                  type="text"
                  required
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  placeholder="e.g. Shri Shiv Tandav Stotram"
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Hindi Title (Optional)</label>
                <input
                  type="text"
                  value={newTrackHindiTitle}
                  onChange={(e) => setNewTrackHindiTitle(e.target.value)}
                  placeholder="e.g. शिव ताण्डव स्तोत्रम्"
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Source Type</label>
                  <select
                    value={newTrackSourceType}
                    onChange={(e) => setNewTrackSourceType(e.target.value as any)}
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                  >
                    <option value="youtube">YouTube Video</option>
                    <option value="direct">Direct MP3 URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Deity</label>
                  <select
                    value={newTrackDeityId}
                    onChange={(e) => setNewTrackDeityId(e.target.value as DeityId)}
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                  >
                    {EXPLORER_DEITIES.map((id) => (
                      <option key={id} value={id}>
                        {DEITIES[id]?.name || id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Media URL *</label>
                <input
                  type="url"
                  required
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or direct MP3"
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Category</label>
                  <select
                    value={newTrackCategory}
                    onChange={(e) => setNewTrackCategory(e.target.value as AartiType)}
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                  >
                    <option value="Aarti">Aarti</option>
                    <option value="Bhajan">Bhajan</option>
                    <option value="Mantra">Mantra</option>
                    <option value="Chalisa">Chalisa</option>
                    <option value="Stotram">Stotram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Artist / Singer</label>
                  <input
                    type="text"
                    value={newTrackArtist}
                    onChange={(e) => setNewTrackArtist(e.target.value)}
                    placeholder="e.g. Shankar Mahadevan"
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-400 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Publish Track to Official Firestore Library</span>
              </button>
            </form>
          )}

          {/* IMPORT YOUTUBE PLAYLIST */}
          {activeTab === 'import-youtube' && (
            <div className="max-w-2xl space-y-4 text-xs">
              <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                Server-Side YouTube Playlist Import with Gemini AI
              </h3>
              <p className="text-stone-400">
                The server securely fetches YouTube playlist items using <code>YOUTUBE_API_KEY</code> and uses Gemini AI to auto-classify track titles, deities, and categories.
              </p>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  YouTube Playlist URL or ID
                </label>
                <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PL..."
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {importStatusMessage && (
                <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-200 text-xs font-mono">
                  {importStatusMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleImportPlaylistServer}
                disabled={isImporting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold hover:from-red-500 hover:to-amber-500 cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isImporting ? 'Importing & Classifying...' : 'Fetch & AI Classify Playlist'}</span>
              </button>
            </div>
          )}

          {/* AI CLASSIFICATION REVIEW */}
          {activeTab === 'ai-review' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                    Gemini AI Classification Review
                  </h3>
                  <p className="text-stone-400">
                    Review and edit AI-suggested metadata before writing to official Firestore library.
                  </p>
                </div>

                {importedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkApproveImported}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-stone-950 font-bold hover:bg-emerald-400 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Bulk Write ({importedItems.filter(i=>i.selected).length}) Tracks</span>
                  </button>
                )}
              </div>

              {importedItems.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-8 text-center">
                  No imported playlist items ready for review. Import a YouTube playlist to begin.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {importedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-amber-900/40 bg-[#18100b] flex items-center gap-3 justify-between"
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => {
                          const next = [...importedItems];
                          next[idx].selected = e.target.checked;
                          setImportedItems(next);
                        }}
                        className="accent-amber-400 cursor-pointer"
                      />

                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={item.cleanTitle || item.title}
                          onChange={(e) => {
                            const next = [...importedItems];
                            next[idx].cleanTitle = e.target.value;
                            setImportedItems(next);
                          }}
                          className="w-full bg-stone-900 border border-amber-800/40 rounded px-2 py-1 text-xs text-stone-100 font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.deity}
                          onChange={(e) => {
                            const next = [...importedItems];
                            next[idx].deity = e.target.value;
                            setImportedItems(next);
                          }}
                          className="bg-stone-900 border border-amber-800/40 rounded px-2 py-1 text-xs text-amber-300"
                        >
                          {EXPLORER_DEITIES.map((id) => (
                            <option key={id} value={id}>
                              {DEITIES[id]?.name || id}
                            </option>
                          ))}
                        </select>

                        <select
                          value={item.type}
                          onChange={(e) => {
                            const next = [...importedItems];
                            next[idx].type = e.target.value;
                            setImportedItems(next);
                          }}
                          className="bg-stone-900 border border-amber-800/40 rounded px-2 py-1 text-xs text-amber-300"
                        >
                          <option value="Aarti">Aarti</option>
                          <option value="Bhajan">Bhajan</option>
                          <option value="Mantra">Mantra</option>
                          <option value="Chalisa">Chalisa</option>
                          <option value="Stotram">Stotram</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OFFICIAL MUSIC LIBRARY */}
          {activeTab === 'official-library' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                  Official Firestore Music Repository ({aartis.length})
                </h3>
                <button
                  type="button"
                  onClick={onRefreshAartis}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-200 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Tracks
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {aartis.map((track) => (
                  <div
                    key={track.id}
                    className="p-3 rounded-xl border border-amber-900/40 bg-[#18100b] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100 truncate">{track.title}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[10px] shrink-0">
                          {track.type || 'Aarti'} · {DEITIES[track.deityId]?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 truncate">
                        {track.sourceType === 'youtube' ? track.youtubeUrl : track.audioUrl}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteOfficialTrack(track.id, track.title)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded cursor-pointer shrink-0"
                      title="Delete from official library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAVRATRI MANAGER */}
          {activeTab === 'navratri' && (
            <div className="space-y-4 text-xs max-w-xl">
              <h3 className="text-base font-bold text-amber-200 font-serif-temple">
                Shardiya Navratri Calendar &amp; Dynamic Theme Settings
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b110b] border border-amber-800/40">
                <span className="font-bold text-amber-300">Enable Navratri Mode</span>
                <input
                  type="checkbox"
                  checked={navratriSettings.enabled}
                  onChange={(e) => {
                    const updated = { ...navratriSettings, enabled: e.target.checked };
                    onSaveNavratriSettings(updated);
                    saveNavratriConfigToFirestore(updated);
                    showToast(`Navratri mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="w-5 h-5 accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Start Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={navratriSettings.startDate}
                    onChange={(e) => {
                      const updated = { ...navratriSettings, startDate: e.target.value };
                      onSaveNavratriSettings(updated);
                      saveNavratriConfigToFirestore(updated);
                    }}
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">End Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={navratriSettings.endDate}
                    onChange={(e) => {
                      const updated = { ...navratriSettings, endDate: e.target.value };
                      onSaveNavratriSettings(updated);
                      saveNavratriConfigToFirestore(updated);
                    }}
                    className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  Preview Day Override (0 = Live Auto IST Date)
                </label>
                <select
                  value={navratriSettings.manualOverrideDay || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const updated = { ...navratriSettings, manualOverrideDay: val > 0 ? val : null };
                    onSaveNavratriSettings(updated);
                    saveNavratriConfigToFirestore(updated);
                    showToast(val > 0 ? `Previewing Navratri Day ${val}` : 'Set to Auto IST');
                  }}
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100"
                >
                  <option value={0}>Auto (IST Date based)</option>
                  {navratriSettings.days.map((d) => (
                    <option key={d.dayNumber} value={d.dayNumber}>
                      {d.dayLabel}: {d.deviForm} ({d.dateString})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
