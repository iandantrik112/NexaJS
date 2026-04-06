export async function Sortable(data, selector = "tableVariablesSortable") {
  let sortableSelector = selector; // Default for Table

  const sortableContainer = document.getElementById(sortableSelector);
  if (!sortableContainer) {
    console.warn("❌ Sortable container not found:", sortableSelector);
    return;
  }

  // Prevent multiple initialization
  if (sortableContainer.hasAttribute("data-drag-initialized")) {
    return;
  }
  sortableContainer.setAttribute("data-drag-initialized", "true");

  let draggedElement = null;

  const variableItems = sortableContainer.querySelectorAll(".variable-item");

  variableItems.forEach((item) => {
    item.draggable = true;

    item.addEventListener("dragstart", (e) => {
      draggedElement = item;
      item.style.opacity = "0.5";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });

    item.addEventListener("dragend", (e) => {
      item.style.opacity = "1";

      // Clean up all borders
      sortableContainer.querySelectorAll(".variable-item").forEach((el) => {
        el.style.borderTop = "";
        el.style.borderBottom = "";
        el.style.transform = "";
      });

      // Get final order - only checked items
      setTimeout(async () => {
        const items = sortableContainer.querySelectorAll(".variable-item");
        const checkedOrder = Array.from(items)
          .filter((el) => {
            const checkbox = el.querySelector('input[type="checkbox"]');
            return checkbox && checkbox.checked;
          })
          .map((el) => el.getAttribute("data-variable"));

        // Save to IndexedDB - only checked variables
        try {
          await NXUI.ref.updateField(
            data.store,
            data.id,
            "variables",
            checkedOrder
          );

          await NXUI.ref.updateField(
            data.store,
            data.id,
            "variablesOrigin",
            checkedOrder
          );
          console.log("✅ Checked variables order saved to DB:", checkedOrder);
        } catch (error) {
          console.error("❌ Failed to save checked variables order:", error);
        }

        console.log("📋 Final Checked Order:", checkedOrder);
      }, 10);

      draggedElement = null;
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();

      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        // Clear previous borders
        sortableContainer.querySelectorAll(".variable-item").forEach((el) => {
          el.style.borderTop = "";
          el.style.borderBottom = "";
        });

        if (e.clientY < midpoint) {
          item.style.borderTop = "3px solid #007bff";
        } else {
          item.style.borderBottom = "3px solid #007bff";
        }
      }
    });

    item.addEventListener("dragleave", (e) => {
      // Only clear if we're actually leaving the item
      const rect = item.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        item.style.borderTop = "";
        item.style.borderBottom = "";
      }
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
          item.parentNode.insertBefore(draggedElement, item);
        } else {
          item.parentNode.insertBefore(draggedElement, item.nextSibling);
        }
      }

      // Clear all borders
      sortableContainer.querySelectorAll(".variable-item").forEach((el) => {
        el.style.borderTop = "";
        el.style.borderBottom = "";
      });
    });
  });
}
