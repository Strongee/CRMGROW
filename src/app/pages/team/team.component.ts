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
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { TabItem } from '../../utils/data.types';

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
  selectedMembers = new SelectionModel(true, []);
  shareUrl = 'https://www.crmgrow.com/';
  tabs: TabItem[] = [
    { icon: 'i-icon i-teams', label: 'MEMBERS', id: 'members' },
    { icon: 'i-icon i-group-call', label: 'SHARED', id: 'shared' }
  ];
  selectedTab: TabItem = this.tabs[0];
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
    this.load();
  }
  load(): void {
    this.teamId = this.route.snapshot.params['id'];
    this.userService.loadProfile().subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
      if (this.teamId) {
        this.loadTeam();
      } else {
        this.teamId = this.route.snapshot.params['team'];
        if (this.teamId) {
          this.acceptInvitation();
        } else {
          const teamId = this.route.snapshot.queryParams['team'];
          const userId = this.route.snapshot.queryParams['user'];
          if (teamId && userId) {
            this.teamId = teamId;
            this.acceptOutRequest(teamId, userId);
          } else {
            this.router.navigate(['/teams']);
          }
        }
      }
    });
    this.loadAffiliateSubscription &&
      this.loadAffiliateSubscription.unsubscribe();
    this.loadAffiliateSubscription = this.userService
      .loadAffiliate()
      .subscribe((res) => {
        let affiliate = {};
        if (res) {
          affiliate = res;
        }
        if (affiliate['id']) {
          this.shareUrl = affiliate['links'][0]['url'];
        } else {
          this.createAffiliateSubscription &&
            this.createAffiliateSubscription.unsubscribe();
          this.createAffiliateSubscription = this.userService
            .createAffiliate()
            .subscribe((response) => {
              if (response) {
                affiliate = response;
                this.shareUrl = affiliate['links'][0]['url'];
              }
            });
        }
      });
  }
  acceptInvitation(): void {
    this.accepting = true;
    this.acceptSubscription && this.acceptSubscription.unsubscribe();
    this.acceptSubscription = this.teamService
      .acceptInvitation(this.teamId)
      .subscribe(
        (res) => {
          this.accepting = false;
          this.location.replaceState('/teams/' + this.teamId);
          this.loadTeam();
        },
        (err) => {
          this.accepting = false;
          if (err.status === 400) {
            // this.dialog
            //   .open(NotifyComponent, {
            //     width: '96vw',
            //     maxWidth: '400px',
            //     data: {
            //       message: 'Invalid permission for this team.'
            //     },
            //     disableClose: true
            //   })
            //   .afterClosed()
            //   .subscribe((res) => {
            //     this.router.navigate(['/teams']);
            //   });
          } else {
            this.router.navigate(['/teams']);
          }
        }
      );
  }
  loadTeam(): void {
    this.loading = true;
    this.showLoader();
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.teamService.read(this.teamId).subscribe(
      (res) => {
        this.hideLoader();
        this.team = {
          ...res,
          owner: res['owner'],
          highlights: res['highlights'] || [],
          brands: res['brands'] || []
        };
        console.log("team =============>", this.team);
        this.loading = false;
        const ownerIndex = _.findIndex(this.team.owner, { _id: this.userId });
        if (ownerIndex !== -1) {
          this.role = 'owner';
        } else if (this.team.editors.indexOf(this.userId) !== -1) {
          this.role = 'editor';
        }
      },
      (err) => {
        this.hideLoader();
        this.loading = false;
        // this.loadError = true;
      }
    );
  }
  inviteMember(): void {
    // this.dialog
    //   .open(InviteUserComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId,
    //       share_url: this.shareUrl
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res['invites']) {
    //       this.team.invites = [...res['invites'], ...this.team.invites];
    //     }
    //     if (res['referrals']) {
    //       if (this.team.referrals && this.team.referrals.length) {
    //         this.team.referrals = [...res['referrals'], ...this.team.referrals];
    //       } else {
    //         this.team.referrals = [...res['referrals']];
    //       }
    //     }
    //   });
  }
  createTeamVideo(): void {
    // this.dialog
    //   .open(VideoShareComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.materials) {
    //         this.team.videos = [...this.team.videos, ...res.materials];
    //       } else if (res.command === 'create_new') {
    //         this.dialog
    //           .open(VideoCreateV2Component, {
    //             width: '96vw',
    //             maxWidth: '500px',
    //             height: 'calc(100vh - 50px)',
    //             maxHeight: '690px',
    //             disableClose: true,
    //             data: {
    //               team_id: this.teamId
    //             }
    //           })
    //           .afterClosed()
    //           .subscribe((response) => {
    //             if (response) {
    //               if (response._id) {
    //                 this.creating = true;
    //                 this.createubscription &&
    //                   this.createubscription.unsubscribe();
    //                 this.createubscription = this.teamService
    //                   .shareVideos(this.teamId, [response._id])
    //                   .subscribe(
    //                     (result) => {
    //                       this.creating = false;
    //                       this.team.videos.push(result['data'][0]);
    //                     },
    //                     (err) => {
    //                       this.creating = false;
    //                     }
    //                   );
    //               }
    //             }
    //           });
    //       }
    //     }
    //   });
  }
  createTeamPdf(): void {
    // this.dialog
    //   .open(PdfShareComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.materials) {
    //         this.team.pdfs = [...this.team.pdfs, ...res.materials];
    //       } else if (res.command === 'create_new') {
    //         this.dialog
    //           .open(PdfCreateComponent, {
    //             width: '96vw',
    //             maxWidth: '500px',
    //             disableClose: true,
    //             data: {
    //               team_id: this.teamId
    //             }
    //           })
    //           .afterClosed()
    //           .subscribe((response) => {
    //             if (response) {
    //               if (response._id) {
    //                 this.creating = true;
    //                 this.createubscription &&
    //                   this.createubscription.unsubscribe();
    //                 this.createubscription = this.teamService
    //                   .sharePdfs(this.teamId, [response._id])
    //                   .subscribe(
    //                     (result) => {
    //                       this.creating = false;
    //                       this.team.pdfs.push(result['data'][0]);
    //                     },
    //                     (err) => {
    //                       this.creating = false;
    //                     }
    //                   );
    //               }
    //             }
    //           });
    //       }
    //     } else {
    //     }
    //   });
  }
  createTeamImage(): void {
    // this.dialog
    //   .open(ImageShareComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.materials) {
    //         this.team.images = [...this.team.images, ...res.materials];
    //       } else if (res.command === 'create_new') {
    //         this.dialog
    //           .open(ImageCreateComponent, {
    //             width: '96vw',
    //             maxWidth: '500px',
    //             disableClose: true,
    //             data: {
    //               team_id: this.teamId
    //             }
    //           })
    //           .afterClosed()
    //           .subscribe((response) => {
    //             if (response) {
    //               if (response._id) {
    //                 this.creating = true;
    //                 this.createubscription &&
    //                   this.createubscription.unsubscribe();
    //                 this.createubscription = this.teamService
    //                   .shareImages(this.teamId, [response._id])
    //                   .subscribe(
    //                     (result) => {
    //                       this.creating = false;
    //                       this.team.images.push(result['data'][0]);
    //                     },
    //                     (err) => {
    //                       this.creating = false;
    //                     }
    //                   );
    //               }
    //             }
    //           });
    //       }
    //     } else {
    //     }
    //   });
  }
  createAutomation(): void {
    // this.dialog
    //   .open(ShareAutomationComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.automations) {
    //         this.team.automations = [
    //           ...this.team.automations,
    //           ...res.automations
    //         ];
    //       }
    //     }
    //   });
  }
  createEmailTemplate(): void {
    // this.dialog
    //   .open(ShareTemplatesComponent, {
    //     width: '96vw',
    //     maxWidth: '500px',
    //     height: '70vh',
    //     disableClose: true,
    //     data: {
    //       team_id: this.teamId
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.templates) {
    //         this.team.email_templates = [
    //           ...this.team.email_templates,
    //           ...res.templates
    //         ];
    //       }
    //     }
    //   });
  }
  removeTeamVideo(material): void {
    // this.dialog
    //   .open(ConfirmComponent, {
    //     data: {
    //       message: 'Are you sure to remove this video?',
    //       cancelLabel: 'No',
    //       confirmLabel: 'Remove'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.teamService.removeVideo(material._id).subscribe(
    //         (response) => {
    //           this.team.videos.some((e, index) => {
    //             if (e._id === material._id) {
    //               this.team.videos.splice(index, 1);
    //               return true;
    //             }
    //           });
    //           this.toast.success('You removed the video successfully.');
    //         },
    //         (err) => {}
    //       );
    //     }
    //   });
  }
  removeTeamPdf(material): void {
    // this.dialog
    //   .open(ConfirmComponent, {
    //     data: {
    //       message: 'Are you sure to remove this pdf?',
    //       cancelLabel: 'No',
    //       confirmLabel: 'Remove'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.teamService.removePdf(material._id).subscribe(
    //         (respose) => {
    //           this.team.pdfs.some((e, index) => {
    //             if (e._id === material._id) {
    //               this.team.pdfs.splice(index, 1);
    //               return true;
    //             }
    //           });
    //           this.toast.success('You removed the pdf successfully.');
    //         },
    //         (err) => {}
    //       );
    //     }
    //   });
  }
  removeTeamImage(material): void {
    // this.dialog
    //   .open(ConfirmComponent, {
    //     data: {
    //       message: 'Are you sure to remove this image?',
    //       cancelLabel: 'No',
    //       confirmLabel: 'Remove'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.teamService.removeImage(material._id).subscribe(
    //         (respose) => {
    //           this.team.images.some((e, index) => {
    //             if (e._id === material._id) {
    //               this.team.images.splice(index, 1);
    //               return true;
    //             }
    //           });
    //           this.toast.success('You removed the image successfully.');
    //         },
    //         (err) => {
    //         }
    //       );
    //     }
    //   });
  }
  removeTeamTemplate(material): void {
    // this.dialog
    //   .open(ConfirmComponent, {
    //     data: {
    //       message: 'Are you sure to remove this template?',
    //       cancelLabel: 'No',
    //       confirmLabel: 'Remove'
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       this.teamService.removeTemplate(material._id).subscribe(
    //         (response) => {
    //           this.team.email_templates.some((e, index) => {
    //             if (e._id === material._id) {
    //               this.team.email_templates.splice(index, 1);
    //               return true;
    //             }
    //           });
    //           this.toast.success('You removed the template successfully.');
    //         },
    //         (err) => {}
    //       );
    //     }
    //   });
  }
  cancelReferral(member): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          message: 'Are you sure to cancel this invitation?',
          cancelLabel: 'No',
          confirmLabel: 'Cancel'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const referrals = [...this.team.referrals];
          const pos = referrals.indexOf(member);
          if (pos !== -1) {
            referrals.splice(pos, 1);
          }
          this.updating = true;
          this.teamService.updateTeam(this.teamId, { referrals }).subscribe(
            (response) => {
              this.updating = false;
              this.team.referrals = referrals;
              this.toast.success('You cancelled the invitation successfully.');
            },
            (err) => {
              this.updating = false;
            }
          );
        }
      });
  }
  cancelInvite(member): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          message: 'Are you sure to cancel this invitation?',
          cancelLabel: 'No',
          confirmLabel: 'Cancel'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          let newInvites = [];
          this.team.invites.forEach((e) => {
            if (e._id != member._id) {
              newInvites.push(e._id);
            }
          });
          this.updating = true;
          this.teamService
            .updateTeam(this.teamId, { invites: newInvites })
            .subscribe(
              (response) => {
                this.updating = false;
                this.team.invites.some((e, index) => {
                  if(e._id === member._id) {
                    this.team.invites.splice(index, 1);
                    return true;
                  }
                });
                this.toast.success(
                  'You cancelled the invitation successfully.'
                );
              },
              (err) => {
                this.updating = false;
              }
            );
        }
      });
  }
  toggleMember(member): void {
    const editors = [...this.team.editors];
    const pos = editors.indexOf(member._id);
    if (pos !== -1) {
      editors.splice(pos, 1);
    } else {
      editors.push(member._id);
    }
    this.updating = true;
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.teamService
      .update(this.teamId, { editors })
      .subscribe(
        (res) => {
          this.updating = false;
          this.team.editors = editors;
        },
        (err) => {
          this.updating = false;
          this.team.editors = editors;
        }
      );
  }
  removeMember(member): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          message: 'Are you sure to remove this member?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const editors = [...this.team.editors];
          const pos = editors.indexOf(member._id);
          if (pos !== -1) {
            editors.splice(pos, 1);
          }
          const newMembers = [];
          this.team.members.forEach((e) => {
            if (e._id !== member._id) {
              newMembers.push(e._id);
            }
          });
          this.teamService
            .updateTeam(this.teamId, { members: newMembers, editors })
            .subscribe(
              (response) => {
                this.team.members.some((e, index) => {
                  if (e._id === member._id) {
                    this.team.members.splice(index, 1);
                  }
                });
                this.toast.success('You removed member successfully.');
              },
              (err) => {}
            );
        }
      });
  }
  acceptRequest(member): void {
    this.teamService.acceptRequest(this.teamId, member._id).subscribe(
      (res) => {
        this.team.members.push(member);
        this.team.requests.some((e, index) => {
          if (e._id === member._id) {
            this.team.requests.splice(index, 1);
            return true;
          }
        });
      },
      (err) => {}
    );
  }
  acceptOutRequest(teamId, memberId): void {
    // this.accepting = true;
    // this.teamService.acceptRequest(teamId, memberId).subscribe(
    //   (res) => {
    //     this.accepting = false;
    //     this.location.replaceState('/teams/' + this.teamId);
    //     this.loadTeam();
    //   },
    //   (err) => {
    //     this.accepting = false;
    //     if (err.status === 400) {
    //       this.dialog
    //         .open(NotifyComponent, {
    //           width: '96vw',
    //           maxWidth: '400px',
    //           data: {
    //             message: 'Invalid permission for this team.'
    //           },
    //           disableClose: true
    //         })
    //         .afterClosed()
    //         .subscribe((res) => {
    //           this.router.navigate(['/teams']);
    //         });
    //     } else {
    //       this.router.navigate(['/teams']);
    //     }
    //   }
    // );
  }
  sendMaterials(materialType, mediaType, material): void {
    // let materials = [];
    // if (material) {
    //   materials = [material];
    // } else {
    //   switch (materialType) {
    //     case 'video':
    //       materials = this.selectedVideos.selected;
    //       break;
    //     case 'pdf':
    //       materials = this.selectedPdfs.selected;
    //       break;
    //     case 'image':
    //       materials = this.selectedImages.selected;
    //       break;
    //   }
    // }
    // this.dialog.open(MaterialDialogComponent, {
    //   position: { top: '5vh' },
    //   width: '100vw',
    //   maxWidth: '600px',
    //   data: {
    //     materialType,
    //     mediaType,
    //     contacts: [],
    //     fromContact: false,
    //     materials,
    //     modalType: false,
    //     team: this.teamId
    //   }
    // });
  }
  copyLink(material, type): void {
    let url;

    if (type === 'video') {
      url =
        environment.website +
        '/video?video=' +
        material._id +
        '&user=' +
        this.userId +
        '&team=' +
        this.teamId;
    } else if (type === 'pdf') {
      url =
        environment.website +
        '/pdf?pdf=' +
        material._id +
        '&user=' +
        this.userId +
        '&team=' +
        this.teamId;
    } else if (type === 'image') {
      url =
        environment.website +
        '/image?image=' +
        material._id +
        '&user=' +
        this.userId +
        '&team=' +
        this.teamId;
    }
    const el = document.createElement('textarea');
    el.value = url;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toast.success('Copied the link to clipboard');
  }
  showLoader(): void {
    this.spinner.show('sp5');
  }
  hideLoader(): void {
    this.spinner.show('sp5');
  }
  status(team): any {
    let index;
    if (team.owner.length) {
      index = team.owner.filter((item) => item._id === this.userId).length;
      if (index > 0) {
        return 'Owner';
      }
    }
    if (team.editors.length) {
      index = team.editors.filter((item) => item._id === this.userId).length;
      if (index > 0) {
        return 'Editor';
      }
    }
  }
  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }
  selectAllPage(): void {
    if (this.isSelectedPage()) {
      this.team.members.forEach((e) => {
        if (this.selectedMembers.isSelected(e._id)) {
          this.selectedMembers.deselect(e._id);
        }
      });
      this.team.invites.forEach((e) => {
        if (this.selectedMembers.isSelected(e._id)) {
          this.selectedMembers.deselect(e._id);
        }
      });
    } else {
      this.team.members.forEach((e) => {
        if (!this.selectedMembers.isSelected(e._id)) {
          this.selectedMembers.select(e._id);
        }
      });
      this.team.invites.forEach((e) => {
        if (!this.selectedMembers.isSelected(e._id)) {
          this.selectedMembers.select(e._id);
        }
      });
    }
  }
  isSelectedPage(): any {
    if (this.team.members.length) {
      for (let i = 0; i < this.team.members.length; i++) {
        const e = this.team.members[i];
        if (!this.selectedMembers.isSelected(e._id)) {
          return false;
        }
      }
      if (this.team.invites.length) {
        for (let i = 0; i < this.team.invites.length; i++) {
          const e = this.team.invites[i];
          if (!this.selectedMembers.isSelected(e._id)) {
            return false;
          }
        }
      }
      return true;
    }
  }
  memberStatus(member): any {
    if (this.team.editors.indexOf(member._id) === -1) {
      return 'Viewer';
    } else {
      return 'Editor';
    }
  }
}
