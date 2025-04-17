import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function WalletScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Wallet Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>£125.75</Text>
        <TouchableOpacity style={styles.topUpButton}>
          <Icon name="plus-circle-outline" size={18} color="#007aff" />
          <Text style={styles.topUpText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>

        {[
          {
            id: 1,
            title: 'Bus No 31',
            date: 'Apr 17, 2025 - 14:35',
            amount: '-£2.50',
          },
          {
            id: 2,
            title: 'Top Up',
            date: 'Apr 17, 2025 - 12:05',
            amount: '+£20.00',
          },
          {
            id: 3,
            title: 'Metro - Central Line',
            date: 'Apr 16, 2025 - 17:40',
            amount: '-£3.00',
          },
        ].map((item) => (
          <View key={item.id} style={styles.transactionRow}>
            <View>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.amount.startsWith('-') ? '#FF3B30' : '#34C759' },
              ]}
            >
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginVertical: 10,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpText: {
    fontSize: 14,
    color: '#007aff',
    marginLeft: 6,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
