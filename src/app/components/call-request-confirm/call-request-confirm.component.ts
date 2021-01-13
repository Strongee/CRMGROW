import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { NoteQuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import { numPad } from '../../helper';

@Component({
  selector: 'app-call-request-confirm',
  templateUrl: './call-request-confirm.component.html',
  styleUrls: ['./call-request-confirm.component.scss']
})
export class CallRequestConfirmComponent implements OnInit {
  formData: any;
  isOrganizer = false;
  isLeader = false;
  isNoteEditable = false;
  isLoading = false;
  isCancelLoading = false;
  isAcceptLoading = false;
  note = '';
  duration = '';
  config = NoteQuillEditor;
  quillEditorRef;
  isAddNoteLoading = false;
  selectedDate;
  ownDateTime;
  date;
  time;
  datetime = '';
  minDate;
  calendaryLink = '';
  timezone;

  constructor(
    private dialogRef: MatDialogRef<CallRequestConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private userService: UserService,
    private location: Location
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
      minute: current.getMinutes()
    };
  }
  @ViewChild('editor') htmlEditor: HtmlEditorComponent;

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.formData = this.data.inquiry;
    this.selectedDate = this.formData.proposed_at[0];
    this.userService.profile$.subscribe((res) => {
      this.timezone = res['time_zone'];
      if (this.formData) {
        if (this.formData.leader) {
          this.isLeader = this.formData.leader._id === res._id;
        }
        this.isOrganizer = this.formData.user._id === res._id;
      }
      this.duration =
        this.formData.duration === 60
          ? '1 hour'
          : this.formData.duration + ' mins';
      this.note = this.formData.note;
      this.isNoteEditable = this.isLeader && this.formData.status !== 'pending';
    });

    const _SELF = this;
    setTimeout(() => {
      if (_SELF.htmlEditor && _SELF.note) {
        _SELF.htmlEditor.setValue(_SELF.note);
      }
    }, 500);
  }

  isSelectedDate(date): any {
    if (this.selectedDate === date) {
      return true;
    }
    return false;
  }
  selectSuiteDate(date): void {
    this.selectedDate = date;
  }
  acceptRequest(): void {
    this.isAcceptLoading = true;
    const ownDateTime = moment(this.ownDateTime);
    const desired = new Date(
      `${ownDateTime.year()}-${numPad(ownDateTime.month() + 1)}-${numPad(
        ownDateTime.date()
      )}T${numPad(ownDateTime.hour())}:${numPad(ownDateTime.minute())}:00.000${
        this.timezone
      }`
    ).toISOString();

    const data = {
      call_id: this.formData._id,
      note: this.note,
      confirmed_at: this.selectedDate,
      desired_at: desired,
      schedule_link: this.calendaryLink
    };

    this.teamService.acceptCall(data).subscribe(
      (res) => {
        this.isAcceptLoading = false;
        const result = {
          inquiry_id: this.formData._id,
          status: 'planned'
        };
        this.location.replaceState('/teams');
        this.dialogRef.close({ data: result });
      },
      (error) => {
        this.isAcceptLoading = false;
        this.closeDialog();
      }
    );
  }
  cancelRequest(): void {
    this.isCancelLoading = true;
    const data = {
      call_id: this.formData._id
    };
    this.teamService.rejectCall(data).subscribe(
      (res) => {
        this.isCancelLoading = false;
        const result = {
          inquiry_id: this.formData._id,
          status: 'canceled'
        };
        this.location.replaceState('/teams');
        this.dialogRef.close({ data: result });
      },
      (error) => {
        this.isCancelLoading = false;
        this.closeDialog();
      }
    );
  }
  addNote(): void {
    if (this.note === this.formData.note) {
      this.dialogRef.close();
      return;
    }
    this.isAddNoteLoading = true;
    const data = {
      ...this.formData,
      note: this.note
    };
    this.teamService.updateCall(this.formData._id, data).subscribe(
      (res) => {
        this.isAddNoteLoading = false;
        this.formData.note = this.note;
        this.closeDialog();
      },
      (error) => {
        this.isAddNoteLoading = false;
        this.closeDialog();
      }
    );
  }
  closeDialog(): void {
    this.isLoading = false;
    this.location.replaceState('/teams');
    this.dialogRef.close();
  }
  sendMessage(): void {}

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
    this.ownDateTime = moment(this.getDateTime()).format('YYYY-MM-DD hh:mm A');
    close();
  }

  calendarLink(): void {
    this.userService.profile$.subscribe((res) => {
      if (
        res['garbage'] &&
        res['garbage'].calendly &&
        res['garbage'].calendly.link
      ) {
        this.calendaryLink = res['garbage'].calendly.link;
      }
    });
  }

  pickOwnDateTime(): void {}
}
