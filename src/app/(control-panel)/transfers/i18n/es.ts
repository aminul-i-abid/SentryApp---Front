const es = {
    transfers: {
        title: 'Transferencias',
        scan: 'Escanear',
        manualEntry: 'Ingreso Manual',
        loadMovement: 'Cargar Movimiento',
        addedProducts: 'Productos Agregados',
        noAddedProducts: 'No hay productos agregados',
        add: 'Agregar',
        delete: 'Eliminar',
        movementType: {
            increase: 'Incremento',
            decrease: 'Disminución'
        },
        table: {
            item: 'Item',
            lot: 'Lote',
            originWarehouse: 'Almacén Origen',
            originLocation: 'Ubicación Origen',
            destWarehouse: 'Almacén Destino',
            destLocation: 'Ubicación Destino',
            quantity: 'Cantidad',
            notes: 'Notas',
            actions: 'Acciones'
        },
        form: {
            title: 'Agregar Producto',
            origin: 'Origen',
            destination: 'Destino',
            item: 'Item',
            lot: 'Lote',
            warehouse: 'Almacén',
            location: 'Ubicación',
            quantity: 'Cantidad',
            notes: 'Notas',
            cancel: 'Cancelar',
            save: 'Agregar'
        },
        messages: {
            createSuccess: 'Transferencia creada exitosamente',
            createError: 'Error al crear la transferencia',
            requiredFields: 'Por favor complete todos los campos requeridos',
            sameOriginDestination: 'El origen y destino deben ser diferentes',
            noProductsToLoad: 'No hay productos para cargar',
            allMovementsLoaded: 'Todos los movimientos fueron cargados exitosamente',
            someMovementsFailed: 'Algunos movimientos no pudieron ser cargados',
            productAdded: 'Producto agregado',
            productRemoved: 'Producto eliminado'
        }
    }
};

export default es;
