import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/services/theme.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { Theme } from '../../models/theme.model';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss']
})
export class ThemesComponent implements OnInit {
  themes: Theme[] = [];

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllThemes();
  }

  loadAllThemes(): void {
    this.themeService.getAllTheme().subscribe(
      (res) => {
        this.themes = res;
      },
      (err) => {}
    );
  }

  editTheme(id: string): void {
    this.router.navigate(['/theme/edit/' + id]);
  }

  deleteTheme(id: string): void {
    const confirmDialog = this.dialog.open(ConfirmComponent, {
      position: { top: '100px' },
      data: {
        title: 'Delete Theme',
        message: 'Are you sure to delete this theme?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel'
      }
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.themeService.deleteTheme(id).subscribe((res) => {
          if (res['status'] == true) {
            this.loadAllThemes();
          }
        });
      }
    });
  }

  duplicateTheme(id: string): void {
    this.router.navigate(['/theme/new/' + id]);
  }
}
