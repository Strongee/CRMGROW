import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatesService } from 'src/app/services/templates.service';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import { Template } from 'src/app/models/template.model';
import { PageCanDeactivate } from '../../variables/abstractors';
import { ToastrService } from 'ngx-toastr';

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

  loadSubcription: Subscription;
  saveSubscription: Subscription;

  isLoading = false;
  isSaving = false;

  cursorStart = 0;
  cursorEnd = 0;
  focusedField = '';

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  @ViewChild('subjectField') subjectEl: ElementRef;
  @ViewChild('smsContentField') textAreaEl: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private templatesService: TemplatesService,
    private router: Router,
    private toastr: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
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
}
