import { Routes } from '@angular/router';
import { IndividualCustomerCreate } from './pages/individual-customer-create/individual-customer-create';
import { CustomerSearch } from './pages/customer-search/customer-search';

export const routes: Routes = [
    {path:"create-individual-customer", component:IndividualCustomerCreate},
    {path:"customer-search", component:CustomerSearch}
];
