import * as FileSystem from "expo-file-system/legacy";

/**
 * Nama sub-folder sandbox khusus dokumen dan foto laporan warga
 */
const SANDBOX_DIR_NAME = "civic_reports_sandbox";

/**
 * URI root direktori dokumen aplikasi (sandbox terisolasi per aplikasi)
 */
function getBaseDocumentDirectory(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error(
      "Document directory tidak tersedia di lingkungan saat ini.",
    );
  }
  return base.endsWith("/") ? base : `${base}/`;
}

/**
 * Mengembalikan URI lengkap dari direktori sandbox laporan
 */
export function getSandboxDirectoryUri(): string {
  return `${getBaseDocumentDirectory()}${SANDBOX_DIR_NAME}/`;
}

/**
 * Memastikan direktori sandbox telah dibuat.
 * Jika belum ada, fungsi akan membuatnya secara rekursif (intermediates: true).
 *
 * @returns URI folder sandbox
 */
export async function ensureSandboxDirectory(): Promise<string> {
  const sandboxUri = getSandboxDirectoryUri();
  const dirInfo = await FileSystem.getInfoAsync(sandboxUri);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sandboxUri, { intermediates: true });
  }

  return sandboxUri;
}

/**
 * Menyimpan data teks atau dokumen laporan ke berkas lokal di dalam sandbox.
 *
 * @param fileName Nama berkas target (misal: "laporan_101.json")
 * @param content Isi teks atau string JSON
 * @returns URI lokal berkas yang tersimpan
 */
export async function saveReportFile(
  fileName: string,
  content: string,
): Promise<string> {
  const sandboxUri = await ensureSandboxDirectory();
  const fileUri = `${sandboxUri}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

/**
 * Membaca isi berkas teks/JSON dari direktori sandbox.
 *
 * @param fileName Nama berkas yang ingin dibaca
 * @returns Konten string dari berkas
 */
export async function readReportFile(fileName: string): Promise<string> {
  const sandboxUri = getSandboxDirectoryUri();
  const fileUri = `${sandboxUri}${fileName}`;

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error(`Berkas "${fileName}" tidak ditemukan di sandbox.`);
  }

  return await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

/**
 * Mengambil daftar nama semua berkas yang tersimpan di dalam folder sandbox.
 *
 * @returns Array nama berkas (misal: ["foto_1.jpg", "draft_laporan.json"])
 */
export async function listReportFiles(): Promise<string[]> {
  await ensureSandboxDirectory();
  const sandboxUri = getSandboxDirectoryUri();

  try {
    const files = await FileSystem.readDirectoryAsync(sandboxUri);
    return files;
  } catch (error) {
    console.error("[FileManager] Gagal mengambil daftar berkas:", error);
    return [];
  }
}

/**
 * Menghapus berkas tertentu dari dalam sandbox.
 *
 * @param fileName Nama berkas yang ingin dihapus
 * @returns boolean status keberhasilan
 */
export async function deleteReportFile(fileName: string): Promise<boolean> {
  const sandboxUri = getSandboxDirectoryUri();
  const fileUri = `${sandboxUri}${fileName}`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return true; // Berkas sudah tidak ada
    }

    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    return true;
  } catch (error) {
    console.error(`[FileManager] Gagal menghapus berkas "${fileName}":`, error);
    return false;
  }
}

/**
 * CONTOH SPESIFIK: Menyalin foto bukti laporan dari URI sementara (misal: kamera/galeri)
 * ke direktori sandbox lokal agar tetap tersimpan permanen secara offline.
 *
 * @param sourceUri URI sumber foto (file:// atau cache://)
 * @param customName Nama file khusus opsional
 * @returns Objek informasi berkas yang disimpan (nama, localUri, ukuran)
 */
export async function saveReportPhoto(
  sourceUri: string,
  customName?: string,
): Promise<{ fileName: string; localUri: string; size?: number }> {
  const sandboxUri = await ensureSandboxDirectory();
  const timestamp = Date.now();
  const fileName = customName ?? `foto_laporan_${timestamp}.jpg`;
  const destinationUri = `${sandboxUri}${fileName}`;

  // Salin file dari sumber (cache/kamera) ke direktori permanen sandbox
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  const info = await FileSystem.getInfoAsync(destinationUri);

  return {
    fileName,
    localUri: destinationUri,
    size: info.exists && "size" in info ? info.size : undefined,
  };
}

/**
 * CONTOH PENDUKUNG: Membuat simulasi foto dummy (format teks base64/SVG)
 * untuk pengujian langsung tanpa perlu membuka kamera fisik.
 */
export async function createDummyReportPhoto(
  title: string = "Kerusakan Jalan",
): Promise<{ fileName: string; localUri: string }> {
  const timestamp = Date.now();
  const fileName = `dummy_foto_${timestamp}.svg`;
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#2d3748"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="20" font-family="sans-serif">CIVIC PULSE BUKTI FOTO</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#ef6b52" font-size="16" font-family="sans-serif">${title}</text>
  </svg>`;

  const localUri = await saveReportFile(fileName, svgContent);
  return { fileName, localUri };
}
