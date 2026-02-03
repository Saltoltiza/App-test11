import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    loadHabits();
    loadDailyQuote();
  }, []);

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadDailyQuote = async () => {
    const quotes = [
      "The secret of getting ahead is getting started.",
      "Small daily improvements are the key to staggering long-term results.",
      "Your future is created by what you do today, not tomorrow.",
      "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      "The only way to do great work is to love what you do.",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  };

  const toggleHabitCompletion = async (habitId) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const today = new Date().toISOString().split('T')[0];
        const completedDates = habit.completedDates || [];
        
        if (completedDates.includes(today)) {
          return {
            ...habit,
            completedDates: completedDates.filter(date => date !== today),
            streak: habit.streak > 0 ? habit.streak - 1 : 0,
          };
        } else {
          return {
            ...habit,
            completedDates: [...completedDates, today],
            streak: (habit.streak || 0) + 1,
          };
        }
      }
      return habit;
    });

    setHabits(updatedHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  };

  const renderHabitItem = ({ item }) => (
    <TouchableOpacity
      style={styles.habitItem}
      onPress={() => toggleHabitCompletion(item.id)}
    >
      <View style={styles.habitInfo}>
        <Icon
          name={item.completedDates?.includes(new Date().toISOString().split('T')[0]) 
            ? 'checkbox' 
            : 'square-outline'}
          size={24}
          color="#4A90E2"
        />
        <View style={styles.habitTextContainer}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitFrequency}>{item.frequency || 'Daily'}</Text>
        </View>
      </View>
      <View style={styles.streakContainer}>
        <Icon name="flame" size={20} color="#FF6B6B" />
        <Text style={styles.streakText}>{item.streak || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const completedToday = habits.filter(h => 
    h.completedDates?.includes(new Date().toISOString().split('T')[0])
  ).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome! 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      <View style={styles.quoteCard}>
        <Icon name="quote" size={24} color="#4A90E2" style={styles.quoteIcon} />
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{habits.length}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedToday}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {habits.length > 0 ? (
          <FlatList
            data={habits.slice(0, 5)}
            renderItem={renderHabitItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="add-circle" size={50} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No habits yet</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('Habits')}
            >
              <Text style={styles.addButtonText}>Add Your First Habit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => navigation.navigate('Habits')}
      >
        <Icon name="add" size={24} color="#FFF" />
        <Text style={styles.quickAddText}>Add New Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  quoteCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteIcon: {
    marginRight: 15,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#4A90E2',
    fontSize: 14,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitTextContainer: {
    marginLeft: 15,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  habitFrequency: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  quickAddButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  quickAddText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;
