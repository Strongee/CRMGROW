import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatesService } from 'src/app/services/templates.service';
import { FileService } from '../../services/file.service';
import { QuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit, OnDestroy {
  template = {
    title: '',
    subject: '',
    content: '',
    type: 'email'
  };
  isNew = true;
  type = true;
  emailType = 'checked';
  textType = '';
  typeFlag = true;
  role = '';
  id = '';

  loadSubcription: Subscription;
  saveSubscription: Subscription;

  isLoading = false;
  isSaving = false;

  submitted = false;

  subjectCursorStart = 0;
  subjectCursorEnd = 0;
  subject = '';
  config = QuillEditor;
  quillEditorRef;

  smsContentCursorStart = 0;
  smsContentCursorEnd = 0;
  smsContent = '';
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private route: ActivatedRoute,
    private templatesService: TemplatesService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    if (id) {
      this.isNew = false;
      this.loadData(id);
    }
    window['confirmReload'] = true;
  }

  ngOnDestroy(): void {
    window['confirmReload'] = false;
  }

  changeType(type): void {
    if (type === 'email') {
      this.emailType = 'checked';
      this.textType = '';
    } else {
      this.textType = 'checked';
      this.emailType = '';
    }
    this.type = type === 'email' ? true : false;
  }

  saveTemplate(): void {
    if (this.type) {
      this.template.subject = this.subject;
    } else {
      this.template.content = this.smsContent;
    }
    if (!this.id) {
      const template = { ...this.template, type: this.type ? 'email' : 'text' };
      this.isSaving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.templatesService.create(template).subscribe(
        (res) => {
          this.router.navigate(['/templates']);
          this.isSaving = false;
        },
        (err) => {
          this.isSaving = false;
        }
      );
    } else {
      const template = { ...this.template, type: this.type ? 'email' : 'text' };
      this.isSaving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.templatesService
        .update(this.id, template)
        .subscribe(
          (res) => {
            this.router.navigate(['/templates']);
            this.isSaving = false;
          },
          (err) => {
            this.isSaving = false;
          }
        );
    }
  }

  loadData(id): void {
    this.isLoading = true;
    this.loadSubcription && this.loadSubcription.unsubscribe();
    this.loadSubcription = this.templatesService.read(id).subscribe(
      (res) => {
        console.log("load template ===============>", res);
        this.id = id;
        this.isLoading = false;
        this.template.title = res.title;
        this.template.subject = res.subject;
        this.template.content = res.content;
        this.role = res.role;
        this.type = res.type === 'email';
        if (res.type === 'email') {
          this.emailType = 'checked';
          this.textType = '';
        } else {
          this.textType = 'checked';
          this.emailType = '';
        }
        if (this.type) {
          this.subject = this.template.subject;
        } else {
          this.smsContent = this.template.content;
        }
        this.typeFlag = false;
      },
      (err) => (this.isLoading = false)
    );
  }

  /**=======================================================
   *
   * Subject Field
   *
   ========================================================*/
  /**
   *
   * @param field : Input text field of the subject
   */
  getSubjectCursorPost(field): void {
    this.setFocusField('subject');
    if (field.selectionStart || field.selectionStart === '0') {
      this.subjectCursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      this.subjectCursorEnd = field.selectionEnd;
    }
  }
  insertSubjectValue(value): void {
    this.subject =
      this.subject.substr(0, this.subjectCursorStart) +
      value +
      this.subject.substr(
        this.subjectCursorEnd,
        this.subject.length - this.subjectCursorEnd
      );
    this.subjectCursorStart = this.subjectCursorStart + value.length;
    this.subjectCursorEnd = this.subjectCursorStart;
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }
  insertEmailContentValue(value): void {
    // const range = this.quillEditorRef.getSelection();
    // const el = `<span>${value}</span>`
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, el);
    this.emailEditor.quillEditor.focus();
    const range = this.emailEditor.quillEditor.getSelection();
    if (!range) {
      return;
    }
    this.emailEditor.quillEditor.insertText(range.index, value, 'user');
    this.emailEditor.quillEditor.setSelection(
      range.index + value.length,
      0,
      'user'
    );
  }
  insertValue(value): void {
    if (this.focusEditor === 'subject') {
      this.insertSubjectValue(value);
    } else if (this.focusEditor === 'content-email') {
      this.insertEmailContentValue(value);
    } else if (this.focusEditor === 'content-text') {
      this.insertSmsContentValue(value);
    }
  }
  getSmsContentCursor(field): void {
    this.setFocusField('content-text');
    if (field.selectionStart || field.selectionStart === '0') {
      this.smsContentCursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      this.smsContentCursorEnd = field.selectionEnd;
    }
  }

  insertSmsContentValue(value): void {
    this.smsContent =
      this.smsContent.substr(0, this.smsContentCursorStart) +
      value +
      this.smsContent.substr(
        this.smsContentCursorEnd,
        this.smsContent.length - this.smsContentCursorEnd
      );
    this.smsContentCursorStart = this.smsContentCursorStart + value.length;
    this.smsContentCursorEnd = this.smsContentCursorStart;
    // field.focus();
  }

  initImageHandler = () => {
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
