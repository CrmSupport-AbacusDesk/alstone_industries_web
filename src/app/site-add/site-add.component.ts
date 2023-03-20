import { Component, OnInit } from '@angular/core';
import { MatDatepicker, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { DatabaseService } from 'src/app/_services/DatabaseService';
import { SessionStorage } from 'src/app/_services/SessionService';

@Component({
  selector: 'app-site-add',
  templateUrl: './site-add.component.html',
  styleUrls: ['./site-add.component.scss']
})
export class SiteAddComponent implements OnInit {

 
  loading_list = false;
  siteform: any = {};
  savingData = false;
  states:any =[];
  districts: any = [];
  citys: any = [];
  filter:any = {};
  salesUser:any =[];
  pc:any=[];
  engineer:any=[];
  pincodes: any = [];
  karigar_id:any;
  image = new FormData();
  date1:any;
  zoneData:any =[];
  managerData:any =[];
  uploadurl: any = "";
  dealers:any = [];
  sales_person:any = [];
  
  
  
  constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,public matDialog: MatDialog,  public dialog: DialogComponent) { 
    this.uploadurl = this.db.uploadUrl;
   
    this.date1 = new Date();
  }
  
  ngOnInit() {
    
    // this.managerList('');
    // this.getBrand('');
    this.route.params.subscribe(params => {
      this.karigar_id = params['id'];
      if (this.karigar_id)
      {
        this.getKarigarDetails();
      
      }
      // this.managerList('');
      this.getStateList();
      // this.get_karigar_type();
      // this.getEngineer('')
      this.siteform.country_id = 99;
    });
  }
  
  
  // selectedExecutive = (event, i) => {
  //   console.log(event.source.value, i);
  //   if(event.source.selected) {
  //     this.salesuser_id.push({'id':event.source.value});
  //   }else {
  //     console.log('unchecked called');
  //     const index = this.salesuser_id.findIndex(row => row.id == event.source.value);
  //     this.salesuser_id.splice(index, 1);
  //   }
  //   console.log(event);
  //   console.log(this.salesuser_id);
  // }

  checkId = (event) => {
    console.log('Checked Called =', event);
  }


  getStateList(){
    this.loading_list = true;
    this.db.get_rqst('', 'app_master/getStates')
    .subscribe(d => { 
      this.loading_list = false;  
      this.states = d.states;
    });
  }
  
  getDistrictList(value){
    this.loading_list = true;
    let st_name;
    if(value == 1)
    {
      st_name = this.siteform.state;
    }
    this.db.post_rqst({'state_name':st_name}, 'app_master/getDistrict')
    .subscribe(d => { 
      
      this.loading_list = false;  
      this.districts = d.districts  ;
    });
  }
  
  getCityList(value){
    let dist_name;
    if(value == 1)
    {
      dist_name = this.siteform.district;
    }
    
    this.db.post_rqst({'district_name':dist_name}, 'app_master/getCity')
    .subscribe(d => { 
      
      this.loading_list = false;  
      this.citys = d.cities;
    });
  }
  
  

  sales_users:any=[];
  AssignSaleUser()
  {
      this.db.post_rqst({'filter':{'state':this.siteform.state,'limit':0}},'karigar/Architect_sales_user')
      .subscribe(d => {
          this.sales_users = d.sales_user;
          console.log(this.sales_users)
      });
  }

  // selectAll = () => {
  //     const data = this.salesuser_id.filter(row => row.id == this.siteform.salesuser_id);
  //     console.log('Selected Data ==>', this.siteform.salesuser_id);
  //     for(let i = 0; i < this.siteform.salesuser_id.length; i++){
  //           // this.salesuser_id[i].selected = true; 
  //     }
  //     console.log('Inside IF ELSE Condition ==>', this.siteform);
  // }


 
  architect_user:any=[]
  getarchitect(search){
    this.db.post_rqst({'filter':{'state':this.siteform.state,'limit':0,'search':search}}, 'karigar/Architect_list')
    .subscribe(d => { 
      console.log(d);
      this.architect_user = d.architect_user;
    });
  }

  getEngineer(search){
    this.db.post_rqst({'search':search}, 'karigar/getEngineer')
    .subscribe(d => { 
      this.engineer = d.engineer;
    });
  }
  
 

  // getSalesUser(search){
  //   this.filter.assigned_location = this.siteform.sales_zone;
  //   this.db.post_rqst({'filter':this.filter, 'search':search}, 'karigar/getSalesExecutives')
  //   .subscribe(d => { 
  //     console.log(d);
      
  //     this.loading_list = false;  
  //     this.salesUser = d.sales_executives;
  //   });
  // }
  
  
  
  openDatePicker(picker : MatDatepicker<Date>)
  {
    picker.open();
  }
  
  
  getKarigarDetails() {
    this.loading_list = true;
    this.db.post_rqst({'site_location_id':this.karigar_id}, 'master/siteLocationDetail')
    .subscribe(d => {
      this.loading_list = false;
      console.log(d);
      this.siteform = d.site_locations;
      console.log(this.siteform.images);
      
      this.getDistrictList(1);
      this.getCityList(1);
      this.getarchitect('');
      this.AssignSaleUser();


      
      for(let i=0; i<this.siteform.image.length ;i++)
      {
        // if( parseInt( this.siteform.images[i].profile ) == 1  )
        this.selected_image.push({"image":this.siteform.image[i].image_name,"id":this.siteform.image[i].id} );
      }
      
    });
  }
  
  
  
  
  
  
  type_list = [];
  get_karigar_type()
  {
    this.db.post_rqst({},"karigar/get_kar_type")
    .subscribe(resp=>{
      console.log(resp);
      this.type_list = resp.types;
    })
  }
  
  numeric_Number(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  
  
  selected_image :any = [];
  onUploadChange(data: any)
  {
    for(let i=0;i<data.target.files.length;i++)
    {
      let files = data.target.files[i];
      if (files) 
      {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          console.log(e.target.result)
          this.selected_image.push({"image":e.target.result});
        }
        reader.readAsDataURL(files);
      }
      this.image.append(""+i,data.target.files[i],data.target.files[i].name);
    }
  }
  
  
  deleteProductImage(index,data)
  {
    console.log(data);
    
    this.dialog.delete("Are you sure ?")
    .then(resp=>{
      console.log(resp);
      if(resp)
      {
        this.db.post_rqst({"id":data},"master/deleteSiteLocationImage")
        .subscribe(resp=>{
          console.log(resp);
          this.dialog.success("Deleted!");
          this.selected_image.splice(index,1)
        });
      }
    })
  }
  
  removeImage() {
    this.selected_image = [];
  }
  
  
  savesiteform(form:any)
  {
    this.savingData = true;
    this.loading_list = true;
    this.siteform.dob = this.siteform.dob  ? this.db.pickerFormat(this.siteform.dob) : '';
    this.siteform.created_by = this.db.datauser.id;
    if(this.karigar_id)
    {
      this.siteform.site_location_id  = this.karigar_id;
    }
   
    this.siteform.image = this.selected_image ? this.selected_image : [];
    
    this.db.insert_rqst( { 'data' : this.siteform }, 'master/siteLocationAdd')
    .subscribe( d => {
      this.savingData = false;
      this.loading_list = false;
      if(d['status'] == 'SUCCESS' ){
        this.router.navigate(['site-list/1']);
        this.dialog.success('Site has been successfully added');
      }
      else if(d['status']  == 'UPDATED'){
        this.router.navigate(['site-list/1']);
        this.dialog.success('Site has been successfully updated');
      }
      // this.db.fileData(this.image, "images").subscribe((resp) => {
      //   console.log(resp);
      //   this.savingData = false;
      //   this.image = new FormData();
      //   this.siteform = {};
      //   this.selected_image = [];
      
      // });
      
    });
  }
  

  getaddress(pincode) {
    if (this.siteform.pincode.length == '6') {
        this.db.post_rqst({ 'pincode': pincode }, 'app_karigar/getAddress')
            .subscribe((result) => {
                console.log(result);
                var address = result.address;
                if (address != null) {
                    this.siteform.state = address.state_name;
                    this.siteform.district = address.district_name;
                    this.siteform.city = address.city;
                    console.log(this.siteform);
                    this.getDistrictList(1);
                     this.AssignSaleUser();
                     this.getarchitect('');
                    }
                else{
                    this.dialog.error('Enter Valid Pincode');
                   }
          
            });
    }

}
}
