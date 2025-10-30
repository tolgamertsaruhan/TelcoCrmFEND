import { Routes } from '@angular/router';
import { IndividualCustomerCreate } from './pages/individual-customer-create/individual-customer-create';
import { CustomerSearch } from './pages/customer-search/customer-search';
import { CustomerCreate } from './pages/customer-create/customer-create';
import { CustomerInfo } from './pages/customer-create/customer-info/customer-info/customer-info';
import { AddressInfo } from './pages/customer-create/address-info/address-info/address-info';
import { ContactMediumInfo } from './pages/customer-create/contact-medium-info/contact-medium-info/contact-medium-info';

export const routes: Routes = [
    {path:"create-individual-customer", component:IndividualCustomerCreate},
    {path:"customer-search", component:CustomerSearch},
    {
    path: 'customer-create',
    component: CustomerCreate,
    children: [
      { path: 'customer-info', component: CustomerInfo },
      { path: 'address-info', component: AddressInfo },
      { path: 'contact-medium-info', component: ContactMediumInfo },
      { path: '', redirectTo: 'customer-info', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'customer-search', pathMatch: 'full' }

];
