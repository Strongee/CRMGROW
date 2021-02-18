import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplatesService } from '../../services/templates.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { Template } from 'src/app/models/template.model';
import { STATUS } from 'src/app/constants/variable.constants';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  STATUS = STATUS;

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

  constructor(
    public templatesService: TemplatesService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.garbage$.subscribe((garbage) => {
      if (garbage && garbage.canned_message) {
        this.emailDefault = garbage.canned_message.email;
        this.smsDefault = garbage.canned_message.sms;
      }
    });
    this.userService.profile$.subscribe((profile) => {
      this.userId = profile._id;
    });
    this.templatesService.templates$.subscribe((templates) => {
      this.templates = templates;
      this.filteredResult = templates;
    });
    this.templatesService.loadAll(true);
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
    this.router.navigate(['/templates/' + template._id]);
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
    const reg = new RegExp(this.searchStr, 'gi');
    const filtered = this.templates.filter((template) => {
      if (
        reg.test(template.title) ||
        reg.test(template.content) ||
        reg.test(template.subject)
      ) {
        return true;
      }
    });
    this.filteredResult = filtered;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filteredResult = this.templates;
  }
}
