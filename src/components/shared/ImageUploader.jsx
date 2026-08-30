import { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ImageUploader = ({ 
  maxImages = 5, 
  onUploadSuccess, 
  currentImages = [],
  title = "Upload Images"
}) => {
  const [images, setImages] = useState(currentImages || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setImages(currentImages || []);
  }, [JSON.stringify(currentImages)]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    let filesToUpload = files;

    if (maxImages === 1) {
      // For single image uploads, just replace it instead of erroring out
      filesToUpload = [files[0]];
    } else if (images.length + files.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      if (filesToUpload.length === 1) {
        formData.append('image', filesToUpload[0]);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          const newImages = maxImages === 1 ? [response.data.data.url] : [...images, response.data.data.url];
          setImages(newImages);
          onUploadSuccess(newImages);
          toast.success('Image uploaded successfully!');
        }
      } else {
        filesToUpload.forEach(file => {
          formData.append('images', file);
        });
        const response = await api.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const uploadedUrls = response.data.data.map(img => img.url);
          const newImages = [...images, ...uploadedUrls];
          setImages(newImages);
          onUploadSuccess(newImages);
          toast.success('Images uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image(s)');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onUploadSuccess(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">{images.length} / {maxImages}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img 
              src={url} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition cursor-pointer text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
