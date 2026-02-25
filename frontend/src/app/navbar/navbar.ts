import { Component, inject, HostListener, ChangeDetectorRef, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgIf } from '@angular/common'
import { AuthService } from '../core/auth.service'
import { Profile } from '../models/profile.model'

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, NgIf],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent {
    @Input() profile: Profile | null = null
    @Input() isDarkMode = false
    @Output() toggleTheme = new EventEmitter<void>()
    @Output() logoutNeeded = new EventEmitter<void>()

    showProfileMenu = false
    private cdr = inject(ChangeDetectorRef)

    toggleDarkMode() {
        this.toggleTheme.emit()
    }

    async logout() {
        this.logoutNeeded.emit()
    }

    toggleProfileMenu(event: Event) {
        event.stopPropagation()
        this.showProfileMenu = !this.showProfileMenu
    }

    @HostListener('document:click')
    closeProfileMenu() {
        this.showProfileMenu = false
    }
}
