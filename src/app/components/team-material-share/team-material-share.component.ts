import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from '../../services/team.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Material } from 'src/app/models/material.model';
import { ToastrService } from 'ngx-toastr';
import { Template } from 'src/app/models/template.model';
import {Automation} from "../../models/automation.model";

@Component({
  selector: 'app-team-material-share',
  templateUrl: './team-material-share.component.html',
  styleUrls: ['./team-material-share.component.scss']
})
export class TeamMaterialShareComponent implements OnInit {
  sharing = false;
  shareType = '';
  selectedTeam: Team = null;
  userId = '';
  currentUser: User;
  teams = [];
  material: Material = new Material();
  template: Template = new Template();
  automation: Automation;

  profileSubscription: Subscription;
  constructor(
    public teamService: TeamService,
    private userService: UserService,
    private toast: ToastrService,
    private dialogRef: MatDialogRef<TeamMaterialShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      const profile = this.userService.profile.getValue();
      this.userId = profile._id;
      this.currentUser = res;
    });

    if (this.data) {
      if (this.data.material) {
        this.material = this.data.material;
      }
      if (this.data.type) {
        this.shareType = this.data.type;
      }
      if (this.data.template) {
        this.template = this.data.template;
      }
      if (this.data.automation) {
        this.automation = this.data.automation;
      }
    }

    this.load();
  }

  load(): void {
    this.teamService.loadAll(true);
    this.teamService.teams$.subscribe((res) => {
      const teams = this.teamService.teams.getValue();
      const ownerTeams = [];
      const editorTeams = [];

      if (this.shareType == 'material') {
        for (const team of teams) {
          const video = team.videos.findIndex(
            (item) => item == this.material._id
          );
          const pdf = team.pdfs.findIndex((item) => item == this.material._id);
          const image = team.images.findIndex(
            (item) => item == this.material._id
          );
          if (team.owner && team.owner.length > 0) {
            const index = team.owner.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && video < 0 && pdf < 0 && image < 0) {
              ownerTeams.push(team);
              continue;
            }
          }
          if (team.editors && team.editors.length > 0) {
            const index = team.editors.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && video < 0 && pdf < 0 && image < 0) {
              editorTeams.push(team);
              continue;
            }
          }
        }
      } else if (this.shareType == 'template') {
        for (const team of teams) {
          const shared = team.email_templates.findIndex(
            (item) => item == this.template._id
          );
          if (team.owner && team.owner.length > 0) {
            const index = team.owner.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && shared < 0) {
              ownerTeams.push(team);
              continue;
            }
          }
          if (team.editors && team.editors.length > 0) {
            const index = team.editors.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && shared < 0) {
              editorTeams.push(team);
              continue;
            }
          }
        }
      } else if (this.shareType === 'automation') {
        for (const team of teams) {
          const shared = team.automations.findIndex(
            (item) => item == this.automation._id
          );
          if (team.owner && team.owner.length > 0) {
            const index = team.owner.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && shared < 0) {
              ownerTeams.push(team);
              continue;
            }
          }
          if (team.editors && team.editors.length > 0) {
            const index = team.editors.findIndex(
              (item) => item._id === this.userId
            );
            if (index >= 0 && shared < 0) {
              editorTeams.push(team);
            }
          }
        }
      }
      this.teams = [...ownerTeams, ...editorTeams];
    });
  }

  share(): void {
    this.sharing = true;
    if (this.shareType == 'material') {
      if (this.material.material_type == 'video') {
        this.teamService
          .shareVideos(this.selectedTeam._id, [this.material._id])
          .subscribe((res) => {
            if (res && res.length > 0) {
              this.sharing = false;
              this.toast.success('Video has been shared successfully.');
              this.dialogRef.close();
            }
          });
      } else if (this.material.material_type == 'pdf') {
        this.teamService
          .sharePdfs(this.selectedTeam._id, [this.material._id])
          .subscribe((res) => {
            if (res && res.length > 0) {
              this.sharing = false;
              this.toast.success('Pdf has been shared successfully.');
              this.dialogRef.close();
            }
          });
      } else if (this.material.material_type == 'image') {
        this.teamService
          .shareImages(this.selectedTeam._id, [this.material._id])
          .subscribe((res) => {
            if (res && res.length > 0) {
              this.sharing = false;
              this.toast.success('Image has been shared successfully.');
              this.dialogRef.close();
            }
          });
      }
    } else if (this.shareType == 'template') {
      this.teamService
        .shareTemplates(this.selectedTeam._id, [this.template._id])
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.sharing = false;
            this.toast.success('Template has been shared successfully.');
            this.dialogRef.close();
          }
        });
    } else if (this.shareType === 'automation') {
      this.teamService
        .shareAutomations(this.selectedTeam._id, [this.automation._id])
        .subscribe((res) => {
          if (res) {
            this.sharing = false;
            this.toast.success('Automation has been shared successfully.');
            this.dialogRef.close();
          }
        });
    }
  }
}
