import {
  Component,
  Inject,
  OnInit,
  ValueProvider,
  ViewChild
} from '@angular/core';
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
  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<ImageEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: ToastrService,
    private materialService: MaterialService,
    private helperService: HelperService,
    private fileService: FileService
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
