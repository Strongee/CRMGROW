import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeamService } from 'src/app/services/team.service';
import { ToastrService } from 'ngx-toastr';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { TeamDeleteComponent } from '../team-delete/team-delete.component';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.scss']
})
export class TeamEditComponent implements OnInit {
  submitted = false;
  updating = false;
  updateSubscription: Subscription;
  team;
  name = '';
  constructor(
    private teamService: TeamService,
    private toast: ToastrService,
    private dialogRef: MatDialogRef<TeamEditComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.team) {
      this.team = { ...this.data.team };
    }
  }

  ngOnInit(): void {
    this.name = this.team.name;
  }

  update(): void {
    const data = {
      ...this.team,
      name: this.name
    };
    this.updating = true;
    this.updateSubscription = this.teamService
      .update(this.team._id, data)
      .subscribe(
        (res) => {
          this.updating = false;
          this.dialogRef.close(res);
        },
        (err) => {
          this.updating = false;
        }
      );
  }
  deleteTeam(): void {
    const team = this.team;
    this.dialog
      .open(TeamDeleteComponent, {
        data: {
          team
        }
      })
      .afterClosed()
      .subscribe((res) => {});
  }
}
