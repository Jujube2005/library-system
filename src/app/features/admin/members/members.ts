import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [FormsModule, NgFor, NgClass, TitleCasePipe],
  templateUrl: './members.html'
})
export class MembersComponent {
  roleFilter = 'all';

  members = [
    { id: 1, name: 'Student 001', email: 'student001@example.com', role: 'student' },
    { id: 2, name: 'Instructor 001', email: 'instructor001@example.com', role: 'instructor' },
    { id: 3, name: 'Librarian', email: 'staff@example.com', role: 'staff' }
  ];
}
