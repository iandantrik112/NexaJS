/**
 * Tabeltfoott - Generates table footer with calculations
 * Only calculates columns with type "number" or "currency"
 * Other columns are left empty
 */
export class Tabeltfoott {
    constructor() {
        this.columns = [];
    }

    /**
     * Add a column to the footer configuration
     * @param {string} fieldName - Field name/identifier
     * @param {string} fieldType - Field type (number, currency, text, etc.)
     * @param {string} fieldKey - Field key (the actual field name)
     */
    addColumn(fieldName, fieldType, fieldKey) {
        const shouldCalculate = fieldType === 'number' || fieldType === 'currency';
        
        this.columns.push({
            fieldName: fieldName,
            fieldType: fieldType,
            fieldKey: fieldKey,
            shouldCalculate: shouldCalculate
        });
    }

    /**
     * Generate tfoot HTML with calculations
     * @param {Array} data - The table data to calculate on
     * @param {string} noColumnName - Name of the "no" column (usually just "no")
     * @returns {string} HTML for tfoot
     */
    generateTfoot(data = []) {
        if (this.columns.length === 0) {
            return '';
        }

        // ✅ Check if there's any column that needs calculation (currency or number)
        const hasCalculableColumns = this.columns.some(column => column.shouldCalculate);
        
        // ✅ Don't display footer if no currency/number columns exist
        if (!hasCalculableColumns) {
            return '';
        }

        // Generate footer cells
        // Structure: Total span 2 kolom (No+Action) + field lainnya
        const footerParts = [];
        
        // First part: Total with colspan 2 (skips No and id/Action columns)
        footerParts.push('<td colspan="2" style="text-align: center; font-weight: bold;">' + 
                        (data.length > 0 ? 'Total' : '') + '</td>');
        
        // Skip first column (id/Action) and generate cells for remaining fields
        for (let i = 1; i < this.columns.length; i++) {
            const column = this.columns[i];
            
            if (column.shouldCalculate) {
                const sum = this.calculateSum(data, column.fieldKey);
                const displayValue = column.fieldType === 'currency' 
                    ? this.formatCurrency(sum) 
                    : this.formatNumber(sum);
                
                const textAlign = column.fieldType === 'currency' ? 'right' : 'center';
                
                footerParts.push(`<td style="text-align: ${textAlign}; font-weight: bold;">${displayValue}</td>`);
            } else {
                // Empty cell for non-calculated columns
                footerParts.push('<td></td>');
            }
        }
        
        // Generate the full tfoot HTML
        return `
        <tfoot>
            <tr>
                ${footerParts.join('')}
            </tr>
        </tfoot>`;
    }

    /**
     * Calculate sum of a field from data array
     * @param {Array} data - Data array
     * @param {string} fieldKey - Field to sum
     * @returns {number} Sum value
     */
    calculateSum(data, fieldKey) {
        if (!data || data.length === 0) return 0;
        
        let sum = 0;
        data.forEach(row => {
            const value = row[fieldKey];
            if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    sum += numValue;
                }
            }
        });
        
        return sum;
    }

    /**
     * Format number for display
     * @param {number} value - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(value) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Format currency for display
     * @param {number} value - Value to format as currency
     * @returns {string} Formatted currency
     */
    formatCurrency(value) {
        // Format dengan Rp. prefix
        return 'Rp. ' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

/**
 * Factory function to create a Tabeltfoott instance
 * @param {Array} columns - Array of column configurations
 * @returns {Tabeltfoott} Tabeltfoott instance
 */
export function createTabeltfoott(columns = []) {
    const tfootInstance = new Tabeltfoott();
    columns.forEach(column => {
        tfootInstance.addColumn(column.fieldName, column.fieldType, column.fieldKey);
    });
    return tfootInstance;
}
