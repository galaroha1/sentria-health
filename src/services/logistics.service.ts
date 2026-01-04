/**
 * LogisticsService
 * 
 * Handles interaction with the secure Python backend for Real-Time Logistics.
 * Replaces client-side mocks with server-side record keeping.
 */
export interface LogisticsOrder {
    order_id: string;
    shipment_id: string;
    tracking_number: string;
    eta: string;
    status: string;
}

export interface NetworkShipment {
    id: string;
    tracking_number: string;
    status: string;
    current_location: string;
    origin: string;
    destination: string;
    provider: string;
    estimated_delivery: string; // ISO Date String
}

export const LogisticsService = {
    /**
     * Places a secure order with the backend.
     * This triggers inventory allocation and shipment scheduling on the server.
     */
    placeOrder: async (userId: string, items: any[], total: number, method: string): Promise<LogisticsOrder> => {
        try {
            const response = await fetch('/api/ai/logistics/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    items,
                    total,
                    shipping_method: method
                })
            });

            if (!response.ok) {
                throw new Error('Order placement failed');
            }

            return await response.json();
        } catch (error) {
            console.error('LogisticsService.placeOrder error:', error);
            throw error;
        }
    },

    /**
     * Fetches real-time tracking information from the backend.
     */
    trackShipment: async (trackingNumber: string): Promise<NetworkShipment | null> => {
        try {
            const response = await fetch(`/api/ai/logistics/tracking/${trackingNumber}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('LogisticsService.trackShipment error:', error);
            return null;
        }
    },

    /**
     * Gets active network shipments for visualization.
     */
    getNetworkActivity: async (): Promise<NetworkShipment[]> => {
        try {
            const response = await fetch('/api/ai/logistics/network');
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('LogisticsService.getNetworkActivity error:', error);
            return [];
        }
    }
};
