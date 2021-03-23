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
import { sortStringArray, sortRoleArray } from '../../utils/functions';
import * as _ from 'lodash';
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
        this.filteredResult = sortRoleArray(templates, true);
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
        if (template.type === 'sms') {
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

  changeSearchStr(): void {
    const words = this.searchStr.split(' ');
    const reg = new RegExp(words.join('|'), 'gi');
    const filtered = this.templates.filter((template) => {
      if (!this.searchStr || !words.length) {
        return true;
      }
      const str =
        template.title + ' ' + template.content + ' ' + template.subject;
      if (
        _.uniqBy(str.match(reg), (e) => e.toLowerCase()).length === words.length
      ) {
        return true;
      }
    });
    if (filtered.length) {
      this.filteredResult = sortRoleArray(filtered, true);
    } else {
      this.filteredResult = filtered;
    }
    this.page = 1;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filteredResult = sortRoleArray(this.templates, true);
  }

  changePageSize(type: any): void {
    this.pageSize = type;
  }

  sort(field: string): void {
    if (field == 'role') {
      this.filteredResult = sortRoleArray(
        this.filteredResult,
        this.searchCondition[field]
      );
    } else {
      this.filteredResult = sortStringArray(
        this.filteredResult,
        field,
        this.searchCondition[field]
      );
    }
    this.page = 1;
    this.searchCondition[field] = !this.searchCondition[field];
  }
}
