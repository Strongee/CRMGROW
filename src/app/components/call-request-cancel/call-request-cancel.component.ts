import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NoteQuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';

@Component({
  selector: 'app-call-request-cancel',
  templateUrl: './call-request-cancel.component.html',
  styleUrls: ['./call-request-cancel.component.scss']
})
export class CallRequestCancelComponent implements OnInit {
  message = '';
  config = NoteQuillEditor;
  quillEditorRef;
  submitted = false;
  isSending = false;
  constructor(
    private dialogRef: MatDialogRef<CallRequestCancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;

  ngOnInit(): void {

  }


  closeDialog(): void {
    this.dialogRef.close();
  }
  sendMessage(): void {
    // this.dialogRef.close();
  }
}
