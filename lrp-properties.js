define([], function() {
    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: {
                uses: "dimensions",
                min: 3,
                max: 3
            },
            measures: {
                uses: "measures",
                min: 3,
                max: 3
            },
            sorting: {
                uses: "sorting"
            },
            appearance: {
                uses: "settings",
            }
        }
    }
})
