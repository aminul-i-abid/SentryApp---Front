export enum RecordTypeStr {
    // Desbloqueo por app
    UNLOCK_BY_APP = 'unlock by app',
    
    // Desbloqueo por contraseña
    UNLOCK_BY_PASSCODE = 'unlock by passcode',
    
    // Levantar la cerradura (para cerradura de estacionamiento)
    RISE_THE_LOCK = 'Rise the lock (for parking lock)',
    
    // Bajar la cerradura (para cerradura de estacionamiento)
    LOWER_THE_LOCK = 'Lower the lock (for parking lock)',
    
    // Desbloqueo por tarjeta IC
    UNLOCK_BY_IC_CARD = 'unlock by IC card',
    
    // Desbloqueo por huella dactilar
    UNLOCK_BY_FINGERPRINT = 'unlock by fingerprint',
    
    // Desbloqueo por pulsera
    UNLOCK_BY_WRIST_STRAP = 'unlock by wrist strap',
    
    // Desbloqueo por llave mecánica
    UNLOCK_BY_MECHANICAL_KEY = 'unlock by Mechanical key',
    
    // Bloqueo por app
    LOCK_BY_APP = 'lock by app',
    
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
    
    // Bloqueo por tarjeta IC
    LOCK_BY_IC_CARD = 'lock by IC card',
    
    // Bloqueo por llave mecánica
    LOCK_BY_MECHANICAL_KEY = 'lock by Mechanical key',
    
    // Usar botón APP para controlar la cerradura
    USE_APP_BUTTON_CONTROL = 'Use APP button to control the lock (rise, fall, stop, lock), mostly used for roller shutter door',
    
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
    
    // Intentar desbloquear con una tarjeta eliminada
    TRY_TO_UNLOCK_WITH_DELETED_CARD = 'Try to unlock with a deleted card',
    
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
    
    // Desbloqueo facial fallido - expirado o inefectivo
    FACE_UNLOCK_FAILED_EXPIRED_INEFFECTIVE = 'Face unlock failed - expired or ineffective',
    
    // Desbloqueado por concesión de App
    UNLOCKED_BY_APP_GRANTING = 'Unlocked by App granting',
    
    // Desbloqueado por concesión remota
    UNLOCKED_BY_REMOTE_GRANTING = 'Unlocked by remote granting',
    
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
    
    // Desbloqueo con vena palmar fallido - expirado o inefectivo
    PALM_VEIN_UNLOCK_FAILED_EXPIRED_INEFFECTIVE = 'Palm vein unlock failed - expired or ineffective',
    
    // Contraseña de administrador para desbloquear
    ADMINISTRATOR_PASSWORD_TO_UNLOCK = 'Administrator password to unlock'
}

// Función para obtener la traducción en español
export const getRecordTypeStrTranslation = (recordTypeStr: string): string => {
    const translations: { [key: string]: string } = {
        [RecordTypeStr.UNLOCK_BY_APP]: 'Desbloqueo por app',
        [RecordTypeStr.UNLOCK_BY_PASSCODE]: 'Desbloqueo por contraseña',
        [RecordTypeStr.RISE_THE_LOCK]: 'Levantar la cerradura (para cerradura de estacionamiento)',
        [RecordTypeStr.LOWER_THE_LOCK]: 'Bajar la cerradura (para cerradura de estacionamiento)',
        [RecordTypeStr.UNLOCK_BY_IC_CARD]: 'Desbloqueo por tarjeta IC',
        [RecordTypeStr.UNLOCK_BY_FINGERPRINT]: 'Desbloqueo por huella dactilar',
        [RecordTypeStr.UNLOCK_BY_WRIST_STRAP]: 'Desbloqueo por pulsera',
        [RecordTypeStr.UNLOCK_BY_MECHANICAL_KEY]: 'Desbloqueo por llave mecánica',
        [RecordTypeStr.LOCK_BY_APP]: 'Bloqueo por app',
        [RecordTypeStr.UNLOCK_BY_GATEWAY]: 'Desbloqueo por gateway',
        [RecordTypeStr.APPLY_FORCE_ON_LOCK]: 'Aplicar fuerza en la cerradura',
        [RecordTypeStr.DOOR_SENSOR_CLOSED]: 'Sensor de puerta cerrado',
        [RecordTypeStr.DOOR_SENSOR_OPEN]: 'Sensor de puerta abierto',
        [RecordTypeStr.OPEN_FROM_INSIDE]: 'Abrir desde adentro',
        [RecordTypeStr.LOCK_BY_FINGERPRINT]: 'Bloqueo por huella dactilar',
        [RecordTypeStr.LOCK_BY_PASSCODE]: 'Bloqueo por contraseña',
        [RecordTypeStr.LOCK_BY_IC_CARD]: 'Bloqueo por tarjeta IC',
        [RecordTypeStr.LOCK_BY_MECHANICAL_KEY]: 'Bloqueo por llave mecánica',
        [RecordTypeStr.USE_APP_BUTTON_CONTROL]: 'Usar botón APP para controlar la cerradura',
        [RecordTypeStr.RECEIVED_NEW_LOCAL_MAIL]: 'Recibido nuevo correo local',
        [RecordTypeStr.RECEIVED_NEW_OTHER_CITIES_MAIL]: 'Recibido nuevo correo de otras ciudades',
        [RecordTypeStr.TAMPER_ALERT]: 'Alerta de manipulación',
        [RecordTypeStr.AUTO_LOCK]: 'Bloqueo automático',
        [RecordTypeStr.UNLOCK_BY_UNLOCK_KEY]: 'Desbloqueo por llave de desbloqueo',
        [RecordTypeStr.LOCK_BY_LOCK_KEY]: 'Bloqueo por llave de bloqueo',
        [RecordTypeStr.SYSTEM_LOCKED]: 'Sistema bloqueado',
        [RecordTypeStr.UNLOCK_BY_HOTEL_CARD]: 'Desbloqueo por tarjeta de hotel',
        [RecordTypeStr.UNLOCKED_DUE_TO_HIGH_TEMPERATURE]: 'Desbloqueado debido a alta temperatura',
        [RecordTypeStr.TRY_TO_UNLOCK_WITH_DELETED_CARD]: 'Intentar desbloquear con una tarjeta eliminada',
        [RecordTypeStr.DEAD_LOCK_WITH_APP]: 'Bloqueo muerto con APP',
        [RecordTypeStr.DEAD_LOCK_WITH_PASSCODE]: 'Bloqueo muerto con contraseña',
        [RecordTypeStr.THE_CAR_LEFT]: 'El auto se fue (para cerradura de estacionamiento)',
        [RecordTypeStr.USE_REMOTE_CONTROL_LOCK_UNLOCK]: 'Usar control remoto para bloquear o desbloquear',
        [RecordTypeStr.UNLOCK_WITH_QR_CODE_SUCCESS]: 'Desbloqueo con código QR exitoso',
        [RecordTypeStr.UNLOCK_WITH_QR_CODE_FAILED_EXPIRED]: 'Desbloqueo con código QR fallido - expirado',
        [RecordTypeStr.DOUBLE_LOCKED]: 'Doble bloqueado',
        [RecordTypeStr.CANCEL_DOUBLE_LOCK]: 'Cancelar doble bloqueo',
        [RecordTypeStr.LOCK_WITH_QR_CODE_SUCCESS]: 'Bloqueo con código QR exitoso',
        [RecordTypeStr.LOCK_WITH_QR_CODE_FAILED_DOUBLE_LOCKED]: 'Bloqueo con código QR fallido - cerradura con doble bloqueo',
        [RecordTypeStr.AUTO_UNLOCK_AT_PASSAGE_MODE]: 'Desbloqueo automático en modo pasaje',
        [RecordTypeStr.DOOR_UNCLOSED_ALARM]: 'Alarma de puerta no cerrada',
        [RecordTypeStr.FAILED_TO_UNLOCK]: 'Falló al desbloquear',
        [RecordTypeStr.FAILED_TO_LOCK]: 'Falló al bloquear',
        [RecordTypeStr.FACE_UNLOCK_SUCCESS]: 'Desbloqueo facial exitoso',
        [RecordTypeStr.FACE_UNLOCK_FAILED_DOOR_LOCKED_INSIDE]: 'Desbloqueo facial fallido - puerta bloqueada desde adentro',
        [RecordTypeStr.LOCK_WITH_FACE]: 'Bloqueo con rostro',
        [RecordTypeStr.FACE_UNLOCK_FAILED_EXPIRED_INEFFECTIVE]: 'Desbloqueo facial fallido - expirado o inefectivo',
        [RecordTypeStr.UNLOCKED_BY_APP_GRANTING]: 'Desbloqueado por concesión de App',
        [RecordTypeStr.UNLOCKED_BY_REMOTE_GRANTING]: 'Desbloqueado por concesión remota',
        [RecordTypeStr.DUAL_AUTH_BLUETOOTH_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo Bluetooth de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_PASSWORD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con contraseña de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_FINGERPRINT_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con huella dactilar de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_IC_CARD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con tarjeta IC de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_FACE_CARD_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con tarjeta facial de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_WIRELESS_KEY_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con llave inalámbrica de autenticación dual exitosa',
        [RecordTypeStr.DUAL_AUTH_PALM_VEIN_UNLOCK_VERIFICATION_SUCCESS]: 'Verificación de desbloqueo con vena palmar de autenticación dual exitosa',
        [RecordTypeStr.PALM_VEIN_UNLOCK_SUCCESS]: 'Desbloqueo con vena palmar exitoso',
        [RecordTypeStr.LOCK_WITH_PALM_VEIN]: 'Bloqueo con vena palmar',
        [RecordTypeStr.PALM_VEIN_UNLOCK_FAILED_EXPIRED_INEFFECTIVE]: 'Desbloqueo con vena palmar fallido - expirado o inefectivo',
        [RecordTypeStr.ADMINISTRATOR_PASSWORD_TO_UNLOCK]: 'Contraseña de administrador para desbloquear'
    };

    return translations[recordTypeStr] || recordTypeStr; // Si no encuentra traducción, devuelve el texto original
}; 