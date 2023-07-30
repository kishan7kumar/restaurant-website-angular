import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LoginComponent>) { }

  user = {
    username: "",
    password: "",
    remember: false,
  }

  ngOnInit(): void {
  }

  onSubmit(){
    console.log(this.user);
    this.dialogRef.close();
    
  }

}
