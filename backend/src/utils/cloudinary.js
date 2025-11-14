import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('⚠️  Cloudinary env vars are not fully set. Uploads will be skipped.');
    isConfigured = false;
    return;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  isConfigured = true;
}

export function isCloudinaryReady() {
  return isConfigured;
}

export async function uploadJsonFile(filePath, publicId, folder = process.env.CLOUDINARY_FOLDER || 'reports') {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured');
  }
  const options = {
    resource_type: 'raw',
    folder,
    public_id: publicId,
    overwrite: true,
    use_filename: false,
    unique_filename: false,
  };
  return await cloudinary.uploader.upload(filePath, options);
}


