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
  hideTemplates: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<TemplateShareComponent>,
    private templateService: TemplatesService,
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.teamId = this.data.team_id;
    this.hideTemplates = this.data.hideTemplates;
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.templateService.loadOwn().subscribe(
      (res) => {
        this.loading = false;
        const templates = res;
        this.templates = templates.filter((e) => {
          if (this.hideTemplates.indexOf(e._id) >= 0) {
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
