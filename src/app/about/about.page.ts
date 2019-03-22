import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss'],
})
export class AboutPage {

  openLink(url) {
    window.open(url, '_system');
  };
  
}
