import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingAccountInformation } from './billing-account-information';

describe('BillingAccountInformation', () => {
  let component: BillingAccountInformation;
  let fixture: ComponentFixture<BillingAccountInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingAccountInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingAccountInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
