import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { Garbage } from 'src/app/models/garbage.model';

@Component({
  selector: 'app-material-edit-template',
  templateUrl: './material-edit-template.component.html',
  styleUrls: ['./material-edit-template.component.scss']
})
export class MaterialEditTemplateComponent implements OnInit {
  theme_setting = {};
  material_id = '';
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  saving = false;
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

  garbageSubscription: Subscription;
  updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MaterialEditTemplateComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.material_id = this.data.id;
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      const garbage = new Garbage().deserialize(res);
      let theme;
      if (
        garbage.material_themes &&
        garbage.material_themes[this.material_id]
      ) {
        this.theme_setting = garbage.material_themes;
        theme = garbage.material_themes[this.material_id];
      } else {
        theme = garbage.material_theme;
      }
      this.selectedTheme = this.themes.filter((e) => e.id == theme)[0];
    });
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
    this.theme_setting[this.material_id] = this.selectedTheme.id;
    this.updateSubscription = this.userService
      .updateGarbage({ material_themes: this.theme_setting })
      .subscribe((status) => {
        this.saving = false;
        if (status) {
          this.userService.updateGarbageImpl({
            material_themes: this.theme_setting
          });
          this.dialogRef.close();
        }
      });
  }
}
