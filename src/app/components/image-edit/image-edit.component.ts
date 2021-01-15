import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';

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
  focusedField = '';

  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<ImageEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.image = { ...this.data.material };
  }

  update(): void {
    this.saving = true;
    const image = {};
    const keys = ['title', 'preview', 'description'];
    keys.forEach((e) => {
      if (this.image[e] != this.data.material[e]) {
        image[e] = this.image[e];
      }
    });
    if (this.image['role'] === 'admin') {
      this.materialService.updateAdminImage(this.image['_id'], image).subscribe(
        (res) => {
          this.saving = false;
          this.dialogRef.close(res);
        },
        (err) => {
          this.saving = false;
        }
      );
    } else {
      this.materialService.updateImage(this.image['_id'], image).subscribe(
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
    let image;
    if (this.image.role == 'admin') {
      image = {
        url: this.image.url,
        title: this.image.title,
        preview: this.image.preview,
        description: this.image.description,
        default_edited: true,
        default_pdf: this.image._id
      };
    } else {
      image = {
        url: this.image.url,
        title: this.image.title,
        preview: this.image.preview,
        description: this.image.description,
        has_shared: true,
        shared_pdf: this.image._id
      };
    }
    this.materialService.createImage(image).subscribe((res) => {
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

  focusEditor(): void {
    this.focusedField = 'editor';
  }
}
