export enum LockRecordTypes {
    // Desbloqueo por Bluetooth
    UNLOCK_BY_BLUETOOTH = 'unlock by Bluetooth',
    
    // Desbloqueo por contraseña exitoso
    UNLOCK_BY_PASSCODE_SUCCESS = 'unlock by passcode success',
    
    // Modificar contraseña en la cerradura
    MODIFY_PASSCODE_ON_LOCK = 'modify a passcode on the lock',
    
    // Eliminar contraseña de la cerradura
    DELETE_PASSCODE_ON_LOCK = 'delete a passcode on the lock',
    
    // Desbloqueo por contraseña fallido - contraseña desconocida
    UNLOCK_BY_PASSCODE_FAILED_UNKNOWN = 'unlock by passcode failed—unknown passcode',
    
    // Limpiar contraseñas de la cerradura
    CLEAR_PASSCODES_FROM_LOCK = 'clear passcodes from the lock',
    
    // Contraseña expulsada
    PASSCODE_SQUEEZED_OUT = 'passcode be squeezed out',
    
    // Desbloqueo con contraseña con función de eliminación
    UNLOCK_WITH_PASSCODE_DELETE_FUNCTION = 'unlock with passcode with delete function, passcode before it will all be deleted',
    
    // Desbloqueo por contraseña fallido - contraseña expirada
    UNLOCK_BY_PASSCODE_FAILED_EXPIRED = 'unlock by passcode failed—passcode expired',
    
    // Desbloqueo por contraseña fallido - sin memoria
    UNLOCK_BY_PASSCODE_FAILED_NO_MEMORY = 'unlock by passcode failed—run out of memory',
    
    // Desbloqueo por contraseña fallido - contraseña en lista negra
    UNLOCK_BY_PASSCODE_FAILED_BLACKLIST = 'unlock by passcode failed—passcode is in blacklist',
    
    // Cerradura encendida
    LOCK_POWER_ON = 'lock power on',
    
    // Agregar tarjeta exitoso
    ADD_CARD_SUCCESS = 'add card success',
    
    // Limpiar tarjetas
    CLEAR_CARDS = 'clear cards',
    
    // Desbloqueo por tarjeta exitoso
    UNLOCK_BY_CARD_SUCCESS = 'unlock by card success',
    
    // Eliminar tarjeta
    DELETE_CARD = 'delete an card',
    
    // Desbloqueo por pulsera exitoso
    UNLOCK_BY_WRIST_STRAP_SUCCESS = 'unlock by wrist strap success',
    
    // Desbloqueo por huella dactilar exitoso
    UNLOCK_BY_FINGERPRINT_SUCCESS = 'unlock by fingerprint success',
    
    // Agregar huella dactilar
    ADD_FINGERPRINT = 'add fingerprint',
    
    // Desbloqueo por huella dactilar fallido - huella expirada
    UNLOCK_BY_FINGERPRINT_FAILED_EXPIRED = 'unlock by fingerprint failed—fingerprint expired',
    
    // Eliminar huella dactilar
    DELETE_FINGERPRINT = 'delete a fingerprint',
    
    // Limpiar huellas dactilares
    CLEAR_FINGERPRINTS = 'clear fingerprints',
    
    // Desbloqueo por tarjeta fallido - tarjeta expirada
    UNLOCK_BY_CARD_FAILED_EXPIRED = 'unlock by card failed—card expired',
    
    // Bloqueo por Bluetooth
    LOCK_BY_BLUETOOTH = 'lock by Bluetooth',
    
    // Desbloqueo por llave mecánica
    UNLOCK_BY_MECHANICAL_KEY = 'unlock by Mechanical key',
    
    // Desbloqueo por gateway
    UNLOCK_BY_GATEWAY = 'unlock by gateway',
    
    // Aplicar fuerza en la cerradura
    APPLY_FORCE_ON_LOCK = 'apply some force on the Lock',
    
    // Sensor de puerta cerrado
    DOOR_SENSOR_CLOSED = 'Door sensor closed',
    
    // Sensor de puerta abierto
    DOOR_SENSOR_OPEN = 'Door sensor open',
    
    // Abrir desde adentro
    OPEN_FROM_INSIDE = 'open from inside',
    
    // Bloqueo por huella dactilar
    LOCK_BY_FINGERPRINT = 'lock by fingerprint',
    
    // Bloqueo por contraseña
    LOCK_BY_PASSCODE = 'lock by passcode',
    
    // Bloqueo por tarjeta
    LOCK_BY_CARD = 'lock by card',
    
    // Bloqueo por llave mecánica
    LOCK_BY_MECHANICAL_KEY = 'lock by Mechanical key',
    
    // Usar botón APP para controlar la cerradura
    USE_APP_BUTTON_CONTROL = 'Use APP button to control the lock (rise, fall, stop, lock), mostly used for roller shutter door',
    
    // Desbloqueo por contraseña fallido - puerta con doble bloqueo
    UNLOCK_BY_PASSCODE_FAILED_DOUBLE_LOCKED = 'unlock by passcode failed—The door has been double locked',
    
    // Desbloqueo por tarjeta IC fallido - puerta con doble bloqueo
    UNLOCK_BY_IC_CARD_FAILED_DOUBLE_LOCKED = 'unlock by IC card failed—The door has been double locked',
    
    // Desbloqueo por huella dactilar fallido - puerta con doble bloqueo
    UNLOCK_BY_FINGERPRINT_FAILED_DOUBLE_LOCKED = 'unlock by fingerprint failed—The door has been double locked',
    
    // Desbloqueo por app fallido - puerta con doble bloqueo
    UNLOCK_BY_APP_FAILED_DOUBLE_LOCKED = 'unlock by app failed—The door has been double locked',
    
    // Recibido nuevo correo local
    RECEIVED_NEW_LOCAL_MAIL = 'received new local mail',
    
    // Recibido nuevo correo de otras ciudades
    RECEIVED_NEW_OTHER_CITIES_MAIL = 'received new other cities\' mail',
    
    // Alerta de manipulación
    TAMPER_ALERT = 'Tamper alert',
    
    // Bloqueo automático
    AUTO_LOCK = 'Auto Lock',
    
    // Desbloqueo por llave de desbloqueo
    UNLOCK_BY_UNLOCK_KEY = 'unlock by unlock key',
    
    // Bloqueo por llave de bloqueo
    LOCK_BY_LOCK_KEY = 'lock by lock key',
    
    // Sistema bloqueado
    SYSTEM_LOCKED = 'System locked ( Caused by, for example: Using INVALID Passcode/Fingerprint/Card several times)',
    
    // Desbloqueo por tarjeta de hotel
    UNLOCK_BY_HOTEL_CARD = 'unlock by hotel card',
    
    // Desbloqueado debido a alta temperatura
    UNLOCKED_DUE_TO_HIGH_TEMPERATURE = 'Unlocked due to the high temperature',
    
    // Desbloqueo por tarjeta fallido - tarjeta en lista negra
    UNLOCK_BY_CARD_FAILED_BLACKLIST = 'unlock by card failed—card in blacklist',
    
    // Bloqueo muerto con APP
    DEAD_LOCK_WITH_APP = 'Dead lock with APP',
    
    // Bloqueo muerto con contraseña
    DEAD_LOCK_WITH_PASSCODE = 'Dead lock with passcode',
    
    // El auto se fue (para cerradura de estacionamiento)
    THE_CAR_LEFT = 'The car left (for parking lock)',
    
    // Usar control remoto para bloquear o desbloquear
    USE_REMOTE_CONTROL_LOCK_UNLOCK = 'Use remote control lock or unlock lock',
    
    // Desbloqueo con código QR exitoso
    UNLOCK_WITH_QR_CODE_SUCCESS = 'Unlock with QR code success',
    
    // Desbloqueo con código QR fallido - expirado
    UNLOCK_WITH_QR_CODE_FAILED_EXPIRED = 'Unlock with QR code failed, it\'s expired',
    
    // Doble bloqueado
    DOUBLE_LOCKED = 'Double locked',
    
    // Cancelar doble bloqueo
    CANCEL_DOUBLE_LOCK = 'Cancel double lock',
    
    // Bloqueo con código QR exitoso
    LOCK_WITH_QR_CODE_SUCCESS = 'Lock with QR code success',
    
    // Bloqueo con código QR fallido - cerradura con doble bloqueo
    LOCK_WITH_QR_CODE_FAILED_DOUBLE_LOCKED = 'Lock with QR code failed, the lock is double locked',
    
    // Desbloqueo automático en modo pasaje
    AUTO_UNLOCK_AT_PASSAGE_MODE = 'Auto unlock at passage mode',
    
    // Alarma de puerta no cerrada
    DOOR_UNCLOSED_ALARM = 'Door unclosed alarm',
    
    // Falló al desbloquear
    FAILED_TO_UNLOCK = 'Failed to unlock',
    
    // Falló al bloquear
    FAILED_TO_LOCK = 'Failed to lock',
    
    // Desbloqueo facial exitoso
    FACE_UNLOCK_SUCCESS = 'Face unlock success',
    
    // Desbloqueo facial fallido - puerta bloqueada desde adentro
    FACE_UNLOCK_FAILED_DOOR_LOCKED_INSIDE = 'Face unlock failed - door locked from inside',
    
    // Bloqueo con rostro
    LOCK_WITH_FACE = 'Lock with face',
    
    // Registro facial exitoso
    FACE_REGISTRATION_SUCCESS = 'Face registration success',
    
    // Desbloqueo facial fallido - expirado o inefectivo
    FACE_UNLOCK_FAILED_EXPIRED_INEFFECTIVE = 'Face unlock failed - expired or ineffective',
    
    // Eliminar rostro exitoso
    DELETE_FACE_SUCCESS = 'Delete face success',
    
    // Limpiar rostros exitoso
    CLEAR_FACE_SUCCESS = 'Clear face success',
    
    // Desbloqueo con tarjeta IC fallido - error de información segura de CPU
    IC_CARD_UNLOCK_FAILED_CPU_ERROR = 'IC card unlock failed - CPU secure information error',
    
    // Desbloqueo con botón autorizado de APP exitoso
    APP_AUTHORIZED_BUTTON_UNLOCK_SUCCESS = 'App authorized button unlock success',
    
    // Desbloqueo con botón autorizado de gateway exitoso
    GATEWAY_AUTHORIZED_BUTTON_UNLOCK_SUCCESS = 'Gateway authorized button unlock success',
    
    // Verificación de desbloqueo Bluetooth de autenticación dual exitosa
    DUAL_AUTH_BLUETOOTH_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication Bluetooth unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con contraseña de autenticación dual exitosa
    DUAL_AUTH_PASSWORD_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication password unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con huella dactilar de autenticación dual exitosa
    DUAL_AUTH_FINGERPRINT_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication fingerprint unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con tarjeta IC de autenticación dual exitosa
    DUAL_AUTH_IC_CARD_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication IC card unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con tarjeta facial de autenticación dual exitosa
    DUAL_AUTH_FACE_CARD_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication face card unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con llave inalámbrica de autenticación dual exitosa
    DUAL_AUTH_WIRELESS_KEY_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication wireless key unlock verification success, waiting for second user',
    
    // Verificación de desbloqueo con vena palmar de autenticación dual exitosa
    DUAL_AUTH_PALM_VEIN_UNLOCK_VERIFICATION_SUCCESS = 'Dual authentication palm vein unlock verification success, waiting for second user',
    
    // Desbloqueo con vena palmar exitoso
    PALM_VEIN_UNLOCK_SUCCESS = 'Palm vein unlock success',
    
    // Bloqueo con vena palmar
    LOCK_WITH_PALM_VEIN = 'Lock with palm vein',
    
    // Registro de vena palmar exitoso
    REGISTER_PALM_VEIN_SUCCESS = 'Register palm vein success',
    
    // Desbloqueo con vena palmar fallido - expirado o inefectivo
    PALM_VEIN_UNLOCK_FAILED_EXPIRED_INEFFECTIVE = 'Palm vein unlock failed - expired or ineffective',
    
    // Eliminar vena palmar exitoso
    DELETE_PALM_VEIN_SUCCESS = 'Delete palm vein successfully',
    
    // Limpiar venas palmares exitoso
    CLEAR_PALM_VEIN_SUCCESS = 'Clear palm vein successfully',
    
    // Falló al desbloquear con tarjeta IC
    FAILED_TO_UNLOCK_WITH_IC_CARD = 'Failed to unlock with IC card',
    
    // Contraseña de administrador para desbloquear
    ADMINISTRATOR_PASSWORD_TO_UNLOCK = 'Administrator password to unlock',
    
    // Agregar contraseña exitoso
    ADD_PASSWORD_SUCCESS = 'Add password successfully (custom password, keyboard add password)'
}

// Función para obtener la traducción en español
export const getLockRecordTypeTranslation = (recordTypeStr: string): string => {
    const translations: { [key: string]: string } = {
        [LockRecordTypes.UNLOCK_BY_BLUETOOTH]: 'Desbloqueo por Bluetooth',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_SUCCESS]: 'Desbloqueo por contraseña exitoso',
        [LockRecordTypes.MODIFY_PASSCODE_ON_LOCK]: 'Modificar contraseña en la cerradura',
        [LockRecordTypes.DELETE_PASSCODE_ON_LOCK]: 'Eliminar contraseña de la cerradura',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_FAILED_UNKNOWN]: 'Desbloqueo por contraseña fallido - contraseña desconocida',
        [LockRecordTypes.CLEAR_PASSCODES_FROM_LOCK]: 'Limpiar contraseñas de la cerradura',
        [LockRecordTypes.PASSCODE_SQUEEZED_OUT]: 'Contraseña expulsada',
        [LockRecordTypes.UNLOCK_WITH_PASSCODE_DELETE_FUNCTION]: 'Desbloqueo con contraseña con función de eliminación',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_FAILED_EXPIRED]: 'Desbloqueo por contraseña fallido - contraseña expirada',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_FAILED_NO_MEMORY]: 'Desbloqueo por contraseña fallido - sin memoria',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_FAILED_BLACKLIST]: 'Desbloqueo por contraseña fallido - contraseña en lista negra',
        [LockRecordTypes.LOCK_POWER_ON]: 'Cerradura encendida',
        [LockRecordTypes.ADD_CARD_SUCCESS]: 'Agregar tarjeta exitoso',
        [LockRecordTypes.CLEAR_CARDS]: 'Limpiar tarjetas',
        [LockRecordTypes.UNLOCK_BY_CARD_SUCCESS]: 'Desbloqueo por tarjeta exitoso',
        [LockRecordTypes.DELETE_CARD]: 'Eliminar tarjeta',
        [LockRecordTypes.UNLOCK_BY_WRIST_STRAP_SUCCESS]: 'Desbloqueo por pulsera exitoso',
        [LockRecordTypes.UNLOCK_BY_FINGERPRINT_SUCCESS]: 'Desbloqueo por huella dactilar exitoso',
        [LockRecordTypes.ADD_FINGERPRINT]: 'Agregar huella dactilar',
        [LockRecordTypes.UNLOCK_BY_FINGERPRINT_FAILED_EXPIRED]: 'Desbloqueo por huella dactilar fallido - huella expirada',
        [LockRecordTypes.DELETE_FINGERPRINT]: 'Eliminar huella dactilar',
        [LockRecordTypes.CLEAR_FINGERPRINTS]: 'Limpiar huellas dactilares',
        [LockRecordTypes.UNLOCK_BY_CARD_FAILED_EXPIRED]: 'Desbloqueo por tarjeta fallido - tarjeta expirada',
        [LockRecordTypes.LOCK_BY_BLUETOOTH]: 'Bloqueo por Bluetooth',
        [LockRecordTypes.UNLOCK_BY_MECHANICAL_KEY]: 'Desbloqueo por llave mecánica',
        [LockRecordTypes.UNLOCK_BY_GATEWAY]: 'Desbloqueo por gateway',
        [LockRecordTypes.APPLY_FORCE_ON_LOCK]: 'Aplicar fuerza en la cerradura',
        [LockRecordTypes.DOOR_SENSOR_CLOSED]: 'Sensor de puerta cerrado',
        [LockRecordTypes.DOOR_SENSOR_OPEN]: 'Sensor de puerta abierto',
        [LockRecordTypes.OPEN_FROM_INSIDE]: 'Abrir desde adentro',
        [LockRecordTypes.LOCK_BY_FINGERPRINT]: 'Bloqueo por huella dactilar',
        [LockRecordTypes.LOCK_BY_PASSCODE]: 'Bloqueo por contraseña',
        [LockRecordTypes.LOCK_BY_CARD]: 'Bloqueo por tarjeta',
        [LockRecordTypes.LOCK_BY_MECHANICAL_KEY]: 'Bloqueo por llave mecánica',
        [LockRecordTypes.USE_APP_BUTTON_CONTROL]: 'Usar botón APP para controlar la cerradura',
        [LockRecordTypes.UNLOCK_BY_PASSCODE_FAILED_DOUBLE_LOCKED]: 'Desbloqueo por contraseña fallido - puerta con doble bloqueo',
        [LockRecordTypes.UNLOCK_BY_IC_CARD_FAILED_DOUBLE_LOCKED]: 'Desbloqueo por tarjeta IC fallido - puerta con doble bloqueo',
        [LockRecordTypes.UNLOCK_BY_FINGERPRINT_FAILED_DOUBLE_LOCKED]: 'Desbloqueo por huella dactilar fallido - puerta con doble bloqueo',
        [LockRecordTypes.UNLOCK_BY_APP_FAILED_DOUBLE_LOCKED]: 'Desbloqueo por app fallido - puerta con doble bloqueo',
        [LockRecordTypes.RECEIVED_NEW_LOCAL_MAIL]: 'Recibido nuevo correo local',
        [LockRecordTypes.RECEIVED_NEW_OTHER_CITIES_MAIL]: 'Recibido nuevo correo de otras ciudades',
        [LockRecordTypes.TAMPER_ALERT]: 'Alerta de manipulación',
        [LockRecordTypes.AUTO_LOCK]: 'Bloqueo automático',
        [LockRecordTypes.UNLOCK_BY_UNLOCK_KEY]: 'Desbloqueo por llave de desbloqueo',
        [LockRecordTypes.LOCK_BY_LOCK_KEY]: 'Bloqueo por llave de bloqueo',
        [LockRecordTypes.SYSTEM_LOCKED]: 'Sistema bloqueado',
        [LockRecordTypes.UNLOCK_BY_HOTEL_CARD]: 'Desbloqueo por tarjeta de hotel',
        [LockRecordTypes.UNLOCKED_DUE_TO_HIGH_TEMPERATURE]: 'Desbloqueado debido a alta temperatura',
        [LockRecordTypes.UNLOCK_BY_CARD_FAILED_BLACKLIST]: 'Desbloqueo por tarjeta fallido - tarjeta en lista negra',
        [LockRecordTypes.DEAD_LOCK_WITH_APP]: 'Bloqueo muerto con APP',
        [LockRecordTypes.DEAD_LOCK_WITH_PASSCODE]: 'Bloqueo muerto con contraseña',
        [LockRecordTypes.THE_CAR_LEFT]: 'El auto se fue (para cerradura de estacionamiento)',
        [LockRecordTypes.USE_REMOTE_CONTROL_LOCK_UNLOCK]: 'Usar control remoto para bloquear o desbloquear',
        [LockRecordTypes.UNLOCK_WITH_QR_CODE_SUCCESS]: 'Desbloqueo con código QR exitoso',
        [LockRecordTypes.UNLOCK_WITH_QR_CODE_FAILED_EXPIRED]: 'Desbloqueo con código QR fallido - expirado',
        [LockRecordTypes.DOUBLE_LOCKED]: 'Doble bloqueado',
        [LockRecordTypes.CANCEL_DOUBLE_LOCK]: 'Cancelar doble bloqueo',
        [LockRecordTypes.LOCK_WITH_QR_CODE_SUCCESS]: 'Bloqueo con código QR exitoso',
        [LockRecordTypes.LOCK_WITH_QR_CODE_FAILED_DOUBLE_LOCKED]: 'Bloqueo con código QR fallido - cerradura con doble bloqueo',
        [LockRecordTypes.AUTO_UNLOCK_AT_PASSAGE_MODE]: 'Desbloqueo automático en modo pasaje',
        [LockRecordTypes.DOOR_UNCLOSED_ALARM]: 'Alarma de puerta no cerrada',
        [LockRecordTypes.FAILED_TO_UNLOCK]: 'Falló al desbloquear',
        [LockRecordTypes.FAILED_TO_LOCK]: 'Falló al bloquear',
        [LockRecordTypes.FACE_UNLOCK_SUCCESS]: 'Desbloqueo facial exitoso',
        [LockRecordTypes.FACE_UNLOCK_FAILED_DOOR_LOCKED_INSIDE]: 'Desbloqueo facial fallido - puerta bloqueada desde adentro',
        [LockRecordTypes.LOCK_WITH_FACE]: 'Bloqueo con rostro',
        [LockRecordTypes.FACE_REGISTRATION_SUCCESS]: 'Registro facial exitoso',
        [LockRecordTypes.FACE_UNLOCK_FAILED_EXPIRED_INEFFECTIVE]: 'Desbloqueo facial fallido - expirado o inefectivo',
        [LockRecordTypes.DELETE_FACE_SUCCESS]: 'Eliminar rostro exitoso',
        [LockRecordTypes.CLEAR_FACE_SUCCESS]: 'Limpiar rostros exitoso',
        [LockRecordTypes.IC_CARD_UNLOCK_FAILED_CPU_ERROR]: 'Desbloqueo con tarjeta IC fallido - error de información segura de CPU',
        [LockRecordTypes.APP_AUTHORIZED_BUTTON_UNLOCK_SUCCESS]: 'Desbloqueo con botón autorizado de APP exitoso',
        [LockRecordTypes.GATEWAY_AUTHORIZED_BUTTON_UNLOCK_SUCCESS]: 'Desbloqueo con botón autorizado de gateway exitoso',
        [LockRecordTypes.DUAL_AUTH_BLUETOOTH_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo Bluetooth de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_PASSWORD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con contraseña de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_FINGERPRINT_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con huella dactilar de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_IC_CARD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con tarjeta IC de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_FACE_CARD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con tarjeta facial de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_WIRELESS_KEY_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con llave inalámbrica de autenticación dual exitosa',
        [LockRecordTypes.DUAL_AUTH_PALM_VEIN_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con vena palmar de autenticación dual exitosa',
        [LockRecordTypes.PALM_VEIN_UNLOCK_SUCCESS]: 'Desbloqueo con vena palmar exitoso',
        [LockRecordTypes.LOCK_WITH_PALM_VEIN]: 'Bloqueo con vena palmar',
        [LockRecordTypes.REGISTER_PALM_VEIN_SUCCESS]: 'Registro de vena palmar exitoso',
        [LockRecordTypes.PALM_VEIN_UNLOCK_FAILED_EXPIRED_INEFFECTIVE]: 'Desbloqueo con vena palmar fallido - expirado o inefectivo',
        [LockRecordTypes.DELETE_PALM_VEIN_SUCCESS]: 'Eliminar vena palmar exitoso',
        [LockRecordTypes.CLEAR_PALM_VEIN_SUCCESS]: 'Limpiar venas palmares exitoso',
        [LockRecordTypes.FAILED_TO_UNLOCK_WITH_IC_CARD]: 'Falló al desbloquear con tarjeta IC',
        [LockRecordTypes.ADMINISTRATOR_PASSWORD_TO_UNLOCK]: 'Contraseña de administrador para desbloquear',
        [LockRecordTypes.ADD_PASSWORD_SUCCESS]: 'Agregar contraseña exitoso'
    };

    return translations[recordTypeStr] || recordTypeStr; // Si no encuentra traducción, devuelve el texto original
}; 