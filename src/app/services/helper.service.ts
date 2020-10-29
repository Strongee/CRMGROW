import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  public generateThumbnail(videoFile: Blob): Promise<any> {
    const video: HTMLVideoElement = this.document.createElement('video');
    const canvas: HTMLCanvasElement = this.document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    const canvasWidth = 480,
      canvasHeight = 270;
    return new Promise<any>((resolve, reject) => {
      canvas.addEventListener('error', reject);
      video.addEventListener('error', reject);
      video.addEventListener('canplay', (event) => {
        const imgWidth = video.videoWidth;
        const imgHeight = video.videoHeight;
        let newWidth, newHeight;
        let offX, offY;
        if (imgHeight < (imgWidth * 9) / 16) {
          newWidth = canvasWidth;
          newHeight = (newWidth * imgHeight) / imgWidth;
          offX = 0;
          offY = (canvasHeight - newHeight) / 2;
        } else {
          newHeight = canvasHeight;
          newWidth = (newHeight * imgWidth) / imgHeight;
          offX = (canvasWidth - newWidth) / 2;
          offY = 0;
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(video, offX, offY, newWidth, newHeight);
        if (video.duration) {
          resolve({
            image: canvas.toDataURL(),
            duration: video.duration * 1000
          });
        } else {
          resolve({
            image: canvas.toDataURL()
          });
        }
      });
      if (videoFile.type) {
        video.setAttribute('type', videoFile.type);
      }
      video.preload = 'auto';
      video.src = window.URL.createObjectURL(videoFile);
      video.load();
    });
  }
  public b64toBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }
  public generateImageThumbnail(imageFile: Blob, type = null): Promise<any> {
    const fileReader = new FileReader();
    const canvas: HTMLCanvasElement = this.document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    const canvasWidth = 480,
      canvasHeight = 270;
    return new Promise<any>((resolve, reject) => {
      canvas.addEventListener('error', reject);
      fileReader.addEventListener('error', reject);
      fileReader.addEventListener('load', (event) => {
        const source = new Image();
        source.addEventListener('load', () => {
          const imgWidth = source.width;
          const imgHeight = source.height;
          let newWidth, newHeight;
          let offX, offY;
          if (imgHeight < (imgWidth * 9) / 16) {
            newWidth = canvasWidth;
            newHeight = (newWidth * imgHeight) / imgWidth;
            offX = 0;
            offY = (canvasHeight - newHeight) / 2;
          } else {
            newHeight = canvasHeight;
            newWidth = (newHeight * imgWidth) / imgHeight;
            offX = (canvasWidth - newWidth) / 2;
            offY = 0;
          }
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvasWidth, canvasHeight);
          context.drawImage(source, offX, offY, newWidth, newHeight);
          if (!type) {
            resolve(canvas.toDataURL('image/jpeg'));
          }
          if (type == 'pdf') {
            const overlay = new Image();
            overlay.onload = (e) => {
              context.drawImage(
                overlay,
                canvasWidth - 70,
                canvasHeight - 85,
                60,
                75
              );
              resolve(canvas.toDataURL('image/jpeg'));
            };
            overlay.src = '../../assets/img/icons/pdf_overlay.png';
          }
          if (type == 'image') {
            const overlay = new Image();
            overlay.onload = (e) => {
              context.drawImage(
                overlay,
                canvasWidth - 82,
                canvasHeight - 70,
                72,
                60
              );
              resolve(canvas.toDataURL('image/jpeg'));
            };
            overlay.src = '../../assets/img/icons/image_overlay.png';
          }
          if (type == 'video_play') {
            const overlay = new Image();
            overlay.onload = (e) => {
              context.drawImage(overlay, 19.2, 183);
              resolve(canvas.toDataURL('image/jpeg'));
            };
            overlay.src = '../../assets/img/icons/overlay.png';
          }
        });
        source.src = fileReader.result as string;
      });
      fileReader.readAsDataURL(imageFile);
    });
  }
}
