const es = {
    movements: {
        title: 'Movimientos',
        search: 'Buscar por item, almacén, ubicación...',
        noData: 'No hay registros de movimientos disponibles',
        rowsPerPage: 'Filas por página',
        of: 'de',
        moreThan: 'más de',
        filters: {
            warehouse: 'Almacén',
            item: 'Item',
            location: 'Ubicación',
            movementType: 'Tipo de Movimiento',
            transactionType: 'Tipo de Transacción',
            dateFrom: 'Fecha Desde',
            dateTo: 'Fecha Hasta',
            all: 'Todos'
        },
        types: {
            decrease: 'Disminución',
            increase: 'Aumento'
        },
        transactionTypes: {
            receiving: 'Recepción',
            transfers: 'Transferencia',
            consumption: 'Consumo',
            scrap: 'Scrap',
            positiveAdjustment: 'Ajuste Positivo',
            negativeAdjustment: 'Ajuste Negativo',
            all: 'Todos'
        },
        table: {
            date: 'Fecha',
            item: 'Item',
            lot: 'Lote',
            warehouse: 'Almacén',
            location: 'Ubicación',
            quantity: 'Cantidad',
            type: 'Tipo',
            transactionType: 'Transacción',
            operator: 'Operador',
            supplier: 'Proveedor',
            reason: 'Motivo',
            notes: 'Notas'
        },
        messages: {
            loadError: 'Error al cargar los movimientos'
        }
    }
};

export default es;
