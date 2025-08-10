export declare const SEAT_CONFIG: {
    readonly TOTAL_SEATS: 64;
    readonly ROWS: 8;
    readonly COLS: 8;
    readonly GRID_TYPE: "8x8";
};
export declare const SEAT_STATUS: {
    readonly AVAILABLE: "available";
    readonly OCCUPIED: "occupied";
    readonly MAINTENANCE: "maintenance";
};
export declare const SEAT_ID_FORMAT: "seat_{number}";
export declare const generateSeatId: (seatNumber: number) => string;
//# sourceMappingURL=seat.constants.d.ts.map