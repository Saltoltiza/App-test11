import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    joinedDate: new Date().toISOString(),
  });
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    weeklyReports: true,
    autoBackup: true,
  });

  useEffect(() => {
    loadUserData();
    loadStats();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const habits = await AsyncStorage.getItem('habits');
      if (habits) {
        const parsedHabits = JSON.parse(habits);
        const today = new Date().toISOString().split('T')[0];
        
        const newStats = {
          totalHabits: parsedHabits.length,
          completedToday: parsedHabits.filter(h => 
            h.completedDates?.includes(today)
          ).length,
          currentStreak: Math.max(...parsedHabits.map(h => h.streak || 0)),
          bestStreak: Math.max(...parsedHabits.map(h => h.streak || 0)),
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingToggle = (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    saveSettings(newSettings);
  };

  const handleExportData = async () => {
    try {
      const habits = await AsyncStorage.getItem('habits');
      const userData = await AsyncStorage.getItem('user');
      
      const exportData = {
        habits: JSON.parse(habits || '[]'),
        user: JSON.parse(userData || '{}'),
        exportDate: new Date().toISOString(),
      };
      
      Alert.alert(
        'Export Data',
        'Your data has been prepared for export. In a real app, this would save or share your data.',
        [{ text: 'OK' }]
      );
      
      console.log('Export Data:', JSON.stringify(exportData, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been reset');
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => Alert.alert('Edit Profile', 'Profile editing would be implemented here'),
    },
    {
      title: 'Achievements',
      icon: 'trophy-outline',
      onPress: () => navigation.navigate('Progress'),
    },
    {
      title: 'Export Data',
      icon: 'download-outline',
      onPress: handleExportData,
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Support features would be implemented here'),
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert(
        'About Habit Tracker',
        'Version 1.0.0\n\nA personal development app for building better habits and tracking progress.'
      ),
    },
    {
      title: 'Reset All Data',
      icon: 'trash-outline',
      color: '#FF6B6B',
      onPress: handleResetData,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(user.joinedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalHabits}</Text>
            <Text style={styles.statLabel}>Total Habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="moon-outline" size={24} color="#4A90E2" />
            <Text style={styles.settingTitle}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={() => handleSettingToggle('darkMode')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications-outline" size={24} color="#4A90E2" />
            <Text style={styles.settingTitle}>Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={() => handleSettingToggle('notifications')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="stats-chart-outline" size={24} color="#4A90E2" />
            <Text style={styles.settingTitle}>Weekly Reports</Text>
          </View>
          <Switch
            value={settings.weeklyReports}
            onValueChange={() => handleSettingToggle('weeklyReports')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="cloud-upload-outline" size={24} color="#4A90E2" />
            <Text style={styles.settingTitle}>Auto Backup</Text>
          </View>
          <Switch
            value={settings.autoBackup}
            onValueChange={() => handleSettingToggle('autoBackup')}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon 
                name={item.icon} 
                size={24} 
                color={item.color || '#4A90E2'} 
              />
              <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                {item.title}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motivational Quote</Text>
        <View style={styles.quoteCard}>
          <Icon name="quote" size={24} color="#4A90E2" style={styles.quoteIcon} />
          <Text style={styles.quoteText}>
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </Text>
          <Text style={styles.quoteAuthor}>- Winston Churchill</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Habit Tracker v1.0.0</Text>
        <Text style={styles.footerText}>Keep building better habits!</Text>
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
    backgroundColor: '#4A90E2',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsSection: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: -30,
    borderRadius: 15,
    padding: 20,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
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
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  quoteCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'flex-end',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
});

export default ProfileScreen;
