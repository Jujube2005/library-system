import { Component, inject } from '@angular/core'
import { NgFor } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth.service'

interface HomeSlide {
  image: string
  context: string
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  currentIndex = 0
  isAnimating = false
  isTextVisible = true
  bgOffset = 0
  isDarkMode = false
  readonly year = new Date().getFullYear()

  private readonly router = inject(Router)
  private readonly auth = inject(AuthService)

  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark'
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
  }

  slides: HomeSlide[] = [
    { image: '/book1.jpg', context: 'Manuscripts' },
    { image: '/book2.jpg', context: 'Research' },
    { image: '/book3.jpg', context: 'Archives' },
    { image: '/book4.jpg', context: 'Literature' },
    { image: '/book5.jpg', context: 'Science' },
    { image: '/book6.jpg', context: 'Art & Design' },
    { image: '/book7.jpg', context: 'History' },
    { image: '/book8jpg.jpg', context: 'Innovation' },
    { image: '/book9.jpg', context: 'Education' }
  ]

  async handleResourcesClick(event: MouseEvent) {
    event.preventDefault()
    await this.router.navigateByUrl('/books')
  }

  // Animation constants
  private readonly transitionDuration = 1200

  nextSlide() {
    if (this.isAnimating) return
    this.startTransition()
    this.currentIndex = (this.currentIndex + 1) % this.slides.length
    this.bgOffset -= 5 // Parallax movement
    this.endTransition()
  }

  prevSlide() {
    if (this.isAnimating) return
    this.startTransition()
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length
    this.bgOffset += 5 // Parallax movement
    this.endTransition()
  }

  private startTransition() {
    this.isAnimating = true;
  }

  private endTransition() {
    setTimeout(() => {
      this.isAnimating = false;
    }, this.transitionDuration);
  }

  onScroll(event: WheelEvent) {
    if (this.isAnimating) return
    if (Math.abs(event.deltaY) < 15) return

    if (event.deltaY > 0) this.nextSlide()
    else this.prevSlide()
  }

  getTrackTransform() {
    // 350px slide width + 60px gap = 410px
    return `translateX(calc(50% - ${(this.currentIndex * 410) + 175}px))`
  }
}
