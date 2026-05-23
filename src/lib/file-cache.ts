// Client-side IndexedDB cache for the multi-file upload picker.
// Keeps the user's selected files across page reloads so a failed extraction
// doesn't force them to re-drop everything.
//
// One DB, one object store keyed by index. We blow it away on success
// (router push to /c/[id]) so the next visit starts fresh.

const DB_NAME = "cracked-uploads";
const STORE = "files";
const VERSION = 1;

interface StoredFile {
  index: number;
  name: string;
  type: string;
  blob: Blob;
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "index" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFiles(files: File[]): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  await new Promise<void>((resolve, reject) => {
    const clear = store.clear();
    clear.onsuccess = () => resolve();
    clear.onerror = () => reject(clear.error);
  });
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    store.put({ index: i, name: f.name, type: f.type, blob: f } satisfies StoredFile);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadFiles(): Promise<File[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const rows: StoredFile[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as StoredFile[]);
      req.onerror = () => reject(req.error);
    });
    db.close();
    rows.sort((a, b) => a.index - b.index);
    return rows.map((r) => new File([r.blob], r.name, { type: r.type }));
  } catch {
    return [];
  }
}

export async function clearFiles(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }
}
