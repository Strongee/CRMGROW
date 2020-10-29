import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, Observable } from 'rxjs';

import {
  QuillEditor,
  TIMES,
  CALL_REQUEST_DURATION
} from 'src/app/constants/variable.constants';

import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from '../../services/file.service';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-join-call-request',
  templateUrl: './join-call-request.component.html',
  styleUrls: ['./join-call-request.component.scss']
})
export class JoinCallRequestComponent implements OnInit, OnDestroy {
  contacts = [];
  leader;
  subject = '';

  description: any;

  minDate: any;
  callDateTimes = [];
  times = TIMES;

  duration = '30 mins';
  durations = CALL_REQUEST_DURATION;

  submitted = false;
  isLoading = false;
  requestCreateSubscription: Subscription;
  constructor(
    private dialogRef: MatDialogRef<JoinCallRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private userService: UserService,
    private fileService: FileService
  ) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.callDateTimes.push({
      id: Date.now(),
      date: this.minDate,
      time: '15:00:00.000'
    });
  }

  @ViewChild('descriptionEditor') descriptionEditor: QuillEditorComponent;

  config = QuillEditor;
  quillEditorRef;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.requestCreateSubscription &&
      this.requestCreateSubscription.unsubscribe();
  }
  changeLeader(leader): void {
    this.leader = leader;
  }
  addCallDateTime(): void {
    this.callDateTimes.push({
      id: Date.now(),
      date: this.minDate,
      time: '15:00:00.000'
    });
  }
  removeCallDateTime(dateTime): void {
    if (this.callDateTimes.length < 2) {
      return;
    }
    const index = this.callDateTimes.findIndex(
      (item) => item.id === dateTime.id
    );
    this.callDateTimes.splice(index, 1);
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }

  initImageHandler(): void {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).subscribe((res) => {
          this.insertImageToEditor(res.url);
        });
      }
    });
    imageInput.click();
  }
  insertImageToEditor(url): void {
    const range = this.quillEditorRef.getSelection();
    // const img = `<img src="${url}" alt="attached-image-${new Date().toISOString()}"/>`;
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, img);
    this.descriptionEditor.quillEditor.insertEmbed(
      range.index,
      `image`,
      url,
      'user'
    );
    this.descriptionEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  assignCallRequest(): void {
    this.submitted = true;
    if (!this.leader) {
      return;
    }

    if (!this.contacts.length) {
      return;
    }

    this.isLoading = true;
    const subject = this.subject;
    const description = this.description;
    let duration = 30;
    if (this.duration === '15 mins') {
      duration = 15;
    } else if (this.duration === '30 mins') {
      duration = 30;
    } else if (this.duration === '45 mins') {
      duration = 45;
    } else {
      duration = 60;
    }

    const status = 'pending';
    const contacts = [];
    for (let contact of this.contacts) {
      contacts.push(contact._id);
    }

    this.userService.loadProfile().subscribe((res) => {
      const timezone = res['time_zone'];
      const dueStart = new Date(
        `${this.callDateTimes[0].date.year}-${this.numPad(
          this.callDateTimes[0].date.month
        )}-${this.numPad(this.callDateTimes[0].date.day)}T${
          this.callDateTimes[0].time
        }${timezone}`
      ).toISOString();
      const data = {
        user: res._id,
        leader: this.leader._id,
        contacts,
        subject,
        description,
        duration,
        status,
        due_start: dueStart
      };

      console.log("request data =============>", data);
      this.teamService.requestCall(data).subscribe((response) => {
        console.log("request call response ==============>", response);
        this.isLoading = false;
        this.dialogRef.close();
      });
    });
  }

  onAdding(): void {}

  numPad(num): any {
    if (num < 10) {
      return '0' + num;
    }
    return num + '';
  }
}
