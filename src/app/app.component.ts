import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'crafty-rachel';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme service initialization is handled by its constructor
    // This ensures the theme is properly set on app startup
  }
}
