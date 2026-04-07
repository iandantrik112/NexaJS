// Search functionality for user table
export function initializeUserSearch() {
  // Wait a bit for DOM to be fully rendered
  setTimeout(() => {
    const searchInput = document.getElementById("searchFormVariablesInput");
    const tableBody = document.querySelector(".nx-table tbody");

    if (!searchInput || !tableBody) {
      // setTimeout(initializeUserSearch, 100);
      return;
    }

    const clearButton = searchInput.parentElement.querySelector("button");

    // Search function with better error handling
    function performSearch() {
      try {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const rows = tableBody.querySelectorAll("tr:not(.nx-no-results-row)");
        let visibleCount = 0;

        rows.forEach((row) => {
          const userInfoCell = row.querySelector(".nx-user-details");
          if (userInfoCell) {
            const userName =
              userInfoCell.querySelector("strong")?.textContent.toLowerCase() ||
              "";
            const userJabatan =
              userInfoCell.querySelector("small")?.textContent.toLowerCase() ||
              "";

            if (
              searchTerm === "" ||
              userName.includes(searchTerm) ||
              userJabatan.includes(searchTerm)
            ) {
              row.classList.remove("nx-table-row-hidden");
              visibleCount++;
            } else {
              row.classList.add("nx-table-row-hidden");
            }
          }
        });

        // Show no results message if needed
        let noResultsRow = tableBody.querySelector(".nx-no-results-row");
        if (visibleCount === 0 && searchTerm !== "") {
          if (!noResultsRow) {
            noResultsRow = document.createElement("tr");
            noResultsRow.className = "nx-no-results-row";
            noResultsRow.innerHTML =
              '<td colspan="3" class="nx-no-results">Tidak ada user yang cocok dengan pencarian</td>';
            tableBody.appendChild(noResultsRow);
          }
          noResultsRow.classList.remove("nx-table-row-hidden");
        } else if (noResultsRow) {
          noResultsRow.classList.add("nx-table-row-hidden");
        }

        console.log(
          `Search completed: ${visibleCount} users found for "${searchTerm}"`
        );
      } catch (error) {
        console.error("Error in search function:", error);
      }
    }

    // Clear function
    function clearSearch() {
      searchInput.value = "";
      performSearch();
      searchInput.focus();
    }

    // Event listeners
    searchInput.addEventListener("input", performSearch);
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Escape") {
        clearSearch();
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", clearSearch);
    }

    // Keyboard shortcut (Ctrl+F)
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

   
  }, 50);
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeUserSearch);
} else {
  initializeUserSearch();
}
