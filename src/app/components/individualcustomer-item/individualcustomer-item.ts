import { Component, Input } from '@angular/core';
import { IndividualCustomerListResponse } from '../../models/individualcustomer/responses/individualCustomerListResponse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-individualcustomer-item',
  imports: [CommonModule],
  templateUrl: './individualcustomer-item.html',
  styleUrl: './individualcustomer-item.scss',
})
export class IndividualcustomerItem {
@Input() individualcustomerItem!: IndividualCustomerListResponse;
}
