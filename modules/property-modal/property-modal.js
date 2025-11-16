console.log("[PropertyModal] Module loading...");

window.PropertyModal = {
    currentProperty: null,
    
    open: async function(propertyId) {
        console.log("[PropertyModal] Opening modal for property:", propertyId);
        console.log("[PropertyModal] Checking if modal exists in DOM...");
        
        const modalCheck = document.getElementById("property-modal");
        console.log("[PropertyModal] Modal element found:", !!modalCheck);
        
        // Wait for modal HTML to be loaded
        await this.waitForModal();
        
        try {
            console.log("[PropertyModal] Fetching property data...");
            
            // Fetch property details
            const property = await Entities.get("Property", propertyId);
            
            console.log("[PropertyModal] Property loaded:", property);
            
            if (!property) {
                console.error("[PropertyModal] Property not found");
                return;
            }
            
            this.currentProperty = property;
            
            console.log("[PropertyModal] Rendering property...");
            this.render(property);
            
            console.log("[PropertyModal] Showing modal...");
            
            // Show modal
            const modal = document.getElementById("property-modal");
            console.log("[PropertyModal] Modal element:", modal);
            console.log("[PropertyModal] Modal classes before:", modal.className);
            
            modal.classList.remove("hidden");
            
            console.log("[PropertyModal] Modal classes after:", modal.className);
            
            // Prevent body scroll
            document.body.style.overflow = "hidden";
            
            // ESC key to close
            document.addEventListener("keydown", this.handleEscape);
            
            console.log("[PropertyModal] Modal should now be visible!");
            
        } catch (err) {
            console.error("[PropertyModal] Failed to load property:", err);
            alert("Failed to load property details: " + err.message);
        }
    },
    
    waitForModal: function() {
        return new Promise((resolve) => {
            let attempts = 0;
            const check = () => {
                attempts++;
                const modal = document.getElementById("property-modal");
                
                if (modal) {
                    console.log("[PropertyModal] Modal HTML ready after", attempts, "attempts");
                    resolve();
                } else if (attempts > 100) {
                    console.error("[PropertyModal] Modal HTML never loaded after 100 attempts (5 seconds)");
                    alert("Modal HTML failed to load. Check console for errors.");
                    resolve(); // Resolve anyway to prevent hanging
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    },
    
    close: function() {
        console.log("[PropertyModal] Closing modal");
        
        const modal = document.getElementById("property-modal");
        if (!modal) {
            console.warn("[PropertyModal] Modal element not found when trying to close");
            return;
        }
        
        modal.classList.add("hidden");
        
        // Restore body scroll
        document.body.style.overflow = "";
        
        // Remove ESC listener
        document.removeEventListener("keydown", this.handleEscape);
        
        this.currentProperty = null;
    },
    
    handleEscape: function(e) {
        if (e.key === "Escape") {
            PropertyModal.close();
        }
    },
    
    render: function(property) {
        console.log("[PropertyModal] Rendering property:", property);
        
        // Title
        const titleEl = document.getElementById("modal-title");
        console.log("[PropertyModal] Title element:", titleEl);
        if (titleEl) {
            titleEl.textContent = property.title || "Untitled Property";
        }
        
        // Location
        const locationEl = document.getElementById("modal-location");
        if (locationEl) {
            const locationText = locationEl.querySelector(".location-text");
            if (property.location && locationText) {
                locationText.textContent = property.location;
                locationEl.style.display = "flex";
            } else {
                locationEl.style.display = "none";
            }
        }
        
        // Gallery
        this.renderGallery(property);
        
        // Info Grid
        this.renderInfoGrid(property);
        
        // Pricing
        this.renderPricing(property);
        
        // Description
        const descEl = document.getElementById("modal-description");
        if (descEl) {
            descEl.textContent = property.description || "No description available.";
        }
        
        // Amenities
        this.renderAmenities(property);
        
        // Google Maps
        this.renderMap(property);
        
        // Contact Buttons
        this.renderContact(property);
        
        // Admin Actions
        this.renderAdminActions();
        
        console.log("[PropertyModal] Render complete");
    },
    
    renderGallery: function(property) {
        const galleryEl = document.getElementById("modal-gallery-main");
        if (!galleryEl) return;
        
        if (property.thumbnail_url) {
            galleryEl.innerHTML = `<img src="${property.thumbnail_url}" alt="${property.title}">`;
        } else {
            const icon = this.getPropertyIcon(property.type);
            galleryEl.innerHTML = `<div class="gallery-placeholder">${icon}</div>`;
        }
    },
    
    renderInfoGrid: function(property) {
        const infoGridEl = document.getElementById("modal-info-grid");
        if (!infoGridEl) return;
        
        const items = [];
        
        if (property.bedrooms) {
            items.push({ icon: "🛏️", label: "Bedrooms", value: property.bedrooms });
        }
        
        if (property.bathrooms) {
            items.push({ icon: "🚿", label: "Bathrooms", value: property.bathrooms });
        }
        
        if (property.max_guests) {
            items.push({ icon: "👥", label: "Max Guests", value: property.max_guests });
        }
        
        if (property.type) {
            items.push({ icon: "🏠", label: "Type", value: property.type.charAt(0).toUpperCase() + property.type.slice(1) });
        }
        
        infoGridEl.innerHTML = items.map(item => `
            <div class="info-item">
                <span class="info-icon">${item.icon}</span>
                <span class="info-label">${item.label}:</span>
                <span>${item.value}</span>
            </div>
        `).join('');
    },
    
    renderPricing: function(property) {
        const pricingEl = document.getElementById("modal-pricing");
        const minStayEl = document.getElementById("modal-min-stay");
        if (!pricingEl) return;
        
        if (property.price) {
            pricingEl.innerHTML = `
                <div class="pricing-item single-price">
                    <div class="pricing-value">${this.formatPrice(property.price)}</div>
                </div>
            `;
        } else {
            pricingEl.innerHTML = '<p style="color: #718096; font-style: italic;">📞 Contact us for pricing information</p>';
        }
        
        // Minimum stay
        if (minStayEl) {
            if (property.min_stay && property.min_stay > 1) {
                minStayEl.textContent = `* Minimum stay: ${property.min_stay} nights`;
                minStayEl.style.display = "block";
            } else {
                minStayEl.style.display = "none";
            }
        }
    },
    
    renderAmenities: function(property) {
        const amenitiesSection = document.getElementById("modal-amenities-section");
        const amenitiesEl = document.getElementById("modal-amenities");
        if (!amenitiesSection || !amenitiesEl) return;
        
        // Import amenities list
        import('../../data/entities.js').then(({ PROPERTY_AMENITIES }) => {
            if (property.amenities && property.amenities.length > 0) {
                // Map amenity IDs to labels with icons
                const amenityList = property.amenities.map(amenityId => {
                    const amenity = PROPERTY_AMENITIES.find(a => a.id === amenityId);
                    return amenity ? amenity.label : amenityId;
                });
                
                amenitiesEl.innerHTML = amenityList.map(amenity => `
                    <div class="amenity-item">
                        <span class="amenity-icon">✅</span>
                        <span>${amenity}</span>
                    </div>
                `).join('');
                amenitiesSection.classList.remove("hidden");
            } else {
                amenitiesSection.classList.add("hidden");
            }
        });
    },
    
    renderMap: function(property) {
        const mapSection = document.getElementById("modal-map-section");
        const mapEl = document.getElementById("modal-map");
        if (!mapSection || !mapEl) return;
        
        if (property.location_map) {
            let mapUrl = property.location_map;
            
            // If it's an embed URL, extract src
            if (mapUrl.includes("<iframe")) {
                const match = mapUrl.match(/src="([^"]+)"/);
                if (match) mapUrl = match[1];
            }
            
            mapEl.innerHTML = `<iframe src="${mapUrl}" allowfullscreen loading="lazy"></iframe>`;
            mapSection.classList.remove("hidden");
        } else {
            mapSection.classList.add("hidden");
        }
    },
    
    renderContact: function(property) {
        const contactEl = document.getElementById("modal-contact");
        if (!contactEl) return;
        
        const buttons = [];
        
        if (property.phone) {
            buttons.push(`
                <a href="tel:${property.phone}" class="btn-contact">
                    📞 Call: ${property.phone}
                </a>
            `);
        }
        
        // WhatsApp: use whatsapp field if exists, otherwise use phone
        const whatsappNumber = property.whatsapp || property.phone;
        if (whatsappNumber) {
            const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
            buttons.push(`
                <a href="https://wa.me/${cleanNumber}" target="_blank" class="btn-contact whatsapp">
                    💬 WhatsApp
                </a>
            `);
        }
        
        if (property.email) {
            buttons.push(`
                <a href="mailto:${property.email}?subject=Inquiry: ${encodeURIComponent(property.title)}" class="btn-contact">
                    ✉️ Email: ${property.email}
                </a>
            `);
        }
        
        if (buttons.length > 0) {
            contactEl.innerHTML = buttons.join('');
        } else {
            contactEl.innerHTML = '<p style="color: #718096;">Contact information not available</p>';
        }
    },
    
    renderAdminActions: function() {
        const adminActionsEl = document.getElementById("modal-admin-actions");
        if (!adminActionsEl) return;
        
        const user = DexaCore.session?.getUser();
        
        if (user && user.role === "admin") {
            adminActionsEl.classList.remove("hidden");
        } else {
            adminActionsEl.classList.add("hidden");
        }
    },
    
    formatPrice: function(price) {
        // If it's a number, format with commas
        if (!isNaN(price)) {
            return "$" + new Intl.NumberFormat('en-US').format(price);
        }
        // Otherwise return as-is (e.g., "Call for price")
        return price;
    },
    
    getPropertyIcon: function(type) {
        const icons = {
            'resort': '🏖️',
            'apartment': '🏢',
            'villa': '🏠',
            'condo': '🏘️',
            'house': '🏡'
        };
        return icons[type?.toLowerCase()] || '🏠';
    },
    
    edit: function() {
        if (!this.currentProperty) return;
        this.close();
        DexaCore.router.go(`/properties?edit=${this.currentProperty.id}`);
    },
    
    delete: async function() {
        if (!this.currentProperty) return;
        
        if (!confirm(`Delete "${this.currentProperty.title}"? This cannot be undone.`)) {
            return;
        }
        
        try {
            await Entities.delete("Property", this.currentProperty.id);
            alert("Property deleted successfully");
            this.close();
            location.reload();
        } catch (err) {
            console.error("[PropertyModal] Delete failed:", err);
            alert("Failed to delete property: " + err.message);
        }
    }
};

console.log("[PropertyModal] Module loaded");