import { Component, OnInit, ViewChild } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import { QuillEditor } from '../../constants/variable.constants';
import { FileService } from '../../services/file.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from 'src/environments/environment';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-video-create',
  templateUrl: './video-create.component.html',
  styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent implements OnInit {
  description;
  submitted = false;
  isStep1 = true;
  isActive1 = true;
  isStep2 = false;
  isActive2 = false;
  isStep3 = false;
  isActive3 = false;
  isStep4 = false;
  isActive4 = false;
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  videoLink = '';
  videoTitle = '';

  quillEditorRef;
  config = QuillEditor;
  focusEditor = '';

  themes = [
    {
      name: 'Default Theme',
      thumbnail: environment.server + '/assets/images/theme/default.jpg',
      id: 'default'
    },
    {
      name: 'Theme 1',
      thumbnail: environment.server + '/assets/images/theme/theme1.jpg',
      id: 'theme1'
    },
    {
      name: 'Theme 2',
      thumbnail: environment.server + '/assets/images/theme/theme2.jpg',
      id: 'theme2'
    },
    {
      name: 'Simple Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.jpg',
      id: 'theme3'
    },
    {
      name: 'Lead Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.png',
      id: 'theme4'
    }
  ];

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private fileService: FileService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadAllThemes();
  }

  loadAllThemes(): void {
    this.themeService.getAllTheme().subscribe((res) => {
      console.log('themes', res);
    });
  }

  uploadVideo(): void {
    this.isStep1 = false;
    this.isStep2 = true;
    this.isActive2 = true;
  }

  saveDetail(): void {
    this.isStep2 = false;
    this.isStep3 = true;
    this.isActive3 = true;
  }

  backUpload(): void {
    this.isStep1 = true;
    this.isStep2 = false;
    this.isActive2 = false;
  }

  selectTheme(): void {
    this.isStep3 = false;
    this.isStep4 = true;
    this.isActive4 = true;
  }

  setVideoTheme(theme) {
    this.selectedTheme = theme;
  }

  backDetail(): void {
    this.isStep2 = true;
    this.isStep3 = false;
    this.isActive3 = false;
  }

  themePreview(id) {}

  backSelectTheme(): void {
    this.isStep3 = true;
    this.isStep4 = false;
    this.isActive4 = false;
  }

  preivew(): void {}

  finishUpload(): void {}

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }

  initImageHandler = () => {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).subscribe((res) => {
          this.insertImageToEditor(res.url);
        });
      }
    });
    imageInput.click();
  };

  insertImageToEditor(url): void {
    const range = this.quillEditorRef.getSelection();
    // const img = `<img src="${url}" alt="attached-image-${new Date().toISOString()}"/>`;
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, img);
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }
  setFocusField(editorType): void {
    this.focusEditor = editorType;
  }
}
