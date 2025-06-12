import {Component, OnInit, Input} from '@angular/core';
import { IProduct } from '../../product';



@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit{
  @Input('datos') public products:IProduct[]=[];
  imageWidth:number=50;
  imageMargin:number=10;
  showImage:boolean=false;
  constructor(){}
  ngOnInit(){}
  toggleImage():void{
    this.showImage=!this.showImage;
  }
}