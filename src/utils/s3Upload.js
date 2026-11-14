import axios from "axios";
import imageCompression from "browser-image-compression";
import Api from "../Api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Hard ceiling before we even try to compress. A raw 500 MB file is almost
// certainly a mistake — refuse early so the browser doesn't OOM trying to
// decode it. Anything ≤ this limit gets compressed down first.
const MAX_RAW_SIZE = 25 * 1024 * 1024; // 25 MB

// Compression targets. Tuned to Instagram-like behavior:
//   - 1080 px longest edge  → matches IG feed width, plenty for profile/rides
//   - 0.85 JPEG quality      → visually indistinguishable, ~5x smaller
//   - Workers                → off the main thread, no UI jank
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,           // try to bring file under this
  maxWidthOrHeight: 1080,   // longest edge
  useWebWorker: true,
  fileType: "image/jpeg",   // PNGs become JPEGs — smaller; alpha becomes white
  initialQuality: 0.85,
};

/**
 * Compress an image File. Returns a new File.
 * - If the input is already small (<400 KB) and small-in-pixels, returns as-is.
 * - Falls back to the original file if compression fails for any reason.
 */
async function compressImage(file) {
  // Fast path — no point re-encoding a tiny file
  if (file.size < 400 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
    // imageCompression returns a File with the same name; keep the extension
    // consistent with the target file type.
    const name = file.name.replace(/\.(png|webp|jpeg|jpg)$/i, "") + ".jpg";
    return new File([compressed], name, { type: "image/jpeg" });
  } catch (err) {
    console.warn("[s3Upload] compression failed, using original file:", err.message);
    return file;
  }
}

export async function uploadImageToS3(
  file,
  folder = "profiles",
  registrationCredential = null,
  maxSize = MAX_RAW_SIZE
) {
  if (!file) {
    throw new Error("Please select an image");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG or WebP image");
  }

  // Pre-compression ceiling — protects against truly absurd uploads
  if (Number.isFinite(maxSize) && file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    throw new Error(`Image must be ${mb} MB or smaller`);
  }

  // Compress before upload. Small files are returned unchanged.
  const uploadFile = await compressImage(file);

  const isRegistration = Boolean(registrationCredential);

  const endpoint = isRegistration
    ? `${Api}/s3/registration-upload-url`
    : `${Api}/s3/upload-url`;

  const token = registrationCredential || localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before uploading an image");
  }

  // Ask the backend for a presigned URL matching the *compressed* file's
  // size and type. This is critical — the backend may validate the
  // content-type and content-length against the presigned PUT.
  const response = await axios.post(
    endpoint,
    {
      folder: isRegistration ? "profiles" : folder,
      contentType: uploadFile.type,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = response.data?.data;

  if (!data?.key || !data?.uploadUrl) {
    throw new Error("The server did not return a valid S3 upload URL");
  }

  // Upload the compressed file directly to S3.
  // Do NOT send the JWT to S3.
  await axios.put(data.uploadUrl, uploadFile, {
    headers: {
      "Content-Type": uploadFile.type,
    },
  });

  return { key: data.key };
}

export default uploadImageToS3;