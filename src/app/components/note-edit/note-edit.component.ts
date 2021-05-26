import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/app/models/note.model';
import { DealsService } from 'src/app/services/deals.service';
import { NoteService } from 'src/app/services/note.service';
import { isEmptyHtml } from 'src/app/utils/functions';

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {
  saving = false;
  note: Note = new Note();
  contact: string = '';

  // Deal Relative Data
  formType = '';
  dealName: string = '';

  constructor(
    private dialogRef: MatDialogRef<NoteEditComponent>,
    private noteService: NoteService,
    private dealService: DealsService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data) {
      if (this.data.type === 'deal') {
        this.formType = 'deal';
        this.note = { ...this.note, ...this.data.note };
        this.dealName = this.data.deal_name;
      } else {
        this.note = { ...this.note, ...this.data.note };
      }
      this.contact = this.data.contact_name;
    }
  }

  ngOnInit(): void {}

  update(): void {
    if (!this.note.content || isEmptyHtml(this.note.content)) {
      return;
    }
    if (this.formType === 'deal') {
      this.saving = true;
      this.dealService
        .editNote({ ...this.note, note: this.note._id, _id: undefined })
        .subscribe((status) => {
          if (status) {
            this.saving = false;
            this.dialogRef.close(this.note);
          }
        });
    } else {
      this.saving = true;
      this.noteService.update(this.note._id, this.note).subscribe((res) => {
        if (res) {
          this.saving = false;
          this.dialogRef.close(this.note);
        }
      });
    }
  }
}
