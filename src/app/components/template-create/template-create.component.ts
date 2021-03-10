import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuillEditorComponent } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Template } from 'src/app/models/template.model';
import { FileService } from 'src/app/services/file.service';
import { TemplatesService } from 'src/app/services/templates.service';

@Component({
  selector: 'app-template-create',
  templateUrl: './template-create.component.html',
  styleUrls: ['./template-create.component.scss']
})
export class TemplateCreateComponent implements OnInit {
  template: Template = new Template();
  isSaving: boolean = false;
  saveSubscription: Subscription;

  placeholder: string = '';
  style: any = { height: '200px' };
  class = '';
  hasToken: boolean = false;
  required: boolean = false;

  @Input() value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  editorForm: FormControl = new FormControl();
  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;
  quillEditorRef;
  config = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }],
        ['link', 'image']
      ]
    },
    blotFormatter: {}
  };
  constructor(
    private fileService: FileService,
    public templateService: TemplatesService,
    @Inject(DOCUMENT) private document: Document,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {}

  setValue(value: string): void {
    if (value && this.quillEditorRef && this.quillEditorRef.clipboard) {
      const delta = this.quillEditorRef.clipboard.convert({ html: value });
      this.emailEditor.quillEditor.setContents(delta, 'user');
    }
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
    if (this.value) {
      this.setValue(this.value);
    }
  }

  initImageHandler = (): void => {
    const imageInput: HTMLInputElement = this.document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).then((res) => {
          this.insertImageToEditor(res['url']);
        });
      }
    });
    imageInput.click();
  };

  insertImageToEditor(url: string): void {
    const range = this.quillEditorRef.getSelection();
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }

  close(): void {
    this.onClose.emit(true);
  }

  saveTemplate(): void {
    this.template.content = this.value;
    this.isSaving = true;
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.saveSubscription = this.templateService
      .create(this.template)
      .subscribe((template) => {
        this.isSaving = false;
        if (template) {
          this.toast.show('', 'New template is created successfully.', {
            closeButton: true
          });
          this.templateService.create$(template);
          this.onClose.emit(true);
        }
      });
  }
}
