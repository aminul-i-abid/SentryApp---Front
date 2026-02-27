export type RoomResponse = {
    id: number;
    roomNumber: string;
    beds: number;
    isStorage: boolean;
    blockId: number;
    blockName?: string;
    block: {
        name: string;
    };
    companyId: number;
    companyName: string;
    company: {
        name: string;
    };
    tag: number;
    floorNumber: number;
    lockName: string;
    ttlockId: string;
    keyId: string;
    keyboardPasswordId: string;
    reservations: any[];
    companyHistory: any[];
    doorLockHistory: any[];
    created: string;
    createdBy: string;
    hasDoorLock: boolean;
    doorLockBatteryLevel?: number;
    disabled: boolean;
    disabledHistory: [{
        comments: string,
        action: boolean,
        created: string,
    }]
}; 