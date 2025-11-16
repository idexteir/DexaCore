import { PROPERTY_AMENITIES } from '../../data/entities.js';

export function renderPropertyForm(property = null) {
    const isEdit = !!property;
    
    // Parse amenities if it's stored as JSON string
    let selectedAmenities = [];
    if (property?.amenities) {
        try {
            selectedAmenities = typeof property.amenities === 'string' 
                ? JSON.parse(property.amenities) 
                : property.amenities;
        } catch (e) {
            console.warn("[PropertyForm] Failed to parse amenities:", e);
            selectedAmenities = [];
        }
    }
    
    return `
        <div class="property-form-container">
            <h2>${isEdit ? 'Edit' : 'Add New'} Property</h2>
            
            <form id="property-form" class="property-form">
                <!-- Basic Info -->
                <div class="form-section">
                    <h3>Basic Information</h3>
                    
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" name="title" value="${property?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea name="description" rows="4" required>${property?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Type *</label>
                            <select name="type" required>
                                <option value="">Select type...</option>
                                <option value="resort" ${property?.type === 'resort' ? 'selected' : ''}>Resort</option>
                                <option value="apartment" ${property?.type === 'apartment' ? 'selected' : ''}>Apartment</option>
                                <option value="villa" ${property?.type === 'villa' ? 'selected' : ''}>Villa</option>
                                <option value="house" ${property?.type === 'house' ? 'selected' : ''}>House</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Location *</label>
                            <input type="text" name="location" value="${property?.location || ''}" placeholder="e.g., Dammam, Saudi Arabia" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Google Maps URL</label>
                        <input type="text" name="location_map" value="${property?.location_map || ''}" placeholder="Paste Google Maps embed link">
                    </div>
                </div>
                
                <!-- Pricing -->
                <div class="form-section">
                    <h3>Pricing</h3>
                    
                    <div class="form-group">
                        <label>Price *</label>
                        <input type="text" name="price" value="${property?.price || ''}" placeholder="e.g., $150/night or 'Call for price'" required>
                        <small>You can enter a number or text like "Call for price"</small>
                    </div>
                </div>
                
                <!-- Property Details -->
                <div class="form-section">
                    <h3>Property Details</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Bedrooms</label>
                            <input type="number" name="bedrooms" value="${property?.bedrooms || ''}" min="0" placeholder="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Bathrooms</label>
                            <input type="number" name="bathrooms" value="${property?.bathrooms || ''}" min="0" step="0.5" placeholder="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Max Guests</label>
                            <input type="number" name="max_guests" value="${property?.max_guests || ''}" min="1" placeholder="1">
                        </div>
                        
                        <div class="form-group">
                            <label>Min Stay (nights)</label>
                            <input type="number" name="min_stay" value="${property?.min_stay || 1}" min="1" placeholder="1">
                        </div>
                    </div>
                </div>
                
                <!-- Contact -->
                <div class="form-section">
                    <h3>Contact Information</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Phone Number *</label>
                            <input type="tel" name="phone" value="${property?.phone || ''}" placeholder="+966-XXX-XXXX" required>
                        </div>
                        
                        <div class="form-group">
                            <label>WhatsApp (if different)</label>
                            <input type="tel" name="whatsapp" value="${property?.whatsapp || ''}" placeholder="+966-XXX-XXXX">
                            <small>Leave empty to use phone number</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${property?.email || ''}" placeholder="contact@property.com">
                    </div>
                </div>
                
                <!-- Amenities Checkboxes -->
                <div class="form-section">
                    <h3>Amenities</h3>
                    
                    <div class="amenities-grid">
                        ${PROPERTY_AMENITIES.map(amenity => {
                            const isChecked = selectedAmenities.includes(amenity.id);
                            return `
                                <label class="amenity-checkbox">
                                    <input type="checkbox" name="amenities" value="${amenity.id}" ${isChecked ? 'checked' : ''}>
                                    <span>${amenity.label}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Image -->
                <div class="form-section">
                    <h3>Image</h3>
                    
                    <div class="form-group">
                        <label>Thumbnail URL</label>
                        <input type="text" name="thumbnail_url" value="${property?.thumbnail_url || ''}" placeholder="https://...">
                    </div>
                </div>
                
                <!-- Status -->
                <div class="form-section">
                    <h3>Status</h3>
                    
                    <div class="form-group">
                        <label>Visibility *</label>
                        <select name="status" required>
                            <option value="hidden" ${!property || property?.status === 'hidden' ? 'selected' : ''}>Hidden</option>
                            <option value="active" ${property?.status === 'active' ? 'selected' : ''}>Active</option>
                        </select>
                        <small>New properties are hidden by default until activated by admin</small>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="DexaCore.router.go('/properties')">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'} Property</button>
                </div>
            </form>
        </div>
    `;
}

export function getPropertyFormData() {
    const form = document.getElementById('property-form');
    const formData = new FormData(form);
    
    const data = {};
    
    // Get all fields
    for (let [key, value] of formData.entries()) {
        if (key !== 'amenities') {
            // Convert numbers
            if (key === 'bedrooms' || key === 'bathrooms' || key === 'max_guests' || key === 'min_stay') {
                data[key] = value ? parseFloat(value) : null;
            } else {
                data[key] = value || null;
            }
        }
    }
    
    // Get checked amenities
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities"]:checked');
    data.amenities = Array.from(amenityCheckboxes).map(cb => cb.value);
    
    return data;
}