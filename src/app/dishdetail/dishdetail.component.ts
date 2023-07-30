import { Component, OnInit, Input, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { commentFeedback, ContactType } from '../shared/feedback';
import { flyInOut, expand } from '../animations/app.animations';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    flyInOut(),
    expand()
  ]
})

export class DishdetailComponent implements OnInit {

  dishIds: string[];
  prev: string;
  next: string;

  dishcopy: Dish;

  dishErrMess: string;

  dish: Dish;

  visibility = 'shown';

  feedbackForm!: FormGroup;
  feedback!: commentFeedback;
  contactType = ContactType;

  formErrors: any = {
    'author': '',
    'comment': ''
  };

  validationMessages: any = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.',
      'maxlength': 'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required': 'Comment is required.',
    },
  };


  constructor(private dishService: DishService, private route: ActivatedRoute, private location: Location, private fb: FormBuilder, @Inject('baseURL') public baseURL) {
    this.createForm();
  }


  createForm(): void {
    this.feedbackForm = new FormGroup({
      author: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]),
      rating: new FormControl('5'),
      comment: new FormControl('', [Validators.required])
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  ngOnInit(): void {
    let id = this.route.snapshot.params['id']; 
    this.dishService.getDish(id).subscribe(dish => this.dish = dish);
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(params['id']); } ))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id);this.visibility = 'shown'; }, dishErrmess => this.dishErrMess = <any>dishErrmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

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
    const jsDate = new Date();
    let isoDateText = jsDate.toISOString();
    this.dish.comments.push({
      'author': this.feedbackForm.value.author,
      'rating': this.feedbackForm.value.rating,
      'comment': this.feedbackForm.value.comment,
      'date': isoDateText,
    });
    this.dishcopy = this.dish;
    this.dishService.putDish(this.dishcopy)
    .subscribe(dish => {
      this.dish = dish; this.dishcopy = dish;
    },
    errmess => { this.dishErrMess = <any>errmess; });
    this.feedbackForm.reset({
      author: '',
      rating: '5',
      message: ''
    });

  }

}
