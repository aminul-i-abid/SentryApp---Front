const en = {
    title: 'Activities',
    subtitle: 'Manage recreational activities and reservations',
    addNew: 'Add New Activity',
    search: 'Search activities...',
    filter: {
        all: 'All Activities',
        active: 'Active',
        inactive: 'Inactive',
        byCamp: 'Filter by Camp'
    },
    table: {
        name: 'Name',
        type: 'Type',
        capacity: 'Capacity',
        camp: 'Camp',
        location: 'Location',
        schedule: 'Schedule',
        status: 'Status',
        actions: 'Actions'
    },
    types: {
        exclusive: 'Exclusive Time',
        shared: 'Shared Resource'
    },
    status: {
        active: 'Active',
        inactive: 'Inactive'
    },
    details: {
        title: 'Activity Details',
        basicInfo: 'Basic Information',
        schedule: 'Schedule & Availability',
        policies: 'Reservation Policies',
        statistics: 'Statistics',
        capacity: 'Capacity'
    },
    form: {
        title: {
            create: 'Create New Activity',
            edit: 'Edit Activity'
        },
        name: 'Activity Name',
        namePlaceholder: 'e.g., Main Gym, Ping Pong Table 1',
        description: 'Description',
        descriptionPlaceholder: 'Describe the activity...',
        concurrencyType: 'Resource Type',
        capacity: 'Capacity',
        capacityHelp: 'Maximum number of concurrent reservations',
        slotDuration: 'Slot Duration (minutes)',
        startTime: 'Start Time',
        endTime: 'End Time',
        camp: 'Camp',
        location: 'Location',
        locationPlaceholder: 'e.g., Building A, Floor 2',
        imageUrl: 'Image URL',
        isActive: 'Active',
        requiresApproval: 'Requires Admin Approval',
        maxAdvanceBookingDays: 'Max Advance Booking (days)',
        minAdvanceBookingHours: 'Min Advance Booking (hours)',
        allowCancellation: 'Allow Cancellation',
        cancellationDeadlineHours: 'Cancellation Deadline (hours before)',
        cancel: 'Cancel',
        save: 'Save',
        create: 'Create'
    },
    reservations: {
        title: 'Activity Reservations',
        myReservations: 'My Reservations',
        allReservations: 'All Reservations',
        bookActivity: 'Book Activity',
        table: {
            activity: 'Activity',
            user: 'User',
            date: 'Date',
            time: 'Time',
            people: 'People',
            status: 'Status',
            actions: 'Actions'
        },
        status: {
            pending: 'Pending',
            inProgress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },
        actions: {
            approve: 'Approve',
            cancel: 'Cancel',
            markNoShow: 'Mark No Show',
            viewDetails: 'View Details'
        },
        pagination: {
            rowsPerPage: 'Rows per page',
            of: 'of'
        },
        filters: {
            fromDate: 'From date',
            showing: 'Showing',
            results: 'results',
            clearFilter: 'Clear filter'
        }
    },
    management: {
        title: 'Manage Reservations',
        subtitle: 'Manage all activity reservations in the system',
        noReservations: 'No reservations found',
        noReservationsSubtitle: 'Reservations will appear here when users create them',
        table: {
            beneficiary: 'Beneficiary'
        },
        actions: {
            confirm: 'Confirm Reservation',
            cancel: 'Cancel Reservation'
        },
        filters: {
            searchByRut: 'Search by RUT',
            rutPlaceholder: 'Enter RUT to search',
            searching: 'Searching...',
            noResults: 'No users found',
            status: 'Status',
            statusOptions: {
                all: 'All',
                pending: 'Pending/Created',
                inProgress: 'In Progress',
                completed: 'Completed',
                cancelled: 'Cancelled'
            }
        },
        confirmModal: {
            title: 'Confirm Reservation',
            message: 'Are you sure you want to confirm this reservation?'
        },
        cancelModal: {
            title: 'Cancel Reservation',
            message: 'Are you sure you want to cancel this reservation?',
            reason: 'Cancellation Reason',
            reasonPlaceholder: 'Enter the cancellation reason (optional)'
        },
        modal: {
            beneficiary: 'Beneficiary',
            date: 'Date',
            time: 'Time',
            cancel: 'Go Back',
            confirmAction: 'Confirm',
            cancelAction: 'Cancel Reservation'
        }
    },
    booking: {
        title: 'Book Activity',
        selectDate: 'Select Date',
        selectTime: 'Select Time Slot',
        selectedTimeSlot: 'Selected Time Slot',
        numberOfPeople: 'Number of People',
        people: 'people',
        person: 'person',
        maxParticipantsAvailable: 'Maximum {{count}} participants available',
        advanceBookingMessage: 'Book up to {{days}} days in advance',
        dateOutOfRange: 'Date must be within the next {{max}} days',
        confirmDetails: 'Please confirm your reservation details:',
        dateLabel: 'Date',
        timeLabel: 'Time',
        participantsLabel: 'Participants',
        notes: 'Notes (optional)',
        notesPlaceholder: 'Additional information...',
        availability: 'Availability',
        available: 'Available',
        full: 'Full',
        unavailable: 'Unavailable',
        spotsLeft: '{{count}} spots left',
        confirm: 'Confirm Reservation',
        cancel: 'Cancel',
        bookForOther: 'Book for another person',
        bookForSelf: 'Book for myself',
        searchByRut: 'Search by RUT',
        rutPlaceholder: 'Enter user RUT',
        searching: 'Searching...',
        noResults: 'No users found',
        selectUserForOther: 'You must select a user to book for',
        bookingFor: 'Booking for:'
    },
    deleteModal: {
        title: 'Delete Activity',
        message: 'Are you sure you want to delete this activity? All associated reservations will be cancelled. This action cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Delete'
    },
    cancelReservationModal: {
        title: 'Cancel Reservation',
        message: 'Are you sure you want to cancel this reservation?',
        reason: 'Cancellation Reason',
        reasonPlaceholder: 'Please provide a reason...',
        cancel: 'Cancel',
        confirm: 'Confirm Cancellation'
    },
    messages: {
        activityCreated: 'Activity created successfully',
        activityUpdated: 'Activity updated successfully',
        activityDeleted: 'Activity deleted successfully',
        reservationCreated: 'Reservation created successfully',
        reservationCancelled: 'Reservation cancelled successfully',
        reservationApproved: 'Reservation approved successfully',
        notAvailable: 'This time slot is no longer available',
        bookingLimitReached: 'Maximum advance booking limit reached',
        minAdvanceNotMet: 'Minimum advance booking time not met',
        capacityExceeded: 'Not enough capacity for the requested number of people'
    },
    errors: {
        loadActivities: 'Error loading activities',
        loadReservations: 'Error loading reservations',
        createActivity: 'Error creating activity',
        updateActivity: 'Error updating activity',
        deleteActivity: 'Error deleting activity',
        createReservation: 'Error creating reservation',
        cancelReservation: 'Error cancelling reservation'
    }
};

export default en;
