import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-test-firebase',
  imports: [],
  templateUrl: './test-firebase.html',
  styleUrl: './test-firebase.scss',
})
export class TestFirebase {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() {
    console.log('🔥 Firebase Auth:', this.auth);
    console.log('🔥 Firestore:', this.firestore);
    console.log('✅ Firebase conectado correctamente');
  }
}