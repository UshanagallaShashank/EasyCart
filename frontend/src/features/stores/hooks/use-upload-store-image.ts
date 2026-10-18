import { useMutation } from '@tanstack/react-query';
import { uploadStoreImage } from '../api/store-api';

export function useUploadStoreImage() {
  return useMutation({
    mutationFn: uploadStoreImage
  });
}
