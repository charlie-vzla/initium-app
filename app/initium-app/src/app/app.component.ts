import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface Customer {
  id: number;
  name: string;
  queue?: string;
  expire_at?: string;
}

export interface Queues {
  queueA: Customer[];
  queueB: Customer[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   *
   */
  private socket: Socket;
  /**
   * Indentifies client, also helps to know how many are inside.
   *
   * @private
   * @property {id}
   * @type {number}
   */
  private id: number;

  /**
   * Form control for the id field
   *
   * @property {id}
   * @type {FormControl}
   */
  idFormControl;
  /**
   * Form control for the name field
   *
   * @property {nameFormControl}
   * @type {FormControl}
   */
  nameFormControl;

  /**
   * Sets if an error is present in my formControl
   *
   * @property {matcher}
   * @type {MyErrorStateMatcher}
   */
  matcher = new MyErrorStateMatcher();

  /**
   * List of custoemr in the queue of 2 mins
   *
   * @property {queueA}
   * @type {Customer[]}
   */
  queueA: Customer[] = [];
  /**
   * List of customer in the queue of 3 mins
   *
   * @property {queueB}
   * @type {Customer[]}
   */
  queueB: Customer[] = [];

  constructor(private http: HttpClient) {
    this.id = 1;

    this.idFormControl = new FormControl(this.id, [Validators.required]);
    this.nameFormControl = new FormControl('', [Validators.required]);

    this.matcher = new MyErrorStateMatcher();

    this.socket = io("http://localhost:9021");

    this.socket.on("customer-queues", (queues: Queues) => {
      this.queueA = queues.queueA;
      this.queueB = queues.queueB;

      if (!this.queueA.length && !this.queueB.length) {
        this.id = 1;
      } else {
        let lastIndexA: number = 0;
        if (this.queueA.length) {
          lastIndexA = this.queueA[this.queueA.length - 1].id;
        }

        let lastIndexB: number = 0;
        if (this.queueB.length) {
          lastIndexB = this.queueB[this.queueB.length - 1].id;
        }

        this.id = lastIndexA > lastIndexB ? lastIndexA : lastIndexB;
        ++this.id
      }

      this.idFormControl.setValue(this.id);
    });

    this.socket.on("serve-customer", (customer: Customer) => {
      let queue;

      if (customer.queue === '2') {
        [, ...queue] = this.queueA;
        this.queueA = queue;
      } else {
        [, ...queue] = this.queueB;
        this.queueB = queue;
      }

      if (!this.queueA.length && !this.queueB.length) {
        this.id = 1;
        this.idFormControl.setValue(this.id);
      }
    });
  }

  /**
   * Makes the call to the service
   * to check if customer can be added.
   *
   * @returns {void}.
   */
  addToQueue(): void {
    if (!this.idFormControl.value || !this.nameFormControl.value) return;

    const body: Customer = { id: this.idFormControl.value, name: this.nameFormControl.value };
    this.http.post<{queue: string, customer: Customer}>('http://localhost:9021/queues/customer', body).subscribe(
      (customer) => {
        if (customer.queue === '2') {
          this.queueA.push(customer.customer);
        } else {
          this.queueB.push(customer.customer);
        }

        ++this.id;
        this.idFormControl.setValue(this.id);
    }, (error) => console.log(error));
  }
}
