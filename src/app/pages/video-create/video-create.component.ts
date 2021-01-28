import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUploader, FileItem, FileUploaderOptions } from 'ng2-file-upload';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { MaterialService } from '../../services/material.service';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../services/theme.service';
import canvas from 'html2canvas';
import { environment } from 'src/environments/environment';
import { Garbage } from 'src/app/models/garbage.model';
import { TabItem } from 'src/app/utils/data.types';
import { Subscription, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';

@Component({
  selector: 'app-video-create',
  templateUrl: './video-create.component.html',
  styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent implements OnInit {
  garbage: Garbage = new Garbage();
  submitted = false;
  isStep = 1;
  isActive = 1;
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  video = {
    url: '',
    title: 'Introduction to eXp Realty',
    duration: 0,
    thumbnail: '',
    description: ''
  };
  pdf = {
    title: '',
    description: '',
    thumbnail: ''
  };
  image = {
    _id: '',
    title: '',
    description: '',
    preview: ''
  };
  file;
  thumbnail_loading = false;
  upload_thumbnail;
  customTitle: '';
  mode = '';

  tabs: TabItem[] = [
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'video' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdf' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'image' }
  ];
  selectedTab: TabItem = this.tabs[0];

  vimeoVideoMetaSubscription: Subscription;
  youtubeVideoMetaSubscription: Subscription;
  urlChecked = false;
  videoId = '';
  loadedData = false;
  videoType = '';
  fileOver = false;

  uploading = false;
  uploadTimer: any;
  uploadTimeSubscriber: any;
  uploaded_time = 0;
  themeSaving = false;
  focusedField = '';

  themes = [
    {
      name: 'Default Theme',
      thumbnail: environment.server + '/assets/images/theme/default.jpg',
      id: 'default'
    },
    {
      name: 'Theme 1',
      thumbnail: environment.server + '/assets/images/theme/theme1.jpg',
      id: 'theme1'
    },
    {
      name: 'Theme 2',
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

  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;
  @ViewChild('videoFile') videoFileInput;
  @ViewChild('pdfFile') pdfFileInput;
  @ViewChild('imageFile') imageFileInput;
  videoUploader: FileUploader = new FileUploader({
    url: environment.api + 'video',
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

  constructor(
    private fileService: FileService,
    private materialService: MaterialService,
    private userService: UserService,
    private toast: ToastrService,
    private helperService: HelperService,
    private themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
      this.selectedTheme = this.themes.filter(
        (theme) => theme.id == this.garbage.material_theme
      )[0];
    });
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.params['mode'];
    this.tabs.forEach((tab) => {
      if (tab.id == this.mode) {
        this.changeTab(tab);
      }
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
      window['confirmReload'] = false;
      try {
        response = JSON.parse(response);
        if (response['status']) {
          const video = { ...response['data'] };
          console.log('###', video);
          this.updateVideo(video);
        } else {
          this.toast.error('Video uploading is failed.');
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
        response = JSON.parse(response);
        if (response['status']) {
          const pdf = { ...response['data'] };
          this.updatePdf(pdf);
        } else {
          this.uploading = false;
          this.toast.error('Pdf uploading is failed.');
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
          this.image.preview = this.upload_thumbnail;
          response = JSON.parse(response);
          this.image._id = response['data']._id;
          this.materialService
            .updateImage(this.image._id, this.image)
            .subscribe(
              (res) => {
                if (res['status']) {
                  this.toast.success('Image is uploaded successfully.');
                  this.router.navigate(['/materials']);
                } else {
                  this.toast.success(
                    'Image is uploaded. But the Image information is not saved.'
                  );
                  this.router.navigate(['/materials']);
                }
              },
              (err) => {
                this.toast.success(
                  'Image is uploaded. But the Image information is not saved.'
                );
                this.router.navigate(['/materials']);
              }
            );
        } else {
          this.toast.error(
            'Image is uploaded. But the Image information is not saved.'
          );
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
    this.selectedTab = tab;
    this.isStep = 1;
    this.isActive = 1;
    this.videoUploader.cancelAll();
    this.videoUploader.clearQueue();
    this.pdfUploader.cancelAll();
    this.pdfUploader.clearQueue();
    this.imageUploader.cancelAll();
    this.imageUploader.clearQueue();
    this.upload_thumbnail = '';
  }

  uploadVideo(): void {
    this.isStep++;
    this.isActive++;
  }

  saveDetail(): void {
    this.isStep++;
    this.isActive++;
    if (this.customTitle) {
      this.video.title = this.customTitle;
    }
  }

  backUpload(): void {
    this.isStep--;
    this.isActive--;
    this.videoType = '';
    this.video = {
      url: '',
      title: 'Introduction to eXp Realty',
      duration: 0,
      thumbnail: '',
      description: ''
    };
    this.urlChecked = false;
    this.loadedData = false;
    this.videoUploader.cancelAll();
    this.videoUploader.clearQueue();
    this.pdfUploader.cancelAll();
    this.pdfUploader.clearQueue();
    this.imageUploader.cancelAll();
    this.imageUploader.clearQueue();
  }

  selectTheme(): void {
    this.isStep++;
    this.isActive++;
  }

  setTheme(theme: any): void {
    this.themeSaving = true;
    this.selectedTheme = theme;
    this.garbage.material_theme = this.selectedTheme.id;
    this.userService.updateGarbage(this.garbage).subscribe(
      () => {
        this.themeSaving = false;
        this.userService.updateGarbageImpl(this.garbage);
      },
      () => {
        this.themeSaving = false;
      }
    );
  }

  backDetail(): void {
    this.isStep--;
    this.isActive--;
  }

  backSelectTheme(): void {
    this.isStep--;
    this.isActive--;
  }

  finishUpload(type: string): void {
    switch (type) {
      case 'video':
        if (this.videoType == 'web') {
          this.uploading = true;
          if (!this.video.duration) {
            this.toast.error("Can't read video's detail information.");
            return;
          }
          this.materialService
            .createVideo({
              ...this.video,
              duration: this.video.duration
            })
            .subscribe((res) => {
              this.uploading = false;
              this.toast.success('Video is uploaded successfully.');
              this.router.navigate(['/materials']);
            });
        } else {
          this.uploading = true;
          this.videoUploader.uploadAll();
          // Window Reload Confirm
          window['confirmReload'] = true;
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
        break;
      case 'pdf':
        this.uploading = true;
        this.pdfUploader.uploadAll();
        this.uploadTimer = timer(0, 500);
        this.uploadTimeSubscriber = this.uploadTimer.subscribe((timer) => {
          if (this.uploaded_time < 60) {
            this.uploaded_time += 0.5;
          } else if (this.uploaded_time >= 60 && this.uploaded_time <= 80) {
            this.uploaded_time += 0.2;
          } else if (this.uploaded_time > 80 && this.uploaded_time <= 95) {
            this.uploaded_time += 0.075;
          }
        });
        break;
      case 'image':
        this.uploading = true;
        this.imageUploader.uploadAllFiles();
        this.uploadTimer = timer(0, 500);
        this.uploadTimeSubscriber = this.uploadTimer.subscribe((timer) => {
          if (this.uploaded_time < 60) {
            this.uploaded_time += 0.5;
          } else if (this.uploaded_time >= 60 && this.uploaded_time <= 80) {
            this.uploaded_time += 0.2;
          } else if (this.uploaded_time > 80 && this.uploaded_time <= 95) {
            this.uploaded_time += 0.075;
          }
        });
        break;
    }
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
    this.materialService.uploadVideoDetail(videoId, newVideo).subscribe(
      (res) => {
        this.uploading = false;
        this.toast.success('Video is uploaded successfully.');
        this.router.navigate(['/materials']);
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Video is uploaded. But the video information is not saved.'
        );
        this.router.navigate(['/materials']);
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
    newPdf.preview = this.upload_thumbnail;
    this.pdf['url'] = pdf.url;
    this.materialService.updatePdf(pdfId, newPdf).subscribe(
      (res) => {
        this.uploading = false;
        this.toast.success('Pdf is uploaded successfully.');
        this.router.navigate(['/materials']);
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Pdf is uploaded. But the Pdf information is not saved.'
        );
        this.router.navigate(['/materials']);
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
        this.fileOver = evt;
        if (this.fileOver == false) {
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
              this.videoType = 'local';
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
        this.fileOver = evt;
        if (this.fileOver == false) {
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
        this.fileOver = evt;
        if (this.fileOver == false) {
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
              this.thumbnail_loading = true;
              this.helperService
                .generateImageThumbnail(file, 'image')
                .then((thumbnail) => {
                  this.thumbnail_loading = false;
                  this.upload_thumbnail = thumbnail;
                  this.uploadVideo();
                })
                .catch(() => {
                  this.thumbnail_loading = false;
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
                this.video['site_image'] = image;
              })
              .catch((err) => {
                console.log('Video Meta Image Load', err);
              });
            this.videoType = 'local';
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
          this.thumbnail_loading = true;
          this.helperService
            .generateImageThumbnail(file, 'image')
            .then((thumbnail) => {
              this.thumbnail_loading = false;
              this.upload_thumbnail = thumbnail;
              this.uploadVideo();
            })
            .catch(() => {
              this.thumbnail_loading = false;
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
                this.video['custom_thumbnail'] = true;
                this.helperService
                  .generateImageThumbnail(imageFile, 'video_play')
                  .then((image) => {
                    this.video['site_image'] = image;
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
            this.thumbnail_loading = true;
            this.helperService
              .generateImageThumbnail(imageFile, 'pdf')
              .then((thumbnail) => {
                this.thumbnail_loading = false;
                this.upload_thumbnail = thumbnail;
              })
              .catch(() => {
                this.thumbnail_loading = false;
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
            this.thumbnail_loading = true;
            this.helperService
              .generateImageThumbnail(imageFile, 'image')
              .then((thumbnail) => {
                this.thumbnail_loading = false;
                this.upload_thumbnail = thumbnail;
              })
              .catch(() => {
                this.thumbnail_loading = false;
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
          this.upload_thumbnail = data;
          this.thumbnail_loading = false;
        })
        .catch((err) => {
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
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getMetaFromYoutube();
        return;
      }
    } else if (
      this.video.url.toLowerCase().indexOf('youtube.com/embed') !== -1
    ) {
      const matches = this.video.url.match(/embed\/([a-zA-Z0-9\-_]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getMetaFromYoutube();
        return;
      }
    } else if (this.video.url.toLowerCase().indexOf('youtu.be/') !== -1) {
      const matches = this.video.url.match(/youtu.be\/([a-zA-Z0-9\-_]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getMetaFromYoutube();
        return;
      }
    }
    this.urlChecked = false;
    return;
  }

  getVimeoId(): any {
    if (this.video.url.toLowerCase().indexOf('vimeo.com/video') !== -1) {
      const matches = this.video.url.match(/video\/([0-9]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getThumbnailFromVimeo();
        return;
      }
    } else if (this.video.url.toLowerCase().indexOf('vimeo.com/') !== -1) {
      const matches = this.video.url.match(/vimeo.com\/([0-9]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getThumbnailFromVimeo();
        return;
      }
    }
  }

  getMetaFromYoutube(): any {
    this.youtubeVideoMetaSubscription &&
      this.youtubeVideoMetaSubscription.unsubscribe();
    this.youtubeVideoMetaSubscription = this.materialService
      .getYoutubeMeta(this.videoId)
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
                'https://img.youtube.com/vi/' + this.videoId + '/0.jpg';
            }
          }
          if (res['items']) {
            this.loadedData = true;
            this.videoType = 'web';
            this.uploadVideo();
          }
        },
        (err) => {
          this.video.thumbnail =
            'https://img.youtube.com/vi/' + this.videoId + '/0.jpg';
        }
      );
  }

  getThumbnailFromVimeo(): any {
    this.vimeoVideoMetaSubscription = this.materialService
      .getVimeoMeta(this.videoId)
      .subscribe((res) => {
        if (res) {
          this.video.thumbnail = res[0]['thumbnail_large'];
          this.video.duration = res[0]['duration'] * 1000;
          this.loadedData = true;
          this.videoType = 'web';
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

  focusEditor(): void {
    this.focusedField = 'editor';
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
