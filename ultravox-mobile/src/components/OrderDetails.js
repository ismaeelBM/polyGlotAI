import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { registerOrderUpdateCallback, unregisterOrderUpdateCallback } from '../lib/clientTools';

// Function to prepare order details from the raw data
function prepOrderDetails(orderDetailsData) {
  try {
    const parsedItems = JSON.parse(orderDetailsData);
    const totalAmount = parsedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Construct the final order details object with total amount
    const orderDetails = {
      items: parsedItems,
      totalAmount: Number(totalAmount.toFixed(2))
    };

    return orderDetails;
  } catch (error) {
    console.error(`Failed to parse order details: ${error}`);
    return {
      items: [],
      totalAmount: 0
    };
  }
}

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    totalAmount: 0
  });

  useEffect(() => {
    // Register callback to receive updates
    const handleOrderUpdate = (orderData) => {
      console.log(`Order update received: ${JSON.stringify(orderData)}`);
      const formattedData = prepOrderDetails(orderData);
      setOrderDetails(formattedData);
    };

    registerOrderUpdateCallback(handleOrderUpdate);

    // Cleanup on unmount
    return () => {
      unregisterOrderUpdateCallback();
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Render an individual order item
  const renderOrderItem = (item, index) => (
    <View key={index} style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.orderItemName}>{item.quantity}x {item.name}</Text>
        <Text style={styles.orderItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
      </View>
      {item.specialInstructions && (
        <Text style={styles.orderItemNotes}>
          Note: {item.specialInstructions}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.itemsSection}>
          <Text style={styles.sectionLabel}>Items:</Text>
          {orderDetails.items.length > 0 ? (
            orderDetails.items.map((item, index) => renderOrderItem(item, index))
          ) : (
            <Text style={styles.noItemsText}>No items</Text>
          )}
        </View>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(orderDetails.totalAmount)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  detailsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  orderItem: {
    marginBottom: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#444444',
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  orderItemPrice: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  orderItemNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999999',
    marginTop: 4,
  },
  noItemsText: {
    fontSize: 16,
    color: '#999999',
    fontFamily: 'monospace',
  },
  totalSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default OrderDetails; 