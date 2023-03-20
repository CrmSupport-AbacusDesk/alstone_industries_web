import { Component, OnInit } from '@angular/core';
import { MatDatepicker, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-purchase-add',
  templateUrl: './purchase-add.component.html',
  styleUrls: ['./purchase-add.component.scss']
})
export class PurchaseAddComponent implements OnInit {

  loading_list = true;
  siteform: any = {};
  savingData = false;
  pcs:any = [];
  districts: any = [];
  citys: any = [];
  salesUser:any =[];
  pc:any=[];
  pincodes: any = [];
  order_id:any;
  image = new FormData();
  date1:any;
  zoneData:any =[];
  managerData:any =[];
  data:any={};
  locations:any = [];
  dealers:any = [];
  products:any = [];
  site_zone: any;
  
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,public matDialog: MatDialog,  public dialog: DialogComponent) { this.date1 = new Date();}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.order_id = params['id'];
      console.log('order id', this.order_id);
      if (this.order_id)
      {
       
        this.getPurchaseOrder();
      }

      console.log('Db user', this.db.datauser);

      this.loading_list = true;
      this.getLocation('');
      this.getProductList();
    
      setTimeout(() => {
        this.loading_list = false;
      }, 5000);

      this.siteform.country_id = 99;
    });
  }

  getPurchaseOrder(){
    this.loading_list = true;
    this.db.post_rqst(  {'purchase_id':this.order_id}, 'master/purchaseDetail')
    .subscribe(d => {
      console.log('Purchase Details ->', d);
      this.data = d.purchase_order; 
      this.getarchitect('',this.data.state);
      this.AssignSaleUser(this.data.state);
    });

  }

  getLocation(search){
    this.loading_list = true;

    this.db.post_rqst({'search': search, 'district': search}, 'master/getSites')
    .subscribe(d => { 
 
      this.locations = d.site_locations;
      this.loading_list = false;
     
    });

  }


  
  getPcs (event) {

    // console.log('Event ->', event);
    // let obj = [];
    // let district = {};
    // if(event){
    //   obj = this.locations.filter(x => x.id == event.value);
    //   district = obj[0].district
    // }
    
    this.loading_list = true;
    this.db.post_rqst({'search': event}, 'master/getPCs')
    .subscribe(d => { 
      console.log(d.pcs);
      this.pcs = d.pcs;
      this.loading_list = false;
    });
  }

  myZone:any
  getDealer(event, zone = ''){
    console.log(event);

    this.myZone =zone;
    console.log(this.myZone);
    
    
    // const obj = this.locations.filter(x => x.id == event.value);
    this.db.post_rqst({'search': event, 'sales_zone':this.myZone}, 'master/getDealers')
    .subscribe(d => { 
   
      this.dealers = d.dealers;
      // this.loading_list = false;
    });
  }

  getProductList(){
    this.loading_list = true;
    this.db.post_rqst({}, 'master/getProducts').subscribe(d => {   
      this.products = d.products;
      this.loading_list = false;
    });
  }
  
  
  numeric_Number(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  

  savesiteform = (form:any) => {
    this.savingData = true;
    this.loading_list = true;
   
    if(this.order_id)
    {
      this.data.purchase_order_id = this.order_id;
    }

    this.data.created_by = this.db.datauser.id;


    this.db.insert_rqst({ 'data' : this.data }, 'master/addPurchaseOrder')
    .subscribe(d => {
      this.savingData = false;
      this.loading_list = false;
      if(d['status'] == 'SUCCESS') {
        this.dialog.success('Purchase order saved successfully');
        this.router.navigate(['/purchase-list']);
      }
      else if(d['status'] == 'UPDATED'){
        this.dialog.success('Purchase order updated successfully');
        this.router.navigate(['/purchase-list']);
      }
      else {
        this.dialog.error('Something went wrong');
      }
    });
  }

  architect_user:any=[]
  getarchitect(search,state){
    console.log(state)
    this.db.post_rqst({'filter':{'state':state,'limit':0,'search':search}}, 'karigar/Architect_list')
    .subscribe(d => { 
      console.log(d);
      this.architect_user = d.architect_user;
    });
  }

  sales_users:any=[];
  AssignSaleUser(state)
  {
    console.log(state)
      this.db.post_rqst({'filter':{'state':state,'limit':0}},'karigar/Architect_sales_user')
      .subscribe(d => {
          this.sales_users = d.sales_user;
          console.log(this.sales_users)
      });
  }

}
