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
import { Subscription } from 'rxjs';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-video-create',
  templateUrl: './video-create.component.html',
  styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent implements OnInit {
  submitted = false;
  isStep1 = true;
  isActive1 = true;
  isStep2 = false;
  isActive2 = false;
  isStep3 = false;
  isActive3 = false;
  isStep4 = false;
  isActive4 = false;
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  video = {
    link: '',
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
    private helperService: HelperService
  ) {}

  ngOnInit(): void {}

  uploadVideo(): void {
    this.isStep1 = false;
    this.isStep2 = true;
    this.isActive2 = true;
  }

  saveDetail(): void {
    this.isStep2 = false;
    this.isStep3 = true;
    this.isActive3 = true;
    if (this.customTitle) {
      this.video.title = this.customTitle;
    }
  }

  backUpload(): void {
    this.isStep1 = true;
    this.isStep2 = false;
    this.isActive2 = false;
    this.videoType = '';
    this.video = {
      link: '',
      title: 'Introduction to eXp Realty',
      duration: 0,
      thumbnail: '',
      description: ''
    };
    this.clearUploader();
  }

  selectTheme(): void {
    this.isStep3 = false;
    this.isStep4 = true;
    this.isActive4 = true;
  }

  setVideoTheme(theme) {
    this.selectedTheme = theme;
  }

  backDetail(): void {
    this.isStep2 = true;
    this.isStep3 = false;
    this.isActive3 = false;
  }

  backSelectTheme(): void {
    this.isStep3 = true;
    this.isStep4 = false;
    this.isActive4 = false;
  }

  finishUpload(): void {}

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

  clearUploader(): void {
    this.uploader.cancelAll();
    this.uploader.clearQueue();
  }

  checkVideoUrl(): void {
    if (this.video.link.toLowerCase().indexOf('youtube.com') > -1) {
      this.getYoutubeId();
      if (this.loadedData == true) {
        this.videoType = 'web';
        this.uploadVideo();
      }
    }
    if (this.video.link.toLowerCase().indexOf('vimeo.com') > -1) {
      this.getVimeoId();
      if (this.loadedData == true) {
        this.videoType = 'web';
        this.uploadVideo();
      }
    }
  }

  getYoutubeId() {
    if (this.video.link.toLowerCase().indexOf('youtube.com/watch') !== -1) {
      const matches = this.video.link.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getMetaFromYoutube();
        return;
      }
    } else if (
      this.video.link.toLowerCase().indexOf('youtube.com/embed') !== -1
    ) {
      const matches = this.video.link.match(/embed\/([a-zA-Z0-9\-_]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getMetaFromYoutube();
        return;
      }
    } else if (this.video.link.toLowerCase().indexOf('youtu.be/') !== -1) {
      const matches = this.video.link.match(/youtu.be\/([a-zA-Z0-9\-_]+)/);
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
    if (this.video.link.toLowerCase().indexOf('vimeo.com/video') !== -1) {
      const matches = this.video.link.match(/video\/([0-9]+)/);
      if (matches) {
        this.urlChecked = true;
        this.videoId = matches[1];
        this.getThumbnailFromVimeo();
        return;
      }
    } else if (this.video.link.toLowerCase().indexOf('vimeo.com/') !== -1) {
      const matches = this.video.link.match(/vimeo.com\/([0-9]+)/);
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
