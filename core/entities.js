Entities.register({
    name: "Property",
    title: "Property",
    table: "properties",
    fields: {
        user_id: {
            label: "Owner",
            type: "hidden",
            required: true
        },
        title: {
            label: "Title",
            type: "text",
            required: true
        },
        description: {
            label: "Description",
            type: "textarea",
            required: false
        },
        price: {
            label: "Price",
            type: "number",
            required: false
        },
        type: {
            label: "Type",
            type: "select",
            required: false,
            options: [
                { value: "resort", label: "Resort" },
                { value: "apartment", label: "Apartment" }
            ]
        },
        status: {
            label: "Status",
            type: "select",
            required: false,
            options: [
                { value: "active", label: "Active" },
                { value: "hidden", label: "Hidden" }
            ]
        },
        location: {
            label: "Location",
            type: "text",
            required: false
        }
    },
    permissions: {
        create: ["admin", "user"],
        read: ["admin", "user"],
        update: ["admin", "user"],
        delete: ["admin"]
    }
});