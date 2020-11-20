import { V } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import {
  catchError,
  filter,
  map,
  takeUntil,
  scan,
  withLatestFrom,
  tap,
  repeat,
  combineAll
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { VIDEO, PDF, IMAGE } from '../constants/api.constant';
import { Image } from '../models/image.model';
import { Pdf } from '../models/pdf.model';
import { Video } from '../models/video.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  loadVideosImpl(): Observable<Video[]> {
    return this.httpClient.get(this.server + VIDEO.LOAD).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD VIDEOS', []))
    );
  }
  loadPdfsImpl(): Observable<Pdf[]> {
    return this.httpClient.get(this.server + PDF.CREATE).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD PDFS', []))
    );
  }
  loadImagesImpl(): Observable<Image[]> {
    return this.httpClient.get(this.server + IMAGE.CREATE).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD IMAGES', []))
    );
  }
  loadVideos(): void {
    this.loadVideosImpl().subscribe((videos) => {
      this.storeService.videos.next(videos);
    });
  }
  loadPdfs(): void {
    this.loadPdfsImpl().subscribe((pdfs) => {
      this.storeService.pdfs.next(pdfs);
    });
  }
  loadImages(): void {
    this.loadImagesImpl().subscribe((images) => {
      this.storeService.images.next(images);
    });
  }

  createVideo(video: any): any {
    return this.httpClient.post(this.server + VIDEO.CREATE, video);
  }

  uploadVideoDetail(id: string, video: any): any {
    return this.httpClient.put(
      this.server + VIDEO.UPDATE_VIDEO_DETAIL + id,
      video
    );
  }

  updateVideo(id: string, video: any): any {
    return this.httpClient.put(this.server + VIDEO.UPDATE + id, video);
  }

  updateAdminVideo(id: string, video: any): any {
    return this.httpClient.post(this.server + VIDEO.UPDATE_ADMIN, {
      id,
      video
    });
  }

  deleteVideo(id: string): any {
    return this.httpClient.delete(this.server + VIDEO.DELETE + id);
  }

  updatePdf(id: string, pdf: any): any {
    return this.httpClient.put(this.server + PDF.UPDATE + id, pdf);
  }

  updateAdminPdf(id: string, pdf: any): any {
    return this.httpClient.post(this.server + PDF.UPDATE_ADMIN, {
      id,
      pdf
    });
  }

  deletePdf(id: string): any {
    return this.httpClient.delete(this.server + PDF.DELETE + id);
  }

  updateImage(id: string, image: any): any {
    return this.httpClient.put(this.server + IMAGE.UPDATE + id, image);
  }

  updateAdminImage(id: string, image: any): any {
    return this.httpClient.post(this.server + IMAGE.UPDATE_ADMIN, {
      id,
      image
    });
  }

  deleteImage(id: string): any {
    return this.httpClient.delete(this.server + IMAGE.DELETE + id);
  }

  getVimeoMeta(id: string): any {
    return this.httpClient.get(`https://vimeo.com/api/v2/video/${id}.json`);
  }

  getYoutubeMeta(id: string): any {
    return this.httpClient.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${environment.API_KEY.Youtube}&part=snippet,contentDetails`
    );
  }

  checkVideosCount = this.storeService.videos$.pipe(
    filter((val) => val.length > 100)
  );
}
