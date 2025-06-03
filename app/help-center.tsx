import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, SafeAreaView } from 'react-native'; // Added SafeAreaView, Platform
import { Stack, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// FAQ data
const faqs = [
  {
    id: '1',
    question: 'How do I track a bus in real-time?',
    answer: 'You can track buses in real-time by going to the Map tab. There, you can see all buses currently in service. Tap on any bus to see its details, route, and estimated arrival times.'
  },
  {
    id: '2',
    question: 'How do I set up notifications for my regular routes?',
    answer: 'To set up notifications, go to a specific route or bus stop and tap the bell icon. You can choose to be notified about delays, route changes, or when a bus is approaching your stop.'
  },
  {
    id: '3',
    question: 'What do the different bus status colors mean?',
    answer: 'Green indicates the bus is on time, yellow means it\'s running slightly behind schedule, and red means it\'s significantly delayed. The exact delay time is shown in the bus details.'
  },
  {
    id: '4',
    question: 'How accurate are the estimated arrival times?',
    answer: 'Our ETAs are calculated based on real-time GPS data, current traffic conditions, and historical patterns. They\'re typically accurate within 2-3 minutes, but can vary during unusual traffic or weather conditions.'
  },
  {
    id: '5',
    question: 'Can I save my favorite stops and routes?',
    answer: 'Yes! When viewing a stop or route, tap the heart icon to add it to your favorites. You can access all your favorites from your profile page for quick access.'
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>(null);
  
  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <Stack.Screen 
        options={{
          title: "Help Center",
          headerBackTitle: "Profile",
        }} 
      />
      
      <ScrollView 
        style={styles.scrollViewContainer} // Renamed from container to avoid confusion, keeps flex:1 and background
        contentContainerStyle={styles.contentContainerPadded} // Apply padding here
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}> {/* Header specific styling, no more top/horizontal padding */}
          <Ionicons name="help-circle" size={40} color={colors.primary} />
          <Text style={styles.title}>How can we help you?</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>
        
        <View style={styles.section}> {/* Section specific styling, no more horizontal padding */}
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinks}>
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="bus" size={24} color={colors.primary} />
              <Text style={styles.quickLinkText}>Track Buses</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => router.push('/(tabs)/stops')}
              activeOpacity={0.7}
            >
              <Ionicons name="location-sharp" size={24} color={colors.secondary} />
              <Text style={styles.quickLinkText}>Find Stops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => router.push('/(tabs)/alerts')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={styles.quickLinkText}>Alerts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={() => router.push('/feedback')}
              activeOpacity={0.7}
            >
              <Ionicons name="gift" size={24} color={colors.success} />
              <Text style={styles.quickLinkText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}> {/* Section specific styling, no more horizontal padding */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(faq => (
            <TouchableOpacity 
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.8}
            >
              <Card style={styles.faqCard}>
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={[
                    styles.faqIcon,
                    expandedFaq === faq.id && styles.faqIconExpanded
                  ]} />
                </View>
                
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.section}> {/* Section specific styling, no more horizontal padding */}
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Card>
            <TouchableOpacity 
              style={styles.contactItem}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.contactText}>+251 11 123 4567</Text>
              <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.contactItem}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>support@guzosync.com</Text>
              <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
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
  scrollViewContainer: { // Renamed from container
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: { // New style for padding content
    paddingTop: Platform.OS === 'android' ? 20 : 34,
    paddingHorizontal: 20,
    paddingBottom: 20, // Add paddingBottom for scrollable content
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24, // Keep vertical padding
    // paddingHorizontal: 20, // Removed, handled by contentContainerPadded
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    // paddingHorizontal: 20, // Removed, handled by contentContainerPadded
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLink: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
  },
  faqItem: {
    marginBottom: 12,
  },
  faqCard: {
    padding: 0,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  faqIcon: {
    transform: [{ rotate: '0deg' }],
  },
  faqIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});