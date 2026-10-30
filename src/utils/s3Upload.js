
import axios from "axios";
import Api from "../Api";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadImageToS3(
  file,
  folder = "profiles",
  registrationCredential = null
) {
  if (!file) {
    throw new Error("Please select an image");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG or WebP image");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Image must be 5 MB or smaller");
  }

  const isRegistration = Boolean(registrationCredential);

  const endpoint = isRegistration
    ? `${Api}/s3/registration-upload-url`
    : `${Api}/s3/upload-url`;

  // Use the registration credential during registration.
  // Otherwise, use the logged-in user's JWT.
  const token =
    registrationCredential ||
    localStorage.getItem("token");

console.log(token,'roken')
  if (!token) {
    throw new Error("Please log in before uploading an image");
  }

  const response = await axios.post(
    endpoint,
    {
      folder: isRegistration ? "profiles" : folder,
      contentType: file.type,
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

  // Upload the actual File directly to S3.
  // Do not send the JWT to S3.
  await axios.put(data.uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });

  // Return the permanent S3 object key.
  return { key: data.key };
}

export default uploadImageToS3;
