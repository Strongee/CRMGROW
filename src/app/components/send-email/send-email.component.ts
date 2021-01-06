import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit {
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

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<SendEmailComponent>,
    private helperSerivce: HelperService,
    private materialService: MaterialService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data) {
      this.emailContacts = [this.data.contact];
    }
  }

  ngOnInit(): void {}

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
      this.materialService
        .sendMaterials({
          contacts,
          cc,
          bcc,
          video_ids,
          pdf_ids,
          image_ids,
          subject,
          content
        })
        .subscribe((status) => {
          this.dialogRef.close();
        });
    }
  }

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

  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    if (this.htmlEditor) {
      this.htmlEditor.setValue(this.emailContent);
    }
    // Attach the Selected Material Content
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

  onAttachmentChange(attachments): void {
    this.attachments = attachments;
  }
}
