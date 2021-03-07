import { Component, Inject, OnInit } from '@angular/core';
import { Material } from '../../models/material.model';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialService } from '../../services/material.service';

@Component({
  selector: 'app-delete-folder',
  templateUrl: './delete-folder.component.html',
  styleUrls: ['./delete-folder.component.scss']
})
export class DeleteFolderComponent implements OnInit {
  currentOption = 'only-folder';
  selectedFolder: Material = new Material();
  rootFolder: Material = new Material().deserialize({ _id: 'root' });
  folders: Material[] = [];
  folderLoadSubscription: Subscription;
  currentFolder;
  submitted = false;

  constructor(
    private storeService: StoreService,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<DeleteFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.material) {
      this.currentFolder = this.data.material;
    }
  }

  ngOnInit(): void {
    this.folderLoadSubscription = this.storeService.materials$.subscribe(
      (materials) => {
        this.folders = materials.filter((e) => {
          return e.material_type === 'folder';
        });
        if (this.currentFolder) {
          const index = this.folders.findIndex(
            (item) => item._id === this.currentFolder._id
          );
          if (index >= 0) {
            this.folders.splice(index, 1);
          }
        }
      }
    );
  }

  selectOption(type): void {
    this.currentOption = type;
  }

  isSelectedOption(type): any {
    return this.currentOption === type;
  }

  delete(): void {
    this.submitted = true;
    if (this.currentOption === 'move-other') {
      if (!this.selectedFolder) {
        return;
      }
    }
    const data = {
      _id: this.currentFolder._id,
      mode: this.currentOption,
      target:
        this.selectedFolder && this.selectedFolder._id
          ? this.selectedFolder._id
          : null
    };
    this.materialService
      .removeFolder(data) // answer
      .subscribe((res) => {
        if (res['status']) {
          this.materialService.delete$([this.currentFolder._id]);
          this.materialService.removeFolder$(this.currentFolder._id);
        }
      });
  }
}
