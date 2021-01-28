import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { FormControl } from '@angular/forms';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { Template } from 'src/app/models/template.model';
import { UserService } from 'src/app/services/user.service';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { MaterialService } from 'src/app/services/material.service';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-material-send',
  templateUrl: './material-send.component.html',
  styleUrls: ['./material-send.component.scss']
})
export class MaterialSendComponent implements OnInit {
  selectedTab = 0;
  contacts: Contact[] = [];
  videos: any[] = [];
  pdfs: any[] = [];
  images: any[] = [];
  emailTemplate: Template = new Template();
  textTemplate: Template = new Template();
  subject = '';
  emailContent = '';
  textContent = '';
  sending = false;

  focusedField = '';
  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<MaterialSendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.material.length > 1) {
      switch (this.data.materialType) {
        case 'video':
          this.videos = [...this.videos, ...this.data.material];
          break;
        case 'pdf':
          this.pdfs = [...this.videos, ...this.data.material];
          break;
        case 'image':
          this.images = [...this.videos, ...this.data.material];
          break;
      }
    }
    if (this.data.type) {
      if (this.data.type === 'email') {
        const defaultEmail = this.userService.email.getValue();
        if (defaultEmail) {
          this.emailContent = defaultEmail.content;
          this.subject = defaultEmail.subject;
        }
        this.selectedTab = 1;
      } else {
        this.selectedTab = 0;
      }
    }
  }

  changeTab(event: number): void {
    this.selectedTab = event;
  }

  selectTextTemplate(event: Template): void {
    this.textTemplate = event;
    this.textContent = this.textTemplate.content;
  }
  selectEmailTemplate(event: Template): void {
    this.emailTemplate = event;
    this.subject = this.emailTemplate.subject;
    this.emailContent = this.emailTemplate.content;
    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.emailContent);
    }
  }

  send(): void {
    if (this.contacts.length == 0) {
      return;
    }
    if (this.selectedTab === 0) {
      // Send Text
      const newContacts = [];
      this.contacts.forEach((e) => {
        if (!e._id) {
          newContacts.push(e);
        }
      });
      if (newContacts.length) {
        this.sending = true;
        this.contactService.bulkCreate(newContacts).subscribe((res) => {
          const newContactIds = [];
          if (res) {
            const addedContacts = res['succeed'];
            addedContacts.forEach((e) => newContactIds.push(e._id));
          }
          this.sendText(newContactIds);
        });
      } else {
        this.sendText([]);
      }
    } else if (this.selectedTab === 1) {
      // Send Email
      const newContacts = [];
      this.contacts.forEach((e) => {
        if (!e._id) {
          newContacts.push(e);
        }
      });
      if (newContacts.length) {
        this.sending = true;
        this.contactService.bulkCreate(newContacts).subscribe((res) => {
          const newContactIds = [];
          if (res) {
            const addedContacts = res['succeed'];
            addedContacts.forEach((e) => newContactIds.push(e._id));
          }
          this.sendEmail(newContactIds);
        });
      } else {
        this.sendEmail([]);
      }
    }
  }

  sendText(newContacts: string[]): void {
    const contacts = [...newContacts];
    let materialType = '';
    const video_ids = [];
    const pdf_ids = [];
    const image_ids = [];
    const data = {};
    this.contacts.forEach((e) => {
      if (e._id && e.email) {
        contacts.push(e._id);
      }
    });
    this.videos.forEach((e) => video_ids.push(e._id));
    this.pdfs.forEach((e) => pdf_ids.push(e._id));
    this.images.forEach((e) => image_ids.push(e._id));
    if (video_ids.length) {
      materialType = 'video';
      data['videos'] = video_ids;
    } else if (pdf_ids.length) {
      materialType = 'pdf';
      data['pdfs'] = pdf_ids;
    } else if (image_ids.length) {
      materialType = 'image';
      data['images'] = image_ids;
    }

    this.sending = true;
    this.materialService
      .sendText({ ...data, content: this.textContent, contacts }, materialType)
      .subscribe((status) => {
        this.sending = false;
        if (status) {
          this.dialogRef.close();
        }
      });
  }

  sendEmail(newContacts: string[]): void {
    let email = this.emailContent;
    const contacts = [...newContacts];
    const video_ids = [];
    const pdf_ids = [];
    const image_ids = [];
    this.contacts.forEach((e) => {
      if (e._id && e.email) {
        contacts.push(e._id);
      }
    });
    this.videos.forEach((e) => video_ids.push(e._id));
    this.pdfs.forEach((e) => pdf_ids.push(e._id));
    this.images.forEach((e) => image_ids.push(e._id));
    email += '<br/><br/><br/>';
    this.data.material.forEach((e) => {
      const html = `<div><strong>${e.title}</strong></div><div><a href="{${e._id}}"><img src="${e.preview}" width="320" height="176" alt="preview image of material" /></a></div><br/>`;
      email += html;
    });
    this.sending = true;
    this.materialService
      .sendMaterials({
        contacts,
        cc: [],
        bcc: [],
        video_ids,
        pdf_ids,
        image_ids,
        subject: this.subject,
        content: email,
        attachment: ''
      })
      .subscribe((status) => {
        this.sending = false;
        if (status) {
          this.dialogRef.close();
        }
      });
  }

  focusEditor(): void {
    this.focusedField = 'editor';
  }
}
