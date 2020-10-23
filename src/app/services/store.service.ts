import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Image } from '../models/image.model';
import { Pdf } from '../models/pdf.model';
import { Video } from '../models/video.model';
import { Template } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  videos: BehaviorSubject<Video[]> = new BehaviorSubject([]);
  pdfs: BehaviorSubject<Pdf[]> = new BehaviorSubject([]);
  images: BehaviorSubject<Image[]> = new BehaviorSubject([]);
  templates: BehaviorSubject<Template[]> = new BehaviorSubject([]);

  videos$ = this.videos.asObservable();
  pdfs$ = this.pdfs.asObservable();
  images$ = this.pdfs.asObservable();
  templates$ = this.templates.asObservable();

  constructor() {}
}
