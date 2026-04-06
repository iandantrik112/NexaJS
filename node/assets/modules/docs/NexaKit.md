# 🎨 NexaKit - The Complete UI Manipulation Kit

NexaKit adalah library JavaScript modern untuk manipulasi DOM yang powerful dan mudah digunakan. Terinspirasi dari jQuery tapi dengan syntax ES6+ dan fitur yang lebih lengkap. Complete toolkit untuk semua kebutuhan User Interface manipulation.

## 📦 Installation & Usage

```javascript
// Import NexaKit
import { NexaKit } from "./NexaKit.js";

// Create your UI controller
const UI = new NexaKit();

// Basic usage - Build amazing interfaces
NXUI.id("myElement").innerHTML = "Hello World";
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
NXUI.id("elementId");

// By Class (first element)
NXUI.class("className");

// By Class (all elements)
NXUI.classAll("className");

// By CSS Selector (first element)
NXUI.selector("#myId .myClass");

// By CSS Selector (all elements)
NXUI.selectorAll("div.container p");
```

---

## 📝 Content Manipulation

### Basic Content

```javascript
// Get/Set innerHTML
NXUI.id("element").innerHTML = "<strong>Bold text</strong>";
const content = NXUI.id("element").innerHTML;

// Get/Set textContent
NXUI.id("element").textContent = "Plain text only";
const text = NXUI.id("element").textContent;

// Clear content
NXUI.id("element").clear();
```

### Advanced Content Manipulation

```javascript
// Append content
NXUI.id("element").append("<p>New paragraph</p>");

// Prepend content
NXUI.id("element").prepend("<h2>Title</h2>");

// Insert before element
NXUI.id("element").before("<div>Before element</div>");

// Insert after element
NXUI.id("element").after("<div>After element</div>");

// Replace element
NXUI.id("element").replaceWith("<span>New element</span>");

// Wrap element
NXUI.id("element").wrap('<div class="wrapper"></div>');

// Unwrap element (remove parent)
NXUI.id("element").unwrap();

// Empty element (remove children)
NXUI.id("element").empty();
```

---

## 🎨 Style & Classes

### CSS Classes

```javascript
// Add class
NXUI.id("element").addClass("newClass");

// Remove class
NXUI.id("element").removeClass("oldClass");

// Toggle class
NXUI.id("element").toggleClass("activeClass");

// Check if has class
const hasClass = NXUI.id("element").hasClass("someClass");

// Replace class
NXUI.id("element").replaceClass("oldClass", "newClass");

// Set multiple classes
NXUI.id("element").setClasses("class1 class2 class3");

// Get all classes
const classes = NXUI.id("element").getClasses();
```

### CSS Styles

```javascript
// Set single style
NXUI.id("element").setStyle("color", "red");

// Set multiple styles (chaining)
NXUI.id("element")
  .setStyle("width", "200px")
  .setStyle("height", "100px")
  .setStyle("background", "blue");

// Get computed style
const color = NXUI.id("element").css("color");
const allStyles = NXUI.id("element").css();
```

### Visibility

```javascript
// Show element
NXUI.id("element").show();

// Hide element
NXUI.id("element").hide();

// Check visibility
const isVisible = NXUI.id("element").isVisible();
const inViewport = NXUI.id("element").isInViewport();
```

---

## ⚡ Event Handling

### Basic Events

```javascript
// Click events
NXUI.id("button").on("click", function (e) {
  console.log("Button clicked!");
});

// Double click
NXUI.id("element").on("dblclick", function (e) {
  console.log("Double clicked!");
});

// Right click (context menu)
NXUI.id("element").on("contextmenu", function (e) {
  e.preventDefault(); // Prevent default context menu
  console.log("Right clicked!");
});
```

### Mouse Events

```javascript
// Mouse hover
NXUI.id("element")
  .on("mouseenter", () => console.log("Mouse entered"))
  .on("mouseleave", () => console.log("Mouse left"))
  .on("mouseover", () => console.log("Mouse over"))
  .on("mouseout", () => console.log("Mouse out"));

// Mouse movement
NXUI.id("element").on("mousemove", function (e) {
  console.log(`Mouse position: ${e.clientX}, ${e.clientY}`);
});

// Mouse buttons
NXUI.id("element")
  .on("mousedown", () => console.log("Mouse pressed"))
  .on("mouseup", () => console.log("Mouse released"));
```

### Keyboard Events

```javascript
// Key events
NXUI.id("input").on("keydown", function (e) {
  console.log("Key pressed:", e.key);
  if (e.key === "Enter") {
    console.log("Enter was pressed!");
  }
});

NXUI.id("input").on("keyup", function (e) {
  console.log("Key released:", e.key);
  console.log("Current value:", e.target.value);
});

NXUI.id("input").on("keypress", function (e) {
  console.log("Key character:", e.key);
});

// Special key combinations
NXUI.id("input").on("keydown", function (e) {
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
NXUI.id("input").on("input", function (e) {
  console.log("Input value changed:", e.target.value);
});

// Change event (triggered when value changes and element loses focus)
NXUI.id("select").on("change", function (e) {
  console.log("Selection changed:", e.target.value);
});

NXUI.id("checkbox").on("change", function (e) {
  console.log("Checkbox state:", e.target.checked);
});

// Focus events
NXUI.id("input")
  .on("focus", () => console.log("Input focused"))
  .on("blur", () => console.log("Input lost focus"))
  .on("focusin", () => console.log("Focus in (bubbles)"))
  .on("focusout", () => console.log("Focus out (bubbles)"));

// Form submission
NXUI.id("form").on("submit", function (e) {
  e.preventDefault();
  const formData = NXUI.id("form").serialize();
  console.log("Form submitted:", formData);
});

// Form reset
NXUI.id("form").on("reset", function (e) {
  console.log("Form reset");
});
```

### Window & Document Events

```javascript
// Page load events
NXUI.selector("document").on("DOMContentLoaded", function () {
  console.log("DOM fully loaded");
});

NXUI.selector("window").on("load", function () {
  console.log("Page fully loaded");
});

// Window resize
NXUI.selector("window").on("resize", function () {
  console.log("Window resized");
});

// Scroll events
NXUI.selector("window").on("scroll", function () {
  console.log("Page scrolled");
});

NXUI.id("container").on("scroll", function () {
  console.log("Container scrolled");
});
```

### Touch Events (Mobile)

```javascript
// Touch events for mobile devices
NXUI.id("element")
  .on("touchstart", (e) => console.log("Touch started"))
  .on("touchmove", (e) => console.log("Touch moved"))
  .on("touchend", (e) => console.log("Touch ended"))
  .on("touchcancel", (e) => console.log("Touch cancelled"));

// Gesture events
NXUI.id("element")
  .on("gesturestart", (e) => console.log("Gesture started"))
  .on("gesturechange", (e) => console.log("Gesture changed"))
  .on("gestureend", (e) => console.log("Gesture ended"));
```

### Drag & Drop Events

```javascript
// Drag events
NXUI.id("draggable").on("dragstart", function (e) {
  e.dataTransfer.setData("text/plain", "Hello World");
  console.log("Drag started");
});

NXUI.id("draggable")
  .on("drag", () => console.log("Dragging"))
  .on("dragend", () => console.log("Drag ended"));

// Drop zone events
NXUI.id("dropzone")
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
NXUI.id("animated-element")
  .on("animationstart", () => console.log("Animation started"))
  .on("animationiteration", () => console.log("Animation iteration"))
  .on("animationend", () => console.log("Animation ended"));

// CSS Transition events
NXUI.id("transitioning-element")
  .on("transitionstart", () => console.log("Transition started"))
  .on("transitionrun", () => console.log("Transition running"))
  .on("transitionend", () => console.log("Transition ended"))
  .on("transitioncancel", () => console.log("Transition cancelled"));
```

### Media Events

```javascript
// Video/Audio events
NXUI.id("video")
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
NXUI.id("element").trigger("customEvent", {
  detail: { message: "Hello from custom event!" },
});

// Listen to custom events
NXUI.id("element").on("customEvent", function (e) {
  console.log("Custom event received:", e.detail);
});

// Real-world custom event example
function notifyUser(message) {
  NXUI.id("notification-area").trigger("userNotification", {
    detail: { message, timestamp: Date.now() },
  });
}

NXUI.id("notification-area").on("userNotification", function (e) {
  const { message, timestamp } = e.detail;
  this.innerHTML = `<div class="notification">${message} at ${new Date(
    timestamp
  )}</div>`;
});
```

### Event Delegation & Multiple Events

```javascript
// Multiple events on same element
NXUI.id("input")
  .on("focus", () => console.log("Focused"))
  .on("blur", () => console.log("Blurred"))
  .on("keyup", (e) => console.log("Key:", e.key))
  .on("change", (e) => console.log("Changed:", e.target.value));

// Event delegation (for dynamically added elements)
NXUI.id("container").on("click", function (e) {
  if (e.target.matches(".dynamic-button")) {
    console.log("Dynamic button clicked!");
  }
});

// Real-time validation example
NXUI.id("email").on("keyup", function (e) {
  const email = e.target.value;
  const isValid = email.includes("@") && email.includes(".");

  NXUI.id("email")
    .removeClass("valid invalid")
    .addClass(isValid ? "valid" : "invalid");
});
```

### Practical Event Examples

```javascript
// Auto-save functionality
let saveTimeout;
NXUI.id("editor").on("input", function (e) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    console.log("Auto-saving content...");
    // Save logic here
  }, 2000); // Save after 2 seconds of no typing
});

// Search as you type
NXUI.id("search").on("keyup", function (e) {
  const query = e.target.value;
  if (query.length >= 3) {
    console.log("Searching for:", query);
    // Search logic here
  }
});

// Confirm before leaving page
NXUI.selector("window").on("beforeunload", function (e) {
  const hasUnsavedChanges = checkForUnsavedChanges();
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
  }
});

// Infinite scroll
NXUI.selector("window").on("scroll", function () {
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
NXUI.id("element").attr("title", "Tooltip text");

// Get attribute
const title = NXUI.id("element").attr("title");

// Remove attribute
NXUI.id("element").removeAttr("old-attr");

// Check if has attribute
const hasAttr = NXUI.id("element").hasAttr("data-id");

// Get all attributes
const allAttrs = NXUI.id("element").getAllAttrs();

// Get attribute names
const attrNames = NXUI.id("element").getAttrNames();
```

### Data Attributes

```javascript
// Set data attribute
NXUI.id("element").data("userId", "12345");

// Get data attribute
const userId = NXUI.id("element").data("userId");

// Get all data attributes
const allData = NXUI.id("element").getAllData();
```

---

## 📝 Form Handling

### Form Values

```javascript
// Set/Get input value
NXUI.id("input").val("New value");
const value = NXUI.id("input").val();

// Set/Get placeholder
NXUI.id("input").placeholder("Enter your name");
const placeholder = NXUI.id("input").placeholder();

// Checkbox/Radio
NXUI.id("checkbox").checked(true);
const isChecked = NXUI.id("checkbox").checked();

// Disable/Enable
NXUI.id("input").disabled(true);
const isDisabled = NXUI.id("input").disabled();
```

### Form Operations

```javascript
// Submit form
NXUI.id("form").submit();

// Reset form
NXUI.id("form").reset();

// Serialize form data
const formData = NXUI.id("form").serialize();
// Returns: { name: "John", email: "john@example.com" }

// Focus/Blur
NXUI.id("input").focus();
NXUI.id("input").blur();

// Select text
NXUI.id("input").select();
```

---

## ✨ Animations

### Fade Effects

```javascript
// Fade in (default: 300ms)
NXUI.id("element").fadeIn();

// Fade in with custom duration
NXUI.id("element").fadeIn(500);

// Fade out
NXUI.id("element").fadeOut(300);

// Fade sequence
NXUI.id("element")
  .fadeOut()
  .then(() => {
    // Change content
    NXUI.id("element").innerHTML = "New content";
    NXUI.id("element").fadeIn();
  });
```

### Slide Effects

```javascript
// Slide up
NXUI.id("element").slideUp();

// Slide down
NXUI.id("element").slideDown();

// Slide up with custom duration
NXUI.id("element").slideUp(500);
```

---

## 📏 Dimensions & Position

### Dimensions

```javascript
// Get/Set width
NXUI.id("element").width(200); // Set to 200px
const width = NXUI.id("element").width(); // Get width

// Get/Set height
NXUI.id("element").height("50%"); // Set to 50%
const height = NXUI.id("element").height(); // Get height

// Get position information
const pos = NXUI.id("element").position();
// Returns: { top, left, right, bottom, width, height }
```

### Scrolling

```javascript
// Scroll element into view
NXUI.id("element").scrollIntoView();

// Scroll with options
NXUI.id("element").scrollIntoView({
  behavior: "smooth",
  block: "center",
});

// Set scroll position
NXUI.id("element").scrollTo(100, 50); // top: 100, left: 50
```

---

## 🌳 DOM Traversal

### Parent & Children

```javascript
// Get parent element
const parent = NXUI.id("element").parent();

// Get all children
const children = NXUI.id("element").children();

// Find child by selector
const child = NXUI.id("element").find(".child-class");

// Find all children by selector
const allChildren = NXUI.id("element").findAll("p");
```

### Siblings

```javascript
// Get next sibling
const next = NXUI.id("element").next();

// Get next sibling with selector
const nextDiv = NXUI.id("element").next("div");

// Get previous sibling
const prev = NXUI.id("element").prev();

// Get all next siblings
const allNext = NXUI.id("element").nextAll();

// Get all previous siblings
const allPrev = NXUI.id("element").prevAll();

// Get all siblings
const siblings = NXUI.id("element").siblings();
```

---

## 🔍 Element Inspection

### Basic Inspection

```javascript
// Get complete element properties
const props = NXUI.id("element").getProperties();

// Get element structure tree
const structure = NXUI.id("element").getStructure();

// Check element type
const tagName = NXUI.id("element").tagName();

// Check if element matches selector
const matches = NXUI.id("element").is(".my-class");

// Check if element has content
const hasContent = NXUI.id("element").hasContent();
```

### Advanced Inspection

```javascript
// Get full inspection as JSON
const inspection = NXUI.id("element").inspect();

// Debug element to console
NXUI.id("element").debug();

// Get filtered attributes
const dataAttrs = NXUI.id("element").getAttrs("data-");
const customAttrs = NXUI.id("element").getAttrs((name, value) => {
  return name.startsWith("custom-");
});
```

---

## 🛠️ Utilities

### Element Operations

```javascript
// Clone element
const cloned = NXUI.id("element").clone();

// Remove element
NXUI.id("element").remove();

// Detach element (remove but keep in memory)
NXUI.id("element").detach();

// Get outer HTML
const outerHTML = NXUI.id("element").outerHTML();

// Set outer HTML
NXUI.id("element").outerHTML("<div>New element</div>");
```

### Validation

```javascript
// Check if element exists
if (NXUI.id("element").element) {
  // Element exists
}

// Check multiple attributes
const hasRequired = NXUI.id("input").hasAttrs(["name", "id", "data-required"]);

// Validate element state
const element = NXUI.id("button");
if (element.isVisible() && !element.disabled()) {
  element.trigger("click");
}
```

---

## 🔗 Method Chaining

NexaKit mendukung method chaining untuk operasi yang lebih efisien:

```javascript
NXUI.id("element")
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
const form = NXUI.id("loginForm");
const email = NXUI.id("email");
const password = NXUI.id("password");

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
  const container = NXUI.id("content");

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
NXUI.selectorAll("*").forEach((element) => {
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

NexaKit memiliki built-in error handling yang aman:

```javascript
// Jika element tidak ditemukan, akan return dummy element
NXUI.id("nonExistentElement").addClass("test"); // Tidak akan error
// Console warning: "Element dengan ID 'nonExistentElement' tidak ditemukan"

// Dummy element methods akan return safe values
const width = NXUI.id("nonExistent").width(); // Returns: 0
const attrs = NXUI.id("nonExistent").getAllAttrs(); // Returns: {}
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
- `NexaKit_examples.html` - Comprehensive feature showcase
- `element_inspection_demo.html` - Advanced element analysis tools

## 🎯 Browser Support

- Modern browsers dengan ES6+ support
- Chrome 60+, Firefox 55+, Safari 10.1+, Edge 79+

---

**NexaKit** - The Complete UI Manipulation Kit! 🎨
_Build. Interact. Animate. - All in One Kit!_ 🚀

