import { Component, OnInit } from '@angular/core';
import { CropperOptions } from 'ngx-cropperjs-wrapper';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styleUrls: ['./avatar-editor.component.scss']
})
export class AvatarEditorComponent implements OnInit {
  config = {
    aspectRatio: 1,
    minContainerWidth: 300,
    minContainerHeight: 300,
    minCanvasWidth: 50,
    minCanvasHeight: 50,
    minCropBoxWidth: 50,
    minCropBoxHeight: 50,
    checkCrossOrigin: false,
    dragMode: 'move',
    viewMode: 0
  } as CropperOptions;
  fileInput: File;

  constructor(private dialogRef: MatDialogRef<AvatarEditorComponent>) {}

  ngOnInit(): void {}

  onFail(event): void {}

  onCropperInit(event): void {}

  onCrop(event): void {}

  onFileChange(event): void {}

  cropEmit(): void {}
}
