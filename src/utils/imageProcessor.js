import imageCompression from 'browser-image-compression'
import heic2any from 'heic2any'

const MAX_FILE_SIZE_MB = 25
const MAX_UPLOAD_SIZE_MB = 5
const COMPRESSION_TRIGGER_KB = 500
const MAX_DIMENSION = 2048

/**
 * Process an image file for upload
 * - Validates file size (max 25MB)
 * - Converts HEIC/HEIF to JPEG
 * - Resizes if dimensions > 2048px
 * - Compresses if size > 5MB
 *
 * @param {File} file - The image file to process
 * @returns {Promise<File>} - The processed file ready for upload
 * @throws {Error} - If file is too large or processing fails
 */
export async function processImageForUpload(file) {
  // 1. Reject if > 25MB
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 25MB.')
  }

  // 2. Convert HEIC/HEIF to JPEG
  let processedFile = file
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      })
      processedFile = new File(
        [convertedBlob],
        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        { type: 'image/jpeg' }
      )
    } catch (error) {
      throw new Error('Failed to convert HEIC image. Please try a different format.')
    }
  }

  // 3. Resize and compress if needed
  const options = {
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/jpeg',
  }

  // Compress if file > 500KB (for speed/storage savings)
  // or resize if dimensions > 2048px
  if (processedFile.size > COMPRESSION_TRIGGER_KB * 1024) {
    processedFile = await imageCompression(processedFile, options)
  } else {
    // Check dimensions even for smaller files
    const needsResize = await checkNeedsResize(processedFile, MAX_DIMENSION)
    if (needsResize) {
      processedFile = await imageCompression(processedFile, {
        ...options,
        maxSizeMB: Infinity, // Don't compress quality, just resize
      })
    }
  }

  return processedFile
}

/**
 * Check if an image needs to be resized based on dimensions
 *
 * @param {File} file - The image file to check
 * @param {number} maxDimension - Maximum allowed dimension
 * @returns {Promise<boolean>} - True if resize is needed
 */
async function checkNeedsResize(file, maxDimension) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img.width > maxDimension || img.height > maxDimension)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
}
