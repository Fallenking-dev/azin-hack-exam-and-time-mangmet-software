// USICT Cloud Sync & MongoDB Persistence Client Helper

export interface DatabaseStatus {
  isMongoConnected: boolean;
  mode: string;
  uriConfigured: boolean;
  host: string;
  database: string;
  counts: {
    schedules: number | string;
    faculty: number | string;
    rooms: number | string;
    exams: number | string;
  };
  lastSyncedAt?: string;
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch (err: any) {
    return {
      isMongoConnected: false,
      mode: 'Local Client-Side Storage',
      uriConfigured: false,
      host: 'local-browser-cache',
      database: 'usict_campus_scheduler',
      counts: {
        schedules: 0,
        faculty: 0,
        rooms: 0,
        exams: 0,
      },
    };
  }
}

export async function connectCustomMongoUri(uri: string): Promise<{ success: boolean; message: string; host?: string }> {
  try {
    const res = await fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error while attempting to connect to MongoDB cluster.',
    };
  }
}

export async function pushFullCampusCloudSync(payload: {
  schedule?: any[];
  subjects?: any[];
  facultyList?: any[];
  rooms?: any[];
  exams?: any[];
  notifications?: any[];
}): Promise<{ success: boolean; mode?: string; stats?: any; error?: string }> {
  try {
    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Sync HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to sync to MongoDB cloud backend.',
    };
  }
}

export async function pullCampusCloudSync(): Promise<{
  schedule?: any[];
  subjects?: any[];
  facultyList?: any[];
  rooms?: any[];
  exams?: any[];
  notifications?: any[];
  databaseStatus?: DatabaseStatus;
  error?: string;
}> {
  try {
    const res = await fetch('/api/db/sync');
    if (!res.ok) throw new Error(`Pull HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      error: err.message || 'Failed to pull cloud snapshot from backend.',
    };
  }
}
