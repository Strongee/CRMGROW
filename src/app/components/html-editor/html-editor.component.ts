import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from 'src/app/services/file.service';
import * as QuillNamespace from 'quill';
import { promptForFiles, loadBase64, ByteToSize } from 'src/app/helper';
import { TemplatesService } from 'src/app/services/templates.service';
import { Template } from 'src/app/models/template.model';
const Quill: any = QuillNamespace;
const Delta = Quill.import('delta');
// import ImageResize from 'quill-image-resize-module';
// Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent implements OnInit {
  @Input() placeholder: string = '';
  @Input() style: any = { height: '180px' };
  @Input() class = '';
  @Input() hasToken: boolean = false;
  @Input() required: boolean = false;
  @Input()
  public set hasAttachment(val: boolean) {
    if (val) {
      this.config.toolbar.container.unshift(['attachment']);
    }
  }
  @Input()
  public set hasTemplates(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['template']);
    }
  }

  @Input() value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() onFocus: EventEmitter<boolean> = new EventEmitter();
  @Output() attachmentChange: EventEmitter<any> = new EventEmitter();
  @Output() onInit: EventEmitter<boolean> = new EventEmitter();
  @Output() onChangeTemplate: EventEmitter<Template> = new EventEmitter();

  editorForm: FormControl = new FormControl();
  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;
  showTemplates: boolean = false;
  quillEditorRef;
  attachments = [];
  config = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }],
        ['link', 'image']
      ],
      handlers: {
        attachment: () => {
          promptForFiles().then((files) => {
            [].forEach.call(files, (file) => {
              loadBase64(file).then((base64) => {
                const attachment = {
                  filename: file.name,
                  type: file.type,
                  content: base64.substr(base64.indexOf(',') + 1),
                  size: ByteToSize(file.size)
                };
                this.attachments.unshift(attachment);
                this.attachmentChange.emit(this.attachments);
                this.cdr.detectChanges();
              });
            });
          });
        },
        template: () => {
          this.showTemplates = !this.showTemplates;
          this.cdr.detectChanges();
        }
      }
    },
    table: false,
    'better-table': {
      operationMenu: {
        items: {
          unmergeCells: {
            text: 'Another unmerge cells name'
          }
        },
        color: {
          colors: ['green', 'red', 'yellow', 'blue', 'white'],
          text: 'Background Colors:'
        }
      }
    },
    blotFormatter: {}
  };

  constructor(
    private fileService: FileService,
    public templateService: TemplatesService,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.templateService.loadAll(false);
  }

  ngOnInit(): void {}

  setValue(value: string): void {
    if (value && this.quillEditorRef && this.quillEditorRef.clipboard) {
      this.emailEditor.quillEditor.focus();
      const range = this.emailEditor.quillEditor.getSelection();
      let index = 0;
      if (range) {
        index = range.index;
      }
      const delta = this.quillEditorRef.clipboard.convert({
        html: value
      });
      this.emailEditor.quillEditor.updateContents(
        new Delta().retain(index).concat(delta),
        'user'
      );
      const length = this.emailEditor.quillEditor.getLength();
      this.emailEditor.quillEditor.setSelection(length, 0, 'user');
      // this.emailEditor.quillEditor.setContents(delta, 'user');
    }
  }

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
    if (this.value) {
      this.setValue(this.value);
    }
    this.onInit.emit();
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

  insertEmailContentValue(value: string): void {
    this.emailEditor.quillEditor.focus();
    const range = this.emailEditor.quillEditor.getSelection();
    this.emailEditor.quillEditor.insertText(range.index, value, 'user');
    this.emailEditor.quillEditor.setSelection(
      range.index + value.length,
      0,
      'user'
    );
  }

  onChangeValue(value: string): void {
    this.valueChange.emit(value);
  }

  insertMaterials(material: any): void {
    const range = this.quillEditorRef.getSelection();
    const length = this.emailEditor.quillEditor.getLength();
    if (range && range.index) {
      let selection = range.index;
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      selection += 1;
      this.emailEditor.quillEditor.insertText(
        selection,
        material.title,
        'bold',
        'user'
      );
      selection += material.title.length + 1;
      this.emailEditor.quillEditor.insertEmbed(
        selection,
        `materialLink`,
        { _id: material._id, preview: material.preview || material.thumbnail },
        'user'
      );
      selection += 1;
      this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
    } else {
      let selection = length;
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      selection += 1;
      this.emailEditor.quillEditor.insertText(
        length,
        material.title,
        'bold',
        'user'
      );
      selection += material.title.length + 1;
      this.emailEditor.quillEditor.insertEmbed(
        selection,
        `materialLink`,
        { _id: material._id, preview: material.preview || material.thumbnail },
        'user'
      );
      selection += 1;
      this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
    }
  }
  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
    this.cdr.detectChanges();
    this.attachmentChange.emit(this.attachments);
  }

  clearAttachments(): void {
    this.attachments = [];
    this.cdr.detectChanges();
    this.attachmentChange.emit(this.attachments);
  }

  onFocusEvt(): void {
    this.onFocus.emit();
  }

  closeTemplates(event: MouseEvent): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('ql-template')) {
      return;
    }
    this.showTemplates = false;
  }

  selectTemplate(template: Template): void {
    this.onChangeTemplate.emit(template);
    this.setValue(template.content + '<br>');
    this.showTemplates = false;
  }
}
// [{ font: [] }],
// [{ size: ['small', false, 'large', 'huge'] }],
// ['bold', 'italic', 'underline', 'strike'],
// [{ header: 1 }, { header: 2 }],
// [{ color: [] }, { background: [] }],
// [{ list: 'ordered' }, { list: 'bullet' }],
// [{ align: [] }],
// ['link', 'image']
