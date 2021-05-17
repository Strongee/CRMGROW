import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { MaterialService } from 'src/app/services/material.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  folder = new Material();
  folders = [];
  saving = false;
  saveSubscription: Subscription;

  constructor(
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<FolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.folder) {
      this.folder = this.data.folder;
    }
    if (this.data && this.data.folders) {
      this.folders = this.data.folders;
    }
  }

  ngOnInit(): void {}

  save(): void {
    if (this.folder && this.folder._id) {
      this.saving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.materialService
        .updateFolder(this.folder._id, {
          title: this.folder.title
        })
        .subscribe((status) => {
          this.saving = false;
          if (status) {
            this.materialService.update$(this.folder._id, {
              title: this.folder.title
            });
            this.dialogRef.close();
          }
        });
    } else {
      if (this.folders && this.folders.length) {
        this.saving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.materialService
          .updateFolders(this.folders, {
            title: this.folder.title
          })
          .subscribe((status) => {
            this.saving = false;
            if (status) {
              this.materialService.bulkUpdate$(this.folders, {
                title: this.folder.title
              });
              this.dialogRef.close();
            }
          });
      } else {
        this.saving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.materialService
          .createFolder({ title: this.folder.title })
          .subscribe((data) => {
            this.saving = false;
            if (data) {
              const _createdFolder = new Material().deserialize(data);
              _createdFolder.material_type = 'folder';
              this.materialService.create$(_createdFolder);
              this.dialogRef.close(_createdFolder);
            }
          });
      }
    }
  }
}
