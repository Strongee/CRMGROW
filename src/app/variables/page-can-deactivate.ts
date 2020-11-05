import { ComponentCanDeactivate } from '../guards/page-exit.guard';

export abstract class PageCanDeactivate extends ComponentCanDeactivate{

  abstract saved: boolean = false;

 canDeactivate():boolean{
    return this.saved;
  }
}
