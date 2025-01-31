// composables/useImageColor.ts
export function useImageColor() {
    const getMedianColor = async (imageUrl: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('rgb(249, 250, 251)'); // Default gray-50
            return;
          }
  
          // Scale down image for faster processing
          const size = 50;
          canvas.width = size;
          canvas.height = size;
          
          // Draw and get image data
          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size).data;
          
          // Collect all RGB values
          const colors: number[][] = [];
          for (let i = 0; i < imageData.length; i += 4) {
            colors.push([
              imageData[i],     // R
              imageData[i + 1], // G
              imageData[i + 2]  // B
            ]);
          }
  
          // Get median for each channel
          const medianColor = colors[Math.floor(colors.length / 2)];
          
          // Make color very light for background
          const lightColor = medianColor.map(c => Math.min(255, Math.floor(c + (255 - c) * 0.65)));
          
          resolve(`rgb(${lightColor.join(',')})`);
        };
  
        img.onerror = () => {
          resolve('rgb(249, 250, 251)'); // Default gray-50
        };
  
        img.src = imageUrl;
      });
    };
  
    return {
      getMedianColor
    };
  }