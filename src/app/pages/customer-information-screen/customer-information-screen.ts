import { Component } from '@angular/core';
import { CreatedIndividualCustomerResponse } from '../../models/individualcustomer/responses/CreateFullIndividualCustomerResponse';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from "../../components/navbar/navbar";
import { Sidebar } from "../../components/sidebar/sidebar";

@Component({
  selector: 'app-customer-information-screen',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterOutlet, Navbar, Sidebar],
  templateUrl: './customer-information-screen.html',
  styleUrl: './customer-information-screen.scss',
})
export class CustomerInformationScreen {

  customerId!: string;
  activeTab: string = 'customer-information';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';

    // URL’ye göre aktif tab’ı belirle
    const childRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    if (childRoute) {
      this.activeTab = childRoute;
    } else {
      this.router.navigate(['customer-information'], { relativeTo: this.route });
    }
  }

  navigateTo(tab: string): void {
    this.activeTab = tab;
    this.router.navigate([tab], { relativeTo: this.route });
  }

 /* goBack(){
    this.router.navigate(['/customer-search']);
  }*/

    goBack() {
  // Arama sonuçları ve form state'ini geri gönder
  this.router.navigate(['/customer-search'], {
    state: {
      searchForm: history.state.searchForm,
      searchResults: history.state.searchResults,
      currentPage: history.state.currentPage
    }
  });
}
}
