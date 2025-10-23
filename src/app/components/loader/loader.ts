import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader-service';
 
@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})
export class Loader {
 constructor(public loaderService:LoaderService){}
}