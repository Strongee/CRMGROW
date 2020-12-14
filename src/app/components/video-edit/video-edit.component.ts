import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from 'src/app/services/file.service';
import { QuillEditor } from '../../constants/variable.constants';
import ImageResize from 'quill-image-resize-module';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-video-edit',
  templateUrl: './video-edit.component.html',
  styleUrls: ['./video-edit.component.scss']
})
export class VideoEditComponent implements OnInit {
  submitted = false;
  video = {
    _id: '',
    url: '',
    duration: '',
    thumbnail: '',
    title: '',
    description: '',
    role: ''
  };
  saving = false;
  thumbnailLoading = false;
  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<VideoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.video = { ...this.data.material };
  }

  update(): void {
    this.saving = true;
    const video = {};
    const keys = ['title', 'thumbnail', 'description', 'site_image'];
    keys.forEach((e) => {
      if (this.video[e] != this.data.material[e]) {
        video[e] = this.video[e];
      }
    });
    if (this.video['role'] === 'admin') {
      this.materialService.updateAdminVideo(this.video['_id'], video).subscribe(
        (res) => {
          this.saving = false;
          this.dialogRef.close(res);
        },
        (err) => {
          this.saving = false;
        }
      );
    } else {
      this.materialService.updateVideo(this.video['_id'], video).subscribe(
        (res) => {
          this.saving = false;
          this.dialogRef.close(res);
        },
        (err) => {
          this.saving = false;
        }
      );
    }
  }

  duplicate(): void {
    this.saving = true;
    let video;
    if (this.video.role == 'admin') {
      video = {
        url: this.video.url,
        title: this.video.title,
        duration: this.video.duration,
        thumbnail: this.video.thumbnail,
        description: this.video.description,
        default_edited: true,
        default_video: this.video._id
      };
    } else {
      video = {
        url: this.video.url,
        title: this.video.title,
        duration: this.video.duration,
        thumbnail: this.video.thumbnail,
        description: this.video.description,
        has_shared: true,
        shared_video: this.video._id
      };
    }
    this.materialService.createVideo(video).subscribe((res) => {
      if (res['data']) {
        this.saving = false;
        this.dialogRef.close(res['data']);
      }
    });
  }

  openPreviewDialog(): void {
    this.helperService
      .promptForImage()
      .then((imageFile) => {
        this.thumbnailLoading = true;
        this.helperService
          .generateImageThumbnail(imageFile)
          .then((thumbnail) => {
            this.helperService
              .generateImageThumbnail(imageFile, 'video_play')
              .then((image) => {
                this.thumbnailLoading = false;
                this.video['thumbnail'] = thumbnail;
                this.video['site_image'] = image;
              })
              .catch((err) => {
                this.thumbnailLoading = false;
                this.video['thumbnail'] = thumbnail;
              });
          })
          .catch(() => {
            this.thumbnailLoading = false;
            this.toast.error("Can't Load this image");
          });
      })
      .catch(() => {
        this.toast.error("Can't read this image");
      });
  }

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }

  initImageHandler = (): void => {
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
