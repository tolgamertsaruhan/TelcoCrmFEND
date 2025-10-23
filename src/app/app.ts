import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from "./components/loader/loader";
import { IndividualcustomerList } from './components/individualcustomer-list/individualcustomer-list';
import { IndividualcustomerItem } from "./components/individualcustomer-item/individualcustomer-item";
import { Navbar } from "./components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader, IndividualcustomerList, IndividualcustomerItem, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Crm-FrontEnd');
}
