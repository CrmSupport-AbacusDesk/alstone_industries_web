import { MatDatepicker, MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SessionStorage } from 'src/app/_services/SessionService';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { Component, OnInit } from '@angular/core';
import { ProductImageModuleComponent } from 'src/app/master/product-image-module/product-image-module.component';
// import { ChangedealerstatusComponent } from 'src/app/changedealerstatus/changedealerstatus.component';
// import { ChangecompanystatusComponent } from 'src/app/changecompanystatus/changecompanystatus.component';

@Component({
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.scss']
})
export class SiteDetailComponent implements OnInit {
  
  loc_id:any='';
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
    this.uploadurl = this.db.uploadUrl;
  }
  
  mode:any=1;
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loc_id = params['id'];
      this.page_number = params['page'];
      this.status = params['status'];
      if (this.loc_id) {
        this.getKarigarDetails();
        this.getSiteDetails();
      }
    });
    
    this.getPurchaseList();
  }
  
  site_visit_count:any =0;
  getSiteDetails() {
    this.filter = {};
    this.loading_list = true;
    this.db.post_rqst({'filter':this.filter, 'site_location_id':this.loc_id}, 'master/siteVisitList')
    .subscribe(d => {
      this.loading_list = false;
      this.site_visit_count = d.site_visit_count;
      this.site_visit = d.site_visit_remarks.data;
    });
  }
  
  
  
  purchaseOrder:any =[];
  site_locations: any = [];
  dealer_all:any =0;
  total_dealers = 0;
  total_purchase:any =0;
  dealer_pending : any = 0;
  dealer_reject : any = 0;
  dealer_suspect : any = 0;
  dealer_verified : any = 0;
  
  getPurchaseList = () => {
    this.loading_list = true;
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    this.filter.start_date = this.filter.start_date  ? this.db.pickerFormat(this.filter.start_date) : '';
    this.filter.end_date = this.filter.end_date  ? this.db.pickerFormat(this.filter.end_date) : '';
    if( this.filter.date ||  this.filter.start_date ||  this.filter.end_date)this.filtering = true;
    
    this.filter.site_location_id = this.loc_id;
    this.db.post_rqst({'filter':this.filter, 'site_location_id': this.loc_id}, 'karigar/getSitePurchaseOrder')
    .subscribe(d => {
      this.loading_list = false;
      this.current_page = d.purchase_orders.current_page;
      this.last_page = d.purchase_orders.last_page;
      this.total_purchase =d.purchase_orders.total;
      this.site_locations = d.purchase_orders.data;            
      this.dealer_all = d.karigar_all;
      this.dealer_pending = d.karigar_pending;
      this.dealer_reject = d.karigar_reject;
      this.dealer_suspect = d.karigar_suspect;
      this.dealer_verified = d.karigar_verified;   
    });
  }
  
  
  // changeCompanyStatus(id,status)
  // {
  //   const dialogRef = this.alrt.open(ChangecompanystatusComponent,{
  //     width: '500px',
  //     // height:'500px',
      
  //     data: {
  //       'id' : id,
  //       'companyStaus' : status,
  //       'target' : 1,
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if( result ){
  //       this.getPurchaseList();
  //     }
  //   });
  // }
  
  
  // changeDealerStatus(id,status)
  // {
  //   const dialogRef = this.alrt.open(ChangedealerstatusComponent,{
  //     width: '500px',
  //     // height:'500px',
      
  //     data: {
  //       'id' : id,
  //       'dealerStatus' : status,
  //       'target' : 1,
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if( result ){
  //       this.getPurchaseList();
  //     }
  //   });
  // }
  
  deletePcs(id)
  {
    this.dialog.delete('Dealer')
    .then((result) => {
      if(result)
      {
        this.db.post_rqst({'purchase_id': id}, 'master/purchaseDelete')
        .subscribe(d => {
          this.getPurchaseList();
          this.dialog.successfully();
        });
      }
    });
  }
  
  
  previousPage = () => {
    
  }
  
  openDatePicker(picker : MatDatepicker<Date>)
  {
    picker.open();
  }
  edit(){
    this.router.navigate(['/site-add/' +this.loc_id]);
  }
  getData:any = {};
  site_visit = [];
  total_wallet_points:any = 0;
  getKarigarDetails() {
    this.loading_list = true;
    this.db.post_rqst(  {'site_location_id':this.loc_id}, 'master/siteLocationDetail')
    .subscribe(d => {
      this.loading_list = false;
      this.getData = d.site_locations;
      this.executive = d.site_locations.assign_executive;
      this.siteImages = d.site_locations.image;
    });
  }
  
  openDialog(data,name,string ) {
    const dialogRef = this.alrt.open(ProductImageModuleComponent,{
      data: {
        'data' : data,
        'name' : name,
        'mode' : string,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  
  
  // checkStatus = (id, status, verified_at) =>{
  //   if(verified_at == 'Dealer'){
  //     this.changeDealerStatus(id, status);
  //   }
  //   else {
  //     this.changeCompanyStatus(id, status);
  //   }
  // }
  
  
  checkIsNumber = (val) => {
    this.filter.dealer_mobile_no = '';
    if(isNaN(val.target.value)){
      this.filter.dealer_mobile_no = '';
      this.filter.dealer_name = val.target.value;
      this.current_page = 1; 
      this.getPurchaseList();
    }else{
      this.filter.dealer_name = '';
      this.filter.dealer_mobile_no = val.target.value;
      this.current_page = 1; 
      this.getPurchaseList();
    }
  }
  
  
}
