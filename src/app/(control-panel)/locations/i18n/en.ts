const en = {
    title: 'Locations',
    search: 'Search locations',
    addButton: 'Add Location',
    columns: {
        id: 'ID',
        description: 'Description',
        warehouse: 'Warehouse',
        createdBy: 'Created by',
        actions: 'Actions'
    },
    modal: {
        titleCreate: 'New Location',
        titleEdit: 'Edit Location',
        description: 'Description',
        warehouse: 'Warehouse',
        selectWarehouse: 'Select a warehouse',
        cancel: 'Cancel',
        save: 'Save'
    },
    delete: {
        title: 'Delete Location',
        message: 'Are you sure you want to delete the location "{{description}}"?',
        confirm: 'Delete',
        cancel: 'Cancel'
    },
    messages: {
        created: 'Location created successfully',
        updated: 'Location updated successfully',
        deleted: 'Location deleted successfully'
    },
    errors: {
        load: 'Error loading locations',
        create: 'Error creating location',
        update: 'Error updating location',
        delete: 'Error deleting location',
        emptyDescription: 'Description is required',
        emptyWarehouse: 'Must select a warehouse'
    },
    loading: 'Loading...',
    noData: 'No locations found',
    pagination: {
        rowsPerPage: 'Rows per page:',
        of: 'of',
        moreThan: 'more than'
    }
};

export default en;
