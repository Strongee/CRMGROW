import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { FileService } from '../../services/file.service';
import { QuillEditorComponent } from 'ngx-quill';
import { QuillEditor } from '../../constants/variable.constants';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  templates = [
    { layout: 'img_text_hor', icon: '' },
    { layout: 'text_img_hor', icon: '' },
    { layout: 'text_img_ver', icon: '' },
    { layout: 'img_text_ver', icon: '' }
  ];
  currentTemplate = '';
  signature = '';
  submitted = false;
  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private userService: UserService,
    private fileService: FileService
  ) {
    this.userService.profile.subscribe((profile) => {
      if (profile.email_signature == '') {
        this.signature = `
        <div>${profile.user_name}</div>
        <div>${profile.company}</div>
        <div>${profile.email}</div>
        <div>${profile.phone.internationalNumber}</div>
        <div><img src="${profile.picture_profile}"></div>
        `;
      } else {
        this.signature = profile.email_signature;
      }
    });
  }

  ngOnInit(): void {}

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
  }

  update(): void {
    console.log('###', this.signature);
  }

  getEditorInstance(editorInstance: any): void {
    const Block = Quill.import('blots/block');
    class DetailBlot extends Block {
      static create(url) {
        const node = super.create();
        node.setAttribute('class', 'detail');
        return node;
      }
    }
    DetailBlot.blotName = 'detail';
    DetailBlot.tagName = 'div';
    class ImageBlot extends Block {
      static create(url) {
        const node = super.create();
        node.setAttribute('class', 'image');
        return node;
      }
    }
    ImageBlot.blotName = 'image';
    ImageBlot.tagName = 'div';
    Quill.register(ImageBlot);
    Quill.register(DetailBlot);
    const quill = new Quill('#editor-container');
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
