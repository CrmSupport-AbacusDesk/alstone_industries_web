import {Component,OnInit} from '@angular/core';
import {DatabaseService} from '../../_services/DatabaseService';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogComponent} from '../../dialog/dialog.component';
import {SessionStorage} from '../../_services/SessionService';
import {MatPaginator, MatTableDataSource, MatDialog, MatDatepicker} from '@angular/material';


@Component({
    selector: 'app-karigar-add',
    templateUrl: './karigar-add.component.html',
})
export class KarigarAddComponent implements OnInit {
    
    loading_list = false;
    karigarform: any = {};
    savingData = false;
    states: any = [];
    districts: any = [];
    cities: any = [];
    pincodes: any = [];
    karigar_id:any;
    date1:any;
    uploadUrl:any='';
    docId:any;
    userType:any;
    navPass:any ={};
    back_doc_id: any;

    

    
    constructor(public db: DatabaseService, private route: ActivatedRoute, private router: Router, public ses: SessionStorage,public matDialog: MatDialog,  public dialog: DialogComponent) { this.date1 = new Date();}
    
    ngOnInit() {

        this.uploadUrl = this.db.uploadUrl;
        this.route.params.subscribe(params => {
            console.log(params)

            if(params['Masons']=='Masons'){
                this.navPass='Masons'
                this.userType=2;

            }
            else if(params['Masons']=='Fabricator'){
                this.navPass='Fabricator';
                this.userType=3;

                

            }
            else if(params['Masons']=='Carpenter'){
                this.navPass='Carpenter';
                this.userType=1;


            }
            this.karigar_id = params['karigar_id'];
            this.docId = params['karigar_id'];
            this.back_doc_id = params['karigar_id'];
          

            
            if (this.karigar_id)
            {
                this.getKarigarDetails();
            }
            this.getStateList();
            this.AssignSaleUser();
            this.AssignDistributor();
            this.get_karigar_type();
            this.karigarform.country_id = 99;
        });
    }
    
    openDatePicker(picker : MatDatepicker<Date>)
    {
        picker.open();
    }
    
    getData:any = {};
    getKarigarDetails() {
        this.loading_list = true;
        this.db.post_rqst(  {'karigar_id':this.karigar_id}, 'karigar/karigarDetail')
        .subscribe(d => {
            this.loading_list = false;
            console.log(d);
            this.karigarform = d.karigar;
            if(this.karigarform.doa == '0000-00-00'){
                this.karigarform.doa = '';
            }
            if(this.karigarform.dob == '0000-00-00'){
                this.karigarform.dob = '';
            }
            console.log( this.karigarform);
            this.getDistrictList(1);
            this.getCityList(1);
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
    
    getStateList(){
        this.loading_list = true;
        this.db.get_rqst('', 'app_master/getStates')
        .subscribe(d => {  
            this.loading_list = false;  
            this.states = d.states;
        });
    }
    getDistrictList(val){
        this.loading_list = true;
        let st_name;
        if(val == 1)
        {
            st_name = this.karigarform.state;
        }
        this.db.post_rqst({'state_name':st_name}, 'app_master/getDistrict')
        .subscribe(d => {  
            this.loading_list = false;
            this.districts = d.districts;  
        });
    }
    getCityList(val){   
        this.loading_list = true;
        let dist_name;
        if(val == 1)
        {
            dist_name = this.karigarform.district;
        }
        this.db.post_rqst({'district_name':dist_name}, 'app_master/getCity')
        .subscribe(d => {  
            this.loading_list = false;
            this.cities = d.cities;
            this.pincode = d.pins;
        });
    }
    pincode:any = [];
    getPincodeList(val){   
        this.loading_list = true;
        let pincode_name;
        if(val == 1)
        {
            pincode_name = this.karigarform.pincode;
        }
        this.db.post_rqst({'city_name':pincode_name}, 'app_master/getPincodes')
        .subscribe(d => {  
            this.loading_list = false;
            this.pincode = d.pins;
        });
    }
    numeric_Number(event: any) {
        const pattern = /[0-9\+\-\ ]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
    }
    savekarigarform(form:any)
    {
        if(this.karigarform.document_type!='' && !this.karigarform.document_no && !this.karigarform.document_image){
            this.dialog.warning(this.karigarform.document_type+' No. & Image Is Required')
            return;

        }
        else if(this.karigarform.document_no!='' && !this.karigarform.document_image){
            this.dialog.warning(this.karigarform.document_type+' Image Is Required')
            return;

        }
        else if(this.karigarform.document_image!='' && !this.karigarform.document_no){
            this.dialog.warning(this.karigarform.document_type+' No. Is Required')
            return;
        }

        console.log(this.navPass)
        this.savingData = true;
        this.loading_list = true;
        this.karigarform.dob = this.karigarform.dob  ? this.db.pickerFormat(this.karigarform.dob) : '';
        this.karigarform.created_by = this.db.datauser.id;
        if(this.karigar_id)
        {
            this.karigarform.karigar_edit_id = this.karigar_id;
        }
        else
        {
            console.log(this.userType)
            this.karigarform.user_type = this.userType;
        }
        this.db.insert_rqst( { 'karigar' : this.karigarform }, 'karigar/addKarigar')
        .subscribe( d => {
            this.savingData = false;
            this.loading_list = false;
            console.log( d );
            if(d['status'] == 'EXIST' ){
                this.dialog.error( ' Mobile No. already exists');
                return;
            }
            this.router.navigate(['karigar-list/'+this.navPass]);
            this.dialog.success(this.navPass+' has been successfully added');
        });
    }
    sales_users:any=[];
    AssignSaleUser()
    {
        this.loading_list = true;
        this.db.get_rqst('','karigar/sales_users')
        .subscribe(d => {
            this.loading_list = false;
            this.sales_users = d.sales_users;
        });
    }
    
    dr_list:any=[];
    AssignDistributor()
    {
        this.loading_list = true;
        this.db.get_rqst('', 'karigar/get_distributor')
        .subscribe(d => {
            console.log(d);
            this.loading_list = false;
            this.dr_list = d.dr_list;
        });
    }
    
    documentChange()
    {
        this.karigarform.document_no=' ';
    }
  
    onUploadChange(evt: any) {
        const file = evt.target.files[0];
        console.log(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = this.handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file);
            this.docId = '';
        }
    }
    handleReaderLoaded(e) {
        this.karigarform.document_image = 'data:image/png;base64,' + btoa(e.target.result) ;
        console.log( this.karigarform.document_image );
    }


    selectSales()
    {
        this.karigarform.sales_mobile = this.sales_users.filter( x => x.id === this.karigarform.sales_user )[0].phone;
    }
    
    selectDistributor()
    {
        this.karigarform.dis_mobile = this.dr_list.filter( x => x.id === this.karigarform.dis_id )[0].phone;
    }

    onUploadBack(evt: any) {
        const file = evt.target.files[0];
        if (file) {
            const reader = new FileReader();
            this.back_doc_id=''
            reader.onload = this.handleReaderBack.bind(this);
            reader.readAsBinaryString(file);
        }
    }
    handleReaderBack(e) {
        this.karigarform.document_image_back = 'data:image/png;base64,' + btoa(e.target.result) ;
    }


    getaddress(pincode) {
        if (this.karigarform.pincode.length == '6') {
            this.db.post_rqst({ 'pincode': pincode }, 'app_karigar/getAddress')
                .subscribe((result) => {
                    console.log(result);
                    var address = result.address;
                  
                    if (address != null) {
                        this.karigarform.state = address.state_name;
                        this.karigarform.district = address.district_name;
                        this.karigarform.city = address.city;
                        console.log(this.karigarform);
                        this.getDistrictList(1);
                        // this.getCityList(1);
                    }
                    else{
                     this.dialog.error('Enter Valid Pincode');

                    }
              
                });
        }
    
    }

}
