const { SessionsClient } = require("@google-cloud/dialogflow");
const { struct } = require("pb-util");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

class DialogflowController {
  constructor(projectId, credentialsPath, sessionClient = null) {
    this.projectId = projectId;
    this.credentialsPath = credentialsPath;

    // Allow injecting a session client directly for testing
    if (sessionClient) {
      this.sessionClient = sessionClient;
    } else {
      try {
        if (fs.existsSync(credentialsPath)) {
          this.sessionClient = new SessionsClient({
            keyFilename: credentialsPath,
          });
        } else {
          console.warn(`Credentials file not found at: ${credentialsPath}`);
          this.sessionClient = null;
        }
      } catch (error) {
        console.error("Error initializing DialogflowController:", error);
        this.sessionClient = null;
      }
    }
  }

  // Create a random session ID
  createSession() {
    return uuid();
  }

  // Add simulateResponse as an instance method
  simulateResponse(message) {
    return DialogflowController.simulateResponse(message);
  }

  // Basic detect intent without contexts
  async detectIntent(sessionId, query, languageCode) {
    if (!this.sessionClient) {
      return this.simulateResponse(query);
    }

    try {
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        this.projectId,
        sessionId
      );

      // Create request object without queryParams property
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: languageCode,
          },
        },
      };

      const responses = await this.sessionClient.detectIntent(request);
      const result = responses[0].queryResult;

      return {
        fulfillmentText: result.fulfillmentText,
        intent: result.intent?.displayName || "",
        confidence: result.intent?.confidence || 0,
        parameters: struct.decode(result.parameters) || {},
      };
    } catch (error) {
      console.error("Error detecting intent:", error);
      throw error;
    }
  }

  // Detect intent with provided context
  async detectIntentWithContext(sessionId, query, languageCode, contexts = []) {
    if (!this.sessionClient) {
      return this.simulateResponse(query);
    }

    try {
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        this.projectId,
        sessionId
      );

      // Create request object with queryParams only if contexts are provided
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: languageCode,
          },
        },
      };

      // Only add queryParams if contexts array is not empty
      if (contexts && contexts.length > 0) {
        request.queryParams = {
          contexts: contexts.map((context) => ({
            name: `${sessionPath}/contexts/${context.name}`,
            lifespanCount: context.lifespanCount,
            parameters: struct.encode(context.parameters),
          })),
        };
      }

      const responses = await this.sessionClient.detectIntent(request);
      const result = responses[0].queryResult;

      return {
        fulfillmentText: result.fulfillmentText,
        intent: result.intent?.displayName || "",
        confidence: result.intent?.confidence || 0,
        parameters: struct.decode(result.parameters) || {},
      };
    } catch (error) {
      console.error("Error detecting intent with context:", error);
      throw error;
    }
  }

  // Static method to simulate responses for testing without real Dialogflow
  static simulateResponse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return "Hello there! How can I help you with our products today?";
    } else if (
      lowerCaseMessage.includes("product") ||
      lowerCaseMessage.includes("items")
    ) {
      return "We offer a wide range of products including furniture, kitchen appliances, and home decor. You can browse our collection on the main page.";
    } else if (lowerCaseMessage.includes("price")) {
      return "Our prices range from affordable to premium options. You can check the price of each product on its details page.";
    } else if (
      lowerCaseMessage.includes("delivery") ||
      lowerCaseMessage.includes("shipping")
    ) {
      return "We offer free shipping on orders over $50. Delivery usually takes 3-5 business days.";
    } else if (lowerCaseMessage.includes("payment")) {
      return "We accept various payment methods including credit cards, QRIS, and digital wallets like OVO and GoPay.";
    } else if (
      lowerCaseMessage.includes("return") ||
      lowerCaseMessage.includes("refund")
    ) {
      return "Our return policy allows you to return products within 14 days of delivery if you're not satisfied.";
    } else if (
      lowerCaseMessage.includes("contact") ||
      lowerCaseMessage.includes("help")
    ) {
      return "You can contact our customer support team at support@ikeastore.com or call us at +62 123-4567-8900.";
    } else if (lowerCaseMessage.includes("thank")) {
      return "You're welcome! Feel free to ask if you need further assistance.";
    } else if (lowerCaseMessage.includes("bye")) {
      return "Thank you for chatting with us. Have a great day!";
    } else {
      return "I'm not sure I understand. Could you rephrase your question? You can ask about our products, prices, delivery, payment methods, or return policy.";
    }
  }

  // API endpoint handler
  static async processMessage(req, res, next) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Generate simulated response for now
      const response = DialogflowController.simulateResponse(message);

      res.status(200).json({ message: response });
    } catch (error) {
      console.error("Error processing message:", error);
      next(error);
    }
  }
}

// Export both as a named export for destructuring and default for backwards compatibility
module.exports = DialogflowController;
module.exports.DialogflowController = DialogflowController;
