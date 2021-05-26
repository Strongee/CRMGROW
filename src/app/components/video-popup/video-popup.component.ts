import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { Video } from 'src/app/models/video.model';
import { HelperService } from 'src/app/services/helper.service';
import { MaterialService } from 'src/app/services/material.service';

@Component({
  selector: 'app-video-popup',
  templateUrl: './video-popup.component.html',
  styleUrls: ['./video-popup.component.scss']
})
export class VideoPopupComponent implements OnInit {
  _id = '';
  loading = false;
  submitted = false;
  saving = false;
  thumbnailLoading = false;
  video: Video = new Video();
  loadSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<VideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService
  ) {
    if (this.data && this.data.id) {
      this._id = this.data.id;
      this.load();
    }
  }

  ngOnInit(): void {}

  load(): void {
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.materialService
      .getVideoById(this._id)
      .subscribe((res) => {
        this.loading = false;
        this.video = new Video().deserialize(res);
      });
  }

  save(): void {
    const videoId = this.video._id;
    const newVideo = { ...this.video };
    delete newVideo.created_at;
    delete newVideo['_v'];
    delete newVideo.user;
    delete newVideo._id;
    newVideo.title = this.video.title;
    newVideo.thumbnail = this.video.thumbnail;
    newVideo.site_image = this.video['site_image'];
    newVideo.description = this.video.description;
    newVideo.recording = true;
    this.saving = true;
    this.materialService
      .uploadVideoDetail(videoId, newVideo)
      .subscribe((res) => {
        if (res.status) {
          this.saving = false;
          this.toast.success('Video is updated successfully');
          this.dialogRef.close(res.data);
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
            this.video['thumbnail'] = thumbnail;
            this.video['custom_thumbnail'] = true;
            this.helperService
              .generateImageThumbnail(imageFile, 'video_play')
              .then((image) => {
                this.thumbnailLoading = false;
                this.video['site_image'] = image;
              })
              .catch((err) => {
                this.thumbnailLoading = false;
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
}
