import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplatesService } from '../../services/templates.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { Template } from 'src/app/models/template.model';
import { STATUS } from 'src/app/constants/variable.constants';
import { TeamService } from '../../services/team.service';
import { ToastrService } from 'ngx-toastr';
import { Team } from '../../models/team.model';
import { sortStringArray } from '../../utils/functions';
import { TemplateBrowserComponent } from '../../components/template-browser/template-browser.component';
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-team-share-template',
  templateUrl: './team-share-template.component.html',
  styleUrls: ['./team-share-template.component.scss']
})
export class TeamShareTemplateComponent implements OnInit, OnChanges {
  STATUS = STATUS;
  DISPLAY_COLUMNS = [
    'title',
    'owner',
    'template-content',
    'template-type',
    'template-action'
  ];
  selectedTemplate: string = '';
  page = 1;
  userId = '';
  emailDefault = '';
  smsDefault = '';
  isSetting = false;
  deleting = false;
  currentUser: any;

  templates: Template[] = [];
  filteredResult: Template[] = [];
  searchStr = '';

  profileSubscription: Subscription;
  garbageSubscription: Subscription;
  loadSubscription: Subscription;
  loading = false;

  selectedSort = 'role';
  searchCondition = {
    title: false,
    role: false,
    type: false
  };

  @Input('team') team: Team;
  @Input('role') role: string;

  constructor(
    public templatesService: TemplatesService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private teamService: TeamService,
    public storeService: StoreService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (garbage) => {
        if (garbage && garbage.canned_message) {
          this.emailDefault = garbage.canned_message.email;
          this.smsDefault = garbage.canned_message.sms;
        }
      }
    );
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.userId = profile._id;
      }
    );

    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.teamService.loadSharedTemplates(this.team._id);
    this.storeService.sharedTemplates$.subscribe(
      (res) => {
        if (res) {
          this.loading = false;
          this.templates = res;
          this.filteredResult = this.templates;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  ngOnChanges(changes): void {
    if (changes.templates && changes.templates.currentValue) {
      this.templates = [...changes.templates.currentValue];
      this.changeSearchStr();
    }
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.loadSubscription && this.loadSubscription.unsubscribe();
  }

  setDefault(template: Template): void {
    const cannedMessage = {
      email: this.emailDefault,
      sms: this.smsDefault
    };
    if (template._id === this.emailDefault) {
      // Disable the Default Email Template
      delete cannedMessage.email;
    } else if (template._id === this.smsDefault) {
      // Disable the Default Sms Template
      delete cannedMessage.sms;
    } else if (template.type === 'email') {
      // Enable the Default Email Template
      cannedMessage.email = template._id;
    } else {
      // Enable the Default Sms Template
      cannedMessage.sms = template._id;
    }
    if (!cannedMessage.email) {
      delete cannedMessage.email;
    }
    if (!cannedMessage.sms) {
      delete cannedMessage.sms;
    }

    this.isSetting = true;
    this.userService.updateGarbage({ canned_message: cannedMessage }).subscribe(
      () => {
        this.isSetting = false;
        this.userService.updateGarbageImpl({ canned_message: cannedMessage });
        if (template.type === 'email') {
          if (cannedMessage['email']) {
            this.userService.email.next(template);
          } else {
            this.userService.email.next(null);
          }
        }
        if (template.type === 'sms') {
          if (cannedMessage['sms']) {
            this.userService.sms.next(template);
          } else {
            this.userService.sms.next(null);
          }
        }
      },
      () => {
        this.isSetting = false;
      }
    );
  }

  openTemplate(template: Template): void {
    this.router.navigate(['/templates/edit/' + template._id]);
  }

  deleteTemplate(template: Template): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete template',
        message: 'Are you sure to delete this template?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      console.log(res);
      if (res) {
        this.templatesService.delete(template._id);
      }
    });
  }

  changeSearchStr(): void {
    this.filteredResult = this.templates.filter((template) => {
      const str =
        template.title + ' ' + template.content + ' ' + template.subject;
      return searchReg(str, this.searchStr);
    });
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filteredResult = this.templates;
  }

  isStopSharable(template): any {
    if (template.user && template.user === this.userId) {
      return true;
    }
    return false;
  }

  isDuplicatable(template): any {
    if (template.user && template.user !== this.userId) {
      return true;
    }
    return false;
  }

  stopShareTemplate(template): any {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Stop Sharing',
          message: 'Are you sure to remove this template?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.removeTemplate(template._id).subscribe(
            (res) => {
              const index = this.templates.findIndex(
                (item) => item._id === template._id
              );
              if (index >= 0) {
                this.templates.splice(index, 1);
              }
              const filterIndex = this.filteredResult.findIndex(
                (item) => item._id === template._id
              );
              if (filterIndex >= 0) {
                this.filteredResult.splice(filterIndex, 1);
              }
              this.toast.success('You removed the template successfully.');
            },
            (err) => {}
          );
        }
      });
  }

  shareEmailTemplate(): void {
    const hideTemplates = [];
    for (const template of this.templates) {
      hideTemplates.push(template._id);
    }
    this.dialog
      .open(TemplateBrowserComponent, {
        width: '96vw',
        maxWidth: '940px',
        disableClose: true,
        data: {
          team_id: this.team._id,
          hideTemplates
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.templates) {
          this.templates = [...this.templates, ...res.templates];
          this.changeSearchStr();
        }
      });
  }

  duplicateTemplate(template: Template): void {
    this.router.navigate(['/templates/duplicate/' + template._id]);
  }

  getOwner(template): any {
    if (template && template.user) {
      if (template.user._id === this.userId) {
        return 'Me';
      } else {
        return template.user.user_name;
      }
    }
    return '--';
  }

  sort(field: string, keep: boolean = false): void {
    if (this.selectedSort != field) {
      this.selectedSort = field;
      return;
    } else {
      if (field == 'role') {
        const admins = this.filteredResult.filter(
          (item) => item.role === 'admin'
        );
        const owns = this.filteredResult.filter(
          (item) => item.role === undefined
        );
        const teams = this.filteredResult.filter(
          (item) => item.role === 'team' && item.user === this.userId
        );
        const shared = this.filteredResult.filter(
          (item) => item.role === 'team' && item.user !== this.userId
        );
        let sortedAdmins, sortedOwns, sortedTeams, sortedShared;
        if (keep) {
          sortedAdmins = sortStringArray(admins, 'title', true);
          sortedOwns = sortStringArray(owns, 'title', true);
          sortedTeams = sortStringArray(teams, 'title', true);
          sortedShared = sortStringArray(shared, 'title', true);
        } else {
          sortedAdmins = sortStringArray(
            admins,
            'title',
            this.searchCondition[field]
          );
          sortedOwns = sortStringArray(
            owns,
            'title',
            this.searchCondition[field]
          );
          sortedTeams = sortStringArray(
            teams,
            'title',
            this.searchCondition[field]
          );
          sortedShared = sortStringArray(
            shared,
            'title',
            this.searchCondition[field]
          );
        }
        this.filteredResult = [];
        if (keep) {
          this.filteredResult = [
            ...sortedAdmins,
            ...sortedOwns,
            ...sortedTeams,
            ...sortedShared
          ];
        } else {
          if (this.searchCondition[field]) {
            this.filteredResult = [
              ...sortedAdmins,
              ...sortedOwns,
              ...sortedTeams,
              ...sortedShared
            ];
          } else {
            this.filteredResult = [
              ...sortedOwns,
              ...sortedTeams,
              ...sortedShared,
              ...sortedAdmins
            ];
          }
        }
      } else if (field == 'type') {
        const text = this.filteredResult.filter((item) => item.type === 'text');
        const email = this.filteredResult.filter(
          (item) => item.type === 'email'
        );
        const sortedText = sortStringArray(
          text,
          'title',
          this.searchCondition[field]
        );
        const sortedEmail = sortStringArray(
          email,
          'title',
          this.searchCondition[field]
        );
        this.filteredResult = [];
        if (this.searchCondition[field]) {
          this.filteredResult = [...sortedEmail, ...sortedText];
        } else {
          this.filteredResult = [...sortedText, ...sortedEmail];
        }
      } else {
        this.filteredResult = sortStringArray(
          this.filteredResult,
          field,
          this.searchCondition[field]
        );
      }
      this.page = 1;
      if (!keep) {
        this.searchCondition[field] = !this.searchCondition[field];
      }
    }
  }
}
