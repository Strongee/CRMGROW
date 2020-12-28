import { Component, Inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-task-delete',
  templateUrl: './task-delete.component.html',
  styleUrls: ['./task-delete.component.scss']
})
export class TaskDeleteComponent implements OnInit {
  deleting = false;
  selectedIds = [];
  constructor(
    private dialogRef: MatDialogRef<TaskDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private taskService: TaskService
  ) {
    this.selectedIds = this.data.ids;
  }

  ngOnInit(): void {}

  delete(): void {
    this.deleting = true;
    this.taskService.archive(this.selectedIds).subscribe(
      (res) => {
        this.deleting = false;
        if (res && res.status) {
          this.dialogRef.close({ status: true });
        } else {
          this.dialogRef.close({ status: false });
        }
      },
      (error) => {
        this.deleting = false;
        this.dialogRef.close({ status: false });
      }
    );
  }
}
