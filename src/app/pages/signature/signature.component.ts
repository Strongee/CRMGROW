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
const BlockEmbed = Quill.import('blots/block/embed');
//Define a new blog type
class AppPanelEmbed extends BlockEmbed {
  static create(value) {
    const node = super.create(value);
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('width', '100%');
    //Set custom HTML
    node.innerHTML = this.transformValue(value);
    return node;
  }

  static transformValue(value) {
    let handleArr = value.split('\n');
    handleArr = handleArr.map((e) =>
      e.replace(/^[\s]+/, '').replace(/[\s]+$/, '')
    );
    return handleArr.join('');
  }

  //Returns the value of the node itself for undo operation
  static value(node) {
    return node.innerHTML;
  }
}
// blotName
AppPanelEmbed.blotName = 'AppPanelEmbed';
//The class name will be used to match the blot name
AppPanelEmbed.className = 'embed-innerApp';
//Label type customization
AppPanelEmbed.tagName = 'div';
Quill.register(AppPanelEmbed, true);

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  user: User = new User();
  templates = [
    { layout: 'img_text_hor', icon: 'i-signature-1' },
    { layout: 'text_img_hor', icon: 'i-signature-2' },
    { layout: 'text_img_ver', icon: 'i-signature-3' },
    { layout: 'img_text_ver', icon: 'i-signature-4' },
    { layout: 'custom', icon: 'i-signature-5' }
  ];
  currentTemplate = 'text_img_hor';
  submitted = false;
  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';
  saving = false;

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private userService: UserService,
    private fileService: FileService
  ) {
    this.userService.profile$.subscribe((profile) => {
      if (profile && profile._id) {
        this.user = profile;
        console.log('##', this.user);
      }
    });
  }

  ngOnInit(): void {}

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
    let signature;
    switch (this.currentTemplate) {
      case 'img_text_hor':
        signature = `
          <div class="d-flex">
            <div class="image">
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
            <div class="text ml-2">
              <div class="f-6">${this.user.user_name}</div>
              <div class="f-6">${this.user.company}</div>
              <div class="f-6">${this.user.email}</div>
              <div class="f-6">${this.user.phone.internationalNumber}</div>
            </div>
          </div>
        `;
        this.emailEditor.quillEditor.insertEmbed(0, 'AppPanelEmbed', signature);
        break;
      case 'text_img_hor':
        signature = `
          <div class="d-flex">
            <div class="text mr-2">
              <div class="f-6">${this.user.user_name}</div>
              <div class="f-6">${this.user.company}</div>
              <div class="f-6">${this.user.email}</div>
              <div class="f-6">${this.user.phone.internationalNumber}</div>
            </div>
            <div class="image">
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
          </div>
        `;
        this.emailEditor.quillEditor.insertEmbed(0, 'AppPanelEmbed', signature);
        break;
      case 'text_img_ver':
        signature = `
          <div class="d-block">
            <div class="text mb-2">
              <div class="f-6">${this.user.user_name}</div>
              <div class="f-6">${this.user.company}</div>
              <div class="f-6">${this.user.email}</div>
              <div class="f-6">${this.user.phone.internationalNumber}</div>
            </div>
            <div class="image">
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
          </div>
        `;
        this.emailEditor.quillEditor.insertEmbed(0, 'AppPanelEmbed', signature);
        break;
      case 'img_text_ver':
        signature = `
          <div class="d-block">
            <div class="image">
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
            <div class="text mt-2">
              <div class="f-6">${this.user.user_name}</div>
              <div class="f-6">${this.user.company}</div>
              <div class="f-6">${this.user.email}</div>
              <div class="f-6">${this.user.phone.internationalNumber}</div>
            </div>
          </div>
        `;
        this.emailEditor.quillEditor.insertEmbed(0, 'AppPanelEmbed', signature);
        break;
    }
  }

  update(): void {
    this.saving = true;
    this.userService.updateProfile(this.user).subscribe((data) => {
      this.userService.updateProfileImpl(data);
      this.saving = false;
    });
  }

  updateEditor(event: any): void {
    this.user.email_signature = event.html;
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
          this.insertImageToEditor(res['url']);
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
