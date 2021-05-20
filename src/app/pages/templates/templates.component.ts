import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplatesService } from '../../services/templates.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { Template } from 'src/app/models/template.model';
import { STATUS } from 'src/app/constants/variable.constants';
import { ToastrService } from 'ngx-toastr';
import { sortStringArray } from '../../utils/functions';
import * as _ from 'lodash';
import { TeamMaterialShareComponent } from 'src/app/components/team-material-share/team-material-share.component';
import { searchReg } from 'src/app/helper';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit, OnDestroy {
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 25, label: '25' },
    { id: 50, label: '50' }
  ];
  DISPLAY_COLUMNS = [
    'title',
    'owner',
    'template-content',
    'template-type',
    'template-action',
    'template-sub-action'
  ];
  STATUS = STATUS;

  pageSize = this.PAGE_COUNTS[1];

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
  selectedSort = 'role';

  profileSubscription: Subscription;
  garbageSubscription: Subscription;
  loadSubscription: Subscription;

  searchCondition = {
    title: false,
    role: false,
    type: false
  };

  constructor(
    public templatesService: TemplatesService,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private router: Router
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
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.templatesService.templates$.subscribe(
      (templates) => {
        this.templates = templates;
        this.templates = _.uniqBy(this.templates, '_id');
        this.filteredResult = this.templates;
        if (this.templates.length) {
          this.sort('role', true);
        }
      }
    );
    this.templatesService.loadAll(true);
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
          if (cannedMessage.email) {
            this.userService.email.next(template);
          } else {
            this.userService.email.next(null);
          }
        }
        if (template.type === 'text') {
          if (cannedMessage.sms) {
            this.userService.sms.next(template);
          } else {
            this.userService.sms.next(null);
          }
        }
        this.toast.success(`Template's default has been successfully changed.`);
      },
      () => {
        this.isSetting = false;
      }
    );
  }

  openTemplate(template: Template): void {
    this.router.navigate(['/templates/edit/' + template._id]);
  }

  duplicateTemplate(template: Template): void {
    this.router.navigate(['/templates/duplicate/' + template._id]);
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

  shareTemplate(template: Template): void {
    this.dialog.open(TeamMaterialShareComponent, {
      width: '98vw',
      maxWidth: '450px',
      data: {
        template: template,
        type: 'template'
      }
    });
  }

  changeSearchStr(): void {
    const filtered = this.templates.filter((template) => {
      const str =
        template.title + ' ' + template.content + ' ' + template.subject;
      return searchReg(str, this.searchStr);
    });
    this.filteredResult = filtered;
    this.sort(this.selectedSort, true);
    this.page = 1;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.changeSearchStr();
  }

  changePageSize(type: any): void {
    this.pageSize = type;
  }

  sort(field: string, keep: boolean = false): void {
    if (this.selectedSort !== field) {
      this.selectedSort = field;
      return;
    } else {
      if (field === 'role') {
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
      } else if (field === 'type') {
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
