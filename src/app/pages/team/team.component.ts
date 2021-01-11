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
import { VideoShareComponent } from '../../components/video-share/video-share.component';
import { TeamEditComponent } from '../../components/team-edit/team-edit.component';
import { InviteTeamComponent } from 'src/app/components/invite-team/invite-team.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { MaterialShareComponent } from '../../components/material-share/material-share.component';
import { TemplateShareComponent } from '../../components/template-share/template-share.component';
import { AutomationShareComponent } from '../../components/automation-share/automation-share.component';
import { NotifyComponent } from '../../components/notify/notify.component';
import { AutomationAssignComponent } from '../../components/automation-assign/automation-assign.component';
import { TeamContactShareComponent } from '../../components/team-contact-share/team-contact-share.component';

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
  acceptJoinRequest = false;
  declineJoinRequest = false;
  acceptSubscription: Subscription;
  selectedVideos = new SelectionModel<any>(true, []);
  selectedPdfs = new SelectionModel<any>(true, []);
  selectedImages = new SelectionModel<any>(true, []);
  loadAffiliateSubscription: Subscription;
  createAffiliateSubscription: Subscription;
  selectedMembers = new SelectionModel(true, []);
  selectedJoinRequest = new SelectionModel(true, []);
  shareUrl = 'https://www.crmgrow.com/';
  tabs: TabItem[] = [
    { icon: 'i-icon i-teams', label: 'MEMBERS', id: 'members' },
    { icon: 'i-icon i-share', label: 'SHARED', id: 'shared' },
    { icon: 'i-icon i-deals', label: 'DEALS', id: 'deals' }
  ];
  selectedTab: TabItem = this.tabs[0];
  sharedTabs: TabItem[] = [
    { icon: '', label: 'Materials', id: 'materials' },
    { icon: '', label: 'Templates', id: 'templates' },
    { icon: '', label: 'Automations', id: 'automations' },
    { icon: '', label: 'Contacts', id: 'contacts' }
  ];
  selectedSharedTab: TabItem = this.sharedTabs[0];
  sharedContacts = [
    {
      first_name: 'Ace',
      last_name: 'Tanoue',
      email: 'rcihawaii01@gmail.com',
      cell_phone: '+18084877281',
      last_activity: {
        send_type: 0,
        _id: '5fce9b8d9104550d64c544f5',
        content: 'added contact',
        contacts: '5fce9b8d9104550d64c54407',
        user: '5e9a0285efb6b2a3449245da',
        type: 'contacts'
      },
      share_at: '2020-12-07T21:15:57.368Z',
      shared_members: [
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        },
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        }
      ]
    },
    {
      first_name: 'Ace',
      last_name: 'Tanoue',
      email: 'rcihawaii01@gmail.com',
      cell_phone: '+18084877281',
      last_activity: {
        send_type: 0,
        _id: '5fce9b8d9104550d64c544f5',
        content: 'added contact',
        contacts: '5fce9b8d9104550d64c54407',
        user: '5e9a0285efb6b2a3449245da',
        type: 'contacts'
      },
      share_at: '2020-12-07T21:15:57.368Z',
      shared_members: [
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        },
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        }
      ]
    },
    {
      first_name: 'Ace',
      last_name: 'Tanoue',
      email: 'rcihawaii01@gmail.com',
      cell_phone: '+18084877281',
      last_activity: {
        send_type: 0,
        _id: '5fce9b8d9104550d64c544f5',
        content: 'added contact',
        contacts: '5fce9b8d9104550d64c54407',
        user: '5e9a0285efb6b2a3449245da',
        type: 'contacts'
      },
      share_at: '2020-12-07T21:15:57.368Z',
      shared_members: [
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        },
        {
          first_name: 'Jone',
          last_name: 'Doe',
          email: 'jonedoe@gmail.com',
          cell_phone: '+18084877281'
        }
      ]
    }
  ];
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
    this.loading = true;
    this.userService.profile$.subscribe((res) => {
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
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.teamService.read(this.teamId).subscribe(
      (res) => {
        this.team = {
          ...res,
          owner: res['owner'],
          highlights: res['highlights'] || [],
          brands: res['brands'] || []
        };
        this.loading = false;
        const ownerIndex = _.findIndex(this.team.owner, { _id: this.userId });
        if (ownerIndex !== -1) {
          this.role = 'owner';
        } else if (this.team.editors && this.team.editors.indexOf(this.userId) !== -1) {
          this.role = 'editor';
        } else {
          this.role = 'viewer';
        }
      },
      (err) => {
        this.loading = false;
        // this.loadError = true;
      }
    );
  }
  shareMaterial(): void {
    this.dialog
      .open(MaterialShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          team_id: this.teamId
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.videos) {
            this.team.videos = [...this.team.videos, ...res.videos];
          }
        }
      });
  }
  createTeamVideo(): void {
    this.dialog
      .open(VideoShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        height: '70vh',
        disableClose: true,
        data: {
          team_id: this.teamId
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.materials) {
            this.team.videos = [...this.team.videos, ...res.materials];
          }
          // else if (res.command === 'create_new') {
          //   this.dialog
          //     .open(VideoCreateV2Component, {
          //       width: '96vw',
          //       maxWidth: '500px',
          //       height: 'calc(100vh - 50px)',
          //       maxHeight: '690px',
          //       disableClose: true,
          //       data: {
          //         team_id: this.teamId
          //       }
          //     })
          //     .afterClosed()
          //     .subscribe((response) => {
          //       if (response) {
          //         if (response._id) {
          //           this.creating = true;
          //           this.createubscription &&
          //             this.createubscription.unsubscribe();
          //           this.createubscription = this.teamService
          //             .shareVideos(this.teamId, [response._id])
          //             .subscribe(
          //               (result) => {
          //                 this.creating = false;
          //                 this.team.videos.push(result['data'][0]);
          //               },
          //               (err) => {
          //                 this.creating = false;
          //               }
          //             );
          //         }
          //       }
          //     });
          // }
        }
      });
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
  shareAutomation(): void {
    this.dialog
      .open(AutomationShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          team_id: this.teamId
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.automations) {
            this.team.automations = [
              ...this.team.automations,
              ...res.automations
            ];
          }
        }
      });
  }

  shareContact(): void {
    this.dialog
      .open(TeamContactShareComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          team: this.team
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  shareEmailTemplate(): void {
    this.dialog
      .open(TemplateShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        maxHeight: '60vh',
        disableClose: true,
        data: {
          team_id: this.teamId
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.templates) {
            this.team.email_templates = [
              ...this.team.email_templates,
              ...res.templates
            ];
          }
        }
      });
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
        maxWidth: '360px',
        width: '96vw',
        data: {
          title: 'Cancel Invitation',
          message: 'Are you sure to cancel this invitation?',
          cancelLabel: 'No',
          confirmLabel: 'Ok'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const newInvites = [];
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
                  if (e._id === member._id) {
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
        maxWidth: '360px',
        width: '96vw',
        data: {
          title: 'Remove Member',
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
  acceptRequest(user): void {
    this.acceptJoinRequest = true;
    this.teamService.acceptRequest(this.teamId, user._id).subscribe(
      (res) => {
        this.acceptJoinRequest = false;
        this.team.members.push(user);
        this.team.requests.some((e, index) => {
          if (e._id === user._id) {
            this.team.requests.splice(index, 1);
            return true;
          }
        });
      },
      (err) => {
        this.acceptJoinRequest = false;
      }
    );
  }
  declineRequest(user): void {

  }

  acceptOutRequest(teamId, memberId): void {
    this.accepting = true;
    this.teamService.acceptRequest(teamId, memberId).subscribe(
      (res) => {
        this.accepting = false;
        this.location.replaceState('/teams/' + this.teamId);
        this.loadTeam();
      },
      (err) => {
        this.accepting = false;
        if (err.status === 400) {
          this.dialog
            .open(NotifyComponent, {
              width: '96vw',
              maxWidth: '400px',
              data: {
                message: 'Invalid permission for this team.'
              },
              disableClose: true
            })
            .afterClosed()
            .subscribe((res) => {
              this.router.navigate(['/teams']);
            });
        } else {
          this.router.navigate(['/teams']);
        }
      }
    );
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
  editMaterial(mediaType, material): void {}
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
  assignContact(automation): void {
    this.dialog
      .open(AutomationAssignComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          automation
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
        }
      });
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
    return 'Viewer';
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  changeSharedTab(tab: TabItem): void {
    this.selectedSharedTab = tab;
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
      this.team.owner.forEach((e) => {
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
      this.team.owner.forEach((e) => {
        if (!this.selectedMembers.isSelected(e._id)) {
          this.selectedMembers.select(e._id);
        }
      });
    }
  }
  isSelectedPage(): any {
    let selectedMember = false;
    let selectedOwner = false;
    let selectedInvite = false;
    if (this.team.members.length) {
      for (let i = 0; i < this.team.members.length; i++) {
        const e = this.team.members[i];
        if (!this.selectedMembers.isSelected(e._id)) {
          return false;
        }
      }
      selectedMember = true;
    }
    if (this.team.owner.length) {
      for (let i = 0; i < this.team.owner.length; i++) {
        const e = this.team.owner[i];
        if (!this.selectedMembers.isSelected(e._id)) {
          return false;
        }
      }
      selectedOwner = true;
    }
    if (this.team.invites.length) {
      for (let i = 0; i < this.team.invites.length; i++) {
        const e = this.team.invites[i];
        if (!this.selectedMembers.isSelected(e._id)) {
          return false;
        }
      }
      selectedInvite = true;
    }

    if (selectedMember || selectedOwner || selectedInvite) {
      return true;
    }

    return false;
  }
  selectAllJoinRequestPage(): void {
    if (this.isSelectedJoinRequestPage()) {
      this.team.requests.forEach((e) => {
        if (this.selectedJoinRequest.isSelected(e._id)) {
          this.selectedJoinRequest.deselect(e._id);
        }
      });
    } else {
      this.team.requests.forEach((e) => {
        if (!this.selectedJoinRequest.isSelected(e._id)) {
          this.selectedJoinRequest.select(e._id);
        }
      });
    }
  }
  isSelectedJoinRequestPage(): any {
    if (this.team.requests.length) {
      for (let i = 0; i < this.team.requests.length; i++) {
        const e = this.team.requests[i];
        if (!this.selectedJoinRequest.isSelected(e._id)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  avatarName(user_name): string {
    if (user_name) {
      const names = user_name.split(' ');
      if (names.length > 1) {
        return names[0][0] + names[1][0];
      } else {
        return names[0][0];
      }
    }
    return 'UN';
  }
  memberStatus(member): any {
    if (this.team.editors.indexOf(member._id) === -1) {
      return 'Viewer';
    } else {
      return 'Editor';
    }
  }
  selectAllVideos(): void {
    if (this.isSelectedVideos()) {
      this.team.videos.forEach((e) => {
        if (this.selectedVideos.isSelected(e._id)) {
          this.selectedVideos.deselect(e._id);
        }
      });
    } else {
      this.team.videos.forEach((e) => {
        if (!this.selectedVideos.isSelected(e._id)) {
          this.selectedVideos.select(e._id);
        }
      });
    }
  }
  isSelectedVideos(): any {
    if (this.team.videos.length) {
      for (let i = 0; i < this.team.videos.length; i++) {
        const e = this.team.videos[i];
        if (!this.selectedVideos.isSelected(e._id)) {
          return false;
        }
      }
    }
    return true;
  }
  selectAllPdfs(): void {
    if (this.isSelectedPdfs()) {
      this.team.pdfs.forEach((e) => {
        if (this.selectedPdfs.isSelected(e._id)) {
          this.selectedPdfs.deselect(e._id);
        }
      });
    } else {
      this.team.pdfs.forEach((e) => {
        if (!this.selectedPdfs.isSelected(e._id)) {
          this.selectedPdfs.select(e._id);
        }
      });
    }
  }
  isSelectedPdfs(): any {
    if (this.team.pdfs.length) {
      for (let i = 0; i < this.team.pdfs.length; i++) {
        const e = this.team.pdfs[i];
        if (!this.selectedPdfs.isSelected(e._id)) {
          return false;
        }
      }
    }
    return true;
  }
  selectAllImages(): void {
    if (this.isSelectedImages()) {
      this.team.images.forEach((e) => {
        if (this.selectedImages.isSelected(e._id)) {
          this.selectedImages.deselect(e._id);
        }
      });
    } else {
      this.team.images.forEach((e) => {
        if (!this.selectedImages.isSelected(e._id)) {
          this.selectedImages.select(e._id);
        }
      });
    }
  }
  isSelectedImages(): any {
    if (this.team.images.length) {
      for (let i = 0; i < this.team.images.length; i++) {
        const e = this.team.images[i];
        if (!this.selectedImages.isSelected(e._id)) {
          return false;
        }
      }
    }
    return true;
  }
  editTeam(): void {
    this.dialog
      .open(TeamEditComponent, {
        width: '96vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          team: this.team
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.team = res;
        }
      });
  }

  /**
   * Open Invite member modal and do action
   */
  inviteMember(): void {
    this.dialog
      .open(InviteTeamComponent, {
        ...DialogSettings.INVITE_TEAM,
        data: { ...this.team }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.invitations) {
            for (const invitation of res.invitations) {
              this.team.invites.push(invitation);
            }
          }
          if (res.referrals) {
            for (const referral of res.referrals) {
              this.team.referrals.push(referral);
            }
          }
        }
      });
  }

  changeShareStatus(contact): void {}

  getAvatarName(contact): any {
    if (contact.first_name && contact.last_name) {
      return contact.first_name[0] + contact.last_name[0];
    } else if (contact.first_name && !contact.last_name) {
      return contact.first_name[0];
    } else if (!contact.first_name && contact.last_name) {
      return contact.last_name[0];
    }
    return 'UC';
  }
  inviteMemberOld(): void {
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
}
