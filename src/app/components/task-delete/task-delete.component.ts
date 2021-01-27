import { Component, Inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

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
    private taskService: TaskService,
    private toast: ToastrService
  ) {
    this.selectedIds = this.data.ids;
  }

  ngOnInit(): void {}

  delete(): void {
    this.deleting = true;
    this.taskService.archive(this.selectedIds).subscribe((status) => {
      this.deleting = false;
      if (status) {
        this.dialogRef.close({ status: true });
        this.toast.success('', 'Task(s) were archived successfully.', {
          closeButton: true
        });
      }
    });
  }
}
