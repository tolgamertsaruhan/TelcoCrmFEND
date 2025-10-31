import { Injectable, signal } from '@angular/core';
import { CreateCustomerModel, Customer } from '../models/individualcustomer/requests/CreateCustomerModel';


@Injectable({
  providedIn: 'root',
})
export class CustomerCreationService {
  public state = signal<CreateCustomerModel>({
    addressRequestList: [],
    createContactMediumRequests: []
  });

  public customer = this.state.asReadonly();

  setCustomerInfo(data: Partial<Customer>) {
  this.state.update(c => ({
    ...c,
    createIndividualCustomerRequest: {
      ...c.createIndividualCustomerRequest,
      ...data
    }
  }));
  }

  addAddress(address: any) {
    this.state.update(c => ({
      ...c,
      addressRequestList: [...(c.addressRequestList ?? []), address]
    }));
  }

  addContactMedium(medium: any) {
    this.state.update(c => ({
      ...c,
      createContactMediumRequests: [...(c.createContactMediumRequests ?? []), medium]
    }));
  }

  reset() {
    this.state.set({ addressRequestList: [], createContactMediumRequests: [] });
  }

  getCurrentCustomer() {
    return this.state();
  }
}
