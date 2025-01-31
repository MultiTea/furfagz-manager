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
            // Skip very dark or very light colors
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            
            // Calculate perceived brightness
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            // Only include colors within a good brightness range
            if (brightness > 30 && brightness < 225) {
              colors.push([r, g, b]);
            }
          }
  
          if (colors.length === 0) {
            resolve('rgb(249, 250, 251)'); // Default gray-50
            return;
          }
  
          // Sort colors by saturation
          const sortedColors = colors.sort((a, b) => {
            const [r1, g1, b1] = a;
            const [r2, g2, b2] = b;
            
            // Calculate saturation
            const max1 = Math.max(r1, g1, b1);
            const min1 = Math.min(r1, g1, b1);
            const sat1 = max1 === 0 ? 0 : (max1 - min1) / max1;
            
            const max2 = Math.max(r2, g2, b2);
            const min2 = Math.min(r2, g2, b2);
            const sat2 = max2 === 0 ? 0 : (max2 - min2) / max2;
            
            return sat2 - sat1;
          });
  
          // Take the most saturated color
          const baseColor = sortedColors[0];
          
          // Create a vibrant version for the background
          const vibrantColor = baseColor.map(c => 
            Math.min(255, Math.floor(c + (255 - c) * 0.2))
          );
          
          resolve(`rgb(${vibrantColor[0]}, ${vibrantColor[1]}, ${vibrantColor[2]})`);
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