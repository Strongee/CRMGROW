import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { Garbage } from 'src/app/models/garbage.model';

@Component({
  selector: 'app-material-edit-template',
  templateUrl: './material-edit-template.component.html',
  styleUrls: ['./material-edit-template.component.scss']
})
export class MaterialEditTemplateComponent implements OnInit {
  garbage: Garbage = new Garbage();
  theme_setting = {};
  material_id = '';
  materials = [];
  type = '';
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  saving = false;
  themes = [
    {
      name: 'Theme 1',
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

  garbageSubscription: Subscription;
  updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MaterialEditTemplateComponent>,
    private userService: UserService,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this.material_id = this.data.id;
    }
    if (this.data.materials) {
      this.materials = [...this.data.materials];
    }
    this.type = this.data.type;
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (garbage) => {
        let theme;
        this.garbage = new Garbage().deserialize(garbage);
        if (this.type == 'all') {
          if (!this.materials.length) {
            theme = garbage.material_theme;
            this.selectedTheme = this.themes.filter((e) => e.id == theme)[0];
          } else {
            this.theme_setting = garbage.material_themes || {};
          }
        } else {
          this.theme_setting = garbage.material_themes || {};
          if (
            garbage.material_themes &&
            garbage.material_themes[this.material_id]
          ) {
            theme = garbage.material_themes[this.material_id];
          } else {
            theme = garbage.material_theme;
          }
          this.selectedTheme = this.themes.filter((e) => e.id == theme)[0];
        }
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.updateSubscription && this.updateSubscription.unsubscribe();
  }

  setMaterialTheme(theme: any): void {
    this.selectedTheme = theme;
  }

  save(): void {
    this.saving = true;
    if (this.type == 'all') {
      if (this.materials.length == 0) {
        if (this.garbage.material_theme !== this.selectedTheme.id) {
          this.updateSubscription = this.userService
            .updateGarbage({
              material_theme: this.selectedTheme.id,
              material_themes: {}
            })
            .subscribe((status) => {
              this.saving = false;
              if (status) {
                this.userService.updateGarbageImpl({
                  material_theme: this.selectedTheme.id,
                  material_themes: {}
                });
                this.dialogRef.close(this.selectedTheme.name);
                this.toast.success(
                  'Material template has been changed successfully.'
                );
              }
            });
        } else {
          this.dialogRef.close();
        }
      } else {
        for (let i = 0; i < this.materials.length; i++) {
          this.theme_setting[this.materials[i]._id] = this.selectedTheme.id;
        }
        this.updateSubscription = this.userService
          .updateGarbage({ material_themes: this.theme_setting })
          .subscribe((status) => {
            this.saving = false;
            if (status) {
              this.userService.updateGarbageImpl({
                material_themes: this.theme_setting
              });
              this.dialogRef.close(this.selectedTheme.name);
              this.toast.success(
                'Material template has been changed successfully.'
              );
            }
          });
      }
    } else {
      if (this.theme_setting[this.material_id] !== this.selectedTheme.id) {
        this.theme_setting[this.material_id] = this.selectedTheme.id;
        this.updateSubscription = this.userService
          .updateGarbage({ material_themes: this.theme_setting })
          .subscribe((status) => {
            this.saving = false;
            if (status) {
              this.userService.updateGarbageImpl({
                material_themes: this.theme_setting
              });
              this.dialogRef.close(this.selectedTheme.name);
              this.toast.success(
                'Material template has been changed successfully.'
              );
            }
          });
      } else {
        this.dialogRef.close();
      }
    }
  }
}
