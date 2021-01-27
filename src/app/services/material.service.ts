import { V } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, BehaviorSubject } from 'rxjs';
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
import { VIDEO, PDF, IMAGE, MATERIAL } from '../constants/api.constant';
import { Image } from '../models/image.model';
import { Pdf } from '../models/pdf.model';
import { Video } from '../models/video.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { STATUS } from '../constants/variable.constants';

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

  loadVidoeStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingVideo$ = this.loadVidoeStatus.asObservable();
  loadPdfStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingPdf$ = this.loadPdfStatus.asObservable();
  loadImageStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingImage$ = this.loadImageStatus.asObservable();

  /**
   * LOAD MATERIALS
   * @param force Flag to load force
   */

  loadVideosImpl(): Observable<Video[]> {
    return this.httpClient.get(this.server + VIDEO.LOAD).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD VIDEOS', []))
    );
  }
  loadPdfsImpl(): Observable<Pdf[]> {
    return this.httpClient.get(this.server + PDF.LOAD).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD PDFS', []))
    );
  }
  loadImagesImpl(): Observable<Image[]> {
    return this.httpClient.get(this.server + IMAGE.LOAD).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD IMAGES', []))
    );
  }
  loadVideos(force = false): void {
    if (!force) {
      const loadVidoeStatus = this.loadVidoeStatus.getValue();
      if (loadVidoeStatus != STATUS.NONE && loadVidoeStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadVidoeStatus.next(STATUS.REQUEST);
    this.loadVideosImpl().subscribe((videos) => {
      videos
        ? this.loadVidoeStatus.next(STATUS.SUCCESS)
        : this.loadVidoeStatus.next(STATUS.FAILURE);
      this.storeService.videos.next(videos);
    });
  }
  loadPdfs(force = false): void {
    if (!force) {
      const loadPdfStatus = this.loadPdfStatus.getValue();
      if (loadPdfStatus != STATUS.NONE && loadPdfStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadPdfStatus.next(STATUS.REQUEST);
    this.loadPdfsImpl().subscribe((pdfs) => {
      pdfs
        ? this.loadPdfStatus.next(STATUS.SUCCESS)
        : this.loadPdfStatus.next(STATUS.FAILURE);
      this.storeService.pdfs.next(pdfs);
    });
  }
  loadImages(force = false): void {
    if (!force) {
      const loadImageStatus = this.loadImageStatus.getValue();
      if (loadImageStatus != STATUS.NONE && loadImageStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadImageStatus.next(STATUS.REQUEST);
    this.loadImagesImpl().subscribe((images) => {
      images
        ? this.loadImageStatus.next(STATUS.SUCCESS)
        : this.loadImageStatus.next(STATUS.FAILURE);
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

  createPdf(pdf: any): any {
    return this.httpClient.post(this.server + PDF.CREATE, pdf);
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

  createImage(image: any): any {
    return this.httpClient.post(this.server + IMAGE.CREATE, image);
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

  sendMaterials(data: any): Observable<boolean> {
    return this.httpClient.post(this.server + MATERIAL.EMAIL, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('SEND MATERIALS', false))
    );
  }

  sendText(data: any, materialType: string): Observable<boolean> {
    let api = '';
    switch (materialType) {
      case 'video':
        api = MATERIAL.VIDEO_TEXT;
        break;
      case 'pdf':
        api = MATERIAL.PDF_TEXT;
        break;
      case 'image':
        api = MATERIAL.IMAGE_TEXT;
        break;
    }
    return this.httpClient.post(this.server + api, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('SEND TEXT MATERIALS', false))
    );
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

  loadConvertingStatus(videos: any): any {
    return this.httpClient.post(this.server + VIDEO.LOAD_CONVERTING_STATUS, {
      videos
    });
  }

  getAnalytics(id: string): Observable<Video[]> {
    return this.httpClient.get(this.server + VIDEO.ANALYTICS + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD VIDEO ANALYTICS', []))
    );
  }

  getVideoById(id: string): Observable<Video[]> {
    return this.httpClient.get(this.server + VIDEO.READ + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD VIDEO DATA', []))
    );
  }
}
