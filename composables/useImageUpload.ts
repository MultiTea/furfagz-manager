// composables/useImageUpload.ts
export function useImageUpload() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const { withLoading } = useLoadingState();

  const uploadImage = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string> => {
    return withLoading(async () => {
      // Check authentication
      if (!user.value?.id) {
        throw new Error('You must be logged in to upload images');
      }

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file must be an image');
      }

      // Create the path ensuring it includes the user ID
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `profile/${user.value.id}/${timestamp}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

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
      if (!user.value?.id) {
        throw new Error('You must be logged in to remove images');
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([`profile/${user.value.id}/${path}`]);

      if (error) throw error;
    });
  };

  return {
    uploadImage,
    removeImage
  };
}