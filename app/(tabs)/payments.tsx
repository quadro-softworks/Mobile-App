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
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Linking,
  TextInput,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { Route } from '@/types';

// QR Code Component using QR Server API for dynamic QR code generation
const QRCodeComponent: React.FC<{ value: string; size?: number }> = ({ value, size = 200 }) => {
  // Generate QR code URL using QR Server API with optimal settings
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&ecc=M&margin=0&qzone=4&format=png&color=000000&bgcolor=ffffff`;

  return (
    <View style={[styles.qrCodeContainer, { width: size, height: size }]}>
      <Image
        source={{ uri: qrCodeUrl }}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain'
        }}
        onError={(error) => {
          console.warn('QR Code loading error:', error);
        }}
      />
    </View>
  );
};

// Chapa Payment Interface
interface ChapaPaymentResponse {
  checkout_url: string;
  tx_ref: string;
  status: string;
}

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

// Chapa Payment Method (Only provider)
interface ChapaPaymentMethod {
  id: string;
  name: string;
  type: 'chapa';
  description: string;
  isDefault: boolean;
}

const chapaPaymentMethod: ChapaPaymentMethod = {
  id: 'chapa-1',
  name: 'Chapa',
  type: 'chapa',
  description: 'Pay with Chapa - Cards, Mobile Money, Bank Transfer',
  isDefault: true,
};

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { routes, fetchRoutes } = useBusStore();
  const { t } = useTranslation();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'external' | 'callback' | 'success'>('checkout');
  const [isProcessing, setIsProcessing] = useState(false);

  // Origin and Destination selection
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [routePrice, setRoutePrice] = useState<number>(0);
  
  // Mock bus stops for autocomplete
  const busStops = [
    'Addis Ababa University', 'Bole Airport', 'Merkato', 'Piazza', 'Stadium',
    'Arat Kilo', 'Mexico', 'Kazanchis', 'Legehar', 'Gotera', 'Megenagna',
    'Sarbet', 'Shiromeda', 'Kotebe', 'Kaliti', 'Akaki', 'Sebeta', 'Bishoftu'
  ];

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Calculate price based on origin and destination
  useEffect(() => {
    if (origin && destination && origin !== destination) {
      // Generate consistent price based on origin and destination
      const priceHash = (origin + destination).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const price = Math.abs(priceHash % 25) + 15; // Price between 15-40
      setRoutePrice(price);
    } else {
      setRoutePrice(0);
    }
  }, [origin, destination]);

  const handleOriginChange = (text: string) => {
    setOrigin(text);
    if (text.length > 0) {
      const suggestions = busStops.filter(stop =>
        stop.toLowerCase().includes(text.toLowerCase())
      );
      setOriginSuggestions(suggestions);
      setShowOriginSuggestions(true);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);
    if (text.length > 0) {
      const suggestions = busStops.filter(stop =>
        stop.toLowerCase().includes(text.toLowerCase()) && stop !== origin
      );
      setDestinationSuggestions(suggestions);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const selectOrigin = (stop: string) => {
    setOrigin(stop);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (stop: string) => {
    setDestination(stop);
    setShowDestinationSuggestions(false);
  };
  
  // Simulate Chapa checkout URL generation
  const generateChapaCheckoutUrl = (origin: string, destination: string, price: number): string => {
    const txRef = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    return `https://checkout.chapa.co/checkout/payment/${txRef}?amount=${price}&currency=ETB&email=${user?.email}&first_name=${user?.name?.split(' ')[0]}&last_name=${user?.name?.split(' ')[1] || ''}&phone_number=${user?.phone || ''}&tx_ref=${txRef}&callback_url=https://guzosync.app/payment/callback&return_url=https://guzosync.app/payment/success&customization[title]=GuzoSync Bus Ticket&customization[description]=Bus ticket from ${origin} to ${destination}`;
  };

  const handlePayForRoute = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Please select both origin and destination');
      return;
    }

    if (origin === destination) {
      Alert.alert('Error', 'Origin and destination cannot be the same');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('checkout');
    setShowPaymentModal(true);

    try {
      // Step 1: Generate checkout URL (simulate backend call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const url = generateChapaCheckoutUrl(origin, destination, routePrice);
      setCheckoutUrl(url);
      setPaymentStep('external');
      setIsProcessing(false);

    } catch (error) {
      Alert.alert('Error', 'Failed to generate checkout URL. Please try again.');
      setShowPaymentModal(false);
      setPaymentStep('checkout');
      setIsProcessing(false);
    }
  };

  const handleExternalPaymentComplete = async () => {
    setPaymentStep('callback');
    setIsProcessing(true);

    try {
      // Step 2: Simulate payment callback processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Step 3: Register payment in backend (simulated)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Generate ticket and QR code with unique data
      const ticketId = `ticket-${Date.now()}`;
      const qrData = `TICKET-${origin.replace(/\s+/g, '')}-${destination.replace(/\s+/g, '')}-${ticketId}-${routePrice}`;

      const newTicket: Ticket = {
        id: ticketId,
        routeId: `route-${origin}-${destination}`,
        routeName: `${origin} to ${destination}`,
        price: routePrice,
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), // Valid for 7 days
        isUsed: false,
        qrData: qrData,
      };

      setActiveTickets([newTicket, ...activeTickets]);
      setSelectedTicket(newTicket);
      setPaymentStep('success');
      setIsProcessing(false);

    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please contact support.');
      setShowPaymentModal(false);
      setPaymentStep('checkout');
      setIsProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep('checkout');
    setIsProcessing(false);
    setCheckoutUrl('');
  };

  const handleViewTicket = () => {
    setShowPaymentModal(false);
    setPaymentStep('checkout');
    setIsProcessing(false);
    setCheckoutUrl('');
    setShowQRCode(true);
  };
  
  const handleViewExistingTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowQRCode(true);
  };
  
  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setSelectedTicket(null);
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
                <QRCodeComponent value={selectedTicket.qrData} size={200} />
              </View>
              
              <Text style={styles.qrCodeId}>{selectedTicket.qrData}</Text>
            </View>
          </Card>
          
          
          
          <Text style={styles.qrInstructions}>
            Show this QR code to the bus driver or scan at the terminal
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Payment Modal Component
  const PaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClosePaymentModal}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleClosePaymentModal}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chapa Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          {paymentStep === 'checkout' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingTitle}>Generating Checkout URL</Text>
              <Text style={styles.processingText}>
                Creating secure Chapa payment link...
              </Text>
            </View>
          )}

          {paymentStep === 'external' && checkoutUrl && (
            <View style={styles.checkoutContainer}>
              <View style={styles.checkoutIcon}>
                <Ionicons name="card" size={60} color={colors.primary} />
              </View>
              <Text style={styles.checkoutTitle}>Complete Payment</Text>
              <Text style={styles.checkoutText}>
                Click the button below to open Chapa payment page and complete your transaction.
              </Text>

              <TouchableOpacity
                style={styles.checkoutUrlButton}
                onPress={() => {
                  Alert.alert(
                    'Chapa Payment',
                    'This will open the Chapa payment page in your browser. Complete the payment and return to the app.',
                    [
                      {
                        text: 'Open Payment Page',
                        onPress: () => {
                          // In real app: Linking.openURL(checkoutUrl)
                          console.log('Opening Chapa checkout:', checkoutUrl);
                          // Simulate external payment completion
                          setTimeout(() => {
                            handleExternalPaymentComplete();
                          }, 3000);
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Ionicons name="open-outline" size={20} color={colors.card} />
                <Text style={styles.checkoutUrlButtonText}>Open Chapa Payment</Text>
              </TouchableOpacity>

              <Text style={styles.checkoutNote}>
                You will be redirected back to the app after payment completion.
              </Text>
            </View>
          )}

          {paymentStep === 'callback' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingTitle}>Processing Payment</Text>
              <Text style={styles.processingText}>
                Verifying payment and generating your ticket...
              </Text>
            </View>
          )}

          {paymentStep === 'success' && selectedTicket && (
            <View style={styles.qrSuccessContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={60} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successText}>Your ticket is ready</Text>

              <View style={styles.modalQrContainer}>
                <QRCodeComponent value={selectedTicket.qrData} size={150} />
              </View>

              <Text style={styles.modalTicketInfo}>
                {selectedTicket.routeName} - ${selectedTicket.price.toFixed(2)}
              </Text>

              <TouchableOpacity
                style={styles.viewTicketButton}
                onPress={handleViewTicket}
              >
                <Text style={styles.viewTicketButtonText}>View Full Ticket</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Remove old purchase flow - now integrated into main screen
  
  return (
    <>
      <PaymentModal />
      <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
        <ScrollView
          // style={styles.container} // Remove container style if it only has flex and background
          contentContainerStyle={styles.scrollContent}
          style={styles.contentContainerPadded} // Add padding to ScrollView itself
        >
        <View style={styles.header}>
          <Text style={styles.title}>{t('payments.title')}</Text>
          <Text style={styles.subtitle}>{t('payments.subtitle')}</Text>
        </View>
        
        {/* Origin and Destination Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.selectRoute')}</Text>
          <Text style={styles.sectionSubtitle}>{t('payments.chooseOriginDestination')}</Text>

          {/* Origin Input */}
          <View style={styles.inputContainer}>
            <View style={styles.autocompleteContainer}>
              <View style={styles.textInputWrapper}>
                <Ionicons name="location" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('payments.enterOrigin')}
                  value={origin}
                  onChangeText={handleOriginChange}
                  style={styles.locationInput}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {originSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectOrigin(suggestion)}
                    >
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Destination Input */}
          <View style={styles.inputContainer}>
            <View style={styles.autocompleteContainer}>
              <View style={styles.textInputWrapper}>
                <Ionicons name="flag" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('payments.enterDestination')}
                  value={destination}
                  onChangeText={handleDestinationChange}
                  style={styles.locationInput}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {destinationSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectDestination(suggestion)}
                    >
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Route Summary and Pay Button */}
          {origin && destination && origin !== destination && (
            <View style={styles.routeSummary}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeText}>{origin} → {destination}</Text>
                <Text style={styles.priceText}>${routePrice}.00</Text>
              </View>

              <TouchableOpacity
                style={styles.payForRouteButton}
                onPress={handlePayForRoute}
                activeOpacity={0.8}
              >
                <View style={styles.payButtonContent}>
                  <Ionicons name="card" size={20} color={colors.card} />
                  <Text style={styles.payButtonText}>
                    {t('payments.pay')} ${routePrice}.00
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.yourTickets')}</Text>
          
          {activeTickets.length > 0 ? (
            activeTickets.map((ticket) => (
              <Pressable
                key={ticket.id}
                onPress={() => handleViewExistingTicket(ticket)}
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
                  Select a route above to purchase a ticket
                </Text>
              </View>
            </Card>
          )}
        </View>
        
        
      </ScrollView>
    </SafeAreaView>
    </>
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
    borderRadius: 5,
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
    flexDirection: 'column',
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
    flex: 1,
    flexWrap: 'wrap',
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
    borderRadius: 5,
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
    borderRadius: 5,
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
    alignItems: 'center',
    paddingVertical:10,
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
    alignItems: 'center',
    marginVertical: 24,
    marginBottom: 32,
  },
  qrCodeId: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal:20
  },
  ticketDetailsCard: {
    marginBottom: 20,
  },
  ticketDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 0,
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
    marginBottom: 40,
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
  // Removed duplicate route styles - using updated ones below
  buttonContainer: {
    // paddingHorizontal: 20, // Removed, handled by parent
    marginBottom: 20,
  },
  purchaseButton: {
    marginBottom: 12,
  },
  // QR Code Component Styles removed - using existing qrCodeContainer style
  // Payment Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  checkoutUrlContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  checkoutUrlLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  checkoutUrlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  checkoutUrlButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  qrSuccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  modalQrContainer: {
    marginBottom: 24,
  },
  modalTicketInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  paymentNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Route Selection Styles
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteOption: {
    borderColor: colors.success,
    backgroundColor: colors.highlight,
  },
  routeOptionPressed: {
    opacity: 0.8,
  },
  routeColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  routeOptionContent: {
    flex: 1,
  },
  routeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  routeOptionDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  routePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  payForRouteButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  // Enhanced Modal Styles
  checkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkoutIcon: {
    marginBottom: 24,
  },
  checkoutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  checkoutText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  checkoutNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  viewTicketButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  viewTicketButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  // Origin/Destination Input Styles
  inputContainer: {
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  autocompleteContainer: {
    position: 'relative',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    width:100,
    height:40
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  routeSummary: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  routeInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});