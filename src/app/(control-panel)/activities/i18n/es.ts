const es = {
    title: 'Actividades',
    subtitle: 'Gestiona actividades recreativas y reservas',
    addNew: 'Agregar Nueva Actividad',
    search: 'Buscar actividades...',
    filter: {
        all: 'Todas las Actividades',
        active: 'Activas',
        inactive: 'Inactivas',
        byCamp: 'Filtrar por Campamento'
    },
    table: {
        name: 'Nombre',
        type: 'Tipo',
        capacity: 'Capacidad',
        camp: 'Campamento',
        location: 'Ubicación',
        schedule: 'Horario',
        status: 'Estado',
        actions: 'Acciones'
    },
    types: {
        exclusive: 'Horario Exclusivo',
        shared: 'Recurso Compartido'
    },
    status: {
        active: 'Activo',
        inactive: 'Inactivo'
    },
    details: {
        title: 'Detalles de la Actividad',
        basicInfo: 'Información Básica',
        schedule: 'Horario y Disponibilidad',
        policies: 'Políticas de Reserva',
        statistics: 'Estadísticas',
        capacity: 'Capacidad'
    },
    form: {
        title: {
            create: 'Crear Nueva Actividad',
            edit: 'Editar Actividad'
        },
        name: 'Nombre de la Actividad',
        namePlaceholder: 'ej., Gimnasio Principal, Mesa de Ping Pong 1',
        description: 'Descripción',
        descriptionPlaceholder: 'Describe la actividad...',
        concurrencyType: 'Tipo de Recurso',
        capacity: 'Capacidad',
        capacityHelp: 'Número máximo de reservas concurrentes',
        slotDuration: 'Duración del Turno (minutos)',
        startTime: 'Hora de Inicio',
        endTime: 'Hora de Fin',
        camp: 'Campamento',
        location: 'Ubicación',
        locationPlaceholder: 'ej., Edificio A, Piso 2',
        imageUrl: 'URL de Imagen',
        isActive: 'Activo',
        requiresApproval: 'Requiere Aprobación del Administrador',
        maxAdvanceBookingDays: 'Reserva Anticipada Máxima (días)',
        minAdvanceBookingHours: 'Reserva Anticipada Mínima (horas)',
        allowCancellation: 'Permitir Cancelación',
        cancellationDeadlineHours: 'Plazo de Cancelación (horas antes)',
        cancel: 'Cancelar',
        save: 'Guardar',
        create: 'Crear'
    },
    reservations: {
        title: 'Reservas de Actividades',
        myReservations: 'Mis Reservas',
        allReservations: 'Todas las Reservas',
        bookActivity: 'Reservar Actividad',
        table: {
            activity: 'Actividad',
            user: 'Usuario',
            date: 'Fecha',
            time: 'Hora',
            people: 'Personas',
            status: 'Estado',
            actions: 'Acciones'
        },
        status: {
            pending: 'Pendiente',
            inProgress: 'En Curso',
            completed: 'Completada',
            cancelled: 'Cancelada'
        },
        actions: {
            approve: 'Aprobar',
            cancel: 'Cancelar',
            markNoShow: 'Marcar No Asistió',
            viewDetails: 'Ver Detalles'
        },
        pagination: {
            rowsPerPage: 'Filas por página',
            of: 'de'
        },
        filters: {
            fromDate: 'Fecha desde',
            showing: 'Mostrando',
            results: 'resultados',
            clearFilter: 'Limpiar filtro'
        }
    },
    management: {
        title: 'Administrar Reservas',
        subtitle: 'Gestiona todas las reservas de actividades del sistema',
        noReservations: 'No hay reservas encontradas',
        noReservationsSubtitle: 'Las reservas aparecerán aquí cuando los usuarios las creen',
        table: {
            beneficiary: 'Beneficiario'
        },
        actions: {
            confirm: 'Confirmar Reserva',
            cancel: 'Cancelar Reserva'
        },
        filters: {
            searchByRut: 'Buscar por RUT',
            rutPlaceholder: 'Ingrese RUT para buscar',
            searching: 'Buscando...',
            noResults: 'No se encontraron usuarios',
            status: 'Estado',
            statusOptions: {
                all: 'Todos',
                pending: 'Pendiente/Creada',
                inProgress: 'En Curso',
                completed: 'Completada',
                cancelled: 'Cancelada'
            }
        },
        confirmModal: {
            title: 'Confirmar Reserva',
            message: '¿Está seguro que desea confirmar esta reserva?'
        },
        cancelModal: {
            title: 'Cancelar Reserva',
            message: '¿Está seguro que desea cancelar esta reserva?',
            reason: 'Razón de cancelación',
            reasonPlaceholder: 'Ingrese el motivo de la cancelación (opcional)'
        },
        modal: {
            beneficiary: 'Beneficiario',
            date: 'Fecha',
            time: 'Horario',
            cancel: 'Volver',
            confirmAction: 'Confirmar',
            cancelAction: 'Cancelar Reserva'
        }
    },
    booking: {
        title: 'Reservar Actividad',
        selectDate: 'Seleccionar Fecha',
        selectTime: 'Seleccionar Horario',
        selectedTimeSlot: 'Horario Seleccionado',
        numberOfPeople: 'Número de Personas',
        people: 'personas',
        person: 'persona',
        maxParticipantsAvailable: 'Máximo {{count}} participantes disponibles',
        advanceBookingMessage: 'Reserva hasta {{days}} días de anticipación',
        dateOutOfRange: 'La fecha debe estar dentro de los próximos {{max}} días',
        confirmDetails: 'Por favor confirme los detalles de su reserva:',
        dateLabel: 'Fecha',
        timeLabel: 'Horario',
        participantsLabel: 'Participantes',
        notes: 'Notas (opcional)',
        notesPlaceholder: 'Información adicional...',
        availability: 'Disponibilidad',
        available: 'Disponible',
        full: 'Completo',
        unavailable: 'No Disponible',
        spotsLeft: '{{count}} lugares disponibles',
        confirm: 'Confirmar Reserva',
        cancel: 'Cancelar',
        bookForOther: 'Reservar para otra persona',
        bookForSelf: 'Reserva propia',
        searchByRut: 'Buscar por RUT',
        rutPlaceholder: 'Ingrese RUT del usuario',
        searching: 'Buscando...',
        noResults: 'No se encontraron usuarios',
        selectUserForOther: 'Debe seleccionar un usuario para reservar',
        bookingFor: 'Reservando para:'
    },
    deleteModal: {
        title: 'Eliminar Actividad',
        message: '¿Está seguro que desea eliminar esta actividad? Todas las reservas asociadas serán canceladas. Esta acción no se puede deshacer.',
        cancel: 'Cancelar',
        confirm: 'Eliminar'
    },
    cancelReservationModal: {
        title: 'Cancelar Reserva',
        message: '¿Está seguro que desea cancelar esta reserva?',
        reason: 'Motivo de Cancelación',
        reasonPlaceholder: 'Por favor proporcione un motivo...',
        cancel: 'Cancelar',
        confirm: 'Confirmar Cancelación'
    },
    messages: {
        activityCreated: 'Actividad creada exitosamente',
        activityUpdated: 'Actividad actualizada exitosamente',
        activityDeleted: 'Actividad eliminada exitosamente',
        reservationCreated: 'Reserva creada exitosamente',
        reservationCancelled: 'Reserva cancelada exitosamente',
        reservationApproved: 'Reserva aprobada exitosamente',
        notAvailable: 'Este horario ya no está disponible',
        bookingLimitReached: 'Límite máximo de reserva anticipada alcanzado',
        minAdvanceNotMet: 'No se cumple el tiempo mínimo de reserva anticipada',
        capacityExceeded: 'No hay suficiente capacidad para el número de personas solicitado'
    },
    errors: {
        loadActivities: 'Error al cargar actividades',
        loadReservations: 'Error al cargar reservas',
        createActivity: 'Error al crear actividad',
        updateActivity: 'Error al actualizar actividad',
        deleteActivity: 'Error al eliminar actividad',
        createReservation: 'Error al crear reserva',
        cancelReservation: 'Error al cancelar reserva',
        notFoundActivity: 'Actividad no encontrada',
        notFoundActivities: 'No se encontraron actividades',
        notFoundReservations: 'No se encontraron reservas'
    },
    moduleGuard: {
        title: 'Característica Plus',
        description: 'El módulo de Actividades es una característica Plus. Por favor contacte a su administrador para actualizar su cuenta y desbloquear el acceso a la gestión de actividades recreativas.',
        benefits: {
            title: 'Con el módulo de Actividades puede:',
            facilities: 'Gestionar instalaciones recreativas',
            booking: 'Reservar actividades y horarios',
            tracking: 'Seguimiento de reservas y disponibilidad',
            approval: 'Gestionar reservas'
        },
        buttonBack: 'Ir al Panel de Control',
        contactAdmin: 'Contacte a su administrador de sistema para obtener acceso'
    }
};

export default es;
