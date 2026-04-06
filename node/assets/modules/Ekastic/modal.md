# Nexa Modal CSS Documentation

## Overview
The Nexa Modal CSS provides a modern, responsive modal system with smooth animations, form validation, and anti-flicker optimizations. Built with performance in mind, it includes GitHub-inspired styling and comprehensive form controls.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Modal Structure](#modal-structure)
- [CSS Classes](#css-classes)
- [Button Styles](#button-styles)
- [Form Elements](#form-elements)
- [Animation & Performance](#animation--performance)
- [Responsive Design](#responsive-design)
- [Examples](#examples)

## Basic Usage

### HTML Structure
```html
<div class="nx-modal" id="myModal">
  <div class="nx-modal-dialog">
    <div class="nx-modal-content">
      <div class="nx-modal-header">
        <h5 class="nx-modal-title">Modal Title</h5>
        <button class="nx-modal-close" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="nx-modal-body">
        <!-- Modal content goes here -->
      </div>
      <div class="nx-modal-footer">
        <button type="button" class="btn btn-secondary">Cancel</button>
        <button type="button" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</div>
```

### JavaScript Integration
```javascript
// Show modal
document.getElementById('myModal').classList.add('show');

// Hide modal
document.getElementById('myModal').classList.remove('show');
```

## Modal Structure

### Core Components

#### `.nx-modal`
- **Purpose**: Main modal container with backdrop
- **Properties**: 
  - Fixed positioning covering full viewport
  - Backdrop blur effects
  - Z-index management (1000)
  - Smooth opacity transitions
- **States**: 
  - Default: `display: none`, `opacity: 0`
  - Active: `.show` class adds `opacity: 1`, `visibility: visible`

#### `.nx-modal-dialog`
- **Purpose**: Modal positioning and sizing container
- **Properties**:
  - Responsive width (max-width: 80%)
  - Centered positioning with auto margins
  - Transform-based animations
  - Performance optimizations with `will-change`

#### `.nx-modal-content`
- **Purpose**: Main content wrapper
- **Properties**:
  - Flexbox layout for header/body/footer
  - White background with subtle border
  - Rounded corners (12px)
  - Drop shadow for depth

## CSS Classes

### Modal Classes

| Class | Description | Usage |
|-------|-------------|-------|
| `.nx-modal` | Main modal container | Required wrapper |
| `.nx-modal.show` | Active modal state | Added via JavaScript |
| `.nx-modal-dialog` | Modal positioning container | Required wrapper |
| `.nx-modal-content` | Content wrapper | Required wrapper |
| `.nx-modal-header` | Header section | Optional |
| `.nx-modal-title` | Title styling | Optional |
| `.nx-modal-close` | Close button | Optional |
| `.nx-modal-body` | Main content area | Required |
| `.nx-modal-footer` | Footer section | Optional |

### Button Classes

| Class | Description | Color Scheme |
|-------|-------------|--------------|
| `.btn` | Base button styling | - |
| `.btn-primary` | Primary action button | Green (#2da44e) |
| `.btn-secondary` | Secondary action button | Gray (#f6f8fa) |
| `.btn-danger` | Destructive action button | Red (#cf222e) |
| `.btn-success` | Success action button | Green (#1a7f37) |
| `.btn.loading` | Loading state button | Spinner animation |

### Form Classes

| Class | Description | Usage |
|-------|-------------|-------|
| `.form-group` | Form field container | Wrapper for form elements |
| `.form-label` | Form field label | Label styling |
| `.form-control` | Input/textarea/select styling | Form inputs |
| `.form-text` | Help text | Additional field information |
| `.form-error` | Error message styling | Validation errors |
| `.form-check` | Checkbox container | Checkbox wrapper |
| `.form-check-input` | Checkbox input styling | Checkbox element |
| `.form-check-label` | Checkbox label | Checkbox label |

### Alert Classes

| Class | Description | Color |
|-------|-------------|-------|
| `.alert` | Base alert styling | - |
| `.alert-info` | Information alert | Blue |
| `.alert-success` | Success alert | Green |
| `.alert-warning` | Warning alert | Yellow |
| `.alert-danger` | Error alert | Red |

## Button Styles

### Standard Buttons
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-danger">Danger Button</button>
<button class="btn btn-success">Success Button</button>
```

### Loading State
```html
<button class="btn btn-primary loading">Processing...</button>
```

### Button Properties
- **Size**: 6px vertical, 16px horizontal padding
- **Typography**: 14px font size, 500 weight
- **Border**: 1px solid with rounded corners (6px)
- **Transitions**: 0.15s ease for all properties
- **States**: Hover, active, and focus states included

## Form Elements

### Basic Form Structure
```html
<div class="form-group">
  <label class="form-label" for="username">Username</label>
  <input type="text" class="form-control" id="username" required>
  <div class="form-text">Enter your username</div>
  <div class="form-error">This field is required</div>
</div>
```

### Form Validation States
```html
<!-- Success state -->
<input type="text" class="form-control success" value="Valid input">

<!-- Error state -->
<input type="text" class="form-control error" value="Invalid input">
```

### Checkbox Example
```html
<div class="form-check">
  <input type="checkbox" class="form-check-input" id="agree">
  <label class="form-check-label" for="agree">
    I agree to the terms and conditions
  </label>
</div>
```

### Form Features
- **Required Fields**: Automatic asterisk (*) indicator
- **Validation States**: Success/error styling with colored borders
- **Focus States**: Blue outline for accessibility
- **Placeholder Styling**: Consistent gray text
- **Custom Checkboxes**: Styled with green checkmarks

## Animation & Performance

### Animation System
- **Duration**: 0.15s for most transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth motion
- **Hardware Acceleration**: `transform: translateZ(0)` for GPU rendering
- **Anti-flicker**: Visibility and opacity coordination

### Performance Optimizations
- **Will-change**: Applied to animating elements
- **Contain**: Layout and style containment
- **Backface-visibility**: Hidden to prevent flicker
- **Transform**: 3D transforms for hardware acceleration

### Animation Sequence
1. **Modal Show**: Fade in backdrop + scale up dialog
2. **Modal Hide**: Reverse animation sequence
3. **Button Loading**: Spinner animation with text replacement

## Responsive Design

### Breakpoints
- **Desktop**: Default styling (max-width: 80%)
- **Mobile** (≤768px): Full-width with minimal margins

### Mobile Optimizations
```css
@media (max-width: 768px) {
  .nx-modal-dialog {
    margin: 1rem;
    max-width: none;
  }
  
  .nx-modal-header,
  .nx-modal-body,
  .nx-modal-footer {
    padding: 10px;
  }
}
```

## Examples

### Simple Modal
```html
<div class="nx-modal" id="simpleModal">
  <div class="nx-modal-dialog">
    <div class="nx-modal-content">
      <div class="nx-modal-header">
        <h5 class="nx-modal-title">Simple Modal</h5>
        <button class="nx-modal-close" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="nx-modal-body">
        <p>This is a simple modal example.</p>
      </div>
    </div>
  </div>
</div>
```

### Form Modal
```html
<div class="nx-modal" id="formModal">
  <div class="nx-modal-dialog">
    <div class="nx-modal-content">
      <div class="nx-modal-header">
        <h5 class="nx-modal-title">User Registration</h5>
        <button class="nx-modal-close" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="nx-modal-body">
        <form>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input type="email" class="form-control" id="email" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" class="form-control" id="password" required>
          </div>
          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="terms">
            <label class="form-check-label" for="terms">
              I agree to the terms of service
            </label>
          </div>
        </form>
      </div>
      <div class="nx-modal-footer">
        <button type="button" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
    </div>
  </div>
</div>
```

### Alert Modal
```html
<div class="nx-modal" id="alertModal">
  <div class="nx-modal-dialog">
    <div class="nx-modal-content">
      <div class="nx-modal-body">
        <div class="alert alert-warning">
          <strong>Warning!</strong> This action cannot be undone.
        </div>
        <p>Are you sure you want to delete this item?</p>
      </div>
      <div class="nx-modal-footer">
        <button type="button" class="btn btn-secondary">Cancel</button>
        <button type="button" class="btn btn-danger">Delete</button>
      </div>
    </div>
  </div>
</div>
```

## Advanced Features

### Custom Scrollbars
The modal includes custom scrollbar styling for:
- Modal body content
- Any scrollable elements within modals
- Both WebKit and Firefox browsers

### Font Integration
- **Primary Font**: Montserrat for all text elements
- **Icons**: Material Symbols Outlined for icons
- **Fallbacks**: Arial, sans-serif for compatibility

### Loading States
Buttons can show loading states with:
- Spinner animation
- Disabled interaction
- Loading text indicator
- Minimum width preservation

### Accessibility Features
- **Focus Management**: Proper focus states for all interactive elements
- **Keyboard Navigation**: Tab-friendly form controls
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: WCAG compliant color combinations

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **CSS Features**: Flexbox, CSS Grid, Custom Properties
- **Fallbacks**: Included for older browser compatibility

## Notes
- Requires Material Symbols Outlined font for icons
- Optimized for performance with hardware acceleration
- Anti-flicker techniques prevent visual glitches
- Responsive design works on all screen sizes
- Form validation requires JavaScript implementation
