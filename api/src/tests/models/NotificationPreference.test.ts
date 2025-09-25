import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotificationPreference } from '../../models/NotificationPreference';
import { NotificationType, NotificationChannel } from '../../types/notifications';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await NotificationPreference.deleteMany({});
});

describe('NotificationPreference Model', () => {
  const userId = new mongoose.Types.ObjectId();

  it('should create default preferences for new user', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    expect(preferences.userId.toString()).toBe(userId.toString());
    expect(preferences.channelPreferences[NotificationChannel.IN_APP]).toBe(true);
    expect(preferences.channelPreferences[NotificationChannel.EMAIL]).toBe(true);
    expect(preferences.channelPreferences[NotificationChannel.PUSH]).toBe(true);
    expect(preferences.typePreferences.size).toBeGreaterThan(0);
  });

  it('should return existing preferences for user', async () => {
    const initialPrefs = await NotificationPreference.getOrCreatePreferences(userId.toString());
    const retrievedPrefs = await NotificationPreference.getOrCreatePreferences(userId.toString());

    expect(initialPrefs._id.toString()).toBe(retrievedPrefs._id.toString());
  });

  it('should update channel preferences', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    await preferences.updatePreferences({
      channelPreferences: {
        [NotificationChannel.IN_APP]: false,
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.PUSH]: false
      }
    });

    const updatedPrefs = await NotificationPreference.findById(preferences._id);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.IN_APP]).toBe(false);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.EMAIL]).toBe(true);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.PUSH]).toBe(false);
  });

  it('should update type preferences', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    const typePreferences = {
      [NotificationType.USER_SIGNUP]: false,
      [NotificationType.JOB_CREATE]: false
    };

    await preferences.updatePreferences({ typePreferences });

    const updatedPrefs = await NotificationPreference.findById(preferences._id);
    expect(updatedPrefs?.typePreferences.get(NotificationType.USER_SIGNUP)).toBe(false);
    expect(updatedPrefs?.typePreferences.get(NotificationType.JOB_CREATE)).toBe(false);
  });

  it('should check if channel is enabled', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    await preferences.updatePreferences({
      channelPreferences: {
        [NotificationChannel.IN_APP]: false
      }
    });

    expect(preferences.isChannelEnabled(NotificationChannel.IN_APP)).toBe(false);
    expect(preferences.isChannelEnabled(NotificationChannel.EMAIL)).toBe(true);
  });

  it('should check if notification type is enabled', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    await preferences.updatePreferences({
      typePreferences: {
        [NotificationType.USER_SIGNUP]: false
      }
    });

    expect(preferences.isTypeEnabled(NotificationType.USER_SIGNUP)).toBe(false);
    expect(preferences.isTypeEnabled(NotificationType.JOB_CREATE)).toBe(true);
  });

  it('should handle partial preference updates', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());

    // Update only channel preferences
    await preferences.updatePreferences({
      channelPreferences: {
        [NotificationChannel.IN_APP]: false
      }
    });

    let updatedPrefs = await NotificationPreference.findById(preferences._id);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.IN_APP]).toBe(false);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.EMAIL]).toBe(true);

    // Update only type preferences
    await preferences.updatePreferences({
      typePreferences: {
        [NotificationType.USER_SIGNUP]: false
      }
    });

    updatedPrefs = await NotificationPreference.findById(preferences._id);
    expect(updatedPrefs?.typePreferences.get(NotificationType.USER_SIGNUP)).toBe(false);
    expect(updatedPrefs?.channelPreferences[NotificationChannel.IN_APP]).toBe(false);
  });

  it('should update timestamp on preference changes', async () => {
    const preferences = await NotificationPreference.getOrCreatePreferences(userId.toString());
    const initialTimestamp = preferences.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));

    await preferences.updatePreferences({
      channelPreferences: {
        [NotificationChannel.IN_APP]: false
      }
    });

    const updatedPrefs = await NotificationPreference.findById(preferences._id);
    expect(updatedPrefs?.updatedAt.getTime()).toBeGreaterThan(initialTimestamp.getTime());
  });
});

