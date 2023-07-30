import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { flyInOut, expand } from '../animations/app.animations';
import { FeedbackServiceService } from '../services/feedback-service.service';
import { Feedback, ContactType } from '../shared/feedback';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})

export class ContactComponent implements OnInit {

  feedbackForm!: FormGroup;
  feedback!: Feedback;
  contactType = ContactType;
  feedbackcopy: Feedback;
  showSubmittedFeedback: boolean = false;
  feedbackErrMess: string;
  showFeedbackForm: boolean = true;
  showLoading: boolean;

 

  formErrors:any = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages:any = {
    'firstname': {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format.'
    },
  };

  constructor(private fb: FormBuilder, private feedbackService: FeedbackServiceService ) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  createForm(): void {
    this.feedbackForm = new FormGroup({
      firstname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]),
      lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]),
      telnum: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      agree: new FormControl(false),
      contacttype: new FormControl('None'),
      message: new FormControl('')
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  get firstName() { return this.feedbackForm.get('firstname')!; }
  get lastName() { return this.feedbackForm.get('lastname')!; }
  get telNum() { return this.feedbackForm.get('telnum')!; }
  get Email() { return this.feedbackForm.get('email')!; }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedbackcopy = this.feedback;
    this.showLoading = true;
    this.showSubmittedFeedback = false;
    this.showFeedbackForm = false;
    this.feedbackService.submitFeedback(this.feedback)
    .subscribe(feedback => {
      this.showLoading = false;
      this.showSubmittedFeedback = true
      this.feedbackcopy = feedback;
      setTimeout(()=>{
        this.showSubmittedFeedback = false;
        this.showFeedbackForm = true;
      }, 5000);
    },
    errmess => { this.feedbackErrMess = <any>errmess; }, 
    );
    
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });

  }
}
