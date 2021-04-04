import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { SmsService } from 'src/app/services/sms.service';
import { MaterialService } from 'src/app/services/material.service';
import { Template } from 'src/app/models/template.model';
import * as _ from 'lodash';
import { Contact } from 'src/app/models/contact.model';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { sortDateArray } from 'src/app/utils/functions';
import { STATUS } from 'src/app/constants/variable.constants';
import { MaterialBrowserComponent } from 'src/app/components/material-browser/material-browser.component';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  STATUS = STATUS;
  PanelView = {
    Contacts: 'contacts',
    Messages: 'messages',
    Files: 'files'
  };
  // Loading Contacts
  loadingContact = false;
  contacts = [];
  selectedContact: Contact = new Contact();
  // Loading Individual Contact messages
  loadingMessage = false;
  messages = [];
  conversationDetails = {};
  // Message
  message = '';
  // Panel View for Mobile
  panel = this.PanelView.Contacts;
  // Message Loader and Updater Timer
  messageLoadSubscription: Subscription;
  messageLoadTimer;
  // Materials of selected contact
  materials = [];
  // contacts and sending status
  isNew = false;
  isSend = false;
  newContacts = [];
  // Space Reg
  spaceReg = /(\r\n|\n|\r|\s)/g;

  // UI Elements
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('messageText') messageText: ElementRef;
  constructor(
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private materialService: MaterialService,
    public smsService: SmsService,
    public userService: UserService,
    private contactService: ContactService
  ) {
    this.templateService.loadAll(false);
  }

  ngOnInit(): void {
    this.smsService.loadAll(true);
    this.initSubscription();
    this.messageLoadTimer = setInterval(() => {
      this.smsService.updateConversations();
    }, 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.messageLoadTimer);
  }

  scrollToBottom(): void {}

  initSubscription(): void {
    this.messageLoadSubscription = this.smsService.messages$.subscribe(
      (_messages) => {
        const messages = _messages;
        this.contacts = [];
        for (let index = 0; index < messages.length; index++) {
          if (messages[index].contacts.length > 0) {
            let contact_item;
            if (messages[index].type == 1 && messages[index].status == 0) {
              contact_item = {
                unread: true,
                lastest_message: messages[index].content,
                lastest_at: messages[index].updated_at
              };
            } else {
              contact_item = {
                unread: false,
                lastest_message: messages[index].content,
                lastest_at: messages[index].updated_at
              };
            }

            this.contacts.push(
              Object.assign(
                new Contact().deserialize(messages[index].contacts[0]),
                contact_item
              )
            );
          }
        }
        this.contacts = sortDateArray(this.contacts, 'lastest_at', false);
      }
    );
  }

  defaultSelectContact(contact: any): void {
    this.loadingMessage = true;
    this.selectedContact = contact;
    this.smsService.getMessage(this.selectedContact).subscribe((res) => {
      if (res) {
        this.loadingMessage = false;
        const message = {
          id: contact._id,
          messages: res
        };
        this.conversationDetails[contact._id] = message;
      }
    });
    this.isNew = false;
  }

  selectContact(contact: any): void {
    // Conversation Data Resetting
    this.selectedContact = contact;
    this.isNew = false;
    this.newContacts = [];
    this.panel = this.PanelView.Messages;
    this.loadingMessage = true;
    this.smsService.getMessage(this.selectedContact).subscribe((res) => {
      if (res) {
        if (res[res.length - 1].type == 1 && res[res.length - 1].status == 0) {
          this.smsService.markRead(res[res.length - 1]._id).subscribe((res) => {
            if (res && res['status']) {
              this.selectedContact.unread = false;
            }
          });
        }
        this.loadingMessage = false;
        const message = {
          id: contact._id,
          messages: res
        };
        this.conversationDetails[contact._id] = message;
      }
    });
  }

  selectNewContacts() {
    if (this.newContacts.length === 1) {
      const firstNewContact = this.newContacts[0];
      const conversationIndex = _.findIndex(
        this.contacts,
        (e) => e._id === firstNewContact._id
      );
      if (conversationIndex !== -1) {
        this.smsService.getMessage(firstNewContact).subscribe((res) => {
          if (res) {
            if (
              res[res.length - 1].type == 1 &&
              res[res.length - 1].status == 0
            ) {
              this.smsService
                .markRead(res[res.length - 1]._id)
                .subscribe((res) => {
                  if (res && res['status']) {
                    this.selectedContact.unread = false;
                  }
                });
            }
            this.loadingMessage = false;
            const message = {
              id: firstNewContact._id,
              messages: res
            };
            this.conversationDetails[firstNewContact._id] = message;
          }
        });
      }
    }
  }

  goToBack(): void {
    this.isNew = false;
    this.newContacts = [];
    this.panel = this.PanelView.Contacts;
  }

  toggleFileList(): void {
    if (this.panel != this.PanelView.Files) {
      this.panel = this.PanelView.Files;
    } else {
      this.panel = this.PanelView.Contacts;
    }
  }

  newMessage(): void {
    this.isNew = true;
    this.newContacts = [];
    this.panel = this.PanelView.Messages;
  }

  sendMessage(): void {
    if (
      this.message == '' ||
      this.message.replace(/(\r\n|\n|\r|\s)/gm, '').length == 0
    ) {
      return;
    }
    if (
      (!this.isNew && !this.selectedContact._id) ||
      (this.isNew && !this.newContacts.length)
    ) {
      return;
    }
    const { videoIds, imageIds, pdfIds } = this.getMaterials();
    let contentToSend = this.message;
    videoIds.forEach((video) => {
      contentToSend = contentToSend.replace(
        environment.website + '/video?video=' + video,
        '{{' + video + '}}'
      );
    });
    pdfIds.forEach((pdf) => {
      contentToSend = contentToSend.replace(
        environment.website + '/pdf?pdf=' + pdf,
        '{{' + pdf + '}}'
      );
    });
    imageIds.forEach((image) => {
      contentToSend = contentToSend.replace(
        environment.website + '/image?image=' + image,
        '{{' + image + '}}'
      );
    });

    const data = {
      video_ids: videoIds,
      pdf_ids: pdfIds,
      image_ids: imageIds,
      content: contentToSend
    };
    this.isSend = true;
    if (this.isNew) {
      const contactsToRegister = [];
      const existContacts = [];
      const contactIds = [];
      this.newContacts.forEach((contact) => {
        if (!contact._id) {
          contactsToRegister.push(contact);
        } else {
          existContacts.push(contact);
          contactIds.push(contact._id);
        }
      });

      if (!contactsToRegister.length) {
        data['contacts'] = contactIds;
        this.sendMessageImpl(data);
      } else {
        this.contactService.bulkCreate(contactsToRegister).subscribe((res) => {
          const newContactIds = [];
          if (res) {
            const addedContacts = res['succeed'];
            addedContacts.forEach((e) => contactIds.push(e._id));
            data['contacts'] = contactIds;
            this.sendMessageImpl(data, addedContacts);
          }
        });
      }
    } else {
      data['contacts'] = [this.selectedContact._id];
      this.sendMessageImpl(data);
    }
  }

  sendMessageImpl(data, newContacts = []): void {
    this.materialService.sendMessage(data).subscribe((res) => {
      this.isSend = false;
      if (res) {
        const message = {
          type: 0,
          content: this.message,
          updated_at: new Date()
        };
        this.contacts.forEach((e) => {
          if (data['contacts'] && data['contacts'].indexOf(e._id) !== -1) {
            e.lastest_message = this.message;
          }
        });
        data.contacts.forEach((contact) => {
          if (this.conversationDetails[contact]) {
            this.conversationDetails[contact].messages.push(message);
          }
        });
        if (newContacts.length) {
          newContacts.forEach((e) => {
            const conversationContact = Object.assign(
              new Contact().deserialize(e),
              {
                unread: false,
                lastest_message: this.message,
                lastest_at: new Date()
              }
            );
            this.contacts.unshift(conversationContact);
            this.conversationDetails[e._id] = {
              id: e._id,
              messages: [message]
            };
          });
        }
        this.message = '';
        // this.messages.forEach((messageList) => {
        //   if (!this.isNew && messageList.id == this.selectedContact._id) {
        //     messageList.messages.push(message);
        //     this.selectedContact.lastest_message = this.message;
        //     this.selectedContact.lastest_at = new Date();
        //     this.message = '';
        //     const pos = this.contacts.findIndex(
        //       (contact) => contact._id === this.selectedContact._id
        //     );
        //     if (pos != 0) {
        //       this.contacts.splice(pos, 1);
        //       this.contacts.unshift(this.selectedContact);
        //     }
        //   }
        //   if (this.isNew) {
        //     for (let i = 0; i < this.newContacts.length; i++) {
        //       if (
        //         messageList.id ==
        //         this.newContacts[this.newContacts.length - 1 - i]._id
        //       ) {
        //         const message = {
        //           type: 0,
        //           content: this.messageText,
        //           updated_at: new Date()
        //         };
        //         messageList.messages.push(message);
        //       }
        //       this.newContacts[
        //         this.newContacts.length - 1 - i
        //       ].lastest_message = this.messageText;
        //       this.newContacts[
        //         this.newContacts.length - 1 - i
        //       ].lastest_at = new Date();
        //       this.contacts.unshift(
        //         this.newContacts[this.newContacts.length - 1 - i]
        //       );
        //     }
        //     this.isNew = false;
        //     this.selectedContact = this.contacts[0];
        //     this.message = '';
        //   }
        //   this.scrollToBottom();
        // });
      }
    });
  }

  openMaterialsDlg(): void {
    const { videoIds, imageIds, pdfIds } = this.getMaterials();
    const selectedMaterials = [...videoIds, ...imageIds, ...pdfIds].map((e) => {
      return { _id: e };
    });
    this.dialog
      .open(MaterialBrowserComponent, {
        width: '98vw',
        maxWidth: '940px',
        data: {
          multiple: true,
          hideMaterials: selectedMaterials
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials && res.materials.length) {
          res.materials.forEach((e, index) => {
            let url;
            switch (e.material_type) {
              case 'video':
                url = `${environment.website}/video?video=${e._id}`;
                break;
              case 'pdf':
                url = `${environment.website}/pdf?pdf=${e._id}`;
                break;
              case 'image':
                url = `${environment.website}/image?image=${e._id}`;
                break;
            }
            // first element insert
            if (
              index === 0 &&
              (!this.message || this.message.slice(-1) === '\n')
            ) {
              this.message = this.message + '\n' + url;
              return;
            }
            if (index === 0) {
              this.message = this.message + '\n\n' + url;
              return;
            }
            // middle element insert
            this.message = this.message + '\n' + url;

            if (index === res.materials.length - 1) {
              this.message += '\n';
            }
          });
        }
      });
  }

  selectTemplate(template: Template): void {
    this.messageText.nativeElement.focus();
    const field = this.messageText.nativeElement;
    if (!this.message.replace(/(\r\n|\n|\r|\s)/g, '').length) {
      field.select();
      document.execCommand('insertText', false, template.content);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.message[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    } else {
      if (this.message.slice(-1) === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    }
  }

  getMaterials(): any {
    const videoIds = [];
    const pdfIds = [];
    const imageIds = [];

    const videoReg = new RegExp(
      environment.website + '/video[?]video=\\w+',
      'g'
    );
    const pdfReg = new RegExp(environment.website + '/pdf[?]pdf=\\w+', 'g');
    const imageReg = new RegExp(
      environment.website + '/image[?]image=\\w+',
      'g'
    );

    let matches = this.message.match(videoReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const videoId = e.replace(environment.website + '/video?video=', '');
        videoIds.push(videoId);
      });
    }
    matches = this.message.match(pdfReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const pdfId = e.replace(environment.website + '/pdf?pdf=', '');
        pdfIds.push(pdfId);
      });
    }
    matches = this.message.match(imageReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const imageId = e.replace(environment.website + '/image?image=', '');
        imageIds.push(imageId);
      });
    }

    return {
      videoIds,
      imageIds,
      pdfIds
    };
  }

  keyTrigger(evt: any): void {
    if (evt.key === 'Enter') {
      if (evt.ctrlKey || evt.altKey) {
        return;
      }
      if (!evt.shiftKey) {
        evt.preventDefault();
        this.sendMessage();
      }
    }
  }

  parseContent(content: string = ''): any {
    return content.replace(/(https?:\/\/[^\s]+)/g, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }

  calcDate(date: any): number {
    const currentDate = new Date();
    const dateSent = new Date(date);
    return Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    );
  }
}
