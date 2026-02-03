import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const ProgressScreen = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0]);
    }
  }, [habits]);

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

  const getHabitCompletionData = () => {
    if (!selectedHabit) return [0, 0, 0, 0, 0, 0, 0];

    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const isCompleted = selectedHabit.completedDates?.includes(dateString);
      data.push(isCompleted ? 1 : 0);
    }

    return data;
  };

  const getCategoryDistribution = () => {
    const distribution = {};
    habits.forEach(habit => {
      const category = habit.category || 'Other';
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return Object.entries(distribution);
  };

  const calculateConsistencyRate = () => {
    if (!selectedHabit || !selectedHabit.createdDate) return 0;

    const createdDate = new Date(selectedHabit.createdDate);
    const today = new Date();
    const daysSinceCreation = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysSinceCreation <= 0) return 0;
    
    const completedDays = selectedHabit.completedDates?.length || 0;
    return Math.round((completedDays / daysSinceCreation) * 100);
  };

  const renderHabitSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.habitSelector}
    >
      {habits.map(habit => (
        <TouchableOpacity
          key={habit.id}
          style={[
            styles.habitOption,
            selectedHabit?.id === habit.id && styles.habitOptionSelected,
          ]}
          onPress={() => setSelectedHabit(habit)}
        >
          <Text style={[
            styles.habitOptionText,
            selectedHabit?.id === habit.id && styles.habitOptionTextSelected,
          ]}>
            {habit.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Dashboard</Text>
        <View style={styles.timeRangeSelector}>
          {['week', 'month', 'year'].map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeOption,
                timeRange === range && styles.timeRangeOptionSelected,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextSelected,
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {habits.length > 0 ? (
        <>
          {renderHabitSelector()}

          {selectedHabit && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Habit Performance</Text>
                <View style={styles.streakBadge}>
                  <Icon name="flame" size={16} color="#FF6B6B" />
                  <Text style={styles.streakText}>{selectedHabit.streak || 0} days</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{selectedHabit.completedDates?.length || 0}</Text>
                  <Text style={styles.statLabel}>Total Completions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{calculateConsistencyRate()}%</Text>
                  <Text style={styles.statLabel}>Consistency Rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {selectedHabit.createdDate ? new Date(selectedHabit.createdDate).toLocaleDateString() : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Started On</Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weekly Completion Trend</Text>
                <LineChart
                  data={{
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [{
                      data: getHabitCompletionData(),
                    }],
                  }}
                  width={Dimensions.get('window').width - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#FFF',
                    backgroundGradientFrom: '#FFF',
                    backgroundGradientTo: '#FFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#4A90E2',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Distribution</Text>
            <View style={styles.categoryDistribution}>
              {getCategoryDistribution().map(([category, count]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryRow}>
                    <View style={[styles.categoryColor, { backgroundColor: getCategoryColor(category) }]} />
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                  <Text style={styles.categoryCount}>{count} habit{count !== 1 ? 's' : ''}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsContainer}>
              {habits.map(habit => {
                if (habit.streak >= 7) {
                  return (
                    <View key={habit.id} style={styles.achievementCard}>
                      <Icon name="trophy" size={24} color="#FFD700" />
                      <View style={styles.achievementInfo}>
                        <Text style={styles.achievementTitle}>7-Day Streak!</Text>
                        <Text style={styles.achievementText}>{habit.name}</Text>
                      </View>
                    </View>
                  );
                }
                if (habit.streak >= 30) {
                  return (
                    <View key={habit.id} style={styles.achievementCard}>
                      <Icon name="trophy" size={24} color="#FFD700" />
                      <View style={styles.achievementInfo}>
                        <Text style={styles.achievementTitle}>30-Day Master!</Text>
                        <Text style={styles.achievementText}>{habit.name}</Text>
                      </View>
                    </View>
                  );
                }
                return null;
              })}
              {habits.filter(h => h.streak >= 7).length === 0 && (
                <Text style={styles.noAchievements}>Keep going! Achievements will appear here.</Text>
              )}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="stats-chart-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No Progress Data Yet</Text>
          <Text style={styles.emptyStateText}>
            Start tracking habits to see your progress and statistics
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    'Health': '#4CAF50',
    'Productivity': '#2196F3',
    'Learning': '#FF9800',
    'Social': '#E91E63',
    'Finance': '#9C27B0',
    'Mindfulness': '#00BCD4',
    'Other': '#9E9E9E',
  };
  return colors[category] || '#9E9E9E';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeRangeSelector: {
    flexDirection: 'row',
  },
  timeRangeOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  timeRangeOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
  },
  timeRangeTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  habitSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  habitOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  habitOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  habitOptionText: {
    fontSize: 14,
    color: '#666',
  },
  habitOptionTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  streakText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 15,
  },
  categoryDistribution: {
    marginTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  achievementsContainer: {
    marginTop: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  achievementInfo: {
    marginLeft: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  achievementText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noAchievements: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ProgressScreen;
