import { Routes } from '@angular/router';
import { IndividualCustomerCreate } from './pages/individual-customer-create/individual-customer-create';
import { CustomerSearch } from './pages/customer-search/customer-search';
import { CustomerCreate } from './pages/customer-create/customer-create';
import { CustomerInfo } from './pages/customer-create/customer-info/customer-info/customer-info';
import { AddressInfo } from './pages/customer-create/address-info/address-info/address-info';
import { ContactMediumInfo } from './pages/customer-create/contact-medium-info/contact-medium-info/contact-medium-info';
import { CustomerInformationScreen } from './pages/customer-information-screen/customer-information-screen';
import { CustomerInformation } from './pages/customer-information-screen/customer-information/customer-information';
import { AddressInformation } from './pages/customer-information-screen/address-information/address-information';
import { ContactMediumInformation } from './pages/customer-information-screen/contact-medium-information/contact-medium-information';
import { BillingAccountInformation } from './pages/customer-information-screen/billing-account-information/billing-account-information';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth-guard-guard';
import { Register } from './pages/register/register';

export const routes: Routes = [
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    {path:"create-individual-customer", component:IndividualCustomerCreate, canActivate: [AuthGuard]},
    {path:"customer-search", component:CustomerSearch , canActivate: [AuthGuard]},
    {
    path: 'customer-create',
    component: CustomerCreate,
    canActivate: [AuthGuard],
    children: [
      { path: 'customer-info', component: CustomerInfo },
      { path: 'address-info', component: AddressInfo },
      { path: 'contact-medium-info', component: ContactMediumInfo },
      { path: '', redirectTo: 'customer-information-screen/:id', pathMatch: 'full' }
    ]
  },
  {
    path: 'customer-information-screen/:id', // 👈 müşteri ID burada parametre olarak gelecek
    component: CustomerInformationScreen,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'customer-information', pathMatch: 'full' },
      { path: 'customer-information', component: CustomerInformation },
      { path: 'address-information', component: AddressInformation },
      { path: 'contact-medium-information', component: ContactMediumInformation },
      { path: 'billing-account-information', component: BillingAccountInformation },
    ]
  },
  { path: '', redirectTo: 'customer-search', pathMatch: 'full' }

];
