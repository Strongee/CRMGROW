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
const Parchment = Quill.import('parchment');
const ImageBlot = Quill.import('formats/image');
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
    { layout: 'img_text_ver', icon: 'i-signature-4' }
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
          if (!this.user.email_signature) {
            this.user.email_signature = '';
          }

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
    let imageCell;
    let dataCell;
    if (this.user.email_signature.indexOf('<table') !== -1) {
      // Table Layout -> IMG_TEXT_HOR, TEXT_IMG_HOR
      const signatureDom = document.createElement('div');
      signatureDom.innerHTML = this.user.email_signature;
      const signatureCells = signatureDom.querySelectorAll('td');
      if (signatureCells[0].querySelector('img')) {
        imageCell = signatureCells[0].innerHTML;
        dataCell = signatureCells[1].innerHTML;
      } else {
        dataCell = signatureCells[0].innerHTML;
        imageCell = signatureCells[1].innerHTML;
      }
    } else {
      // Normal Layout -> IMG_TEXT_VER, TEXT_IMG_VER
      const signatureDom = document.createElement('div');
      signatureDom.innerHTML = this.user.email_signature;
      const firstImageDom = signatureDom.querySelector('img');
      if (firstImageDom) {
        const firstImageEl = firstImageDom.closest('div');
        const children = signatureDom.children;
        let prevNodeCount = 0;
        let prevHTML = '';
        for (let i = 0; i < children.length; i++) {
          if (children[i] === firstImageEl) {
            break;
          }
          prevHTML += children[i].outerHTML;
          prevNodeCount++;
        }
        if (prevNodeCount < children.length - 1 - prevNodeCount) {
          imageCell = prevHTML + firstImageEl.outerHTML;
          dataCell = this.user.email_signature.replace(imageCell, '');
        } else {
          dataCell = prevHTML;
          imageCell = this.user.email_signature.replace(dataCell, '');
        }
      } else {
        dataCell = this.user.email_signature;
        imageCell = '';
      }
    }

    let textCellHTML = '';
    let imageCellHTML = '';
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
                  ${imageCell}
                </td>
                <td data-row="row-yu3l" rowspan="1" colspan="1">
                  ${dataCell}
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
                ${dataCell}
              </td>
              <td data-row="row-yu3l" rowspan="1" colspan="1">
                ${imageCell}
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
        textCellHTML = this.clearHTML(dataCell);
        imageCellHTML = this.clearHTML(imageCell);
        textCellHTML = textCellHTML.replace(new RegExp('<p', 'gi'), '<div');
        textCellHTML = textCellHTML.replace(new RegExp('</p>', 'gi'), '</div>');
        imageCellHTML = imageCellHTML.replace(new RegExp('<p', 'gi'), '<div');
        imageCellHTML = imageCellHTML.replace(
          new RegExp('</p>', 'gi'),
          '</div>'
        );
        signature = `
          <div>
            <div class="ql-user-profile">
              ${textCellHTML}
            </div>
            ${imageCellHTML}
          </div>
        `;
        break;
      case 'img_text_ver':
        textCellHTML = this.clearHTML(dataCell);
        imageCellHTML = this.clearHTML(imageCell);
        textCellHTML = textCellHTML.replace(new RegExp('<p', 'gi'), '<div');
        textCellHTML = textCellHTML.replace(new RegExp('</p>', 'gi'), '</div>');
        imageCellHTML = imageCellHTML.replace(new RegExp('<p', 'gi'), '<div');
        imageCellHTML = imageCellHTML.replace(
          new RegExp('</p>', 'gi'),
          '</div>'
        );
        signature = `
          <div>
            ${imageCellHTML}
            <div>
              ${textCellHTML}
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
        this.toastr.success('Email signature is updated successfully.');
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

    this.emailEditor.quillEditor.container.addEventListener('click', (ev) => {
      const img = Parchment.Registry.find(ev.target);
      if (img instanceof ImageBlot) {
        this.emailEditor.quillEditor.setSelection(
          img.offset(this.emailEditor.quillEditor.scroll),
          1,
          'user'
        );
      }
    });

    const tooltip = this.emailEditor.quillEditor.theme.tooltip;
    const input = tooltip.root.querySelector('input[data-link]');
    input.dataset.link = 'www.crmgrow.com';
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

  clearHTML(html: string): string {
    const outerDom = document.createElement('div');
    outerDom.innerHTML = html;
    const pels = outerDom.querySelectorAll('p');
    for (let i = 0; i < pels.length; i++) {
      const attrs = pels[i].attributes;
      for (let j = 0; j < attrs.length; j++) {
        pels[i].removeAttribute(attrs[j].name);
      }
    }
    return outerDom.innerHTML;
  }
}
