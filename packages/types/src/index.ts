export interface Route {
  origin: string;
  destination: string;
  waypoints?: string[];
  transportType: 'truck' | 'ship' | 'train' | 'air';
}

export interface TrafficData {
  normalDuration: number;
  currentDuration: number;
  delay: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'severe';
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod: 'email' | 'sms' | 'both';
}

export interface Shipment {
  id: string;
  customerId: string;
  route: Route;
  estimatedDeliveryTime: string;
  delayThreshold: number;
}


export interface DelayNotification {
  shipmentId: string;
  customerId: string;
  delayTime: number;
  originalEta: string;
  newEta: string;
  message: string;
  sent: boolean;
  sentTimestamp?: string;
}

// Workflow input
export interface CheckTrafficWorkflowInput {
  shipmentId: string;
  customerId: string;
  route: Route;
  estimatedDeliveryTime: string;
  delayThreshold: number;
}