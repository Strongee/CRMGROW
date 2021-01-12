import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactService } from '../../services/contact.service';
import { EmailService } from '../../services/email.service';
import { UserService } from '../../services/user.service';
import { Contact } from 'src/app/models/contact.model';
import { FormControl } from '@angular/forms';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-material-send',
  templateUrl: './material-send.component.html',
  styleUrls: ['./material-send.component.scss']
})
export class MaterialSendComponent implements OnInit {
  selected = new FormControl(0);
  contacts: Contact[] = [];
  selectedTemplate = { subject: '', content: '' };
  submitted = false;
  isSending = false;
  materials: any[] = [];
  focusedField = '';
  user_id = '';
  siteUrl = environment.website;

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<MaterialSendComponent>,
    private contactService: ContactService,
    private emailService: EmailService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userService.profile$.subscribe((profile) => {
      this.user_id = profile._id;
    });
  }

  ngOnInit(): void {
    this.materials = this.data.material;

    if (this.data.mediaType) {
      if (this.data.mediaType == 'email') {
        this.selected.setValue(1);
      } else {
        this.selected.setValue(0);
      }
    }
  }

  selectTemplate(event: any): void {
    this.selectedTemplate = event;
    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.selectedTemplate.content);
    }
  }

  sendMessage(): any {
    const contacts = [];
    const newContacts = [];

    this.contacts.forEach((e) => {
      if (e._id) {
        contacts.push(e._id);
      } else {
        newContacts.push(e);
      }
    });
    if (!contacts.length && !newContacts.length) {
      return false;
    }

    if (newContacts.length) {
      this.contactService.bulkCreate(newContacts).subscribe(
        (res) => {
          if (res['failure'].length) {
          }
          if (res['succeed']) {
            if (res['succeed'].length) {
              res['succeed'].forEach((e) => {
                contacts.push(e._id);
              });
              this.sendMessageImpl(contacts);
            } else {
              if (contacts.length) {
                this.sendMessageImpl(contacts);
              } else {
                this.dialogRef.close();
              }
            }
          }
        },
        (err) => {
          if (contacts.length) {
            this.sendMessageImpl(contacts);
          } else {
            this.dialogRef.close();
          }
        }
      );
    }
  }

  sendMessageImpl(contacts: any): void {
    let mediaType;
    if (this.selected.value == 0) {
      mediaType = 'text';
    } else {
      mediaType = 'email';
    }
    const emailType = this.userService.getUserInfoItem('connected_email_type');
    const primaryConnected = this.userService.getUserInfoItem(
      'primary_connected'
    );
    if (primaryConnected || emailType === 'email') {
      mediaType = emailType;
    }
    if (mediaType == 'text') {
      if (this.selectedTemplate.content == '') {
        return;
      }
      this.isSending = true;
      this.emailService
        .sendMaterial(
          this.materials,
          this.data.materialType,
          mediaType,
          this.selectedTemplate,
          contacts
        )
        .subscribe((res) => {
          this.isSending = false;
          this.dialogRef.close({ status: true });
        });
    } else {
      if (
        this.selectedTemplate.content == '' ||
        this.selectedTemplate.subject == ''
      ) {
        return;
      }
    }
  }

  focusEditor(): void {
    this.focusedField = 'editor';
  }
}
