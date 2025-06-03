import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
  SafeAreaView // Added SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Route } from '@/types';

// Mock ticket data
interface Ticket {
  id: string;
  routeId: string;
  routeName: string;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  isUsed: boolean;
  qrData: string;
}

const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    routeId: 'R1',
    routeName: 'Route 1',
    price: 15.00,
    purchaseDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    expiryDate: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
    isUsed: false,
    qrData: 'TICKET-R1-1234567890',
  },
  {
    id: 'ticket-2',
    routeId: 'R3',
    routeName: 'Route 3',
    price: 20.00,
    purchaseDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    expiryDate: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
    isUsed: false,
    qrData: 'TICKET-R3-0987654321',
  },
];

// Mock payment methods
interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
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

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { routes, fetchRoutes } = useBusStore();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>(mockTickets);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);
  
  const handleBuyTicket = () => {
    setIsPurchasing(true);
  };
  
  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
  };
  
  const handleConfirmPurchase = () => {
    if (!selectedRoute) {
      Alert.alert('Error', 'Please select a route');
      return;
    }
    
    // Create a new ticket
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      price: Math.floor(Math.random() * 20) + 10, // Random price between 10-30
      purchaseDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), // Valid for 7 days
      isUsed: false,
      qrData: `TICKET-${selectedRoute.id}-${Date.now()}`,
    };
    
    setActiveTickets([newTicket, ...activeTickets]);
    setIsPurchasing(false);
    setSelectedRoute(null);
    
    Alert.alert(
      'Success',
      'Ticket purchased successfully!',
      [
        {
          text: 'View Ticket',
          onPress: () => {
            setSelectedTicket(newTicket);
            setShowQRCode(true);
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleCancelPurchase = () => {
    setIsPurchasing(false);
    setSelectedRoute(null);
  };
  
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowQRCode(true);
  };
  
  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setSelectedTicket(null);
  };
  
  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'This feature would allow adding a new payment method.');
  };
  
  const handleManagePaymentMethods = () => {
    router.push('/payment-methods');
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (!user) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
        <View style={[styles.emptyStateContainer, styles.contentContainerPadded]}> {/* Add padding */}
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="ticket" size={60} color={colors.card} />
          </View>
          <Text style={styles.emptyStateTitle}>Sign In Required</Text>
          <Text style={styles.emptyStateText}>
            Please sign in to purchase and manage your tickets
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/login')}
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  if (showQRCode && selectedTicket) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
        <View style={[styles.qrContainer, styles.contentContainerPadded]}> {/* Add padding */}
          <View style={styles.qrHeader}>
            <TouchableOpacity 
              onPress={handleCloseQRCode} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Your Ticket</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <Card style={styles.qrCodeCard} variant="elevated">
            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCodeHeader}>
                <Text style={styles.qrCodeTitle}>{selectedTicket.routeName}</Text>
                <Text style={styles.qrCodeSubtitle}>Valid until {formatDate(selectedTicket.expiryDate)}</Text>
              </View>
              
              <View style={styles.qrCodeWrapper}>
                <Ionicons name="qr-code" size={200} color={colors.text} />
              </View>
              
              <Text style={styles.qrCodeId}>{selectedTicket.qrData}</Text>
            </View>
          </Card>
          
          <Card style={styles.ticketDetailsCard}>
            <Text style={styles.ticketDetailsTitle}>Ticket Details</Text>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Price:</Text>
              <Text style={styles.ticketDetailValue}>${selectedTicket.price.toFixed(2)}</Text>
            </View>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Purchase Date:</Text>
              <Text style={styles.ticketDetailValue}>{formatDate(selectedTicket.purchaseDate)}</Text>
            </View>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Valid Until:</Text>
              <Text style={styles.ticketDetailValue}>{formatDate(selectedTicket.expiryDate)}</Text>
            </View>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Status:</Text>
              <Text style={[
                styles.ticketDetailValue, 
                { color: selectedTicket.isUsed ? colors.error : colors.success }
              ]}>
                {selectedTicket.isUsed ? 'Used' : 'Active'}
              </Text>
            </View>
          </Card>
          
          <Text style={styles.qrInstructions}>
            Show this QR code to the bus driver or scan at the terminal
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (isPurchasing) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
        <ScrollView 
          // style={styles.container} // Remove container style if it only has flex and background
          contentContainerStyle={styles.scrollContent}
          style={styles.contentContainerPadded} // Add padding to ScrollView itself
        >
          <View style={styles.purchaseHeader}>
            <TouchableOpacity 
              onPress={handleCancelPurchase}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.purchaseTitle}>Buy Ticket</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <Text style={styles.purchaseSubtitle}>Select a route to purchase a ticket</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Routes</Text>
            {routes.map((route) => (
              <Pressable
                key={route.id}
                style={({ pressed }) => [
                  styles.routeOption,
                  selectedRoute?.id === route.id && styles.selectedRouteOption,
                  pressed && !selectedRoute?.id && styles.routeOptionPressed
                ]}
                onPress={() => handleSelectRoute(route)}
              >
                <View style={[styles.routeColorIndicator, { backgroundColor: route.color }]} />
                <View style={styles.routeOptionContent}>
                  <Text style={styles.routeOptionName}>{route.name}</Text>
                  <Text style={styles.routeOptionDetails}>
                    {route.startPoint} to {route.endPoint}
                  </Text>
                </View>
                {selectedRoute?.id === route.id && (
                  <View style={styles.selectedIndicator} />
                )}
              </Pressable>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Card style={styles.paymentCard}>
              {paymentMethods.map((method, index) => (
                <React.Fragment key={method.id}>
                  <View style={styles.paymentMethod}>
                    <Ionicons name="card" size={20} color={colors.primary} />
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      {method.lastFour && (
                        <Text style={styles.paymentMethodInfo}>
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
                  {index < paymentMethods.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Purchase Ticket"
              onPress={handleConfirmPurchase}
              disabled={!selectedRoute}
              style={styles.purchaseButton}
              size="lg"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <ScrollView 
        // style={styles.container} // Remove container style if it only has flex and background
        contentContainerStyle={styles.scrollContent} 
        style={styles.contentContainerPadded} // Add padding to ScrollView itself
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tickets & Payments</Text>
          <Text style={styles.subtitle}>Manage your tickets and payment methods</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Tickets</Text>
            <Button
              title="Buy Ticket"
              onPress={handleBuyTicket}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add" size={16} color={colors.card} />}
              iconPosition="left"
            />
          </View>
          
          {activeTickets.length > 0 ? (
            activeTickets.map((ticket) => (
              <Pressable
                key={ticket.id}
                onPress={() => handleViewTicket(ticket)}
                style={({ pressed }) => [
                  styles.ticketCard,
                  pressed ? styles.ticketCardPressed : {}
                ]}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketInfo}>
                    <Ionicons name="ticket" size={20} color={colors.primary} />
                    <Text style={styles.ticketRoute}>{ticket.routeName}</Text>
                  </View>
                  <Text style={styles.ticketPrice}>${ticket.price.toFixed(2)}</Text>
                </View>
                
                <View style={styles.ticketBody}>
                  <View style={styles.ticketDetail}>
                    <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                    <Text style={styles.ticketDetailText}>
                      Valid until {formatDate(ticket.expiryDate)}
                    </Text>
                  </View>
                  
                  <View style={styles.ticketActions}>
                    <Text style={[
                      styles.ticketStatus,
                      { color: ticket.isUsed ? colors.error : colors.success }
                    ]}>
                      {ticket.isUsed ? 'Used' : 'Active'}
                    </Text>
                    <View style={styles.viewQrButton}>
                      <Ionicons name="qr-code" size={16} color={colors.primary} />
                      <Text style={styles.viewQrText}>View QR</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <Card style={styles.emptyTicketsCard}>
              <View style={styles.emptyTickets}>
                <View style={styles.emptyTicketIcon}>
                  <Ionicons name="ticket" size={40} color={colors.primary} />
                </View>
                <Text style={styles.emptyTicketsText}>No active tickets</Text>
                <Text style={styles.emptyTicketsSubtext}>
                  Purchase a ticket to ride the bus
                </Text>
                <Button
                  title="Buy Ticket"
                  onPress={handleBuyTicket}
                  style={styles.emptyTicketButton}
                  icon={<Ionicons name="add" size={16} color={colors.card} />}
                  iconPosition="left"
                />
              </View>
            </Card>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <Card style={styles.paymentCard}>
            {paymentMethods.map((method, index) => (
              <React.Fragment key={method.id}>
                <View style={styles.paymentMethod}>
                  <Ionicons name="card" size={20} color={colors.primary} />
                  <View style={styles.paymentMethodDetails}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    {method.lastFour && (
                      <Text style={styles.paymentMethodInfo}>
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
                {index < paymentMethods.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
            
            <Pressable 
              style={({ pressed }) => [
                styles.addPaymentMethod,
                pressed ? styles.addPaymentMethodPressed : {}
              ]}
              onPress={handleAddPaymentMethod}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addPaymentMethodText}>Add Payment Method</Text>
            </Pressable>
          </Card>
          
          <Pressable 
            style={({ pressed }) => [
              styles.managePaymentsButton,
              pressed ? styles.managePaymentsButtonPressed : {}
            ]}
            onPress={handleManagePaymentMethods}
          >
            <Text style={styles.managePaymentsText}>Manage Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase History</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.viewHistoryButton,
              pressed ? styles.viewHistoryButtonPressed : {}
            ]}
            onPress={() => router.push('/purchase-history')}
          >
            <Text style={styles.viewHistoryText}>View Purchase History</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { // New style for SafeAreaView
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: { // New style for padding content
    flex: 1, // Ensure it fills SafeAreaView if it's a direct child View
    paddingTop: Platform.OS === 'android' ? 20 : 34,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // Padding will be handled by contentContainerPadded or applied directly to ScrollView
  },
  scrollContent: {
    paddingBottom: 40,
    // paddingHorizontal will be handled by the parent padded container or ScrollView itself
  },
  header: {
    // paddingHorizontal: 20, // Removed, handled by parent
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    // paddingHorizontal: 20, // Removed, handled by parent
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  ticketBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  ticketDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  ticketActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  viewQrText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyTicketsCard: {
    padding: 24,
  },
  emptyTickets: {
    alignItems: 'center',
  },
  emptyTicketIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTicketsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyTicketsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyTicketButton: {
    minWidth: 150,
  },
  paymentCard: {
    padding: 0,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentMethodInfo: {
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
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addPaymentMethodPressed: {
    backgroundColor: colors.highlight,
  },
  addPaymentMethodText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 12,
  },
  managePaymentsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  managePaymentsButtonPressed: {
    backgroundColor: colors.highlight,
  },
  managePaymentsText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
  },
  viewHistoryButtonPressed: {
    backgroundColor: colors.highlight,
  },
  viewHistoryText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 20, // Removed, handled by parent
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
  },
  signInButton: {
    width: '80%',
  },
  qrContainer: {
    flex: 1,
    backgroundColor: colors.background,
    // padding: 20, // Removed, handled by parent
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  qrCodeCard: {
    padding: 0,
    marginBottom: 24,
  },
  qrCodeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  qrCodeHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  qrCodeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  qrCodeWrapper: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  qrCodeId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ticketDetailsCard: {
    marginBottom: 24,
  },
  ticketDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ticketDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 20, // Removed, handled by parent
    paddingTop: 16,
    paddingBottom: 8,
  },
  purchaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  purchaseSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    // paddingHorizontal: 20, // Removed, handled by parent
    marginBottom: 24,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  routeOptionPressed: {
    backgroundColor: colors.highlight,
  },
  selectedRouteOption: {
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  routeColorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  routeOptionContent: {
    flex: 1,
  },
  routeOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  routeOptionDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    // paddingHorizontal: 20, // Removed, handled by parent
    marginBottom: 20,
  },
  purchaseButton: {
    marginBottom: 12,
  },
});