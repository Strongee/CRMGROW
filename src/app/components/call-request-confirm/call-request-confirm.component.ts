import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, Observable } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { NoteQuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import { Location } from '@angular/common';

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
  callDates = [];
  selectedDate;

  constructor(
    private dialogRef: MatDialogRef<CallRequestConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private userService: UserService,
    private location: Location
  ) {}

  @ViewChild('noteEditor') noteEditor: QuillEditorComponent;

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.formData = this.data.inquiry;
    this.callDates.push(this.data.inquiry.due_start);
    this.callDates.push(this.data.inquiry.due_end);
    this.selectedDate = this.data.inquiry.due_start;
    this.userService.loadProfile().subscribe((res) => {
      if (this.formData) {
        if (this.formData.leader) {
          this.isLeader = this.formData.leader._id === res._id;
        }
        this.isOrganizer = this.formData.user._id === res._id;
      }
      this.duration =
        this.formData.duration === '60'
          ? '1 hour'
          : this.formData.duration + ' mins';
      this.note = this.formData.note;
      this.isNoteEditable = this.isLeader && this.formData.status !== 'pending';
    });
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
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
    const data = {
      call_id: this.formData._id,
      note: this.note
    };
    this.teamService.acceptCall(data).subscribe(
      (res) => {
        this.isAcceptLoading = false;
        const result = {
          inquiry_id: this.formData._id,
          status: 'planned'
        };
        this.dialogRef.close({ data: result });
      },
      (error) => {
        this.isAcceptLoading = false;
        this.dialogRef.close();
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
        this.dialogRef.close({ data: result });
      },
      (error) => {
        this.isCancelLoading = false;
        this.dialogRef.close();
      }
    );
  }
  addNote(): void {
    this.isAddNoteLoading = true;
    const data = {
      ...this.formData,
      note: this.note
    };
    this.teamService.updateCall(this.formData._id, data).subscribe(
      (res) => {
        this.isAddNoteLoading = false;
        this.formData.note = this.note;
        this.dialogRef.close();
      },
      (error) => {
        this.isAddNoteLoading = false;
        this.dialogRef.close();
      }
    );
  }

  closeDialog(): void {
    this.isLoading = false;
    this.location.replaceState('/teams');
    this.dialogRef.close();
  }
}
