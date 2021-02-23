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
import { MaterialSendComponent } from '../../components/material-send/material-send.component';
import { MaterialEditTemplateComponent } from '../../components/material-edit-template/material-edit-template.component';

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
    { icon: '', label: 'Members', id: 'members' },
    { icon: '', label: 'Materials', id: 'materials' },
    { icon: '', label: 'Contacts', id: 'contacts' },
    { icon: '', label: 'Automations', id: 'automations' },
    { icon: '', label: 'Templates', id: 'templates' }
  ];
  selectedTab: TabItem = this.tabs[0];
  materialTabs: TabItem[] = [
    { icon: '', label: 'Video', id: 'video' },
    { icon: '', label: 'PDF', id: 'pdf' },
    { icon: '', label: 'Image', id: 'image' }
  ];
  selectedMaterialTab: TabItem = this.materialTabs[0];
  contactTabs: TabItem[] = [
    { icon: '', label: 'SHARED WITH ME', id: 'share-with' },
    { icon: '', label: 'SHARED BY ME', id: 'share-by' }
  ];
  selectedContactTab: TabItem = this.contactTabs[0];
  selectedSharedTab: TabItem;
  sharedContacts = [];
  myContacts = [];
  otherContacts = [];

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
  goToBack(): void {
    this.location.back();
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
        const ownerIndex = _.findIndex(this.team.owner, { _id: this.userId });
        if (ownerIndex !== -1) {
          this.role = 'owner';
        } else if (
          this.team.editors &&
          this.team.editors.indexOf(this.userId) !== -1
        ) {
          this.role = 'editor';
        } else {
          this.role = 'viewer';
        }
        this.teamService.loadSharedContacts().subscribe(
          (contacts) => {
            this.loading = false;
            if (contacts) {
              this.sharedContacts = contacts;
              this.sharedContacts.forEach((e) => {
                if (e.user[0]._id === this.userId) {
                  this.myContacts.push(e);
                } else {
                  this.otherContacts.push(e);
                }
              });
              console.log('MyContacts', this.myContacts, this.otherContacts);
            }
          },
          (err) => {
            this.loading = false;
          }
        );
      },
      (err) => {
        this.loading = false;
      }
    );
  }
  shareMaterial(type): void {
    this.dialog
      .open(MaterialShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          team_id: this.teamId,
          type
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          if (type === 'video') {
            this.team.videos = [...this.team.videos, ...res.materials];
          } else if (type === 'pdf') {
            this.team.pdfs = [...this.team.pdfs, ...res.materials];
          } else if (type === 'image') {
            this.team.images = [...this.team.images, ...res.materials];
          }
        }
      });
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
        if (res && res.data) {
          this.sharedContacts = _.unionBy(res.data, this.sharedContacts, '_id');
          this.myContacts = _.unionBy(res.data, this.myContacts, '_id');
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
              this.toast.success('You canceled the invitation successfully.');
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
  declineRequest(user): void {}

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
  sendMaterial(material: any, type: string): void {
    this.dialog.open(MaterialSendComponent, {
      position: { top: '5vh' },
      width: '100vw',
      maxWidth: '600px',
      disableClose: false,
      data: {
        material: [material],
        material_type: type,
        type: 'email'
      }
    });
  }

  editTemplate(material_id: string): void {
    this.dialog.open(MaterialEditTemplateComponent, {
      position: { top: '10vh' },
      width: '100vw',
      maxWidth: '600px',
      height: '550px',
      disableClose: true,
      data: {
        id: material_id
      }
    });
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
  changeMaterialTab(tab: TabItem): void {
    this.selectedMaterialTab = tab;
  }
  changeContactTab(tab: TabItem): void {
    this.selectedContactTab = tab;
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
          this.team = {
            ...this.team,
            name: res.name,
            picture: res.picture
          };
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
    if (contact.user_name) {
      const names = contact.user_name.split(' ');
      if (names.length > 1) {
        return names[0][0] + names[1][0];
      } else {
        return names[0][0];
      }
    } else if (contact.first_name && contact.last_name) {
      return contact.first_name[0] + contact.last_name[0];
    } else if (contact.first_name && !contact.last_name) {
      return contact.first_name[0];
    } else if (!contact.first_name && contact.last_name) {
      return contact.last_name[0];
    }
    return 'UC';
  }
}
