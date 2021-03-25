import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AutomationService } from 'src/app/services/automation.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-automation-share',
  templateUrl: './automation-share.component.html',
  styleUrls: ['./automation-share.component.scss']
})
export class AutomationShareComponent implements OnInit {
  automations: any[] = [];
  loading = false;
  loadSubscription: Subscription;

  selectedAutomations: any[] = [];
  hideAutomations: any[] = [];
  sharing = false;
  shareSubscription: Subscription;

  teamId = '';
  constructor(
    private dialogRef: MatDialogRef<AutomationShareComponent>,
    private automationService: AutomationService,
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.teamId = this.data.team_id;
    if (this.data.hideAutomations && this.data.hideAutomations.length > 0) {
      this.hideAutomations = this.data.hideAutomations;
    }
    this.loadAutomations();
  }

  loadAutomations(): void {
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.automationService.loadOwn().subscribe(
      (automations) => {
        this.loading = false;
        this.automations = automations.filter((e) => {
          if (this.hideAutomations.indexOf(e._id) >= 0) {
            return false;
          }
          return true;
        });
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  toggleAutomation(_id): void {
    const pos = this.selectedAutomations.indexOf(_id);
    if (pos !== -1) {
      this.selectedAutomations.splice(pos, 1);
    } else {
      this.selectedAutomations.push(_id);
    }
  }

  shareAutomations(): void {
    this.sharing = true;
    this.shareSubscription && this.shareSubscription.unsubscribe();
    this.shareSubscription = this.teamService
      .shareAutomations(this.teamId, this.selectedAutomations)
      .subscribe(
        (res) => {
          this.sharing = false;
          this.dialogRef.close({
            automations: res
          });
        },
        (err) => {
          this.sharing = false;
        }
      );
  }
}
