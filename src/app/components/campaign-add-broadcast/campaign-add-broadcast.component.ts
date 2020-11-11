import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { MaterialAddComponent } from '../material-add/material-add.component';

@Component({
  selector: 'app-campaign-add-broadcast',
  templateUrl: './campaign-add-broadcast.component.html',
  styleUrls: ['./campaign-add-broadcast.component.scss']
})
export class CampaignAddBroadcastComponent implements OnInit {
  name = '';
  selectedTemplate = { subject: '', content: '' };
  date;
  time;
  datetime = '';
  minDate;
  sendAdding = true;
  sessions = [];
  submitted = false;
  selectedDateTime;
  materials = [];

  constructor(private dialog: MatDialog) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.date = this.minDate;
    this.time = {
      hour: current.getHours(),
      minute: current.getMinutes()
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
      this.time.minute
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
  addBroadcast(): void {}
}
