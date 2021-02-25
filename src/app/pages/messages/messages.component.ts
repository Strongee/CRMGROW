import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { MaterialService } from 'src/app/services/material.service';
import { Template } from 'src/app/models/template.model';
import { MaterialAddComponent } from 'src/app/components/material-add/material-add.component';
import * as _ from 'lodash';
import { Contact } from 'src/app/models/contact.model';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  contacts = [
    {
      avatarName: 'DW',
      fullName: 'Donald Williams',
      cell_phone: '+12015550213',
      latest_message: "I'm a preview of the text message for you to see",
      received_at: '1/14/21',
      _id: '1'
    },
    {
      avatarName: 'HW',
      fullName: 'Hattie Webster',
      cell_phone: '+12057896648',
      latest_message: "I'm a preview of the text message for you to see",
      received_at: '1/14/21',
      _id: '2'
    }
  ];
  selectedContact = {
    avatarName: '',
    fullName: '',
    cell_phone: '',
    latest_message: '',
    received_at: '',
    _id: ''
  };
  messages = [
    {
      id: '1',
      message: [
        'Hey, lets meet on dinner and discuss',
        'Sure, is tomorrow 1 pm okay?',
        'Hey, lets meet on dinner and discuss',
        'Sure, is tomorrow 1 pm okay?',
        'Hey, lets meet on dinner and discuss',
        'Sure, is tomorrow 1 pm okay?',
        'Hey, lets meet on dinner and discuss',
        'Sure, is tomorrow 1 pm okay?'
      ]
    },
    {
      id: '2',
      message: [
        'Could you let me know when you come here?',
        'Okay, I will',
        'Could you let me know when you come here?',
        'Okay, I will'
      ]
    }
  ];
  messageText = '';
  showFileList = false;
  showMessage = false;
  isNew = false;
  newContact: Contact = new Contact();
  materials = [];
  materialType = '';
  selectedTemplate: Template = new Template();
  emailSubject = '';
  emailContent = '';
  siteUrl = environment.website;
  user_id = '';
  profileSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private userService: UserService,
    private materialService: MaterialService
  ) {
    this.templateService.loadAll(false);
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user_id = profile._id;
      }
    );
  }

  ngOnInit(): void {
    this.selectedContact = { ...this.selectedContact, ...this.contacts[0] };
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  selectContact(contact: any): void {
    this.selectedContact = { ...this.selectedContact, ...contact };
    this.isNew = false;
    this.showMessage = true;
  }

  addContacts(contact: any): void {
    this.newContact = { ...this.newContact, ...contact };
    const newData = {
      id: contact._id,
      messages: []
    };
    this.messages.push(JSON.parse(JSON.stringify(newData)));
  }

  openMaterialsDlg(): void {
    this.dialog
      .open(MaterialAddComponent, {
        width: '98vw',
        maxWidth: '500px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          this.materials = [];
          this.materials = [...this.materials, ...res.materials];
          for (let i = 0; i < this.materials.length; i++) {
            let url = '';
            if (this.materials[i].hasOwnProperty('default_video')) {
              url = `${this.siteUrl}/video?video=${this.materials[i]._id}&user=${this.user_id}`;
            } else if (this.materials[i].hasOwnProperty('default_pdf')) {
              url = `${this.siteUrl}/pdf?pdf=${this.materials[i]._id}&user=${this.user_id}`;
            } else {
              url = `${this.siteUrl}/image?image=${this.materials[i]._id}&user=${this.user_id}`;
            }
            this.messageText += '\n' + url;
          }
        }
      });
  }

  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    this.messageText += '\n' + this.emailContent;
  }

  goToBack(): void {
    this.showMessage = false;
  }

  newMessage(): void {
    this.isNew = true;
  }

  sendMessage(): void {
    const videoIds = [];
    const pdfIds = [];
    const imageIds = [];
    for (let i = 0; i < this.materials.length; i++) {
      if (this.materials[i].hasOwnProperty('default_video')) {
        videoIds.push(this.materials[i]._id);
      } else if (this.materials[i].hasOwnProperty('default_pdf')) {
        pdfIds.push(this.materials[i]._id);
      } else {
        imageIds.push(this.materials[i]._id);
      }
    }
    let data;
    if (this.isNew) {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: this.messageText,
        contacts: [this.newContact._id]
      };
    } else {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: this.messageText,
        contacts: [this.selectedContact._id]
      };
    }
    this.materialService.sendMessage(data).subscribe((res) => {
      if (res) {
        this.messages.forEach((messageList) => {
          if (this.isNew && messageList.id == this.newContact._id) {
            messageList.message.push(this.messageText);
            this.contacts.push(JSON.parse(JSON.stringify(this.newContact)));
          }
          if (!this.isNew && messageList.id == this.selectedContact._id) {
            messageList.message.push(this.messageText);
          }
        });
      }
    });
  }
}
