import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';

@Component({
  selector: 'app-team-join',
  templateUrl: './team-join.component.html',
  styleUrls: ['./team-join.component.scss']
})
export class TeamJoinComponent implements OnInit {
  submitted = false;
  updating = false;
  updateSubscription: Subscription;
  constructor(
    private dialogRef: MatDialogRef<TeamJoinComponent>,
  ) { }

  ngOnInit() {
  }

  join(): void {

  }

}
