import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { NoteQuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import { Location } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-call-request-scheduled',
  templateUrl: './call-request-scheduled.component.html',
  styleUrls: ['./call-request-scheduled.component.scss']
})
export class CallRequestScheduledComponent implements OnInit {
  formData: any;
  isOrganizer = false;
  isLeader = false;
  isLoading = false;
  isCancelLoading = false;
  note = '';
  duration = '';
  config = NoteQuillEditor;
  quillEditorRef;
  isAddNoteLoading = false;
  selectedDate;
  submitted = false;
  isEditable = false;

  constructor(
    private dialogRef: MatDialogRef<CallRequestScheduledComponent>,
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
    this.formData = this.data.plan;
    this.selectedDate = this.formData.proposed_at[0];
    this.userService.profile$.subscribe((res) => {
      if (this.formData) {
        if (this.formData.leader) {
          this.isLeader = this.formData.leader._id === res._id;
        }
        this.isOrganizer = this.formData.user._id === res._id;

        if (this.formData.status === 'planned') {
          this.isEditable = true;
        }
      }
      this.duration =
        this.formData.duration === 60
          ? '1 hour'
          : this.formData.duration + ' mins';
      this.note = this.formData.note;
    });
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
  }

  backCall(): void {
    if (this.isEditable) {
      this.isAddNoteLoading = true;
      const data = {
        ...this.formData,
        note: this.note
      };
      this.teamService.updateCall(this.formData._id, data).subscribe(
        (res) => {
          this.isAddNoteLoading = false;
          this.formData.note = this.note;
          this.location.replaceState('/teams');
          this.closeDialog();
        },
        (error) => {
          this.isAddNoteLoading = false;
          this.location.replaceState('/teams');
          this.closeDialog();
        }
      );
    } else {
      this.closeDialog();
    }
  }
  cancelCall(): void {
    this.isCancelLoading = true;
    const data = {
      call_id: this.formData._id
    };
    this.teamService.rejectCall(data).subscribe(
      (res) => {
        this.isCancelLoading = false;
        const result = {
          planed_id: this.formData._id,
          status: 'canceled'
        };
        this.location.replaceState('/teams');
        this.dialogRef.close({ data: result });
      },
      (error) => {
        this.isCancelLoading = false;
        this.location.replaceState('/teams');
        this.closeDialog();
      }
    );
  }

  closeDialog(): void {
    this.isLoading = false;
    this.location.replaceState('/teams');
    this.dialogRef.close();
  }
}
