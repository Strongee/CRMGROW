import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { TeamService } from 'src/app/services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { UserService } from '../../services/user.service';
import { environment } from 'src/environments/environment';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  loading = false;
  loadError = false;
  team;
  teamId = '';
  userId = '';
  currentUser;
  loadSubscription: Subscription;
  updating = false;
  updateSubscription: Subscription;
  paramSubscription: Subscription;
  role = 'member'; // owner | editor | member
  siteUrl = environment.website;
  createubscription: Subscription;
  creating = false;
  accepting = false;
  acceptSubscription: Subscription;
  selectedVideos = new SelectionModel<any>(true, []);
  selectedPdfs = new SelectionModel<any>(true, []);
  selectedImages = new SelectionModel<any>(true, []);
  loadAffiliateSubscription: Subscription;
  createAffiliateSubscription: Subscription;
  share_url = 'https://www.crmgrow.com/';
  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // this.teamId = this.route.snapshot.params['id'];
    // this.userService.loadProfile().subscribe((res) => {
    //   this.currentUser = res;
    //   this.userId = res._id;
    //   if (this.teamId) {
    //     this.loadTeam();
    //   } else {
    //     this.teamId = this.route.snapshot.params['team'];
    //     if (this.teamId) {
    //       this.acceptInvitation();
    //     } else {
    //       const teamId = this.route.snapshot.queryParams['team'];
    //       const userId = this.route.snapshot.queryParams['user'];
    //       if(teamId && userId) {
    //         this.teamId = teamId;
    //         this.acceptOutRequest(teamId, userId);
    //       } else {
    //         this.router.navigate(['/teams']);
    //       }
    //     }
    //   }
    // });
  }
}
