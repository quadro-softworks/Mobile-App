import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Mock payment methods
interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 'payment-1',
    type: 'card',
    name: 'Visa',
    lastFour: '4242',
    expiryDate: '12/25',
    isDefault: true,
  },
  {
    id: 'payment-2',
    type: 'mobile',
    name: 'Mobile Money',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // New card form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Form validation errors
  const [cardNameError, setCardNameError] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [cvvError, setCvvError] = useState('');
  
  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };
  
  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id);
            
            // If we deleted the default method, set a new default
            if (paymentMethods.find(m => m.id === id)?.isDefault && updatedMethods.length > 0) {
              updatedMethods[0].isDefault = true;
            }
            
            setPaymentMethods(updatedMethods);
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate card name
    if (!cardName.trim()) {
      setCardNameError('Name on card is required');
      isValid = false;
    } else {
      setCardNameError('');
    }
    
    // Validate card number
    if (!cardNumber.trim()) {
      setCardNumberError('Card number is required');
      isValid = false;
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      setCardNumberError('Invalid card number');
      isValid = false;
    } else {
      setCardNumberError('');
    }
    
    // Validate expiry date
    if (!expiryDate.trim()) {
      setExpiryDateError('Expiry date is required');
      isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setExpiryDateError('Use format MM/YY');
      isValid = false;
    } else {
      setExpiryDateError('');
    }
    
    // Validate CVV
    if (!cvv.trim()) {
      setCvvError('CVV is required');
      isValid = false;
    } else if (!/^\d{3,4}$/.test(cvv)) {
      setCvvError('Invalid CVV');
      isValid = false;
    } else {
      setCvvError('');
    }
    
    return isValid;
  };
  
  const handleAddCard = () => {
    if (validateForm()) {
      // Create new payment method
      const newMethod: PaymentMethod = {
        id: `payment-${Date.now()}`,
        type: 'card',
        name: cardName.includes('Visa') ? 'Visa' : 
              cardName.includes('Mastercard') ? 'Mastercard' : 
              'Credit Card',
        lastFour: cardNumber.slice(-4),
        expiryDate,
        isDefault: paymentMethods.length === 0, // Make default if it's the first one
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      
      // Reset form
      setCardName('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setIsAddingNew(false);
      
      Alert.alert('Success', 'Payment method added successfully');
    }
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };
  
  const handleExpiryDateChange = (text: string) => {
    // Format as MM/YY
    const cleaned = text.replace(/[^\d]/g, '');
    if (cleaned.length <= 2) {
      setExpiryDate(cleaned);
    } else {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Payment Methods",
          headerBackTitle: "Profile",
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isAddingNew ? (
          <View style={styles.addCardForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add New Card</Text>
              <TouchableOpacity 
                onPress={() => setIsAddingNew(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Input
              label="Name on Card"
              placeholder="John Doe"
              value={cardName}
              onChangeText={setCardName}
              error={cardNameError}
            />
            
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              error={cardNumberError}
              leftIcon={<FontAwesome name="credit-card" size={20} color={colors.textSecondary} />}
            />
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="numeric"
                  error={expiryDateError}
                />
              </View>
              
              <View style={styles.formColumn}>
                <Input
                  label="CVV"
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  error={cvvError}
                />
              </View>
            </View>
            
            <Button
              title="Add Card"
              onPress={handleAddCard}
              style={styles.addButton}
            />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Your Payment Methods</Text>
            
            {paymentMethods.length > 0 ? (
              <View style={styles.methodsList}>
                {paymentMethods.map((method) => (
                  <Card key={method.id} style={styles.methodCard}>
                    <View style={styles.methodHeader}>
                      <FontAwesome name="credit-card" size={24} color={colors.primary} />
                      <View style={styles.methodInfo}>
                        <Text style={styles.methodName}>{method.name}</Text>
                        {method.lastFour && (
                          <Text style={styles.methodDetails}>
                            •••• {method.lastFour}
                            {method.expiryDate && ` | Expires ${method.expiryDate}`}
                          </Text>
                        )}
                      </View>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.methodActions}>
                      {!method.isDefault && (
                        <TouchableOpacity 
                          style={styles.methodAction}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                          <Text style={styles.methodActionText}>Set as Default</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity 
                        style={[styles.methodAction, styles.deleteAction]}
                        onPress={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Ionicons name="trash" size={16} color={colors.error} />
                        <Text style={styles.deleteActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <FontAwesome name="credit-card" size={48} color={colors.inactive} />
                  <Text style={styles.emptyTitle}>No Payment Methods</Text>
                  <Text style={styles.emptyText}>
                    Add a payment method to purchase tickets
                  </Text>
                </View>
              </Card>
            )}
            
            <Button
              title="Add New Payment Method"
              onPress={() => setIsAddingNew(true)}
              icon={<Ionicons name="add" size={20} color={colors.card} />} 
              iconPosition="left"
              style={styles.addNewButton}
            />
          </>
        )}
      </ScrollView>
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
    // backgroundColor: colors.background, // This is now handled by safeArea
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  methodsList: {
    marginBottom: 24,
  },
  methodCard: {
    marginBottom: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  methodDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: colors.highlight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  methodAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  methodActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  deleteAction: {
    marginLeft: 16,
  },
  deleteActionText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 4,
  },
  addNewButton: {
    marginTop: 8,
  },
  emptyCard: {
    padding: 24,
    marginBottom: 24,
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
  addCardForm: {
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formColumn: {
    width: '48%',
  },
  addButton: {
    marginTop: 16,
  },
});