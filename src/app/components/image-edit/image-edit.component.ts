import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Material } from 'src/app/models/material.model';

@Component({
  selector: 'app-image-edit',
  templateUrl: './image-edit.component.html',
  styleUrls: ['./image-edit.component.scss']
})
export class ImageEditComponent implements OnInit {
  submitted = false;
  image = {
    _id: '',
    url: [],
    role: '',
    preview: '',
    title: '',
    description: ''
  };
  saving = false;
  thumbnailLoading = false;

  editedImages = [];
  garbageSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<ImageEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private userService: UserService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.image = { ...this.data.material };
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (_garbage) => {
        this.editedImages = _garbage.edited_image || [];
      }
    );
  }

  update(): void {
    const image = {};
    const keys = ['title', 'preview', 'description'];
    keys.forEach((e) => {
      if (this.image[e] != this.data.material[e]) {
        image[e] = this.image[e];
      }
    });
    this.saving = true;
    if (this.image['role'] === 'admin') {
      this.materialService
        .updateAdminImage(this.image['_id'], image)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'image';
            this.materialService.create$(newMaterial);
            this.editedImages.push(this.image._id);
            this.userService.updateGarbageImpl({
              edited_image: this.editedImages
            });
            this.materialService.delete$([this.image._id]);
            this.toast.success('Image material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      this.materialService
        .updateImage(this.image['_id'], image)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            this.toast.success('Image material successfully edited.');
            this.materialService.update$(this.image['_id'], this.image);
            this.dialogRef.close();
          }
        });
    }
  }

  duplicate(): void {
    let image;
    if (this.image.role == 'admin') {
      this.saving = true;
      const image = {};
      const keys = ['title', 'preview', 'description'];
      keys.forEach((e) => {
        if (this.image[e] != this.data.material[e]) {
          image[e] = this.image[e];
        }
      });
      this.materialService
        .updateAdminImage(this.image['_id'], image)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'image';
            this.materialService.create$(newMaterial);
            this.editedImages.push(this.image._id);
            this.userService.updateGarbageImpl({
              edited_image: this.editedImages
            });
            this.materialService.delete$([this.image._id]);
            this.toast.success('Image material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      image = {
        url: this.image.url,
        title: this.image.title,
        preview: this.image.preview,
        description: this.image.description,
        shared_image: this.image._id
      };
      this.saving = true;
      this.materialService.createImage(image).subscribe((res) => {
        if (res['data']) {
          this.saving = false;
          this.toast.success('Image material successfully duplicated.');
          const newMaterial = new Material().deserialize(res['data']);
          newMaterial.material_type = 'image';
          this.materialService.create$(newMaterial);
          this.materialService.update$(this.image._id, {
            has_shared: true,
            shared_image: newMaterial._id
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
            this.thumbnailLoading = false;
            this.image['preview'] = thumbnail;
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
