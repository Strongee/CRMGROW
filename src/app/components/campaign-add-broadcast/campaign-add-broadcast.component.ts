import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialAddComponent } from '../material-add/material-add.component';
import { numPad } from '../../helper';
import { UserService } from '../../services/user.service';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaign-add-broadcast',
  templateUrl: './campaign-add-broadcast.component.html',
  styleUrls: ['./campaign-add-broadcast.component.scss']
})
export class CampaignAddBroadcastComponent implements OnInit {
  title = '';
  selectedTemplate;
  selectedMailList;
  date;
  time;
  datetime = '';
  minDate;
  sendAdding = true;
  sessions = [];
  submitted = false;
  selectedDateTime;
  materials = [];
  adding = false;

  constructor(
    private dialogRef: MatDialogRef<CampaignAddBroadcastComponent>,
    private dialog: MatDialog,
    private userService: UserService,
    private campaignService: CampaignService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.date = this.minDate;
    this.time = {
      hour: current.getHours(),
      minute: 0
    };
  }

  ngOnInit(): void {
    const current = new Date();
    const session = {
      name: 'Session1',
      number: 2000,
      date: current.toISOString()
    };
    this.sessions.push(session);
  }

  selectTemplate(event): void {
    this.selectedTemplate = event;
  }

  selectMailList(event): void {
    this.selectedMailList = event;
  }

  toggle($event): void {
    this.sendAdding = !this.sendAdding;
  }

  getDateTime(): any {
    if (this.date.day) {
      return (
        this.date.year +
        '-' +
        this.date.month +
        '-' +
        this.date.day +
        ' ' +
        this.time.hour +
        ':' +
        this.time.minute
      );
    }
    return (
      this.date.year +
      '-' +
      this.date.month +
      '-' +
      this.minDate.day +
      ' ' +
      this.time.hour +
      ':' +
      '00'
    );
  }

  setDateTime(): void {
    this.selectedDateTime = moment(this.getDateTime()).format(
      'YYYY-MM-DD hh:mm A'
    );
    close();
  }

  deleteMaterial(material): void {
    const index = this.materials.findIndex((item) => item._id === material._id);
    if (index >= 0) {
      this.materials.splice(index, 1);
    }
  }

  getMaterialType(material): any {
    if (material.type) {
      if (material.type === 'application/pdf') {
        return 'PDF';
      } else if (material.type.includes('image')) {
        return 'Image';
      }
    }
    return 'Video';
  }

  attachMaterials(): void {
    this.dialog
      .open(MaterialAddComponent, {
        width: '98vw',
        maxWidth: '500px',
        data: this.materials
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.materials = res.materials;
        }
      });
  }
  addBroadcast(): void {
    this.submitted = true;
    if (
      !this.selectedMailList ||
      !this.selectedTemplate ||
      !this.selectedDateTime
    ) {
      return;
    }

    const images = [];
    const pdfs = [];
    const videos = [];

    this.materials.forEach((material) => {
      const type = this.getMaterialType(material);
      if (type === 'Image') {
        images.push(material._id);
      } else if (type === 'PDF') {
        pdfs.push(material._id);
      } else if (type === 'Video') {
        videos.push(material._id);
      }
    });

    this.adding = true;
    this.userService.profile$.subscribe((res) => {
      const timezone = res['time_zone'];
      const dueDateTime = moment(this.selectedDateTime)
        .set({
          minute: 0,
          second: 0,
          millisecond: 0
        })
        .toISOString();
      // Number(new Date(this.selectedDateTime).getHours()) + ':00:00';

      // const dueDateTime = new Date(
      //   `${this.date.year}-${numPad(this.date.month)}-${numPad(
      //     this.date.day ? this.date.day : this.minDate.day
      //   )}T${time}${timezone}`
      // ).toISOString();

      const data = {
        title: this.title,
        mail_list: this.selectedMailList._id,
        email_template: this.selectedTemplate._id,
        due_start: dueDateTime,
        video: videos,
        pdf: pdfs,
        image: images
      };

      this.campaignService.create(data).subscribe((response) => {
        this.adding = false;
        this.dialogRef.close({ data: response });
      });
    });
  }
}
