import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { FormControl } from '@angular/forms';
import { Template } from 'src/app/models/template.model';
import { UserService } from 'src/app/services/user.service';
import { MaterialService } from 'src/app/services/material.service';
import { ContactService } from 'src/app/services/contact.service';
import { ToastrService } from 'ngx-toastr';

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
  firstMaterialType = '';

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    private materialService: MaterialService,
    private toast: ToastrService,
    private dialogRef: MatDialogRef<MaterialSendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.material.length > 1) {
      if (this.data.material_type) {
        switch (this.data.material_type) {
          case 'video':
            this.videos = [...this.data.material];
            break;
          case 'pdf':
            this.pdfs = [...this.data.material];
            break;
          case 'image':
            this.images = [...this.data.material];
            break;
        }
        this.firstMaterialType = this.data.material_type;
      } else {
        this.data.material.forEach((e) => {
          switch (e.material_type) {
            case 'video':
              this.videos.push(e);
              break;
            case 'pdf':
              this.pdfs.push(e);
              break;
            case 'image':
              this.images.push(e);
              break;
          }
        });
        this.firstMaterialType = this.data.material[0]['material_type'];
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
  onChangeTemplate(event: Template): void {
    this.subject = event.subject;
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
      if (e._id && e.cell_phone) {
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
          this.toast.success('Materials has been successfully sent.');
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
    const data = {
      contacts,
      cc: [],
      bcc: [],
      video_ids,
      pdf_ids,
      image_ids,
      subject: this.subject,
      content: email,
      attachment: ''
    };
    if (!data.video_ids) {
      delete data.video_ids;
    }
    if (!data.pdf_ids) {
      delete data.pdf_ids;
    }
    if (!data.image_ids) {
      delete data.image_ids;
    }
    this.sending = true;
    this.materialService
      .sendMaterials({
        ...data
      })
      .subscribe((status) => {
        this.sending = false;
        if (status) {
          this.toast.success('Materials has been successfully sent.');
          this.dialogRef.close();
        }
      });
  }
}
