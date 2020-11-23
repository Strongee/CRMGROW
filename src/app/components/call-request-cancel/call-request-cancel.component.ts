import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NoteQuillEditor } from '../../constants/variable.constants';
import { QuillEditorComponent } from 'ngx-quill';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

  @ViewChild('messageEditor') noteEditor: QuillEditorComponent;

  ngOnInit(): void {
    console.log("cancel call ============>", this.data);
  }
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
  sendMessage(): void {
    // this.dialogRef.close();
  }
}
