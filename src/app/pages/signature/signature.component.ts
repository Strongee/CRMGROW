import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { FileService } from '../../services/file.service';
import { QuillEditorComponent } from 'ngx-quill';
import { QuillEditor } from '../../constants/variable.constants';
import * as QuillNamespace from 'quill';
import quillBetterTable from 'quill-better-table';
const Quill: any = QuillNamespace;
Quill.register({ 'modules/better-table': quillBetterTable }, true);
import BlotFormatter from 'quill-blot-formatter';
Quill.register('modules/blotFormatter', BlotFormatter);
// Quill.register('modules/imageResize', ImageResize);
// import ImageResize from 'quill-image-resize-module';
const BlockEmbed = Quill.import('blots/block/embed');
const keyboard = quillBetterTable.keyboardBindings;

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  table: any;
  user: User = new User();
  templates = [
    { layout: 'img_text_hor', icon: 'i-signature-1' },
    { layout: 'text_img_hor', icon: 'i-signature-2' },
    { layout: 'text_img_ver', icon: 'i-signature-3' },
    { layout: 'img_text_ver', icon: 'i-signature-4' },
    { layout: 'custom', icon: 'i-signature-5' }
  ];
  currentTemplate = 'text_img_ver';
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
    // console.log(quillBetterTable);
    // this.config['keyboard'] = {
    //   bindings: {
    //     ...quillBetterTable.keyboardBindings,
    //     Backspace: {
    //       key: 'Backspace',
    //       format: ['table-cell-line'],
    //       collapsed: true,
    //       offset: 0
    //     }
    //   }
    // };
    this.userService.profile$.subscribe((profile) => {
      if (profile && profile._id) {
        this.user = profile;
      }
    });
  }

  ngOnInit(): void {}

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
    let signature;
    // const delta = this.emailEditor.quillEditor.clipboard.convert(
    //   { html: this.user.email_signature }
    // );
    // this.emailEditor.quillEditor.setContents(delta, 'user');
    switch (this.currentTemplate) {
      case 'img_text_hor':
        signature = `
        <div class="quill-better-table-wrapper">
          <table class="quill-better-table" style="width: 400px;">
            <colgroup>
              <col width="120">
              <col width="280">
            </colgroup>
            <tbody>
              <tr data-row="row-yu3l">
                <td data-row="row-yu3l" rowspan="1" colspan="1">
                  <img src="${this.user.picture_profile}" width="95" height="95">
                </td>
                <td data-row="row-yu3l" rowspan="1" colspan="1">
                  <div>${this.user.user_name}</div>
                  <div>${this.user.company}</div>
                  <div>${this.user.email}</div>
                  <div>${this.user.phone.internationalNumber}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><br></p>
        `;
        break;
      case 'text_img_hor':
        signature = `
        <div class="quill-better-table-wrapper">
          <table class="quill-better-table" style="width: 400px;">
            <colgroup>
              <col width="280">
              <col width="120">
            </colgroup>
            <tbody>
            <tr data-row="row-yu3l">
              <td data-row="row-yu3l" rowspan="1" colspan="1">
                <div>${this.user.user_name}</div>
                <div>${this.user.company}</div>
                <div>${this.user.email}</div>
                <div>${this.user.phone.internationalNumber}</div>
              </td>
              <td data-row="row-yu3l" rowspan="1" colspan="1">
                <img src="${this.user.picture_profile}" width="95" height="95">
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p><br></p>
        `;
        break;
      case 'text_img_ver':
        signature = `
          <div>
            <div>
              <div>${this.user.user_name}</div>
              <div>${this.user.company}</div>
              <div>${this.user.email}</div>
              <div>${this.user.phone.internationalNumber}</div>
            </div>
            <div>
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
          </div>
        `;
        break;
      case 'img_text_ver':
        signature = `
          <div>
            <div>
              <img src="${this.user.picture_profile}" width="95" height="95">
            </div>
            <div>
              <div>${this.user.user_name}</div>
              <div>${this.user.company}</div>
              <div>${this.user.email}</div>
              <div>${this.user.phone.internationalNumber}</div>
            </div>
          </div>
        `;
        break;
    }
    this.emailEditor.quillEditor.setContents([]);
    this.user.email_signature = signature;
    this.emailEditor.quillEditor.clipboard.dangerouslyPasteHTML(
      0,
      signature,
      'user'
    );
    return;
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
    console.log('editor is initated', editorInstance);
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
    this.table = this.quillEditorRef.getModule('better-table');
    console.log('this.table', this.table);
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
