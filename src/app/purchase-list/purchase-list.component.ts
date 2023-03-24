import { Component, OnInit } from '@angular/core';
import { MatDatepicker, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
// import { ChangecompanystatusComponent } from 'src/app/changecompanystatus/changecompanystatus.component';
// import { ChangedealerstatusComponent } from 'src/app/changedealerstatus/changedealerstatus.component';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { ChangeStatusComponent } from 'src/app/gift-gallery/change-status/change-status.component';
import { MastetDateFilterModelComponent } from 'src/app/mastet-date-filter-model/mastet-date-filter-model.component';
import { DatabaseService } from 'src/app/_services/DatabaseService';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent implements OnInit {

  loading_list = false;
  site_locations: any = [];
  total_dealers = 0;
  dealer_all:any =0;
  
  last_page: number ;
  current_page = 1;
  search: any = '';
  filter:any = {};
  filtering : any = false;
  select_all:any=false;
  
  dealer_pending : any = 0;
  dealer_reject : any = 0;
  dealer_suspect : any = 0;
  dealer_verified : any = 0;
  delete_count:any;
  

  constructor(public db: DatabaseService, private router: Router, public dialog: DialogComponent, public route: ActivatedRoute, public alrt: MatDialog) {
    this.route.params.subscribe(resp=>{
      this.current_page = resp.page;
      console.log("helo");
      
    });
    this.filter ={};
    this.filter.status = '';

    console.log(this.filter);
    if(this.filter.status == undefined)
    {
        this.filter.status = '';
    }
  
   }

  ngOnInit() {

    this.getPurchaseList(''); 
    this.AssignSaleUser();
  }

  openDatePicker(picker : MatDatepicker<Date>)
  {
    picker.open();
  }
  openDatepicker(): void {
    const dialogRef = this.alrt.open(MastetDateFilterModelComponent, {
        width: '500px',
        data: {
            from:this.filter.date_from,
            to:this.filter.date_to
        }
    });
    
    dialogRef.afterClosed().subscribe(result => {
        this.filter.date_from = result.from;
        this.filter.date_to = result.to;
        this.getPurchaseList('');
    });
}
  redirect_previous() {
    this.current_page--;
    this.getPurchaseList('');
  }
  redirect_next() {
    if (this.current_page < this.last_page) { this.current_page++; }
    else { this.current_page = 1; }
    this.getPurchaseList('');
  }
  
  set_filter(data)
  {
    this.db.set_filters(data);
  }
  current1()
  {
    this.current_page = 1;
    this.getPurchaseList('');
  }
  last1()
  {
    this.current_page = this.last_page;
    this.getPurchaseList('');
  }
  
  total_wallet_point:any = 0;
  
  getPurchaseList(action:any) 
  {
    console.log(this.filter);
    this.loading_list = true;
    this.filter.date = this.filter.date  ? this.db.pickerFormat(this.filter.date) : '';
    if( this.filter.date)this.filtering = true;
    this.filter.mode = 0;
    
    if(action=='refresh')
    {
      this.select_all = false;
      let status = this.filter.status
      this.filter={}
      this.filter.status= status;
      this.current_page = 1;
    }
    
    this.db.post_rqst({'filter': this.filter,'login':this.db.datauser,user_type:"3"}, 'master/purchaseList?page=' + this.current_page)
    .subscribe( d => {
      this.loading_list = false;
      console.log('Purchase List ->', d);            
      this.current_page = d.purchase_orders.current_page;
      this.last_page = d.purchase_orders.last_page;
      this.total_dealers =d.purchase_orders.total;
      this.site_locations = d.purchase_orders.data;            
      this.dealer_all = d.purchase_count;
      this.dealer_pending = d.purchase_pending_count;
      this.delete_count=d.purchase_delete_count
      this.dealer_reject = d.purchase_reject_count;
      this.dealer_suspect = d.karigar_suspect;
      this.dealer_verified = d.purchase_verified_count;            
    
    });
  }
  
  
  exportDealer()
  {
    this.filter.mode = 1;
    this.db.post_rqst(  {'filter': this.filter , 'login':this.db.datauser,user_type:'3'}, 'master/exportPurchaseOrder')
    .subscribe( d => {
      document.location.href = this.db.myurl+'/app/uploads/exports/'+d.file_name;
      console.log(d);
    });
  }

  
  sales_users:any=[];
  AssignSaleUser()
  {
    this.db.get_rqst('','karigar/sales_users')
    .subscribe(d => {
      console.log(d);
      this.sales_users = d.sales_users;
    });
  }

  deletepurchase(id)
  {
    this.dialog.delete('Dealer')
    .then((result) => {
      if(result)
      {
        this.db.post_rqst({'purchase_id': id}, 'master/purchaseDelete')
        .subscribe(d => {
          console.log(d);
          this.getPurchaseList('');
          this.dialog.successfully();
        });
      }
    });
  }

 
  salesUsertatus(id, status)
  {
    this.dialog.comanAlert('Do you want to change status')
    .then((result) => {
      if(result)
      {
        this.db.post_rqst({'id': id, 'is_active':status}, 'karigar/changeActiveStatus')
        .subscribe(d => {
          console.log(d);
          this.getPurchaseList('');
          this.dialog.successfully();
        });
      }
    });
  }


  


 


  edit = (id) => {
    this.router.navigate(['/purchase-add/' + id]);
  }

  checkIsNumber = (val) => {
    this.filter.dealer_mobile_no = '';
    console.log('Check is Number Called', val.target.value);
    if(isNaN(val.target.value)){
      this.filter.dealer_mobile_no = '';
      this.filter.dealer_name = val.target.value;
      this.current_page = 1; 
      this.getPurchaseList('')
    }else{
      this.filter.dealer_name = '';
      this.filter.dealer_mobile_no = val.target.value;
      this.current_page = 1; 
      this.getPurchaseList('')
    }
  }


  purchaseStatus(id,status){
    this.dialog.comanAlert("Are you sure ?")
    .then(resp=>{
      console.log(resp);
      if(resp)
      {
        this.db.post_rqst({'purchase_order_id':id,'status':status }, 'master/purchaseOrderStatus')
        .subscribe(d => {
            console.log(d);
            if(d['status']=='product_not_exist'){
            this.dialog.error("Product Not Exist!");
            this.getPurchaseList('');

            }

           else if(d['status']=='architect_not_exist'){
              this.dialog.error("Architect Not Exist!");
              this.getPurchaseList('');
  
              }

            else if(d['status']=='UPDATED'){
              this.dialog.success("Status Change Successfully!");
              this.getPurchaseList('');
  
              }
        });
       
      }
      else{
        this.getPurchaseList('');
      }
    })
  }


  
}
