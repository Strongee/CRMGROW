import { DOCUMENT } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { QuillEditor } from 'src/app/constants/variable.constants';
import { FileService } from 'src/app/services/file.service';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
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

  @Input() value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter();

  editorForm: FormControl = new FormControl();
  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;
  config = QuillEditor;
  quillEditorRef: { getModule: (arg0: string) => any; getSelection: () => any };

  constructor(
    private fileService: FileService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {}

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
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
}
