import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import { TemplatesService } from '../../services/templates.service';

@Component({
  selector: 'app-template-share',
  templateUrl: './template-share.component.html',
  styleUrls: ['./template-share.component.scss']
})
export class TemplateShareComponent implements OnInit {

  templates: any[] = [];
  loading = false;
  loadSubscription: Subscription;
  shareSubscription: Subscription;
  selectedTemplates: any[] = [];
  sharing = false;
  teamId = '';
  preShared: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<TemplateShareComponent>,
    private templateService: TemplatesService,
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.teamId = this.data.team_id;
    this.preShared = this.data.preShared;
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.templateService.loadOwn().subscribe(
      (res) => {
        this.loading = false;
        const templates = res;
        if (this.preShared && this.preShared.length > 0) {
          for (const shared of this.preShared) {
            const index = templates.findIndex((item) => item._id === shared._id);
            if (index >= 0) {
              templates.splice(index, 1);
            }
          }
        }
        this.templates = templates;
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  toggleTemplate(_id): void {
    const pos = this.selectedTemplates.indexOf(_id);
    if (pos !== -1) {
      this.selectedTemplates.splice(pos, 1);
    } else {
      this.selectedTemplates.push(_id);
    }
  }

  shareTemplates(): void {
    this.sharing = true;
    this.shareSubscription && this.shareSubscription.unsubscribe();
    this.shareSubscription = this.teamService
      .shareTemplates(this.teamId, this.selectedTemplates)
      .subscribe(
        (res) => {
          this.sharing = false;
          this.dialogRef.close({
            templates: res
          });
        },
        (err) => {
          this.sharing = false;
        }
      );
  }
}
