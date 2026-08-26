import axios from "axios";
import Api from "../Api";


const uploadToCloudinary = async (file) => {
  try {
    // Get signed upload details from backend
    const { data } = await axios.get(
      `${Api}/users/upload-signature`
    );

    console.log(data,'data from db')

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("folder", data.folder);

    // Upload directly to Cloudinary
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
      formData
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error.response?.data || error
    );

    throw new Error("Failed to upload profile image");
  }
};

export default uploadToCloudinary;