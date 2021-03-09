import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';

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
  focusedField = '';

  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<VideoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService
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
          if (res && res['status']) {
            this.saving = false;
            this.toast.success('Video material successfully edited.');
            this.dialogRef.close(res);
          }
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
        this.toast.success('Video material successfully duplicated.');
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

  focusEditor(): void {
    this.focusedField = 'editor';
  }
}
