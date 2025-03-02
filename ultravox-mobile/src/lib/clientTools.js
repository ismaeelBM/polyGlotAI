/**
 * Client-side tool implementations for Ultravox
 */

// Client-implemented tool for Order Details
export const updateOrderTool = (parameters) => {
  const { ...orderData } = parameters;
  console.log("Received order details update:", orderData.orderDetailsData);

  // In React Native, we'll need to use a different approach than dispatching browser events
  // For now, we can use a callback approach that we can connect to our state management
  if (typeof global.orderUpdateCallback === 'function') {
    global.orderUpdateCallback(orderData.orderDetailsData);
  }

  return "Updated the order details.";
};

// Register the callback for order updates
export function registerOrderUpdateCallback(callback) {
  global.orderUpdateCallback = callback;
}

// Remove the callback when component unmounts
export function unregisterOrderUpdateCallback() {
  global.orderUpdateCallback = null;
} 