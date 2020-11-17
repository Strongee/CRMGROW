import { Component, OnInit, ViewChild } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import { FileUploader } from 'ng2-file-upload';
import { QuillEditor } from '../../constants/variable.constants';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { MaterialService } from '../../services/material.service';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
import { Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-video-create',
  templateUrl: './video-create.component.html',
  styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent implements OnInit {
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
  customTitle: '';

  quillEditorRef;
  config = QuillEditor;
  vimeoVideoMetaSubscription: Subscription;
  youtubeVideoMetaSubscription: Subscription;
  focusEditor = '';
  urlChecked = false;
  videoId = '';
  loadedData = false;
  videoType = '';
  fileOver = false;

  uploading = false;
  uploadTimer: any;
  uploadTimeSubscriber: any;
  uploaded_time = 0;

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

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;
  @ViewChild('videoFile') fileInput;
  uploader: FileUploader = new FileUploader({
    url: environment.api + 'video',
    authToken: this.userService.getToken(),
    itemAlias: 'video'
  });

  constructor(
    private fileService: FileService,
    private materialService: MaterialService,
    private userService: UserService,
    private toast: ToastrService,
    private helperService: HelperService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.uploader.queue.length > 1) {
        this.uploader.queue.splice(0, 1);
      }
    };
    this.uploader.onCompleteItem = (
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
          this.updateVideo(video);
        } else {
          this.toast.error('Video uploading is failed.');
        }
      } catch (e) {
        console.log('Error', e);
        this.toast.error('Video uploading is failed. Response error');
      }
    };
  }

  ngOnDestroy(): void {
    this.vimeoVideoMetaSubscription &&
      this.vimeoVideoMetaSubscription.unsubscribe();
    this.youtubeVideoMetaSubscription &&
      this.youtubeVideoMetaSubscription.unsubscribe();
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
  }

  selectTheme(): void {
    this.isStep++;
    this.isActive++;
  }

  setVideoTheme(theme) {
    this.selectedTheme = theme;
  }

  backDetail(): void {
    this.isStep--;
    this.isActive--;
  }

  backSelectTheme(): void {
    this.isStep--;
    this.isActive--;
  }

  finishUpload(): void {
    if (this.videoType == 'web') {
      this.uploading = true;
      if (!this.video.duration) {
        this.toast.error("Can't read video's detail information.");
        return;
      }
      this.materialService
        .createVideo({
          ...this.video,
          duration: this.video.duration * 1000
        })
        .subscribe((res) => {
          this.uploading = false;
          this.toast.success('Video is uploaded successfully.');
          this.router.navigate(['/materials']);
        });
    } else {
      this.uploading = true;
      this.uploader.uploadAll();
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
    newVideo.duration = this.video.duration * 1000;
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

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  fileDrop(evt) {
    this.fileOver = evt;
    if (this.fileOver == false) {
      const file = this.uploader.queue[0]._file;
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
  }

  fileChange(evt) {
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
  }

  openPreviewDialog(): void {
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
  }

  checkVideoUrl(): void {
    this.videoType = 'web';
    this.uploadVideo();
    if (this.video.url.toLowerCase().indexOf('youtube.com') > -1) {
      this.getYoutubeId();
    }
    if (this.video.url.toLowerCase().indexOf('vimeo.com') > -1) {
      this.getVimeoId();
    }
  }

  getYoutubeId() {
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

  getVimeoId() {
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

  getMetaFromYoutube() {
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
            this.video.duration = this.YTDurationToSeconds(duration);
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
          }
        },
        (err) => {
          this.video.thumbnail =
            'https://img.youtube.com/vi/' + this.videoId + '/0.jpg';
        }
      );
  }

  getThumbnailFromVimeo() {
    this.vimeoVideoMetaSubscription = this.materialService
      .getVimeoMeta(this.videoId)
      .subscribe((res) => {
        if (res) {
          this.video.thumbnail = res[0]['thumbnail_large'];
          this.video.duration = res[0]['duration'];
          this.loadedData = true;
        }
      });
  }

  YTDurationToSeconds(duration) {
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

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }

  initImageHandler = () => {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).subscribe((res) => {
          this.insertImageToEditor(res.url);
        });
      }
    });
    imageInput.click();
  };

  insertImageToEditor(url): void {
    const range = this.quillEditorRef.getSelection();
    // const img = `<img src="${url}" alt="attached-image-${new Date().toISOString()}"/>`;
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, img);
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }
  setFocusField(editorType): void {
    this.focusEditor = editorType;
  }
}
