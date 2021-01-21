import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactService } from 'src/app/services/contact.service';
import { validateEmail } from 'src/app/helper';
import { Labels, TeamLabel } from 'src/app/constants/variable.constants';
import { MaterialService } from 'src/app/services/material.service';
import { FileService } from 'src/app/services/file.service';
import { ToastrService } from 'ngx-toastr';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog
} from '@angular/material/dialog';
import { EmailService } from 'src/app/services/email.service';
import { NotifyComponent } from '../notify/notify.component';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';

@Component({
  selector: 'app-share-site',
  templateUrl: './share-site.component.html',
  styleUrls: ['./share-site.component.scss']
})
export class ShareSiteComponent implements OnInit {
  labelSearchedContacts: any[] = [];
  searchedContacts: any[] = [];
  selectedContacts: any[] = [];
  selectedEmails: string[] = [];
  videos: any[] = [];

  searchStr = '';
  searchLabel = 'Team';

  searching = false;
  searchSubscription: Subscription;

  labelSearching = false;
  labelSearchSubscription: Subscription;

  loadingVideo = false;
  loadingVideoSubscription: Subscription;

  email: any = {
    subject: 'You have to check out crmgrow.com ',
    content: `<p>Hi {contact_first_name},</p><br/><p>Wanted to share with you the agent attraction software that has helped me take my recruiting to the next level. It’s a game changer! </p><p>There is a 7 day free trial and then it’s only $29 per month. You should check it out risk free and see the power of it: </p><p><a href="{platform_url}">www.crmgrow.com</a> </p><br/><p>Thanks,</p>`
  };

  selectedVideos: any[] = [];
  selectedVideoIds: any[] = [];

  platform_url = '';

  showSearchedResult = false;
  showLabelSearchedResult = false;

  hoverIndex = 0;
  sharing = false;
  focusedField = '';

  showType = 'normal';
  isOpen = false;

  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;
  @ViewChild('inputTrigger') inputTrigger: HTMLInputElement;
  @ViewChild('teamTrigger') teamTrigger: HTMLElement;

  constructor(
    private contactService: ContactService,
    private materialService: MaterialService,
    private fileService: FileService,
    private emailService: EmailService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ShareSiteComponent>,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.changeLabel();
    // this.loadVideos();
    this.platform_url = this.data.share_url;
    this.email.content = this.email.content.replace(
      '{platform_url}',
      this.platform_url
    );
  }

  addContact(contact): void {
    const pos = this.selectedEmails.indexOf(contact.email);
    if (pos !== -1) {
      this.selectedEmails.splice(pos, 1);
      this.selectedContacts.some((e, index) => {
        if (e.email === contact.email) {
          this.selectedContacts.splice(index, 1);
          return true;
        }
      });
    } else {
      this.selectedEmails.splice(0, 0, contact.email);
      this.selectedContacts.splice(0, 0, contact);
      if (this.searchedContacts.length === 1) {
        this.showSearchedResult = false;
        this.searchStr = '';
      }
    }
  }

  addAllSearched(): void {
    this.searchedContacts.forEach((e) => {
      const pos = this.selectedEmails.indexOf(e.email);
      if (pos === -1) {
        this.selectedEmails.splice(0, 0, e.email);
        this.selectedContacts.splice(0, 0, e);
      }
    });
    this.showSearchedResult = false;
    this.searchStr = '';
  }

  addAllLabelSearched(): void {
    this.labelSearchedContacts.forEach((e) => {
      const pos = this.selectedEmails.indexOf(e.email);
      if (pos === -1) {
        this.selectedEmails.splice(0, 0, e.email);
        this.selectedContacts.splice(0, 0, e);
      }
    });
    this.showLabelSearchedResult = false;
  }

  removeContact(i, email): void {
    const pos = this.selectedEmails.indexOf(email);
    if (pos !== -1) {
      this.selectedEmails.splice(pos, 1);
    }
    this.selectedContacts.splice(i, 1);
  }

  manualAddContact(event): void {
    const keyCode = event.keyCode || event.which;
    if (keyCode === 13) {
      if (this.searchedContacts.length) {
        const contact = this.searchedContacts[this.hoverIndex];
        const pos = this.selectedEmails.indexOf(contact.email);
        if (pos !== -1) {
          return;
        } else {
          this.selectedEmails.splice(0, 0, contact.email);
          this.selectedContacts.splice(0, 0, contact);
        }
      } else {
        if (validateEmail(this.searchStr)) {
          if (this.selectedEmails.indexOf(this.searchStr) !== -1) {
            return;
          }
          this.selectedContacts.splice(0, 0, {
            email: this.searchStr
          });
          this.selectedEmails.splice(0, 0, this.searchStr);
        }
      }

      this.searchStr = '';
      this.showSearchedResult = false;
      this.showLabelSearchedResult = false;
    }
    if (keyCode === 38) {
      if (this.searchedContacts.length) {
        if (this.hoverIndex > 0) {
          this.hoverIndex--;
        }
      }
    }
    if (keyCode === 40) {
      if (this.searchedContacts.length) {
        if (this.hoverIndex < this.searchedContacts.length - 1) {
          this.hoverIndex++;
        }
      }
    }
  }

  manualAdd(): void {
    if (validateEmail(this.searchStr)) {
      if (this.selectedEmails.indexOf(this.searchStr) !== -1) {
        return;
      }
      this.selectedContacts.splice(0, 0, {
        email: this.searchStr
      });
      this.selectedEmails.splice(0, 0, this.searchStr);
    }
    this.searchStr = '';
    this.showSearchedResult = false;
    this.showLabelSearchedResult = false;
  }

  removeAllSelected(): void {
    this.selectedContacts = [];
    this.selectedEmails = [];
  }

  searchContacts(): void {
    this.searching = true;
    this.searchSubscription && this.searchSubscription.unsubscribe();
    this.searchSubscription = this.contactService
      .easySearch(this.searchStr)
      .subscribe(
        (res) => {
          this.searching = false;
          const contacts = [];
          res.forEach((e) => {
            if (e.email) {
              const contact = {
                name:
                  e.first_name || e.last_name
                    ? (e.first_name || '') + ' ' + (e.last_name || '')
                    : '',
                first_name: e.first_name,
                last_name: e.last_name,
                email: e.email
              };
              contacts.push(contact);
            }
          });
          this.searchedContacts = contacts;
          if (this.searchStr) {
            this.hoverIndex = 0;
            this.showSearchedResult = true;
          }
        },
        (err) => {
          this.searching = false;
        }
      );
  }

  changeLabel(evt = null): void {
    let label = TeamLabel;
    if (evt) {
      label = evt.value;
    }
    this.labelSearching = true;
    this.labelSearchSubscription && this.labelSearchSubscription.unsubscribe();
    this.labelSearchSubscription = this.contactService
      .filter({ label })
      .subscribe(
        (res) => {
          this.labelSearching = false;
          const contacts = [];
          res.forEach((e) => {
            if (e.email) {
              const contact = {
                name:
                  e.first_name || e.last_name
                    ? (e.first_name || '') + ' ' + (e.last_name || '')
                    : '',
                first_name: e.first_name,
                last_name: e.last_name,
                email: e.email
              };
              contacts.push(contact);
            }
          });
          this.labelSearchedContacts = contacts;
        },
        (err) => {
          this.searching = false;
        }
      );
  }

  loadVideos(): void {
    this.loadingVideo = true;
    this.loadingVideoSubscription &&
      this.loadingVideoSubscription.unsubscribe();
    this.loadingVideoSubscription = this.materialService
      .loadVideosImpl()
      .subscribe(
        (res) => {
          this.loadingVideo = false;
          this.videos = res;
        },
        (err) => {
          this.loadingVideo = false;
        }
      );
  }

  isValidEmail(str): void {}

  share(): void {
    if (
      this.email.content.indexOf(this.platform_url) === -1 &&
      this.email.content.indexOf('{platform_url}')
    ) {
      this.dialog.open(NotifyComponent, {
        width: '100vw',
        maxWidth: '360px',
        data: {
          message:
            'Please make sure the email content contains the platform share link.'
        }
      });
      return;
    }
    this.sharing = true;
    this.emailService
      .shareUrl({
        contacts: this.selectedContacts,
        content: this.email.content,
        subject: this.email.subject,
        videos: this.selectedVideos
      })
      .subscribe(
        (res) => {
          this.sharing = false;
          this.toast.success('Email has been successfully sent.');
          this.dialogRef.close();
        },
        (err) => {
          this.sharing = false;
        }
      );
  }

  labels = [{ id: 'unset', text: 'Unset' }, ...Labels];

  toggleVideo(video): void {
    const pos = this.selectedVideoIds.indexOf(video._id);
    if (pos !== -1) {
      this.selectedVideoIds.splice(pos, 1);
      this.selectedVideos.some((e, index) => {
        if (e._id === video._id) {
          this.selectedVideos.splice(index, 1);
          return true;
        }
      });
    } else {
      this.selectedVideoIds.push(video._id);
      this.selectedVideos.push(video);
    }
  }

  hideSearchedResult(): void {
    this.showSearchedResult = false;
  }

  toggleLabelContacts(): void {
    this.showLabelSearchedResult = !this.showLabelSearchedResult;
    if (this.showLabelSearchedResult) {
      this.showSearchedResult = false;
    }
  }

  isValid(email): any {
    const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim;
    if (email === '' || !re.test(email)) {
      return false;
    }
    return true;
  }

  hideSearchedResultFn(event): void {
    this.showLabelSearchedResult = false;
    this.showSearchedResult = false;
  }

  focusEditor(): void {
    this.focusedField = 'editor';
  }

  openLabelContacts(): void {
    this.isOpen = true;
    this.showType = 'team';
  }
  openNormalContacts(): void {
    this.isOpen = true;
    this.showType = 'normal';
  }
  openOverlay(): void {
    this.isOpen = !this.isOpen;
  }
  closeOverlay(event: MouseEvent): void {
    const target = <HTMLInputElement>event.target;
    if (target === this.inputTrigger) {
      return;
    }
    if (target === this.teamTrigger) {
      return;
    }
    this.isOpen = false;
  }
}
