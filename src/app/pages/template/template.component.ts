import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatesService } from 'src/app/services/templates.service';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import { Template } from 'src/app/models/template.model';
import { PageCanDeactivate } from '../../variables/abstractors';

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
  constructor(
    private route: ActivatedRoute,
    private templatesService: TemplatesService,
    private router: Router
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
      console.log("template content =================>", value, this.template.content);
      return;
    }
    let text = '';
    if (this.focusedField === 'subject') {
      text = this.template.subject;
    } else {
      text = this.template.content;
    }
    text =
      text.substr(0, this.cursorStart) +
      value +
      text.substr(this.cursorEnd, text.length - this.cursorEnd);
    if (this.focusedField === 'subject') {
      this.template.subject = text;
    } else {
      this.template.content = text;
    }
    this.saved = false;
    this.cursorStart += value.length;
    this.cursorEnd = this.cursorStart;
  }
  focusEditor(): void {
    this.focusedField = 'editor';
  }

  stateChanged(): void {
    this.saved = false;
  }
}
