import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
  ApplicationRef,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatesService } from 'src/app/services/templates.service';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import { Template } from 'src/app/models/template.model';
import { PageCanDeactivate } from '../../variables/abstractors';
import { ToastrService } from 'ngx-toastr';
import { HandlerService } from 'src/app/services/handler.service';
import { ROUTE_PAGE } from 'src/app/constants/variable.constants';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
import { ConnectService } from 'src/app/services/connect.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { HelperService } from 'src/app/services/helper.service';
import { isEmptyHtml } from 'src/app/utils/functions';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent
  extends PageCanDeactivate
  implements OnInit, OnDestroy {
  saved = true;

  template: Template = new Template();
  id: string = '';
  role = '';
  mode = '';

  loadSubcription: Subscription;
  saveSubscription: Subscription;

  isLoading = false;
  isSaving = false;

  cursorStart = 0;
  cursorEnd = 0;
  focusedField = '';

  isCalendly = false;
  garbage: Garbage = new Garbage();
  garbageSubscription: Subscription;

  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;
  @ViewChild('createNewContent') createNewContent: TemplateRef<unknown>;
  templateSubject = '';
  templateValue = '';

  set = 'twitter';

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  @ViewChild('subjectField') subjectEl: ElementRef;
  @ViewChild('smsContentField') textAreaEl: ElementRef;
  constructor(
    private route: ActivatedRoute,
    public templatesService: TemplatesService,
    public connectService: ConnectService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private handlerService: HandlerService,
    private helperSerivce: HelperService,
    private _viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) {
    super();

    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      this.garbage = res;
      if (this.garbage?.calendly) {
        this.isCalendly = true;
        this.connectService.loadCalendlyAll(false);
      } else {
        this.isCalendly = false;
      }
    });
    this.templatesService.loadAll(false);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    this.mode = this.route.snapshot.params.mode;
    if (id) {
      this.id = id;
      this.loadData(id);
    }
    window['confirmReload'] = true;
  }

  ngOnDestroy(): void {
    window['confirmReload'] = false;
  }

  changeType(type: string): void {
    this.template.type = type;
    this.saved = false;
  }

  saveTemplate(): void {
    if (isEmptyHtml(this.template.content)) {
      return;
    }

    if (!this.id) {
      this.isSaving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.templatesService
        .create(this.template)
        .subscribe(
          () => {
            this.toastr.success('New Template has been successfully created.');
            this.router.navigate(['/templates']);
            this.isSaving = false;
            this.saved = true;
          },
          () => {
            this.isSaving = false;
          }
        );
    } else {
      if (this.mode != 'duplicate') {
        const template = { ...this.template, _id: undefined };
        this.isSaving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.templatesService
          .update(this.id, template)
          .subscribe(
            () => {
              this.toastr.success('Template has been successfully updated.');
              this.router.navigate(['/templates']);
              this.isSaving = false;
              this.saved = true;
            },
            () => {
              this.isSaving = false;
            }
          );
      } else {
        const template = {
          content: this.template.content,
          subject: this.template.subject,
          title: this.template.title,
          type: this.template.type
        };
        this.isSaving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.templatesService
          .create(new Template().deserialize(template))
          .subscribe(
            () => {
              this.toastr.success(
                'New Template has been successfully duplicated.'
              );
              this.router.navigate(['/templates']);
              this.isSaving = false;
              this.saved = true;
            },
            () => {
              this.isSaving = false;
            }
          );
      }
    }
  }

  loadData(id: string): void {
    this.isLoading = true;
    this.loadSubcription && this.loadSubcription.unsubscribe();
    this.loadSubcription = this.templatesService.read(id).subscribe(
      (res) => {
        this.isLoading = false;
        this.template.deserialize(res);
        if (this.template.type === 'email') {
          this.htmlEditor.setValue(this.template.content);
        }
        if (this.mode == 'duplicate') {
          this.template.title = '';
        }
      },
      () => (this.isLoading = false)
    );
  }

  /**=======================================================
   *
   * Subject Field
   *
   ========================================================*/
  setCursorPos(field, field_name: string): void {
    this.focusedField = field_name;
    if (field.selectionStart || field.selectionStart === '0') {
      this.cursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      this.cursorEnd = field.selectionEnd;
    }
  }
  insertValue(value: string): void {
    if (this.focusedField === 'editor') {
      this.htmlEditor.insertEmailContentValue(value);
      return;
    }
    if (this.focusedField === 'subject') {
      this.subjectEl.nativeElement.focus();
      this.subjectEl.nativeElement.setSelectionRange(
        this.cursorStart,
        this.cursorEnd
      );
      document.execCommand('insertText', false, value);
      this.cursorStart += value.length;
      this.cursorEnd = this.cursorStart;
      this.subjectEl.nativeElement.setSelectionRange(
        this.cursorStart,
        this.cursorEnd
      );
    } else {
      this.textAreaEl.nativeElement.focus();
      this.textAreaEl.nativeElement.setSelectionRange(
        this.cursorStart,
        this.cursorEnd
      );
      document.execCommand('insertText', false, value);
      this.cursorStart += value.length;
      this.cursorEnd = this.cursorStart;
      this.textAreaEl.nativeElement.setSelectionRange(
        this.cursorStart,
        this.cursorEnd
      );
    }
    this.saved = false;
  }
  focusEditor(): void {
    this.focusedField = 'editor';
  }

  stateChanged(): void {
    this.saved = false;
  }

  goToBack(): void {
    this.handlerService.goBack('/templates');
  }

  getPrevPage(): string {
    if (!this.handlerService.previousUrl) {
      return 'to Templates';
    }
    if (
      this.handlerService.previousUrl.includes('/team/') &&
      this.handlerService.previousUrl.includes('/templates')
    ) {
      return 'to Team Templates';
    }
    for (const route in ROUTE_PAGE) {
      if (this.handlerService.previousUrl === route) {
        return 'to ' + ROUTE_PAGE[route];
      }
    }
    return '';
  }

  createNew(): void {
    this.templatePortal = new TemplatePortal(
      this.createNewContent,
      this._viewContainerRef
    );
    if (this.overlayRef) {
      if (this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
        return;
      } else {
        this.overlayRef.attach(this.templatePortal);
        return;
      }
    } else {
      this.overlayRef = this.overlay.create({
        hasBackdrop: true,
        backdropClass: 'template-backdrop',
        panelClass: 'template-panel',
        width: '96vw',
        maxWidth: '480px'
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
  }

  selectTextTemplate(template: Template): void {
    this.textAreaEl.nativeElement.focus();
    const field = this.textAreaEl.nativeElement;
    if (!this.template.content.replace(/(\r\n|\n|\r|\s)/gm, '')) {
      field.select();
      document.execCommand('insertText', false, template.content);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.template.content[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    } else {
      if (this.template.content.slice(-1) === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    }
  }

  selectCalendly(url: string): void {
    this.textAreaEl.nativeElement.focus();
    const field = this.textAreaEl.nativeElement;
    if (!this.template.content.replace(/(\r\n|\n|\r|\s)/gm, '')) {
      field.select();
      document.execCommand('insertText', false, url);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.template.content[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, url);
      } else {
        document.execCommand('insertText', false, '\n' + url);
      }
    } else {
      if (this.template.content.slice(-1) === '\n') {
        document.execCommand('insertText', false, url);
      } else {
        document.execCommand('insertText', false, '\n' + url);
      }
    }
  }

  closeOverlay(flag: boolean): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.detachBackdrop();
    }
    if (flag) {
      this.toastr.success('', 'New template is created successfully.', {
        closeButton: true
      });
      setTimeout(() => {
        this.appRef.tick();
      }, 1);
    }
    this.cdr.detectChanges();
  }
}
