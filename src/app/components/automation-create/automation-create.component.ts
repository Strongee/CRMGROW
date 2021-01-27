import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-automation-create',
  templateUrl: './automation-create.component.html',
  styleUrls: ['./automation-create.component.scss']
})
export class AutomationCreateComponent implements OnInit {
  submitted = false;
  title = '';
  loading = false;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<AutomationCreateComponent>,
  ) {}

  ngOnInit(): void {}

  create(): void {
    if (this.title === '') {
      return;
    }
    this.router.navigate([`/autoflow/create/${this.title}`]);
    this.dialogRef.close();
  }
}
