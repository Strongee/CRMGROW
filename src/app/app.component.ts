import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CRMGrow';
  langs = ['en', 'fr'];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService
  ) {
    this.translateService.addLangs(this.langs);
    this.translateService.setDefaultLang('en');

    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use(browserLang.match(/en|fr/) ? browserLang : 'fr');
  }

  ngOnInit(): void {
    this.titleHandle();
  }

  titleHandle(): void {
    const appTitle = this.titleService.getTitle();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      )
      .subscribe((ttl: string) => {
        const title = ttl ? `${ttl} | ${this.title}` : this.title;
        this.titleService.setTitle(title);
      });
  }
}
