import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upgrade-plan-error',
  templateUrl: './upgrade-plan-error.component.html',
  styleUrls: ['./upgrade-plan-error.component.scss']
})
export class UpgradePlanErrorComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UpgradePlanErrorComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {}

  goToBilling(): void {
    this.router.navigate([`/profile/upgrade-billing`]);
    this.dialogRef.close();
  }
}
