# 🎨 NexaUIKit - The Complete UI Manipulation Kit

NexaUIKit adalah library JavaScript modern untuk manipulasi DOM yang powerful dan mudah digunakan. Terinspirasi dari jQuery tapi dengan syntax ES6+ dan fitur yang lebih lengkap. Complete toolkit untuk semua kebutuhan User Interface manipulation.

## 📦 Installation & Usage

```javascript
// Import NexaUIKit
import { NexaUIKit } from "./NexaUIKit.js";

// Create your UI controller
const UI = new NexaUIKit();

// Basic usage - Build amazing interfaces
UI.id("myElement").innerHTML = "Hello World";
```

## 🎯 Table of Contents

- [Element Selection](#-element-selection)
- [Content Manipulation](#-content-manipulation)
- [Style & Classes](#-style--classes)
- [Event Handling](#-event-handling)
- [Attributes & Data](#-attributes--data)
- [Form Handling](#-form-handling)
- [Animations](#-animations)
- [Dimensions & Position](#-dimensions--position)
- [DOM Traversal](#-dom-traversal)
- [Element Inspection](#-element-inspection)
- [Utilities](#-utilities)

---

## 🎯 Element Selection

### Basic Selectors

```javascript
// By ID
UI.id("elementId");

// By Class (first element)
UI.class("className");

// By Class (all elements)
UI.classAll("className");

// By CSS Selector (first element)
UI.selector("#myId .myClass");

// By CSS Selector (all elements)
UI.selectorAll("div.container p");
```

---

## 📝 Content Manipulation

### Basic Content

```javascript
// Get/Set innerHTML
UI.id("element").innerHTML = "<strong>Bold text</strong>";
const content = UI.id("element").innerHTML;

// Get/Set textContent
UI.id("element").textContent = "Plain text only";
const text = UI.id("element").textContent;

// Clear content
UI.id("element").clear();
```

### Advanced Content Manipulation

```javascript
// Append content
UI.id("element").append("<p>New paragraph</p>");

// Prepend content
UI.id("element").prepend("<h2>Title</h2>");

// Insert before element
UI.id("element").before("<div>Before element</div>");

// Insert after element
UI.id("element").after("<div>After element</div>");

// Replace element
UI.id("element").replaceWith("<span>New element</span>");

// Wrap element
UI.id("element").wrap('<div class="wrapper"></div>');

// Unwrap element (remove parent)
UI.id("element").unwrap();

// Empty element (remove children)
UI.id("element").empty();
```

---

## 🎨 Style & Classes

### CSS Classes

```javascript
// Add class
UI.id("element").addClass("newClass");

// Remove class
UI.id("element").removeClass("oldClass");

// Toggle class
UI.id("element").toggleClass("activeClass");

// Check if has class
const hasClass = UI.id("element").hasClass("someClass");

// Replace class
UI.id("element").replaceClass("oldClass", "newClass");

// Set multiple classes
UI.id("element").setClasses("class1 class2 class3");

// Get all classes
const classes = UI.id("element").getClasses();
```

### CSS Styles

```javascript
// Set single style
UI.id("element").setStyle("color", "red");

// Set multiple styles (chaining)
UI.id("element")
  .setStyle("width", "200px")
  .setStyle("height", "100px")
  .setStyle("background", "blue");

// Get computed style
const color = UI.id("element").css("color");
const allStyles = UI.id("element").css();
```

### Visibility

```javascript
// Show element
UI.id("element").show();

// Hide element
UI.id("element").hide();

// Check visibility
const isVisible = UI.id("element").isVisible();
const inViewport = UI.id("element").isInViewport();
```

---

## ⚡ Event Handling

### Basic Events

```javascript
// Click events
UI.id("button").on("click", function (e) {
  console.log("Button clicked!");
});

// Double click
UI.id("element").on("dblclick", function (e) {
  console.log("Double clicked!");
});

// Right click (context menu)
UI.id("element").on("contextmenu", function (e) {
  e.preventDefault(); // Prevent default context menu
  console.log("Right clicked!");
});
```

### Mouse Events

```javascript
// Mouse hover
UI.id("element")
  .on("mouseenter", () => console.log("Mouse entered"))
  .on("mouseleave", () => console.log("Mouse left"))
  .on("mouseover", () => console.log("Mouse over"))
  .on("mouseout", () => console.log("Mouse out"));

// Mouse movement
UI.id("element").on("mousemove", function (e) {
  console.log(`Mouse position: ${e.clientX}, ${e.clientY}`);
});

// Mouse buttons
UI.id("element")
  .on("mousedown", () => console.log("Mouse pressed"))
  .on("mouseup", () => console.log("Mouse released"));
```

### Keyboard Events

```javascript
// Key events
UI.id("input").on("keydown", function (e) {
  console.log("Key pressed:", e.key);
  if (e.key === "Enter") {
    console.log("Enter was pressed!");
  }
});

UI.id("input").on("keyup", function (e) {
  console.log("Key released:", e.key);
  console.log("Current value:", e.target.value);
});

UI.id("input").on("keypress", function (e) {
  console.log("Key character:", e.key);
});

// Special key combinations
UI.id("input").on("keydown", function (e) {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    console.log("Ctrl+S pressed - Save action");
  }

  if (e.altKey && e.key === "Enter") {
    console.log("Alt+Enter pressed");
  }

  if (e.shiftKey && e.key === "Tab") {
    console.log("Shift+Tab pressed");
  }
});
```

### Form Events

```javascript
// Input events
UI.id("input").on("input", function (e) {
  console.log("Input value changed:", e.target.value);
});

// Change event (triggered when value changes and element loses focus)
UI.id("select").on("change", function (e) {
  console.log("Selection changed:", e.target.value);
});

UI.id("checkbox").on("change", function (e) {
  console.log("Checkbox state:", e.target.checked);
});

// Focus events
UI.id("input")
  .on("focus", () => console.log("Input focused"))
  .on("blur", () => console.log("Input lost focus"))
  .on("focusin", () => console.log("Focus in (bubbles)"))
  .on("focusout", () => console.log("Focus out (bubbles)"));

// Form submission
UI.id("form").on("submit", function (e) {
  e.preventDefault();
  const formData = UI.id("form").serialize();
  console.log("Form submitted:", formData);
});

// Form reset
UI.id("form").on("reset", function (e) {
  console.log("Form reset");
});
```

### Window & Document Events

```javascript
// Page load events
UI.selector("document").on("DOMContentLoaded", function () {
  console.log("DOM fully loaded");
});

UI.selector("window").on("load", function () {
  console.log("Page fully loaded");
});

// Window resize
UI.selector("window").on("resize", function () {
  console.log("Window resized");
});

// Scroll events
UI.selector("window").on("scroll", function () {
  console.log("Page scrolled");
});

UI.id("container").on("scroll", function () {
  console.log("Container scrolled");
});
```

### Touch Events (Mobile)

```javascript
// Touch events for mobile devices
UI.id("element")
  .on("touchstart", (e) => console.log("Touch started"))
  .on("touchmove", (e) => console.log("Touch moved"))
  .on("touchend", (e) => console.log("Touch ended"))
  .on("touchcancel", (e) => console.log("Touch cancelled"));

// Gesture events
UI.id("element")
  .on("gesturestart", (e) => console.log("Gesture started"))
  .on("gesturechange", (e) => console.log("Gesture changed"))
  .on("gestureend", (e) => console.log("Gesture ended"));
```

### Drag & Drop Events

```javascript
// Drag events
UI.id("draggable").on("dragstart", function (e) {
  e.dataTransfer.setData("text/plain", "Hello World");
  console.log("Drag started");
});

UI.id("draggable")
  .on("drag", () => console.log("Dragging"))
  .on("dragend", () => console.log("Drag ended"));

// Drop zone events
UI.id("dropzone")
  .on("dragover", function (e) {
    e.preventDefault(); // Allow drop
  })
  .on("dragenter", () => console.log("Drag entered drop zone"))
  .on("dragleave", () => console.log("Drag left drop zone"))
  .on("drop", function (e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    console.log("Dropped:", data);
  });
```

### Animation Events

```javascript
// CSS Animation events
UI.id("animated-element")
  .on("animationstart", () => console.log("Animation started"))
  .on("animationiteration", () => console.log("Animation iteration"))
  .on("animationend", () => console.log("Animation ended"));

// CSS Transition events
UI.id("transitioning-element")
  .on("transitionstart", () => console.log("Transition started"))
  .on("transitionrun", () => console.log("Transition running"))
  .on("transitionend", () => console.log("Transition ended"))
  .on("transitioncancel", () => console.log("Transition cancelled"));
```

### Media Events

```javascript
// Video/Audio events
UI.id("video")
  .on("play", () => console.log("Video started playing"))
  .on("pause", () => console.log("Video paused"))
  .on("ended", () => console.log("Video ended"))
  .on("loadstart", () => console.log("Started loading"))
  .on("loadeddata", () => console.log("Data loaded"))
  .on("canplay", () => console.log("Can start playing"))
  .on("timeupdate", (e) => console.log("Current time:", e.target.currentTime));
```

### Custom Events

```javascript
// Trigger custom events
UI.id("element").trigger("customEvent", {
  detail: { message: "Hello from custom event!" },
});

// Listen to custom events
UI.id("element").on("customEvent", function (e) {
  console.log("Custom event received:", e.detail);
});

// Real-world custom event example
function notifyUser(message) {
  UI.id("notification-area").trigger("userNotification", {
    detail: { message, timestamp: Date.now() },
  });
}

UI.id("notification-area").on("userNotification", function (e) {
  const { message, timestamp } = e.detail;
  this.innerHTML = `<div class="notification">${message} at ${new Date(
    timestamp
  )}</div>`;
});
```

### Event Delegation & Multiple Events

```javascript
// Multiple events on same element
UI.id("input")
  .on("focus", () => console.log("Focused"))
  .on("blur", () => console.log("Blurred"))
  .on("keyup", (e) => console.log("Key:", e.key))
  .on("change", (e) => console.log("Changed:", e.target.value));

// Event delegation (for dynamically added elements)
UI.id("container").on("click", function (e) {
  if (e.target.matches(".dynamic-button")) {
    console.log("Dynamic button clicked!");
  }
});

// Real-time validation example
UI.id("email").on("keyup", function (e) {
  const email = e.target.value;
  const isValid = email.includes("@") && email.includes(".");

  UI.id("email")
    .removeClass("valid invalid")
    .addClass(isValid ? "valid" : "invalid");
});
```

### Practical Event Examples

```javascript
// Auto-save functionality
let saveTimeout;
UI.id("editor").on("input", function (e) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    console.log("Auto-saving content...");
    // Save logic here
  }, 2000); // Save after 2 seconds of no typing
});

// Search as you type
UI.id("search").on("keyup", function (e) {
  const query = e.target.value;
  if (query.length >= 3) {
    console.log("Searching for:", query);
    // Search logic here
  }
});

// Confirm before leaving page
UI.selector("window").on("beforeunload", function (e) {
  const hasUnsavedChanges = checkForUnsavedChanges();
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
  }
});

// Infinite scroll
UI.selector("window").on("scroll", function () {
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    console.log("Load more content...");
    // Load more content logic
  }
});
```

---

## 📋 Attributes & Data

### HTML Attributes

```javascript
// Set attribute
UI.id("element").attr("title", "Tooltip text");

// Get attribute
const title = UI.id("element").attr("title");

// Remove attribute
UI.id("element").removeAttr("old-attr");

// Check if has attribute
const hasAttr = UI.id("element").hasAttr("data-id");

// Get all attributes
const allAttrs = UI.id("element").getAllAttrs();

// Get attribute names
const attrNames = UI.id("element").getAttrNames();
```

### Data Attributes

```javascript
// Set data attribute
UI.id("element").data("userId", "12345");

// Get data attribute
const userId = UI.id("element").data("userId");

// Get all data attributes
const allData = UI.id("element").getAllData();
```

---

## 📝 Form Handling

### Form Values

```javascript
// Set/Get input value
UI.id("input").val("New value");
const value = UI.id("input").val();

// Set/Get placeholder
UI.id("input").placeholder("Enter your name");
const placeholder = UI.id("input").placeholder();

// Checkbox/Radio
UI.id("checkbox").checked(true);
const isChecked = UI.id("checkbox").checked();

// Disable/Enable
UI.id("input").disabled(true);
const isDisabled = UI.id("input").disabled();
```

### Form Operations

```javascript
// Submit form
UI.id("form").submit();

// Reset form
UI.id("form").reset();

// Serialize form data
const formData = UI.id("form").serialize();
// Returns: { name: "John", email: "john@example.com" }

// Focus/Blur
UI.id("input").focus();
UI.id("input").blur();

// Select text
UI.id("input").select();
```

---

## ✨ Animations

### Fade Effects

```javascript
// Fade in (default: 300ms)
UI.id("element").fadeIn();

// Fade in with custom duration
UI.id("element").fadeIn(500);

// Fade out
UI.id("element").fadeOut(300);

// Fade sequence
UI.id("element")
  .fadeOut()
  .then(() => {
    // Change content
    UI.id("element").innerHTML = "New content";
    UI.id("element").fadeIn();
  });
```

### Slide Effects

```javascript
// Slide up
UI.id("element").slideUp();

// Slide down
UI.id("element").slideDown();

// Slide up with custom duration
UI.id("element").slideUp(500);
```

---

## 📏 Dimensions & Position

### Dimensions

```javascript
// Get/Set width
UI.id("element").width(200); // Set to 200px
const width = UI.id("element").width(); // Get width

// Get/Set height
UI.id("element").height("50%"); // Set to 50%
const height = UI.id("element").height(); // Get height

// Get position information
const pos = UI.id("element").position();
// Returns: { top, left, right, bottom, width, height }
```

### Scrolling

```javascript
// Scroll element into view
UI.id("element").scrollIntoView();

// Scroll with options
UI.id("element").scrollIntoView({
  behavior: "smooth",
  block: "center",
});

// Set scroll position
UI.id("element").scrollTo(100, 50); // top: 100, left: 50
```

---

## 🌳 DOM Traversal

### Parent & Children

```javascript
// Get parent element
const parent = UI.id("element").parent();

// Get all children
const children = UI.id("element").children();

// Find child by selector
const child = UI.id("element").find(".child-class");

// Find all children by selector
const allChildren = UI.id("element").findAll("p");
```

### Siblings

```javascript
// Get next sibling
const next = UI.id("element").next();

// Get next sibling with selector
const nextDiv = UI.id("element").next("div");

// Get previous sibling
const prev = UI.id("element").prev();

// Get all next siblings
const allNext = UI.id("element").nextAll();

// Get all previous siblings
const allPrev = UI.id("element").prevAll();

// Get all siblings
const siblings = UI.id("element").siblings();
```

---

## 🔍 Element Inspection

### Basic Inspection

```javascript
// Get complete element properties
const props = UI.id("element").getProperties();

// Get element structure tree
const structure = UI.id("element").getStructure();

// Check element type
const tagName = UI.id("element").tagName();

// Check if element matches selector
const matches = UI.id("element").is(".my-class");

// Check if element has content
const hasContent = UI.id("element").hasContent();
```

### Advanced Inspection

```javascript
// Get full inspection as JSON
const inspection = UI.id("element").inspect();

// Debug element to console
UI.id("element").debug();

// Get filtered attributes
const dataAttrs = UI.id("element").getAttrs("data-");
const customAttrs = UI.id("element").getAttrs((name, value) => {
  return name.startsWith("custom-");
});
```

---

## 🛠️ Utilities

### Element Operations

```javascript
// Clone element
const cloned = UI.id("element").clone();

// Remove element
UI.id("element").remove();

// Detach element (remove but keep in memory)
UI.id("element").detach();

// Get outer HTML
const outerHTML = UI.id("element").outerHTML();

// Set outer HTML
UI.id("element").outerHTML("<div>New element</div>");
```

### Validation

```javascript
// Check if element exists
if (UI.id("element").element) {
  // Element exists
}

// Check multiple attributes
const hasRequired = UI.id("input").hasAttrs(["name", "id", "data-required"]);

// Validate element state
const element = UI.id("button");
if (element.isVisible() && !element.disabled()) {
  element.trigger("click");
}
```

---

## 🔗 Method Chaining

NexaUIKit mendukung method chaining untuk operasi yang lebih efisien:

```javascript
UI.id("element")
  .addClass("active")
  .setStyle("color", "blue")
  .attr("title", "Active element")
  .fadeIn(300)
  .on("click", function () {
    console.log("Element clicked!");
  });
```

## 🎯 Practical Examples

### Form Validation

```javascript
const form = UI.id("loginForm");
const email = UI.id("email");
const password = UI.id("password");

form.on("submit", function (e) {
  e.preventDefault();

  // Validate email
  if (!email.val().includes("@")) {
    email.addClass("error").focus();
    return;
  }

  // Validate password
  if (password.val().length < 6) {
    password.addClass("error").focus();
    return;
  }

  // Submit form
  const formData = form.serialize();
  console.log("Submitting:", formData);
});
```

### Dynamic Content Loading

```javascript
function loadContent(url) {
  const container = UI.id("content");

  // Show loading
  container.fadeOut(200).then(() => {
    container.innerHTML = '<div class="loading">Loading...</div>';
    container.fadeIn(200);

    // Simulate API call
    setTimeout(() => {
      container.fadeOut(200).then(() => {
        container.innerHTML = "<h2>New Content Loaded!</h2>";
        container.fadeIn(300);
      });
    }, 1000);
  });
}
```

### Interactive Element Inspection

```javascript
// Inspect any element on click
UI.selectorAll("*").forEach((element) => {
  element.on("click", function (e) {
    if (e.ctrlKey) {
      // Ctrl + Click
      e.preventDefault();
      e.stopPropagation();

      console.log("Element Inspection:");
      element.debug();

      // Highlight element
      element.addClass("highlighted");
      setTimeout(() => {
        element.removeClass("highlighted");
      }, 2000);
    }
  });
});
```

## 🚨 Error Handling

NexaUIKit memiliki built-in error handling yang aman:

```javascript
// Jika element tidak ditemukan, akan return dummy element
UI.id("nonExistentElement").addClass("test"); // Tidak akan error
// Console warning: "Element dengan ID 'nonExistentElement' tidak ditemukan"

// Dummy element methods akan return safe values
const width = UI.id("nonExistent").width(); // Returns: 0
const attrs = UI.id("nonExistent").getAllAttrs(); // Returns: {}
```

## 🎉 Best Practices

1. **Always use method chaining** untuk operasi multiple
2. **Check element existence** sebelum operasi critical
3. **Use semantic method names** untuk code yang readable
4. **Leverage inspection methods** untuk debugging
5. **Combine with modern JavaScript** features (async/await, destructuring, etc.)

---

## 📚 Demo Files

- `application.html` - Basic usage examples
- `NexaUIKit_examples.html` - Comprehensive feature showcase
- `element_inspection_demo.html` - Advanced element analysis tools

## 🎯 Browser Support

- Modern browsers dengan ES6+ support
- Chrome 60+, Firefox 55+, Safari 10.1+, Edge 79+

---

**NexaUIKit** - The Complete UI Manipulation Kit! 🎨
_Build. Interact. Animate. - All in One Kit!_ 🚀
