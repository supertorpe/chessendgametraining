import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SharedModule } from '../shared';
import { RouterModule } from '@angular/router';
import { PositionPage } from './position.page';

describe('PositionPage', () => {
  let component: PositionPage;
  let fixture: ComponentFixture<PositionPage>;
  let positionPage: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        SharedModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        RouterModule.forRoot([
          {
            path: '',
            component: PositionPage
          }
        ])
      ],
    })
      .compileComponents();
  }));

  beforeEach(async () => {
    fixture = await TestBed.createComponent(PositionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
