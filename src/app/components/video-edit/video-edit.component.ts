import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { Material } from 'src/app/models/material.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-edit',
  templateUrl: './video-edit.component.html',
  styleUrls: ['./video-edit.component.scss']
})
export class VideoEditComponent implements OnInit, OnDestroy {
  submitted = false;
  video: Material = new Material();
  saving = false;
  thumbnailLoading = false;

  editedVideos = [];
  garbageSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<VideoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private userService: UserService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.video = { ...this.data.material };
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (_garbage) => {
        this.editedVideos = _garbage.edited_video || [];
      }
    );
    console.log('video', this.video);
  }

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
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
      this.materialService
        .updateAdminVideo(this.video['_id'], video)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'video';
            this.materialService.create$(newMaterial);
            this.editedVideos.push(this.video._id);
            this.userService.updateGarbageImpl({
              edited_video: this.editedVideos
            });
            this.materialService.delete$([this.video._id]);
            this.toast.success('Video material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      this.materialService
        .updateVideo(this.video['_id'], video)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            this.toast.success('Video material successfully edited.');
            this.materialService.update$(this.video['_id'], this.video);
            this.dialogRef.close();
          }
        });
    }
  }

  duplicate(): void {
    let video;
    if (this.video.role == 'admin') {
      this.saving = true;
      const video = {};
      const keys = ['title', 'thumbnail', 'description', 'site_image'];
      keys.forEach((e) => {
        if (this.video[e] != this.data.material[e]) {
          video[e] = this.video[e];
        }
      });
      this.materialService
        .updateAdminVideo(this.video['_id'], video)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'video';
            this.materialService.create$(newMaterial);
            this.editedVideos.push(this.video._id);
            this.userService.updateGarbageImpl({
              edited_video: this.editedVideos
            });
            this.materialService.delete$([this.video._id]);
            this.toast.success('Video material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      const newVideo = { ...this.video };
      newVideo['shared_video'] = this.video._id;
      delete newVideo['_id'];
      this.saving = true;
      this.materialService.createVideo(newVideo).subscribe((res) => {
        this.saving = false;
        if (res['data']) {
          this.toast.success('Video material successfully duplicated.');
          const newMaterial = new Material().deserialize(res['data']);
          newMaterial.material_type = 'video';
          this.materialService.create$(newMaterial);
          this.materialService.update$(this.video._id, {
            has_shared: true,
            shared_video: newMaterial._id
          });
          this.dialogRef.close();
        }
      });
    }
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
}
