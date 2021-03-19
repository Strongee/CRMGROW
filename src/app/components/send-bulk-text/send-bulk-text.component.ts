import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-send-bulk-text',
  templateUrl: './send-bulk-text.component.html',
  styleUrls: ['./send-bulk-text.component.scss']
})
export class SendBulkTextComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SendBulkTextComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
}
