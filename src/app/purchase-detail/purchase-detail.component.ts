import { Component, OnInit } from '@angular/core';
import { MatDatepicker, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { ProductImageModuleComponent } from 'src/app/master/product-image-module/product-image-module.component';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.scss']
})
export class PurchaseDetailComponent implements OnInit {

  karigar_id:any='';
  page_number:any='';
  status:any='';
  loading_list = true;
  executive:any=[];
  filtering : any = false;
  filter:any = {};
  last_page: number ;
  current_page = 1;
  search: any = '';
  uploadurl: any = "";
  siteImages:any=[];
  previousUrl:any='';
  mindate :any = new Date();  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,public dialog: DialogComponent, public alrt:MatDialog ) {
    console.log(route);
    this.uploadurl = this.db.uploadUrl;
  }
  
  mode:any=1;
  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
      
      this.karigar_id = params['id'];
      
      console.log(this.karigar_id);
      
      this.page_number = params['page'];
      this.status = params['status'];
      if (this.karigar_id) {
        this.getKarigarDetails();
      }
    });
  }
  
  openDatePicker(picker : MatDatepicker<Date>)
  {
    picker.open();
  }
  edit(){
    this.router.navigate(['/purchase-add/' + this.karigar_id]);
  }
  getData:any = {};
  total_wallet_points:any = 0;

  getKarigarDetails() {
    this.loading_list = true;
    this.db.post_rqst(  {'purchase_id':this.karigar_id}, 'master/purchaseDetail')
    .subscribe(d => {
      this.loading_list = false;
      console.log(d);
      this.getData = d.purchase_order;
      // this.executive = d.site_locations.assign_executive;
      // this.siteImages = d.site_locations.images;
      
      
    });
  }
  
  openDialog(id,name,string ) {
    const dialogRef = this.alrt.open(ProductImageModuleComponent,{
      data: {
        'id' : id,
        'name' : name,
        'mode' : string,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  

}
