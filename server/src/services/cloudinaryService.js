import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });

export const uploadToCloudinary = async (file, folder, resourceType = 'image') => {
  if (!file) return null;

  const configured = env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;
  if (!configured) {
    if (env.isProduction) throw new ApiError(500, 'Cloudinary is not configured.');
    const base64 = file.buffer.toString('base64');
    return {
      secure_url: `data:${file.mimetype};base64,${base64}`,
      public_id: `development/${Date.now()}-${file.originalname}`
    };
  }

  return uploadBuffer(file.buffer, {
    folder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId || !env.cloudinaryCloudName) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
