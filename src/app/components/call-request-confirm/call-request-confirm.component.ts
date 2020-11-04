import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    this.selectedDate = this.formData.proposed_at[0];
    this.userService.profile$.subscribe((res) => {
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
      console.log("call inquiry data ==============>", this.formData);
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
      note: this.note,
      proposed_at: this.selectedDate
    };
    this.teamService.acceptCall(data).subscribe(
      (res) => {
        console.log("accept call =============>", res);
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
}
