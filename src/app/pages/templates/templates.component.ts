import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplatesService } from '../../services/templates.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  isLoading = false;
  templates = [];
  loadSubscription: Subscription;
  count = 0;
  page = 1;
  userId = '';
  emailDefault = '';
  smsDefault = '';
  pageTemplateData: any[] = [];
  currentTemplatePage: any = 1;
  isTemplateTableLoading = false;
  isSetting = false;
  garbage: any[] = [];
  currentUser: any;
  deleting = false;
  constructor(
    private templatesService: TemplatesService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.loadProfile().subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
      const garbage = res.garbage;
      const cannedTemplate = garbage && garbage.canned_message;
      this.emailDefault = cannedTemplate && cannedTemplate.email;
      this.smsDefault = cannedTemplate && cannedTemplate.sms;
      this.loadAllTemplates();
    });
  }

  loadAllTemplates(): void {
    this.isLoading = true;
    this.templatesService.loadAll().subscribe(
      (res) => {
        this.isLoading = false;
        const templates = res;
        const templateIds = [];
        templates.forEach((e) => {
          if (templateIds.indexOf(e._id) !== -1) {
            return;
          }
          templateIds.push(e._id);
          this.templates.push(e);
        });
        this.templates.sort((a, b) => {
          if (a.role === 'admin') {
            return -1;
          } else if (a.role === 'team' && a.user !== this.userId) {
            return 1;
          } else {
            return 0;
          }
        });
        this.count = this.templates.length;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  loadTemplatePage(page): void {
    let skip = 0;
    if (page) {
      this.currentTemplatePage = page;
      skip = (page - 1) * 10;
    } else {
      this.currentTemplatePage = 1;
      skip = 0;
    }

    this.isTemplateTableLoading = true;
    this.templatesService.getByPage(skip).subscribe(
      (res) => {
        this.isTemplateTableLoading = false;
        this.templates = res;
      },
      (error) => {
        this.isTemplateTableLoading = false;
      }
    );
  }

  setPageTemplate(page): void {
    this.loadTemplatePage(page);
    const start = (page - 1) * 10;
    const end = page * 10;
    this.pageTemplateData = this.pageTemplateData.slice(start, end);
    this.currentTemplatePage = page;
  }

  setDefault(template): void {
    const cannedMessage = {
      email: this.emailDefault,
      sms: this.smsDefault
    };
    if (template._id === this.emailDefault) {
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

    this.isSetting = true;
    this.templatesService
      .setDefault({
        cannedMessage
      })
      .subscribe(
        (res) => {
          this.isSetting = false;
          this.emailDefault = cannedMessage.email;
          this.smsDefault = cannedMessage.sms;
          if (
            this.currentUser.garbage &&
            this.currentUser.garbage.canned_message
          ) {
            this.currentUser.garbage.canned_message = cannedMessage;
            this.userService.updateProfile(this.currentUser);
          }
        },
        (err) => {
          this.isSetting = false;
        }
      );
  }

  openTemplate(template): void {
    this.router.navigate(['/templates/' + template._id]);
  }

  deleteTemplate(template): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        message: 'Are you sure to remove the template?',
        cancelLabel: 'No',
        confirmLabel: 'Remove'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleting = true;
        this.templatesService.delete(template._id).subscribe(
          (delRes) => {
            this.templates.some((e, index) => {
              if (e._id === template._id) {
                this.templates.splice(index, 1);
                return true;
              }
            });
          },
          (err) => {
            this.deleting = false;
          }
        );
      }
    });
  }
}
