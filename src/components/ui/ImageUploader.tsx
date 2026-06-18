import { useState } from 'react';
import { uploadImageFileToImgBB } from '@/services/imgbb.service';
import { Button } from './Button';

/** Props for the ImgBB-backed image uploader. */
export interface ImageUploaderProps {
  readonly imageUrls: readonly string[];
  readonly onChange: (urls: readonly string[]) => void;
}

/** Uploads one or more images to ImgBB and returns real public URLs. */
export const ImageUploader = ({ imageUrls, onChange }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const result = await uploadImageFileToImgBB(file);
      if (result.ok) {
        uploaded.push(result.data);
      } else {
        setError(result.error);
      }
    }

    onChange([...imageUrls, ...uploaded]);
    setIsUploading(false);
  };

  const removeImage = (url: string) => onChange(imageUrls.filter((item) => item !== url));

  return (
    <div className="image-uploader">
      <label className="form-label" htmlFor="post-images">Images</label>
      <input className="form-input" id="post-images" type="file" accept="image/*" multiple onChange={(event) => void handleFiles(event.target.files)} />
      {isUploading ? <p className="form-helper">Uploading images to ImgBB.</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {imageUrls.length > 0 ? (
        <div className="image-uploader__grid">
          {imageUrls.map((url) => (
            <div className="image-uploader__item" key={url}>
              <img src={url} alt="Uploaded BSDC post asset" loading="lazy" />
              <Button type="button" variant="danger" onClick={() => removeImage(url)}>Remove</Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
