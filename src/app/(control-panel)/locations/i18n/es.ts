const es = {
    title: 'Ubicaciones',
    search: 'Buscar ubicaciones',
    addButton: 'Agregar Ubicación',
    columns: {
        id: 'ID',
        description: 'Descripción',
        warehouse: 'Almacén',
        createdBy: 'Creado por',
        actions: 'Acciones'
    },
    modal: {
        titleCreate: 'Nueva Ubicación',
        titleEdit: 'Editar Ubicación',
        description: 'Descripción',
        warehouse: 'Almacén',
        selectWarehouse: 'Seleccione un almacén',
        cancel: 'Cancelar',
        save: 'Guardar'
    },
    delete: {
        title: 'Eliminar Ubicación',
        message: '¿Está seguro de que desea eliminar la ubicación "{{description}}"?',
        confirm: 'Eliminar',
        cancel: 'Cancelar'
    },
    messages: {
        created: 'Ubicación creada exitosamente',
        updated: 'Ubicación actualizada exitosamente',
        deleted: 'Ubicación eliminada exitosamente'
    },
    errors: {
        load: 'Error al cargar las ubicaciones',
        create: 'Error al crear la ubicación',
        update: 'Error al actualizar la ubicación',
        delete: 'Error al eliminar la ubicación',
        emptyDescription: 'La descripción es requerida',
        emptyWarehouse: 'Debe seleccionar un almacén'
    },
    loading: 'Cargando...',
    noData: 'No se encontraron ubicaciones',
    pagination: {
        rowsPerPage: 'Filas por página:',
        of: 'de',
        moreThan: 'más de'
    }
};

export default es;
