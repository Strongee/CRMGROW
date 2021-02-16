import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import { Contact } from 'src/app/models/contact.model';
import { Template } from 'src/app/models/template.model';
import { MaterialAddComponent } from '../material-add/material-add.component';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import * as _ from 'lodash';
import { TIMES } from 'src/app/constants/variable.constants';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { DealsService } from '../../services/deals.service';
import { HandlerService } from 'src/app/services/handler.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit, AfterViewInit {
  emailSubmitted = false;
  emailSending = false;
  ccFlag = false;
  bccFlag = false;
  emailContacts: Contact[] = [];
  ccContacts: Contact[] = [];
  bccContacts: Contact[] = [];
  emailSubject = '';
  emailContent = '';
  selectedTemplate: Template = new Template();
  materials = [];
  schedule_date = {
    year: '',
    month: '',
    day: ''
  };
  scheduleDateTime = '';
  planned = false;
  selectedDateTime;
  minDate: any;
  schedule_time = '12:00:00.000';
  times = TIMES;
  attachments = [];
  type = '';
  dealId;
  mainContact;

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<SendEmailComponent>,
    private helperSerivce: HelperService,
    private materialService: MaterialService,
    private userService: UserService,
    private handlerService: HandlerService,
    private dealService: DealsService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data && this.data.deal) {
      this.dealId = this.data.deal;
      this.type = 'deal';
      for (const contact of this.data.contacts) {
        this.emailContacts.push(contact);
      }
    } else {
      if (this.data && this.data.contact) {
        this.emailContacts = [this.data.contact];
        this.mainContact = this.data.contact;
      }
      if (this.data && this.data.contacts) {
        this.emailContacts = this.data.contacts;
      }
    }
  }

  ngOnInit(): void {
    const defaultEmail = this.userService.email.getValue();
    if (defaultEmail) {
      this.emailSubject = defaultEmail.subject;
      this.emailContent = defaultEmail.content;
    }
  }

  ngAfterViewInit(): void {}

  sendEmail(): void {
    if (this.emailContacts.length) {
      // email api call
      const contacts = [];
      const cc = [];
      const bcc = [];
      const video_ids = [];
      const pdf_ids = [];
      const image_ids = [];
      const content = this.helperSerivce.convertEmailContent(this.emailContent);
      const subject = this.emailSubject;
      this.emailContacts.forEach((e) => {
        contacts.push(e._id);
      });
      this.ccContacts.forEach((e) => cc.push(e.email));
      this.bccContacts.forEach((e) => bcc.push(e.email));
      const materials = this.helperSerivce.getMaterials(this.emailContent);
      this.materials = _.intersectionBy(this.materials, materials, '_id');
      this.materials.forEach((e) => {
        const type = this.helperSerivce.getMaterialType(e);
        switch (type) {
          case 'PDF':
            pdf_ids.push(e._id);
            break;
          case 'Image':
            image_ids.push(e._id);
            break;
          case 'Video':
            video_ids.push(e._id);
            break;
        }
      });

      const data = {
        contacts,
        cc,
        bcc,
        video_ids,
        pdf_ids,
        image_ids,
        subject,
        content,
        attachments: this.attachments
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

      if (this.type === 'deal') {
        this.emailSending = true;
        this.dealService
          .sendEmail({
            deal: this.dealId,
            ...data
          })
          .subscribe((status) => {
            this.emailSending = false;
            this.dialogRef.close();
          });
      } else {
        this.emailSending = true;
        this.materialService
          .sendMaterials({
            ...data
          })
          .subscribe((status) => {
            this.emailSending = false;
            const length =
              (data.video_ids ? data.video_ids.length : 0) +
              (data.pdf_ids ? data.pdf_ids.length : 0) +
              (data.image_ids ? data.image_ids.length : 0) +
              1;
            this.handlerService.addLatestActivities$(length);
            this.dialogRef.close();
          });
      }
    }
  }

  /**
   * Open the Material Select Dialog
   */
  openMaterialsDlg(): void {
    const content = this.emailContent;
    const materials = this.helperSerivce.getMaterials(content);
    this.dialog
      .open(MaterialAddComponent, {
        width: '98vw',
        maxWidth: '500px',
        data: {
          hideMaterials: materials
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          this.materials = _.intersectionBy(this.materials, materials, '_id');
          this.materials = [...this.materials, ...res.materials];
          for (let i = 0; i < res.materials.length; i++) {
            const material = res.materials[i];
            this.htmlEditor.insertMaterials(material);
          }
        }
      });
  }

  /**
   * Populate the selected template content
   * @param template : Template
   */
  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.emailContent);
    }
    // Attach the Selected Material Content
  }
  onChangeTemplate(template: Template): void {
    this.emailSubject = template.subject;
  }

  getScheduleDateTime(): any {
    if (this.schedule_date.day != '' && this.schedule_time != '') {
      return moment(
        this.schedule_date.year +
          '-' +
          this.schedule_date.month +
          '-' +
          this.schedule_date.day +
          ' ' +
          this.schedule_time
      ).format();
    }
  }

  setScheduleDateTime(): void {
    this.scheduleDateTime = moment(
      this.schedule_date.year +
        '-' +
        this.schedule_date.month +
        '-' +
        this.schedule_date.day +
        ' ' +
        this.schedule_time
    ).format();
    this.planned = true;
  }

  removeSchedule(): void {
    this.planned == false;
    this.scheduleDateTime = '';
  }

  // onInitEditor(): void {

  // }
  onAttachmentChange(attachments: any[]): void {
    this.attachments = attachments;
  }

  removeContact(contact: Contact): void {
    if (this.mainContact) {
      if (this.mainContact._id === contact._id) {
        this.emailContacts.unshift(this.mainContact);
      }
    }
  }

  checkDuplication(field: string): void {
    let newContact;
    let isChecked = false;
    switch (field) {
      case 'to':
        newContact = this.emailContacts.slice(-1)[0];
        // cc && bcc check
        this.ccContacts.some((e) => {
          if (e.email === newContact.email) {
            this.emailContacts.splice(-1);
            isChecked = true;
            return true;
          }
        });
        if (!isChecked) {
          this.bccContacts.some((e) => {
            if (e.email === newContact.email) {
              this.emailContacts.splice(-1);
              return true;
            }
          });
        }
        break;
      case 'cc':
        newContact = this.ccContacts.slice(-1)[0];
        // cc && bcc check
        this.emailContacts.some((e) => {
          if (e.email === newContact.email) {
            this.ccContacts.splice(-1);
            isChecked = true;
            return true;
          }
        });
        if (!isChecked) {
          this.bccContacts.some((e) => {
            if (e.email === newContact.email) {
              this.ccContacts.splice(-1);
              return true;
            }
          });
        }
        break;
      case 'bcc':
        newContact = this.bccContacts.slice(-1)[0];
        // cc && bcc check
        this.emailContacts.some((e) => {
          if (e.email === newContact.email) {
            this.bccContacts.splice(-1);
            isChecked = true;
            return true;
          }
        });
        if (!isChecked) {
          this.ccContacts.some((e) => {
            if (e.email === newContact.email) {
              this.bccContacts.splice(-1);
              return true;
            }
          });
        }
        break;
    }
  }
}
