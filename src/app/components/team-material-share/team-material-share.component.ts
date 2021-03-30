import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from '../../services/team.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Material } from 'src/app/models/material.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team-material-share',
  templateUrl: './team-material-share.component.html',
  styleUrls: ['./team-material-share.component.scss']
})
export class TeamMaterialShareComponent implements OnInit {
  sharing = false;
  selectedTeam: Team = null;
  userId = '';
  currentUser: User;
  teams = [];
  material: Material = new Material();

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

    if (this.data && this.data.material) {
      this.material = this.data.material;
    }

    this.load();
  }

  load(): void {
    this.teamService.loadAll(true);
    this.teamService.teams$.subscribe((res) => {
      const teams = this.teamService.teams.getValue();
      const ownerTeams = [];
      const editorTeams = [];

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
      this.teams = [...ownerTeams, ...editorTeams];
    });
  }

  share(): void {
    this.sharing = true;
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
  }
}
