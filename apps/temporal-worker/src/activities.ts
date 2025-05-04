import axios from 'axios';
import dotenv from 'dotenv';
import type {
  Route,
  TrafficData,
  Customer,
  DelayNotification
} from '@traffic/types';

// Load environment variables
dotenv.config();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Traffic API configuration (using Google Maps as an example)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Notification API configuration (using SendGrid as an example)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'notifications@yourdomain.com';

// Mock customer database - in a real app, this would be a database call
const customerDb = new Map<string, Customer>();

/**
 * Activities used in the traffic delay workflow
 */
export const activities = {
  /**
   * Get traffic data for a specified route
   * Uses Google Maps Distance Matrix API to get real-time traffic information
   * 
   * @param route - The route to check traffic for
   * @returns Traffic data including delay information
   */
  async getTrafficData(route: Route): Promise<TrafficData> {
    try {
      console.log(`Getting traffic data for route: ${route.origin} to ${route.destination}`);

      // Prepare API request
      const origin = encodeURIComponent(route.origin);
      const destination = encodeURIComponent(route.destination);
      let waypoints = '';

      if (route.waypoints && route.waypoints.length > 0) {
        waypoints = `&waypoints=${route.waypoints.map(wp => encodeURIComponent(wp)).join('|')}`;
      }

      // Make API request to Google Maps Distance Matrix API
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}${waypoints}&mode=driving&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

      // Uncomment the following to use the actual API
      /*
      const response = await axios.get(url);
      const data = response.data;
      
      // Extract relevant information
      const element = data.rows[0].elements[0];
      const normalDuration = Math.round(element.duration.value / 60); // Convert seconds to minutes
      const currentDuration = Math.round(element.duration_in_traffic.value / 60); // Convert seconds to minutes
      const delay = currentDuration - normalDuration;
      
      // Determine congestion level based on delay
      let congestionLevel: 'low' | 'moderate' | 'high' | 'severe';
      if (delay <= 10) congestionLevel = 'low';
      else if (delay <= 30) congestionLevel = 'moderate';
      else if (delay <= 60) congestionLevel = 'high';
      else congestionLevel = 'severe';
      
      return {
        normalDuration,
        currentDuration,
        delay,
        congestionLevel,
        timestamp: new Date().toISOString()
      };
      */

      // For now, use mock data for testing
      // TODO: Replace with actual API call
      const normalDuration = 120; // 2 hours normal duration

      // Randomize the current duration to simulate different traffic conditions
      const random = Math.random();
      let currentDuration: number;
      let congestionLevel: 'low' | 'moderate' | 'high' | 'severe';

      if (random < 0.3) {
        // Low congestion (0-10 min delay)
        currentDuration = normalDuration + Math.floor(Math.random() * 10);
        congestionLevel = 'low';
      } else if (random < 0.6) {
        // Moderate congestion (10-30 min delay)
        currentDuration = normalDuration + 10 + Math.floor(Math.random() * 20);
        congestionLevel = 'moderate';
      } else if (random < 0.8) {
        // High congestion (30-60 min delay)
        currentDuration = normalDuration + 30 + Math.floor(Math.random() * 30);
        congestionLevel = 'high';
      } else {
        // Severe congestion (60+ min delay)
        currentDuration = normalDuration + 60 + Math.floor(Math.random() * 60);
        congestionLevel = 'severe';
      }

      const delay = currentDuration - normalDuration;

      return {
        normalDuration,
        currentDuration,
        delay,
        congestionLevel,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      // Return a default error response
      return {
        normalDuration: 0,
        currentDuration: 0,
        delay: 0,
        congestionLevel: 'low',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Calculate new ETA based on original ETA and delay time
   * 
   * @param originalEta - Original estimated time of arrival (ISO date string)
   * @param delayMinutes - Delay in minutes
   * @returns New estimated time of arrival (ISO date string)
   */
  async calculateNewEta(originalEta: string, delayMinutes: number): Promise<string> {
    try {
      const originalDate = new Date(originalEta);
      const newDate = new Date(originalDate.getTime() + delayMinutes * 60 * 1000);
      return newDate.toISOString();
    } catch (error) {
      console.error('Error calculating new ETA:', error);
      return originalEta; // Return original as fallback
    }
  },

  /**
   * Get customer information from database
   * 
   * @param customerId - Customer ID to look up
   * @returns Customer information
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    // In a real application, this would be a database query
    // For now, we'll use our mock database
    const customer = customerDb.get(customerId);

    if (!customer) {
      // For testing purposes, create a mock customer if not found
      const mockCustomer: Customer = {
        id: customerId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        preferredContactMethod: 'email'
      };

      customerDb.set(customerId, mockCustomer);
      return mockCustomer;
    }

    return customer;
  },

  /**
   * Generate a personalized delay message using AI
   * Uses OpenAI API to create a friendly, context-aware message
   * 
   * @param customerId - Customer ID to personalize message for
   * @param delayInfo - Information about the delay
   * @returns AI-generated message
   */
  async generateDelayMessage(customerId: string, delayInfo: any): Promise<string> {
    try {
      console.log('Generating delay message using AI');

      // Get customer information for personalization
      const customer = await activities.getCustomer(customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${customerId}`);
      }

      // Include customer name in delay info for personalization
      delayInfo.customerName = customer.name;

      // Format dates for better readability
      const originalEtaDate = new Date(delayInfo.originalEta);
      const newEtaDate = new Date(delayInfo.newEta);

      const formattedOriginalEta = originalEtaDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      const formattedNewEta = newEtaDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      // Create prompt for OpenAI
      const prompt = `
        Write a friendly, professional notification message to inform a customer about a delivery delay.
        
        Customer name: ${delayInfo.customerName}
        Shipment ID: ${delayInfo.shipmentId}
        Original estimated arrival: ${formattedOriginalEta}
        New estimated arrival: ${formattedNewEta}
        Delay: ${delayInfo.delayMinutes} minutes
        Cause: ${delayInfo.congestionLevel} traffic congestion
        
        The message should:
        1. Be concise (2-3 short paragraphs)
        2. Be apologetic but professional
        3. Clearly state the new estimated arrival time
        4. Provide the shipment ID for reference
        5. End with an offer to contact support if needed
      `;

      // Call OpenAI API
      if (!OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using fallback message');
        return activities.fallbackDelayMessage(delayInfo);
      }

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      const message = response.data.choices[0].message.content.trim();
      console.log('AI-generated message:', message);

      return message;
    } catch (error) {
      console.error('Error generating message with AI:', error);
      // Fallback to a template message if AI fails
      return activities.fallbackDelayMessage(delayInfo);
    }
  },

  /**
   * Fallback message template if AI message generation fails
   * 
   * @param delayInfo - Information about the delay
   * @returns Template-based message
   */
  fallbackDelayMessage(delayInfo: any): string {
    const originalEtaDate = new Date(delayInfo.originalEta);
    const newEtaDate = new Date(delayInfo.newEta);

    const formattedOriginalEta = originalEtaDate.toLocaleString();
    const formattedNewEta = newEtaDate.toLocaleString();

    return `
      Dear ${delayInfo.customerName},
      
      We regret to inform you that your shipment (ID: ${delayInfo.shipmentId}) will be delayed due to ${delayInfo.congestionLevel} traffic conditions. The delivery originally scheduled for ${formattedOriginalEta} is now expected to arrive at ${formattedNewEta}.
      
      We apologize for any inconvenience this may cause. If you need further assistance, please contact our customer support team.
      
      Thank you for your understanding.
    `.trim();
  },

  /**
   * Send notification to customer via email or SMS
   * 
   * @param notification - Notification to send
   * @returns Updated notification with sent status
   */
  async sendNotification(notification: DelayNotification): Promise<DelayNotification> {
    try {
      console.log(`Sending notification to customer ${notification.customerId}`);

      // Get customer contact information
      const customer = await activities.getCustomer(notification.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${notification.customerId}`);
      }

      if (customer.preferredContactMethod === 'email' || customer.preferredContactMethod === 'both') {
        await activities.sendEmailNotification(customer.email, 'Delivery Delay Notification', notification.message);
      }

      if ((customer.preferredContactMethod === 'sms' || customer.preferredContactMethod === 'both') && customer.phone) {
        await activities.sendSmsNotification(customer.phone, notification.message);
      }

      // Update notification status
      const updatedNotification: DelayNotification = {
        ...notification,
        sent: true,
        sentTimestamp: new Date().toISOString()
      };

      return updatedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        ...notification,
        sent: false
      };
    }
  },

  /**
   * Send email notification using SendGrid
   * 
   * @param email - Recipient email address
   * @param subject - Email subject
   * @param message - Email body
   */
  async sendEmailNotification(email: string, subject: string, message: string): Promise<void> {
    try {
      console.log(`Sending email to ${email}`);

      if (!SENDGRID_API_KEY) {
        console.log('SendGrid API key not configured, logging email instead:');
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${message}`);
        return;
      }

      // Uncomment to use actual SendGrid API
      /*
      const url = 'https://api.sendgrid.com/v3/mail/send';
      await axios.post(
        url,
        {
          personalizations: [{ to: [{ email }] }],
          from: { email: SENDGRID_FROM_EMAIL },
          subject,
          content: [{ type: 'text/plain', value: message }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_API_KEY}`
          }
        }
      );
      */

      // For now, just log the email
      console.log('Email notification would be sent with:');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${message}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  },

  /**
   * Send SMS notification using Twilio
   * 
   * @param phoneNumber - Recipient phone number
   * @param message - SMS body
   */
  async sendSmsNotification(phoneNumber: string, message: string): Promise<void> {
    try {
      console.log(`Sending SMS to ${phoneNumber}`);

      // For now, just log the SMS
      console.log('SMS notification would be sent with:');
      console.log(`To: ${phoneNumber}`);
      console.log(`Body: ${message}`);

      // Implement actual Twilio API call here in a real application
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }
};

export type Activities = typeof activities;