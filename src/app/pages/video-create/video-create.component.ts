import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUploader, FileItem, FileUploaderOptions } from 'ng2-file-upload';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { MaterialService } from '../../services/material.service';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import canvas from 'html2canvas';
import { environment } from 'src/environments/environment';
import { TabItem } from 'src/app/utils/data.types';
import { Subscription, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Material } from 'src/app/models/material.model';
import { PageCanDeactivate } from 'src/app/variables/abstractors';

@Component({
  selector: 'app-video-create',
  templateUrl: './video-create.component.html',
  styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent
  extends PageCanDeactivate
  implements OnInit, OnDestroy {
  saved = true;
  submitted = false;
  isStep = 1;
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  video: Material = new Material();
  pdf: Material = new Material();
  image: Material = new Material();
  // PDF FILE & Thumbnail Loading
  file;
  thumbnail_loading = false;

  tabs: TabItem[] = [
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'video' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdf' },
    { icon: 'i-icon i-image', label: 'IMAGE', id: 'image' }
  ];
  selectedTab: TabItem = this.tabs[0];

  vimeoVideoMetaSubscription: Subscription;
  youtubeVideoMetaSubscription: Subscription;
  routeChangeSubscription: Subscription;

  uploading = false;
  uploadTimer: any;
  uploadTimeSubscriber: any;
  uploaded_time = 0;
  currentFolder = '';

  themes = [
    {
      name: 'Theme 1',
      thumbnail: environment.server + '/assets/images/theme/theme2.jpg',
      id: 'theme2'
    },
    {
      name: 'Simple Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.jpg',
      id: 'theme3'
    },
    {
      name: 'Lead Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.png',
      id: 'theme4'
    }
  ];

  @ViewChild('videoFile') videoFileInput;
  @ViewChild('pdfFile') pdfFileInput;
  @ViewChild('imageFile') imageFileInput;
  videoUploader: FileUploader = new FileUploader({
    url: environment.api + 'video/upload',
    authToken: this.userService.getToken(),
    itemAlias: 'video'
  });
  pdfUploader: FileUploader = new FileUploader({
    url: environment.api + 'pdf',
    authToken: this.userService.getToken(),
    itemAlias: 'pdf'
  });
  imageUploader: FileUploaderCustom = new FileUploaderCustom({
    url: environment.api + 'image',
    authToken: this.userService.getToken(),
    itemAlias: 'image'
  });

  overFile = false;

  constructor(
    private materialService: MaterialService,
    private userService: UserService,
    private toast: ToastrService,
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();

    this.userService.garbage$.subscribe((_garbage) => {
      this.selectedTheme = this.themes.filter(
        (theme) => theme.id == _garbage.material_theme
      )[0];
    });
  }

  ngOnInit(): void {
    this.routeChangeSubscription = this.route.params.subscribe((params) => {
      const mode = params['mode'];
      this.selectedTab = this.tabs.filter((tab) => tab.id == mode)[0];
      this.currentFolder = params['folder'];
      this.isStep = 1;
      this.video = new Material();
      this.image = new Material();
      this.pdf = new Material();
      this.videoUploader.cancelAll();
      this.videoUploader.clearQueue();
      this.pdfUploader.cancelAll();
      this.pdfUploader.clearQueue();
      this.imageUploader.cancelAll();
      this.imageUploader.clearQueue();
      this.saved = true;
    });
    this.videoUploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.videoUploader.queue.length > 1) {
        this.videoUploader.queue.splice(0, 1);
      }
    };
    this.pdfUploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.pdfUploader.queue.length > 1) {
        this.pdfUploader.queue.splice(0, 1);
      }
    };

    this.videoUploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      try {
        if (status === 200) {
          response = JSON.parse(response);
          if (response['status']) {
            const video = { ...response['data'] };
            this.updateVideo(video);
          } else {
            this.toast.error('Video uploading is failed.');
          }
        }
      } catch (e) {
        console.log('Error', e);
        this.toast.error('Video uploading is failed. Response error');
      }
    };
    this.pdfUploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      try {
        if (status === 200) {
          response = JSON.parse(response);
          if (response['status']) {
            const pdf = { ...response['data'] };
            this.updatePdf(pdf);
          } else {
            this.uploading = false;
            this.toast.error('Pdf uploading is failed.');
          }
        }
      } catch (e) {
        console.log('Error', e);
        this.toast.error('Pdf uploading is failed. Response error');
      }
    };
    this.imageUploader.onSuccessItem = (
      item: FileItem,
      response: string,
      status: any,
      headers: any
    ) => {
      try {
        if (status == 200) {
          response = JSON.parse(response);
          if (response['status']) {
            const image = { ...response['data'] };
            this.updateImage(image);
          } else {
            this.uploading = false;
            this.toast.error('Image uploading is failed.');
          }
        }
      } catch (e) {
        this.toast.error("Image is uploaded. But the Image could't saved.");
      }
    };
  }

  ngOnDestroy(): void {
    this.vimeoVideoMetaSubscription &&
      this.vimeoVideoMetaSubscription.unsubscribe();
    this.youtubeVideoMetaSubscription &&
      this.youtubeVideoMetaSubscription.unsubscribe();
  }

  changeTab(tab: TabItem): void {
    if (this.currentFolder) {
      this.router.navigate([
        `/materials/create/${tab.id}/${this.currentFolder}`
      ]);
    } else {
      this.router.navigate([`/materials/create/${tab.id}`]);
    }
  }

  uploadVideo(): void {
    this.isStep++;
    this.saved = false;
  }

  saveDetail(): void {
    this.isStep++;
  }

  backUpload(): void {
    this.isStep--;
    this.video = new Material();
    this.image = new Material();
    this.pdf = new Material();
    this.videoUploader.cancelAll();
    this.videoUploader.clearQueue();
    this.pdfUploader.cancelAll();
    this.pdfUploader.clearQueue();
    this.imageUploader.cancelAll();
    this.imageUploader.clearQueue();
  }

  selectTheme(): void {
    this.isStep++;
  }

  setTheme(theme: any): void {
    this.selectedTheme = theme;
  }

  backDetail(): void {
    this.isStep--;
  }

  backSelectTheme(): void {
    this.isStep--;
  }

  finishUpload(type: string): void {
    if (
      type === 'video' &&
      (this.video.type == 'youtube' || this.video.type === 'vimeo')
    ) {
      this.uploading = true;
      if (!this.video.duration) {
        this.toast.error("Can't read video's detail information.");
        return;
      }
      if (this.currentFolder !== '') {
        this.video['folder'] = this.currentFolder;
      }
      this.materialService
        .createVideo({
          ...this.video,
          duration: this.video.duration
        })
        .subscribe((res) => {
          if (res) {
            this.uploading = false;
            this.saved = true;
            this.toast.success('Video is uploaded successfully.');
            if (this.currentFolder) {
              this.router.navigate([`/materials/${this.currentFolder}`]);
            } else {
              this.router.navigate(['/materials']);
            }
          }
        });
      return;
    }
    this.uploading = true;
    switch (type) {
      case 'video':
        this.videoUploader.uploadAll();
        break;
      case 'pdf':
        this.pdfUploader.uploadAll();
        break;
      case 'image':
        this.imageUploader.uploadAllFiles();
        break;
    }
    this.uploadTimer = timer(0, 500);
    this.uploadTimeSubscriber = this.uploadTimer.subscribe((timer) => {
      if (this.uploaded_time < 60) {
        this.uploaded_time += 0.2;
      } else if (this.uploaded_time >= 60 && this.uploaded_time <= 80) {
        this.uploaded_time += 0.1;
      } else if (this.uploaded_time > 80 && this.uploaded_time <= 95) {
        this.uploaded_time += 0.05;
      }
    });
  }

  updateVideo(video): void {
    const videoId = video._id;
    const newVideo = { ...video };
    delete newVideo.created_at;
    delete newVideo._v;
    delete newVideo.user;
    delete newVideo._id;
    newVideo.title = this.video.title;
    newVideo.description = this.video.description;
    newVideo.duration = this.video.duration;
    newVideo.thumbnail = this.video.thumbnail;
    newVideo.site_image = this.video['site_image'];
    newVideo.custom_thumbnail = this.video['custom_thumbnail'];
    this.video['url'] = video.url;
    if (this.currentFolder !== '') {
      newVideo['folder'] = this.currentFolder;
    }

    this.materialService.uploadVideoDetail(videoId, newVideo).subscribe(
      (res) => {
        this.uploading = false;
        this.saved = true;
        this.toast.success('Video is uploaded successfully.');
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Video is uploaded. But the video information is not saved.'
        );
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      }
    );
  }

  updatePdf(pdf): void {
    const pdfId = pdf._id;
    const newPdf = { ...pdf };
    delete newPdf.created_at;
    delete newPdf._v;
    delete newPdf.user;
    delete newPdf._id;
    newPdf.title = this.pdf.title;
    newPdf.description = this.pdf.description;
    newPdf.preview = this.pdf.preview;
    this.pdf['url'] = pdf.url;
    if (this.currentFolder !== '') {
      newPdf['folder'] = this.currentFolder;
    }
    this.materialService.updatePdf(pdfId, newPdf).subscribe(
      (res) => {
        this.uploading = false;
        this.saved = true;
        this.toast.success('Pdf is uploaded successfully.');
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Pdf is uploaded. But the Pdf information is not saved.'
        );
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      }
    );
  }

  updateImage(image): void {
    const imageId = image._id;
    const newImage = { ...image };
    delete newImage.created_at;
    delete newImage._v;
    delete newImage.user;
    delete newImage._id;
    newImage.title = this.image.title;
    newImage.description = this.image.description;
    newImage.preview = this.image.preview;
    this.image['url'] = image.url;
    if (this.currentFolder !== '') {
      newImage['folder'] = this.currentFolder;
    }
    this.materialService.updateImage(imageId, newImage).subscribe(
      (res) => {
        this.uploading = false;
        this.saved = true;
        this.toast.success('Image is uploaded successfully.');
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Image is uploaded. But the Image information is not saved.'
        );
        if (this.currentFolder) {
          this.router.navigate([`/materials/${this.currentFolder}`]);
        } else {
          this.router.navigate(['/materials']);
        }
      }
    );
  }

  openFileDialog(type: string): void {
    switch (type) {
      case 'video':
        this.videoFileInput.nativeElement.click();
        break;
      case 'pdf':
        this.pdfFileInput.nativeElement.click();
        break;
      case 'image':
        this.imageFileInput.nativeElement.click();
        break;
    }
  }

  fileDrop(evt: any, type: string): any {
    switch (type) {
      case 'video':
        if (!evt && this.videoUploader.queue[0]) {
          const file = this.videoUploader.queue[0]._file;
          if (!file) {
            return false;
          }
          if (
            !(
              file.name.toLowerCase().endsWith('.mp4') ||
              file.name.toLowerCase().endsWith('.mov')
            )
          ) {
            this.toast.warning('Unsupported File Selected.');
            this.videoUploader.cancelAll();
            this.videoUploader.clearQueue();
            return false;
          }
          this.helperService
            .generateThumbnail(file)
            .then((data) => {
              this.video.thumbnail = data.image;
              this.video.duration = data.duration;
              const imageBlob = this.helperService.b64toBlob(data.image);
              this.helperService
                .generateImageThumbnail(imageBlob, 'video_play')
                .then((image) => {
                  this.video['site_image'] = image;
                })
                .catch((err) => {});
              this.video.type = 'video/';
              this.uploadVideo();
            })
            .catch((err) => {
              this.toast.warning(
                'Cannot read this file. Please try with standard file.'
              );
            });
        }
        break;
      case 'pdf':
        if (!evt && this.pdfUploader.queue[0]) {
          const file = this.pdfUploader.queue[0]._file;
          if (!file) {
            return false;
          }
          if (!file.name.toLowerCase().endsWith('.pdf')) {
            this.toast.warning('Unsupported File Selected.');
            this.pdfUploader.cancelAll();
            this.pdfUploader.clearQueue();
            return false;
          }
          const fileReader = new FileReader();
          fileReader.onload = (e) => {
            this.file = e.target['result'];
          };
          this.thumbnail_loading = true;
          fileReader.readAsArrayBuffer(file);
          this.uploadVideo();
        }
        break;
      case 'image':
        if (!evt && this.imageUploader.queue[0]) {
          this.imageUploader.queue.forEach((queue) => {
            const file = queue.file;
            if (!file) {
              return false;
            }
            if (!file.type.toLowerCase().startsWith('image')) {
              this.toast.warning('Unsupported File Selected.');
              this.imageUploader.cancelAll();
              this.imageUploader.clearQueue();
              return false;
            }
          });
          if (this.imageUploader.queue.length > 0) {
            const rawfile: Blob = this.imageUploader.queue[0].file
              .rawFile as any;
            const file: Blob = rawfile as Blob;
            if (file) {
              this.helperService
                .generateImageThumbnail(file, 'image')
                .then((thumbnail) => {
                  this.image.preview = thumbnail;
                  this.uploadVideo();
                })
                .catch(() => {
                  this.toast.warning('Cannot load the image file.');
                });
            }
          }
        }
        break;
    }
  }

  fileChange(evt, type: string): any {
    switch (type) {
      case 'video':
        const file = evt.target.files[0];
        if (!file) {
          return false;
        }
        if (
          !(
            file.name.toLowerCase().endsWith('.mp4') ||
            file.name.toLowerCase().endsWith('.mov')
          )
        ) {
          this.toast.warning('Unsupported File Selected.');
          return false;
        }
        this.helperService
          .generateThumbnail(file)
          .then((data) => {
            this.video.thumbnail = data.image;
            this.video.duration = data.duration;
            const imageBlob = this.helperService.b64toBlob(data.image);
            this.helperService
              .generateImageThumbnail(imageBlob, 'video_play')
              .then((image) => {
                this.video.site_image = image;
              })
              .catch((err) => {
                console.log('Video Meta Image Load', err);
              });
            this.video.type = 'video/';
            this.uploadVideo();
          })
          .catch((err) => {
            console.log('error', err);
            this.toast.warning(
              'Cannot read this file. Please try with standard file.'
            );
          });
        break;
      case 'pdf':
        try {
          const file = evt.target.files[0];
          if (file) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
              this.file = e.target['result'];
            };
            this.thumbnail_loading = true;
            fileReader.readAsArrayBuffer(file);
            this.uploadVideo();
          }
        } catch (e) {
          this.toast.error('Loading the PDF file is failed. Please try agian');
        }
        break;
      case 'image':
        try {
          const rawfile: Blob = this.imageUploader.queue[0].file.rawFile as any;
          const file: Blob = rawfile as Blob;
          this.helperService
            .generateImageThumbnail(file, 'image')
            .then((thumbnail) => {
              this.image.preview = thumbnail;
              this.uploadVideo();
            })
            .catch(() => {
              this.toast.warning('Cannot load the image file.');
            });
        } catch (e) {
          this.toast.error(
            'Loading the Preview Image is failed. Please try agian'
          );
        }
        break;
    }
  }

  openPreviewDialog(type: string): void {
    switch (type) {
      case 'video':
        this.helperService
          .promptForImage()
          .then((imageFile) => {
            this.helperService
              .generateImageThumbnail(imageFile)
              .then((thumbnail) => {
                this.video.thumbnail = thumbnail;
                this.video.custom_thumbnail = true;
                this.helperService
                  .generateImageThumbnail(imageFile, 'video_play')
                  .then((image) => {
                    this.video.site_image = image;
                  })
                  .catch(() => {
                    this.video.site_image = thumbnail;
                  });
              })
              .catch(() => {
                this.toast.warning('Cannot load the image file.');
              });
          })
          .catch(() => {
            this.toast.warning('Cannot read this image file.');
          });
        break;
      case 'pdf':
        this.helperService
          .promptForImage()
          .then((imageFile) => {
            this.helperService
              .generateImageThumbnail(imageFile, 'pdf')
              .then((thumbnail) => {
                this.pdf.preview = thumbnail;
              })
              .catch(() => {
                this.toast.warning('Cannot load the image file.');
              });
          })
          .catch(() => {
            this.toast.warning('Cannot read this image file.');
          });
        break;
      case 'image':
        this.helperService
          .promptForImage()
          .then((imageFile) => {
            this.helperService
              .generateImageThumbnail(imageFile, 'image')
              .then((thumbnail) => {
                this.image.preview = thumbnail;
              })
              .catch(() => {
                this.toast.warning('Cannot load the image file.');
              });
          })
          .catch(() => {
            this.toast.warning('Cannot read this image file.');
          });
        break;
    }
  }

  pageRendered(evt): any {
    canvas(evt.source.div).then((canvas) => {
      this.helperService
        .resizeThumbnail(canvas.toDataURL(), 'pdf')
        .then((data) => {
          const img: HTMLElement = document.querySelector(
            '#pdf-selector .image'
          ) as HTMLElement;
          img.setAttribute('src', data);
          this.pdf.preview = data;
          this.thumbnail_loading = false;
        })
        .catch(() => {
          this.toast.error('Loading the PDF file is failed. Please try agian');
        });
    });
  }

  checkVideoUrl(): void {
    if (this.video.url.toLowerCase().indexOf('youtube.com') > -1) {
      this.getYoutubeId();
    }
    if (this.video.url.toLowerCase().indexOf('vimeo.com') > -1) {
      this.getVimeoId();
    }
  }

  getYoutubeId(): any {
    if (this.video.url.toLowerCase().indexOf('youtube.com/watch') !== -1) {
      const matches = this.video.url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
      if (matches) {
        const videoId = matches[1];
        this.getMetaFromYoutube(videoId);
        return;
      }
    } else if (
      this.video.url.toLowerCase().indexOf('youtube.com/embed') !== -1
    ) {
      const matches = this.video.url.match(/embed\/([a-zA-Z0-9\-_]+)/);
      if (matches) {
        const videoId = matches[1];
        this.getMetaFromYoutube(videoId);
        return;
      }
    } else if (this.video.url.toLowerCase().indexOf('youtu.be/') !== -1) {
      const matches = this.video.url.match(/youtu.be\/([a-zA-Z0-9\-_]+)/);
      if (matches) {
        const videoId = matches[1];
        this.getMetaFromYoutube(videoId);
        return;
      }
    }
    return;
  }

  getVimeoId(): any {
    if (this.video.url.toLowerCase().indexOf('vimeo.com/video') !== -1) {
      const matches = this.video.url.match(/video\/([0-9]+)/);
      if (matches) {
        let videoId = matches[1];

        const hashReg = new RegExp(
          'vimeo.com/video/' + videoId + '/([0-9a-z]+)'
        );
        const hashMatches = this.video.url.match(hashReg);
        let hash = '';
        if (hashMatches && hashMatches.length) {
          hash = hashMatches[1];
          videoId = videoId + ':' + hash;
        }

        this.getThumbnailFromVimeo(videoId);
        return;
      }
    } else if (this.video.url.toLowerCase().indexOf('vimeo.com/') !== -1) {
      const matches = this.video.url.match(/vimeo.com\/([0-9]+)/);
      if (matches) {
        let videoId = matches[1];

        const hashReg = new RegExp('vimeo.com/' + videoId + '/([0-9a-z]+)');
        const hashMatches = this.video.url.match(hashReg);
        let hash = '';
        if (hashMatches && hashMatches.length) {
          hash = hashMatches[1];
          videoId = videoId + ':' + hash;
        }

        this.getThumbnailFromVimeo(videoId);
        return;
      }
    }
  }

  getMetaFromYoutube(id: string): any {
    this.youtubeVideoMetaSubscription &&
      this.youtubeVideoMetaSubscription.unsubscribe();
    this.youtubeVideoMetaSubscription = this.materialService
      .getYoutubeMeta(id)
      .subscribe(
        (res) => {
          if (
            res['items'] &&
            res['items'][0] &&
            res['items'][0]['contentDetails']
          ) {
            const duration = res['items'][0]['contentDetails']['duration'];
            this.video.duration = this.YTDurationToSeconds(duration) * 1000;
          }
          if (res['items'] && res['items'][0] && res['items'][0]['snippet']) {
            const thumbnail =
              res['items'][0]['snippet']['thumbnails']['medium']['url'];
            if (thumbnail) {
              this.video.thumbnail = thumbnail;
            } else {
              this.video.thumbnail =
                'https://img.youtube.com/vi/' + id + '/0.jpg';
            }

            const title = res['items'][0]['snippet']['title'];
            this.video.title = title;
          }
          if (res['items']) {
            this.video.type = 'youtube';
            this.uploadVideo();
          }
        },
        (err) => {
          this.video.thumbnail = 'https://img.youtube.com/vi/' + id + '/0.jpg';
        }
      );
  }

  getThumbnailFromVimeo(id): any {
    this.vimeoVideoMetaSubscription &&
      this.vimeoVideoMetaSubscription.unsubscribe();
    this.vimeoVideoMetaSubscription = this.materialService
      .getVimeoMeta(id)
      .subscribe((res) => {
        if (res) {
          const pictures = res.pictures.sizes;
          if (pictures && pictures.length) {
            pictures.some((e) => {
              if (e.width === 640) {
                this.video.thumbnail = e.link;
                return true;
              }
            });
          }
          this.video.duration = res['duration'] * 1000;
          this.video.title = res['name'];
          this.video.type = 'vimeo';
          this.uploadVideo();
        }
      });
  }

  YTDurationToSeconds(duration): any {
    let a = duration.match(/\d+/g);

    if (
      duration.indexOf('M') >= 0 &&
      duration.indexOf('H') == -1 &&
      duration.indexOf('S') == -1
    ) {
      a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
      a = [a[0], 0, a[1]];
    }
    if (
      duration.indexOf('H') >= 0 &&
      duration.indexOf('M') == -1 &&
      duration.indexOf('S') == -1
    ) {
      a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
      duration = duration + parseInt(a[0]) * 3600;
      duration = duration + parseInt(a[1]) * 60;
      duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
      duration = duration + parseInt(a[0]) * 60;
      duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
      duration = duration + parseInt(a[0]);
    }
    return duration;
  }

  activeFileZone(evt = null): void {
    evt && evt.preventDefault();
    this.overFile = true;
  }
  disableFileZone(evt = null): void {
    evt && evt.preventDefault();
    this.overFile = false;
  }
}

export class FileUploaderCustom extends FileUploader {
  constructor(options: FileUploaderOptions) {
    super(options);
  }

  uploadAllFiles(): void {
    const xhr = new XMLHttpRequest();
    const sendable = new FormData();
    const fakeitem: FileItem = null;
    this.onBuildItemForm(fakeitem, sendable);

    for (const item of this.queue) {
      item.isReady = true;
      item.isUploading = true;
      item.isUploaded = false;
      item.isSuccess = false;
      item.isCancel = false;
      item.isError = false;
      item.progress = 0;

      if (typeof item._file.size !== 'number') {
        throw new TypeError('The file specified is no longer valid');
      }
      sendable.append(this.options.itemAlias, item._file, item.file.name);
    }

    if (this.options.additionalParameter !== undefined) {
      Object.keys(this.options.additionalParameter).forEach((key) => {
        sendable.append(key, this.options.additionalParameter[key]);
      });
    }

    xhr.onload = () => {
      const gist =
        (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304
          ? 'Success'
          : 'Error';
      const method = 'on' + gist + 'Item';
      this[method](fakeitem, xhr.response, xhr.status, null);
    };
    xhr.onerror = () => {
      this.onErrorItem(fakeitem, null, xhr.status, null);
    };

    xhr.onabort = () => {
      this.onErrorItem(fakeitem, null, xhr.status, null);
    };

    xhr.upload.onprogress = (event) => {
      const progress = Math.round(
        event.lengthComputable ? (event.loaded * 100) / event.total : 0
      );
      this.progress = progress;
    };

    xhr.open('POST', this.options.url, true);
    xhr.withCredentials = false;
    if (this.options.headers) {
      for (let _i = 0, _a = this.options.headers; _i < _a.length; _i++) {
        const header = _a[_i];
        xhr.setRequestHeader(header.name, header.value);
      }
    }
    if (this.authToken) {
      xhr.setRequestHeader(this.authTokenHeader, this.authToken);
    }
    xhr.send(sendable);
  }

  clearQueue = () => {
    while (this.queue.length) {
      this.queue[0].remove();
    }
    this.progress = 0;
  };
}
