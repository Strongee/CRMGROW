import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from 'src/app/services/file.service';
import { QuillEditor } from '../../constants/variable.constants';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
// import ImageResize from 'quill-image-resize-module';
// Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-pdf-edit',
  templateUrl: './pdf-edit.component.html',
  styleUrls: ['./pdf-edit.component.scss']
})
export class PdfEditComponent implements OnInit {
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
  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<PdfEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.pdf = { ...this.data.material };
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
      this.materialService.updateAdminPdf(this.pdf['_id'], pdf).subscribe(
        (res) => {
          this.saving = false;
          this.dialogRef.close(res);
        },
        (err) => {
          this.saving = false;
        }
      );
    } else {
      this.materialService.updatePdf(this.pdf['_id'], pdf).subscribe(
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
    let pdf;
    if (this.pdf.role == 'admin') {
      pdf = {
        url: this.pdf.url,
        title: this.pdf.title,
        preview: this.pdf.preview,
        description: this.pdf.description,
        default_edited: true,
        default_pdf: this.pdf._id
      };
    } else {
      pdf = {
        url: this.pdf.url,
        title: this.pdf.title,
        preview: this.pdf.preview,
        description: this.pdf.description,
        has_shared: true,
        shared_pdf: this.pdf._id
      };
    }
    this.materialService.createPdf(pdf).subscribe((res) => {
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
        this.fileService.attachImage(file).then((res) => {
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
