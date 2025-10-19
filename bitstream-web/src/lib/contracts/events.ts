/**
 * Event listening and parsing utilities for BitStream Smart Contracts
 * Handles blockchain event monitoring and parsing
 */

import {
  type Network,
  type ContentRegisteredEvent,
  type PaymentEvent,
  type AccessGrantedEvent,
  getContractAddresses,
} from './types';

// Event types from the contracts
export interface ContractEvent {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log: {
    contract_id: string;
    topic: string;
    value: {
      hex: string;
      repr: string;
    };
  };
}

export interface EventFilter {
  contractAddress?: string;
  eventType?: string;
  fromBlock?: number;
  toBlock?: number;
  limit?: number;
}

/**
 * Get API base URL for network
 */
const getApiBaseUrl = (network: Network): string => {
  return network === 'testnet' 
    ? 'https://api.testnet.hiro.so/extended/v1'
    : 'https://api.hiro.so/extended/v1';
};

/**
 * Fetch contract events from the blockchain
 */
export const fetchContractEvents = async (
  network: Network,
  filter: EventFilter = {}
): Promise<ContractEvent[]> => {
  const baseUrl = getApiBaseUrl(network);
  const contractAddresses = getContractAddresses(network);
  
  // Default to all BitStream contracts if no specific contract is specified
  const contractIds = filter.contractAddress 
    ? [filter.contractAddress]
    : Object.values(contractAddresses);

  const allEvents: ContractEvent[] = [];

  for (const contractId of contractIds) {
    try {
      const url = new URL(`${baseUrl}/extended/v1/contract/${contractId}/events`);
      
      if (filter.limit) {
        url.searchParams.set('limit', filter.limit.toString());
      }
      if (filter.fromBlock) {
        url.searchParams.set('offset', filter.fromBlock.toString());
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.warn(`Failed to fetch events for contract ${contractId}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        const contractEvents = data.results.filter((event: ContractEvent) => {
          return !filter.eventType || event.contract_log?.topic === filter.eventType;
        });
        
        allEvents.push(...contractEvents);
      }
    } catch (error) {
      console.error(`Error fetching events for contract ${contractId}:`, error);
    }
  }

  // Sort events by event_index (most recent first)
  return allEvents.sort((a, b) => b.event_index - a.event_index);
};

/**
 * Parse content registered event
 */
export const parseContentRegisteredEvent = (event: ContractEvent): ContentRegisteredEvent | null => {
  if (event.contract_log?.topic !== 'content-registered') {
    return null;
  }

  try {
    // Parse the event data from the hex representation
    const eventData = JSON.parse(event.contract_log.value.repr);
    
    return {
      contentId: BigInt(eventData['content-id'] || '0'),
      creator: eventData.creator || '',
      price: BigInt(eventData.price || '0'),
      metadataUri: eventData['metadata-uri'] || '',
    };
  } catch (error) {
    console.error('Failed to parse content registered event:', error);
    return null;
  }
};

/**
 * Parse payment processed event
 */
export const parsePaymentEvent = (event: ContractEvent): PaymentEvent | null => {
  if (event.contract_log?.topic !== 'payment-processed') {
    return null;
  }

  try {
    const eventData = JSON.parse(event.contract_log.value.repr);
    
    return {
      contentId: BigInt(eventData['content-id'] || '0'),
      viewer: eventData.viewer || '',
      amount: BigInt(eventData.amount || '0'),
      creatorShare: BigInt(eventData['creator-share'] || '0'),
      platformShare: BigInt(eventData['platform-share'] || '0'),
      timestamp: BigInt(eventData.timestamp || '0'),
    };
  } catch (error) {
    console.error('Failed to parse payment event:', error);
    return null;
  }
};

/**
 * Parse access granted event
 */
export const parseAccessGrantedEvent = (event: ContractEvent): AccessGrantedEvent | null => {
  if (event.contract_log?.topic !== 'access-granted') {
    return null;
  }

  try {
    const eventData = JSON.parse(event.contract_log.value.repr);
    
    return {
      contentId: BigInt(eventData['content-id'] || '0'),
      viewer: eventData.viewer || '',
      grantedAt: BigInt(eventData['granted-at'] || '0'),
    };
  } catch (error) {
    console.error('Failed to parse access granted event:', error);
    return null;
  }
};

/**
 * Event listener class for real-time event monitoring
 */
export class ContractEventListener {
  private network: Network;
  private listeners: Map<string, ((event: any) => void)[]> = new Map();
  private polling: boolean = false;
  private pollInterval: number = 5000; // 5 seconds
  private lastEventIndex: number = 0;

  constructor(network: Network) {
    this.network = network;
  }

  /**
   * Add event listener for specific event type
   */
  addEventListener(eventType: string, callback: (event: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Start polling if this is the first listener
    if (!this.polling) {
      this.startPolling();
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, callback: (event: any) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Remove the event type if no more callbacks
      if (callbacks.length === 0) {
        this.listeners.delete(eventType);
      }
    }

    // Stop polling if no more listeners
    if (this.listeners.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Start polling for new events
   */
  private async startPolling(): Promise<void> {
    if (this.polling) return;
    
    this.polling = true;
    
    while (this.polling) {
      try {
        await this.pollForEvents();
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      } catch (error) {
        console.error('Error polling for events:', error);
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      }
    }
  }

  /**
   * Stop polling for events
   */
  private stopPolling(): void {
    this.polling = false;
  }

  /**
   * Poll for new events and notify listeners
   */
  private async pollForEvents(): Promise<void> {
    const events = await fetchContractEvents(this.network, {
      fromBlock: this.lastEventIndex,
      limit: 50,
    });

    // Process new events (those with higher event_index)
    const newEvents = events.filter(event => event.event_index > this.lastEventIndex);
    
    if (newEvents.length > 0) {
      // Update last event index
      this.lastEventIndex = Math.max(...newEvents.map(e => e.event_index));
      
      // Notify listeners
      for (const event of newEvents) {
        this.notifyListeners(event);
      }
    }
  }

  /**
   * Notify listeners of new events
   */
  private notifyListeners(event: ContractEvent): void {
    const eventType = event.contract_log?.topic;
    if (!eventType) return;

    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    let parsedEvent: any = null;

    // Parse event based on type
    switch (eventType) {
      case 'content-registered':
        parsedEvent = parseContentRegisteredEvent(event);
        break;
      case 'payment-processed':
        parsedEvent = parsePaymentEvent(event);
        break;
      case 'access-granted':
        parsedEvent = parseAccessGrantedEvent(event);
        break;
      default:
        parsedEvent = event; // Return raw event for unknown types
    }

    if (parsedEvent) {
      callbacks.forEach(callback => {
        try {
          callback(parsedEvent);
        } catch (error) {
          console.error('Error in event listener callback:', error);
        }
      });
    }
  }

  /**
   * Set polling interval
   */
  setPollInterval(intervalMs: number): void {
    this.pollInterval = intervalMs;
  }

  /**
   * Get current polling status
   */
  isPolling(): boolean {
    return this.polling;
  }
}

/**
 * Create a new event listener instance
 */
export const createEventListener = (network: Network): ContractEventListener => {
  return new ContractEventListener(network);
};

/**
 * Utility function to wait for a specific event
 */
export const waitForEvent = (
  network: Network,
  eventType: string,
  filter: (event: any) => boolean,
  timeoutMs: number = 30000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const listener = createEventListener(network);
    const timeout = setTimeout(() => {
      listener.removeEventListener(eventType, eventHandler);
      reject(new Error(`Timeout waiting for event: ${eventType}`));
    }, timeoutMs);

    const eventHandler = (event: any) => {
      if (filter(event)) {
        clearTimeout(timeout);
        listener.removeEventListener(eventType, eventHandler);
        resolve(event);
      }
    };

    listener.addEventListener(eventType, eventHandler);
  });
};