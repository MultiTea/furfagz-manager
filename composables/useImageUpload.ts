// composables/useImageUpload.ts
export function useImageUpload() {
    const { supabase } = useSupabaseAuth();
    const { withLoading } = useLoadingState();
  
    const uploadImage = async (
      file: File,
      bucket: string,
      path: string
    ): Promise<string> => {
      return withLoading(async () => {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be less than 5MB');
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('Selected file must be an image');
        }
  
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true });
  
        if (uploadError) throw uploadError;
  
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
  
        return publicUrl;
      });
    };
  
    const removeImage = async (
      bucket: string,
      path: string
    ): Promise<void> => {
      return withLoading(async () => {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([path]);
  
        if (error) throw error;
      });
    };
  
    return {
      uploadImage,
      removeImage
    };
  }