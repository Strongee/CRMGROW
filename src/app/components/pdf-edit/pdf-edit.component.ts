import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Material } from 'src/app/models/material.model';

@Component({
  selector: 'app-pdf-edit',
  templateUrl: './pdf-edit.component.html',
  styleUrls: ['./pdf-edit.component.scss']
})
export class PdfEditComponent implements OnInit, OnDestroy {
  submitted = false;
  pdf = {
    _id: '',
    url: '',
    preview: '',
    title: '',
    description: '',
    role: ''
  };
  saving = false;
  thumbnailLoading = false;

  editedPdfs = [];
  garbageSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<PdfEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private userService: UserService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.pdf = { ...this.data.material };
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (_garbage) => {
        this.editedPdfs = _garbage.edited_pdf || [];
      }
    );
  }

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
  }

  update(): void {
    this.saving = true;
    const pdf = {};
    const keys = ['title', 'preview', 'description'];
    keys.forEach((e) => {
      if (this.pdf[e] != this.data.material[e]) {
        pdf[e] = this.pdf[e];
      }
    });
    if (this.pdf['role'] === 'admin') {
      this.materialService
        .updateAdminPdf(this.pdf['_id'], pdf)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'pdf';
            this.materialService.create$(newMaterial);
            this.editedPdfs.push(this.pdf._id);
            this.userService.updateGarbageImpl({
              edited_pdf: this.editedPdfs
            });
            this.materialService.delete$([this.pdf._id]);
            this.toast.success('Pdf material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      this.materialService.updatePdf(this.pdf['_id'], pdf).subscribe((res) => {
        this.saving = false;
        if (res && res['status']) {
          this.toast.success('Pdf material successfully edited.');
          this.materialService.update$(this.pdf['_id'], this.pdf);
          this.dialogRef.close();
        }
      });
    }
  }

  duplicate(): void {
    this.saving = true;
    let pdf;
    if (this.pdf.role == 'admin') {
      const pdf = {};
      const keys = ['title', 'preview', 'description'];
      keys.forEach((e) => {
        if (this.pdf[e] != this.data.material[e]) {
          pdf[e] = this.pdf[e];
        }
      });
      this.materialService
        .updateAdminPdf(this.pdf['_id'], pdf)
        .subscribe((res) => {
          this.saving = false;
          if (res && res['status']) {
            const newMaterial = new Material().deserialize(res['data']);
            newMaterial.material_type = 'pdf';
            this.materialService.create$(newMaterial);
            this.editedPdfs.push(this.pdf._id);
            this.userService.updateGarbageImpl({
              edited_pdf: this.editedPdfs
            });
            this.materialService.delete$([this.pdf._id]);
            this.toast.success('Pdf material successfully duplicated.');
            this.dialogRef.close();
          }
        });
    } else {
      pdf = {
        url: this.pdf.url,
        title: this.pdf.title,
        preview: this.pdf.preview,
        description: this.pdf.description,
        shared_pdf: this.pdf._id
      };
    }
    this.materialService.createPdf(pdf).subscribe((res) => {
      this.saving = false;
      if (res['data']) {
        this.toast.success('Pdf material successfully duplicated.');
        const newMaterial = new Material().deserialize(res['data']);
        newMaterial.material_type = 'pdf';
        this.materialService.create$(newMaterial);
        this.materialService.update$(this.pdf._id, {
          has_shared: true,
          shared_pdf: newMaterial._id
        });
        this.dialogRef.close();
      }
    });
  }

  openPreviewDialog(): void {
    this.helperService
      .promptForImage()
      .then((imageFile) => {
        this.thumbnailLoading = true;
        this.helperService
          .generateImageThumbnail(imageFile, 'pdf')
          .then((thumbnail) => {
            this.thumbnailLoading = false;
            this.pdf['preview'] = thumbnail;
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
