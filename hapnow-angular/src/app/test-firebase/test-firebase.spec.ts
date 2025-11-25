import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFirebase } from './test-firebase';

describe('TestFirebase', () => {
  let component: TestFirebase;
  let fixture: ComponentFixture<TestFirebase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFirebase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestFirebase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
