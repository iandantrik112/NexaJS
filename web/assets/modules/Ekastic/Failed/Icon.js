import * as Icons from './Icon.js'
export async function setFailed(data) {
  try {
    // Get all icon names from Icons object - include all string values
    const iconNames = Object.keys(Icons).filter(key => {
      const value = Icons[key];
      // Include all string values (images, URLs, SVG, etc.)
      if (typeof value !== 'string') return false;
      // Exclude empty strings
      if (value.trim().length === 0) return false;
      // Include everything else (data URIs, URLs, SVG, etc.)
      return true;
    });
    
    // Generate icon HTML for each size
    const generateIcons = (sizeClass) => {
      return iconNames.map(iconName => {
        const iconValue = Icons[iconName];
        const displayName = iconName.replace(/^base64_|^svg_/, '').replace(/_/g, ' ');
        
        // Handle SVG icons differently
        if (iconValue.trim().startsWith('<svg')) {
          // Get size from class name
          let size = '24';
          if (sizeClass.includes('extra-small')) size = '12';
          else if (sizeClass.includes('small')) size = '16';
          else if (sizeClass.includes('medium')) size = '20';
          else if (sizeClass.includes('large') && !sizeClass.includes('extra')) size = '24';
          else if (sizeClass.includes('extra-large')) size = '32';
          
          return `<div class="icon-svg-wrapper ${sizeClass}" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center;" title="${iconName}">${iconValue}</div>`;
        } else {
          // For image URLs and base64
          return `<img src="${iconValue}" class="${sizeClass}" alt="${displayName}" title="${iconName}" onerror="this.style.display='none'" />`;
        }
      }).join('\n            ');
    };
    
    //Generate and return HTML
    return `<div class="nx-scroll" style="height: 600px;">
      <style>
        .icon-display {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }
        .icon-size-group {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fafafa;
        }
        .icon-size-label {
          min-width: 150px;
          font-weight: 600;
          color: #333;
          padding-top: 5px;
          font-size: 14px;
        }
        .icon-extra-small {
          width: 12px;
          height: 12px;
        }
        .icon-small {
          width: 16px;
          height: 16px;
        }
        .icon-medium {
          width: 20px;
          height: 20px;
        }
        .icon-large {
          width: 24px;
          height: 24px;
        }
        .icon-extra-large {
          width: 32px;
          height: 32px;
        }
        .icon-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          flex: 1;
        }
        .icon-preview img,
        .icon-svg-wrapper {
          object-fit: contain;
          display: block;
          flex-shrink: 0;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 2px;
          background: white;
          transition: transform 0.2s;
        }
        .icon-svg-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .icon-svg-wrapper svg {
          display: block;
        }
        .icon-preview img:hover,
        .icon-svg-wrapper:hover {
          transform: scale(1.2);
          border-color: #0078d4;
          z-index: 10;
          position: relative;
        }
        .icon-count {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
      </style>
      
      <div class="icon-display">
        <div class="icon-size-group">
          <div>
            <div class="icon-size-label">Extra Small (12px)</div>
            <div class="icon-count">Total: ${iconNames.length} icons</div>
          </div>
          <div class="icon-preview">
            ${generateIcons('icon-extra-small')}
          </div>
        </div>
        
        <div class="icon-size-group">
          <div>
            <div class="icon-size-label">Small (16px)</div>
            <div class="icon-count">Total: ${iconNames.length} icons</div>
          </div>
          <div class="icon-preview">
            ${generateIcons('icon-small')}
          </div>
        </div>
        
        <div class="icon-size-group">
          <div>
            <div class="icon-size-label">Medium (20px)</div>
            <div class="icon-count">Total: ${iconNames.length} icons</div>
          </div>
          <div class="icon-preview">
            ${generateIcons('icon-medium')}
          </div>
        </div>
        
        <div class="icon-size-group">
          <div>
            <div class="icon-size-label">Large (24px)</div>
            <div class="icon-count">Total: ${iconNames.length} icons</div>
          </div>
          <div class="icon-preview">
            ${generateIcons('icon-large')}
          </div>
        </div>
        
        <div class="icon-size-group">
          <div>
            <div class="icon-size-label">Extra Large (32px)</div>
            <div class="icon-count">Total: ${iconNames.length} icons</div>
          </div>
          <div class="icon-preview">
            ${generateIcons('icon-extra-large')}
          </div>
        </div>
      </div>
    </div>`;
    
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return `
      <div class="alert alert-danger text-center">
        <h5>❌ Initialization Failed</h5>
        <p>Gagal menginisialisasi komponen. Error: ${error.message}</p>
      </div>
    `;
  }
}
