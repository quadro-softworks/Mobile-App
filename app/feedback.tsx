import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, SafeAreaView } from 'react-native'; // Added SafeAreaView
import { Stack, useRouter } from 'expo-router';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackScreen() {
  const router = useRouter();
  const { submitFeedback, isLoading } = useFeedbackStore();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [routeId, setRouteId] = useState('');
  const [commentError, setCommentError] = useState('');
  
  const handleClose = () => {
    router.back();
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (rating === 0) {
      alert('Please select a rating');
      isValid = false;
    }
    
    if (!comment.trim()) {
      setCommentError('Please provide feedback');
      isValid = false;
    } else {
      setCommentError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      await submitFeedback({
        rating,
        comment,
        routeId: routeId || 'R1', // Default route if not specified
        routeName: `Route ${routeId.replace('R', '') || '1'}`,
        tripDate: new Date().toISOString(),
      });
      
      alert('Thank you for your feedback!');
      router.back();
    }
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.card} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.container} // Keep flex:1 and background color here
        contentContainerStyle={styles.contentContainerPadded} // Apply padding here
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>
          Your feedback helps us improve our service
        </Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Ionicons 
                name="star" 
                size={40} 
                color={star <= rating ? colors.warning : colors.inactive} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Tap to rate' : 
            rating === 1 ? 'Poor' :
            rating === 2 ? 'Fair' :
            rating === 3 ? 'Good' :
            rating === 4 ? 'Very Good' : 'Excellent'}
        </Text>
        
        <View style={styles.formContainer}>
          <Input
            label="Route ID (Optional)"
            placeholder="e.g. R1, R2, etc."
            value={routeId}
            onChangeText={setRouteId}
          />
          
          <Input
            label="Your Feedback"
            placeholder="Tell us about your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            error={commentError}
          />
          
          <Button
            title="Submit Feedback"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: { // New style for padding content
    paddingTop: Platform.OS === 'android' ? 20 : 34,
    paddingHorizontal: 20,
    paddingBottom: 20, // Add paddingBottom for scrollable content
  },
  content: { // This style is now contentContainerPadded
    // padding: 20, // Removed, handled by contentContainerPadded
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 40,
  },
  submitButton: {
    marginTop: 16,
  },
});