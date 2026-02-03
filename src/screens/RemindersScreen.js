import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    dailySummary: true,
    streakReminders: true,
    motivationalMessages: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '09:00',
    days: ['Mon', 'Wed', 'Fri'],
  });

  useEffect(() => {
    loadReminders();
    loadNotificationSettings();
  }, []);

  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        setNotificationSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveReminders = async (updatedReminders) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const saveNotificationSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleAddReminder = () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      days: newReminder.days,
      enabled: true,
    };
    
    const updatedReminders = [...reminders, reminder];
    saveReminders(updatedReminders);
    setNewReminder({
      title: '',
      time: '09:00',
      days: ['Mon', 'Wed', 'Fri'],
    });
  };

  const handleToggleReminder = async (reminderId) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        return { ...reminder, enabled: !reminder.enabled };
      }
      return reminder;
    });
    await saveReminders(updatedReminders);
  };

  const handleDeleteReminder = async (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            await saveReminders(updatedReminders);
          },
        },
      ]
    );
  };

  const handleSettingToggle = async (setting) => {
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };
    await saveNotificationSettings(updatedSettings);
  };

  const toggleDay = (day) => {
    const newDays = newReminder.days.includes(day)
      ? newReminder.days.filter(d => d !== day)
      : [...newReminder.days, day];
    setNewReminder({ ...newReminder, days: newDays });
  };

  const renderReminderItem = (reminder) => (
    <View key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderTime}>
            <Icon name="time-outline" size={14} color="#666" /> {reminder.time}
          </Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={() => handleToggleReminder(reminder.id)}
          trackColor={{ false: '#767577', true: '#4A90E2' }}
        />
      </View>
      
      <View style={styles.reminderDays}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayBadge,
              reminder.days.includes(day) && styles.dayBadgeSelected,
            ]}
          >
            <Text style={[
              styles.dayText,
              reminder.days.includes(day) && styles.dayTextSelected,
            ]}>
              {day.charAt(0)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteReminder(reminder.id)}
      >
        <Icon name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders & Notifications</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Reminder</Text>
        <View style={styles.addReminderForm}>
          <TextInput
            style={styles.input}
            value={newReminder.title}
            onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
            placeholder="Reminder title (e.g., Morning Meditation)"
          />
          
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Time:</Text>
            <TextInput
              style={styles.timeInput}
              value={newReminder.time}
              onChangeText={(text) => setNewReminder({ ...newReminder, time: text })}
              placeholder="09:00"
            />
          </View>

          <View style={styles.daysContainer}>
            <Text style={styles.label}>Days:</Text>
            <View style={styles.daysSelector}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.daySelectorBadge,
                    newReminder.days.includes(day) && styles.daySelectorBadgeSelected,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[
                    styles.daySelectorText,
                    newReminder.days.includes(day) && styles.daySelectorTextSelected,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
            <Text style={styles.addButtonText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Reminders</Text>
        {reminders.length > 0 ? (
          reminders.map(renderReminderItem)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="notifications-off-outline" size={50} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No reminders set</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="calendar-outline" size={24} color="#4A90E2" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Daily Summary</Text>
              <Text style={styles.settingDescription}>Daily progress report at 9 PM</Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.dailySummary}
            onValueChange={() => handleSettingToggle('dailySummary')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="flame-outline" size={24} color="#FF6B6B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Streak Reminders</Text>
              <Text style={styles.settingDescription}>Remind to maintain streaks</Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.streakReminders}
            onValueChange={() => handleSettingToggle('streakReminders')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="bulb-outline" size={24} color="#FFD700" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Motivational Messages</Text>
              <Text style={styles.settingDescription}>Daily motivational quotes</Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.motivationalMessages}
            onValueChange={() => handleSettingToggle('motivationalMessages')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="volume-medium-outline" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound</Text>
              <Text style={styles.settingDescription}>Play sound for notifications</Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.soundEnabled}
            onValueChange={() => handleSettingToggle('soundEnabled')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="phone-portrait-outline" size={24} color="#9C27B0" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate for notifications</Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.vibrationEnabled}
            onValueChange={() => handleSettingToggle('vibrationEnabled')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addReminderForm: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    marginBottom: 15,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    width: 100,
  },
  daysContainer: {
    marginBottom: 20,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  daySelectorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  daySelectorBadgeSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  daySelectorText: {
    fontSize: 12,
    color: '#666',
  },
  daySelectorTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reminderTime: {
    fontSize: 14,
    color: '#666',
  },
  reminderDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeSelected: {
    backgroundColor: '#4A90E2',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: '#FFF',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default RemindersScreen;
