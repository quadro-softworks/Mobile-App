import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Mock purchase history
interface Purchase {
  id: string;
  type: 'ticket' | 'pass';
  name: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    type: 'ticket',
    name: 'Single Ride - Route 1',
    amount: 15.00,
    date: '2025-05-28T14:30:00Z',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'purchase-2',
    type: 'pass',
    name: 'Weekly Pass',
    amount: 75.00,
    date: '2025-05-25T09:15:00Z',
    paymentMethod: 'Mobile Money',
  },
  {
    id: 'purchase-3',
    type: 'ticket',
    name: 'Single Ride - Route 3',
    amount: 20.00,
    date: '2025-05-22T18:45:00Z',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'purchase-4',
    type: 'ticket',
    name: 'Single Ride - Route 2',
    amount: 18.00,
    date: '2025-05-20T11:20:00Z',
    paymentMethod: 'Mobile Money',
  },
  {
    id: 'purchase-5',
    type: 'pass',
    name: 'Monthly Pass',
    amount: 250.00,
    date: '2025-05-01T10:00:00Z',
    paymentMethod: 'Visa •••• 4242',
  },
];

export default function PurchaseHistoryScreen() {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <Card style={styles.purchaseCard}>
      <View style={styles.purchaseHeader}>
        <View style={styles.purchaseIcon}>
          {item.type === 'ticket' ? (
            <FontAwesome name="ticket" size={20} color={colors.primary} />
          ) : (
            <Ionicons name="calendar" size={20} color={colors.secondary} />
          )}
        </View>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseName}>{item.name}</Text>
          <Text style={styles.purchaseDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.purchaseAmount}>${item.amount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.purchaseFooter}>
        <FontAwesome name="credit-card" size={14} color={colors.textSecondary} />
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
      </View>
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: "Purchase History",
          headerBackTitle: "Profile",
        }} 
      />
      
      <View style={styles.container}>
        <FlatList
          data={mockPurchases}
          keyExtractor={(item) => item.id}
          renderItem={renderPurchaseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Recent Purchases</Text>
              <Text style={styles.subtitle}>View your ticket and pass purchase history</Text>
            </View>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <FontAwesome name="ticket" size={48} color={colors.inactive} />
                <Text style={styles.emptyTitle}>No Purchase History</Text>
                <Text style={styles.emptyText}>
                  Your purchases will appear here
                </Text>
              </View>
            </Card>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  purchaseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  purchaseDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  purchaseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  purchaseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  paymentMethod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  emptyCard: {
    marginHorizontal: 20,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});