/**
 * Image processing utilities for client-side compression and passport aspect ratio cropping.
 */

export const resizeImage = (file: File, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const cropToPassport = (file: File, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        const targetRatio = 3 / 4; // Standard Malaysian / International Passport Portrait Ratio
        const imgRatio = img.width / img.height;

        let sWidth: number;
        let sHeight: number;
        let sx: number;
        let sy: number;

        if (imgRatio > targetRatio) {
          sHeight = img.height;
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }

        canvas.width = 600;
        canvas.height = 800;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
