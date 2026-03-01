import { Component, Input, Output, EventEmitter } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgIf } from '@angular/common'

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, NgIf],
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
    @Input() isStaff = false
    @Output() logoutNeeded = new EventEmitter<void>()

    logout() {
        this.logoutNeeded.emit()
    }
}
