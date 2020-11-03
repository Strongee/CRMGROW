import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-recurring-dialog',
  templateUrl: './calendar-recurring-dialog.component.html',
  styleUrls: ['./calendar-recurring-dialog.component.scss']
})
export class CalendarRecurringDialogComponent implements OnInit {
  eventType = 'own';

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CalendarRecurringDialogComponent>
  ) {}

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    const data = {
      type: this.eventType
    };
    this.dialogRef.close(data);
  }

  changeType(e): void {
    this.eventType = e.target.value;
  }
}
