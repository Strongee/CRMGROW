import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { FileService } from '../../services/file.service';
import { QuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import quillBetterTable from 'quill-better-table';
Quill.register({ 'modules/better-table': quillBetterTable }, true);
import BlotFormatter from 'quill-blot-formatter';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
Quill.register('modules/blotFormatter', BlotFormatter);
@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit, OnDestroy {
  user: User = new User();
  templates = [
    { layout: 'img_text_hor', icon: 'i-signature-1' },
    { layout: 'text_img_hor', icon: 'i-signature-2' },
    { layout: 'text_img_ver', icon: 'i-signature-3' },
    { layout: 'img_text_ver', icon: 'i-signature-4' },
    { layout: 'custom', icon: 'i-signature-5' }
  ];
  currentTemplate = '';
  submitted = false;
  saving = false;

  quillEditorRef;
  config = QuillEditor;
  table: any;

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  profileSubscription: Subscription;

  constructor(
    private userService: UserService,
    private fileService: FileService,
    private toastr: ToastrService
  ) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile && profile._id) {
          this.user = profile;

          if (this.quillEditorRef) {
            const delta = this.quillEditorRef.clipboard.convert({
              html: this.user.email_signature
            });
            this.emailEditor.quillEditor.setContents(delta, 'user');
          }
        }
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
    let signature;
    switch (this.currentTemplate) {
      case 'img_text_hor':
        signature = `
        <div class="quill-better-table-wrapper">
          <table class="quill-better-table" style="width: 270px;">
            <colgroup>
              <col width="100">
              <col width="170">
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
        const delta = this.quillEditorRef.clipboard.convert({
          html: signature
        });
        this.emailEditor.quillEditor.setContents(delta, 'user');
        break;
      case 'text_img_hor':
        signature = `
        <div class="quill-better-table-wrapper">
          <table class="quill-better-table" style="width: 270px;">
            <colgroup>
              <col width="170">
              <col width="100">
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
        const html = this.quillEditorRef.clipboard.convert({
          html: signature
        });
        this.emailEditor.quillEditor.setContents(html, 'user');
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
    this.userService
      .updateProfile({ email_signature: this.user.email_signature })
      .subscribe((data) => {
        this.userService.updateProfileImpl(data);
        this.saving = false;
        this.toastr.success('Profile picture successfully uploaded.');
      });
  }

  updateEditor(event: any): void {
    this.user.email_signature = event.html;
  }

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
    this.table = this.quillEditorRef.getModule('better-table');

    if (this.user.email_signature) {
      const delta = this.quillEditorRef.clipboard.convert({
        html: this.user.email_signature
      });
      this.emailEditor.quillEditor.setContents(delta, 'user');
    }
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

  insertImageToEditor(url: string): void {
    const range = this.quillEditorRef.getSelection();
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }
}
